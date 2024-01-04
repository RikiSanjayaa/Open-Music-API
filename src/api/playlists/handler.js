class PlaylistsHandler {
  constructor(service, activitiesService, validator) {
    this._service = service;
    this._activitiesService = activitiesService;
    this._validator = validator;
  }

  postPlaylistHandler = async (request, h) => {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  };

  getPlaylistsHandler = async (request) => {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  };

  deletePlaylistByIdHandler = async (request) => {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById(playlistId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  };

  postPlaylistSongHandler = async (request, h) => {
    this._validator.validatePostPlaylistSongsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongtoPlaylist({ playlistId, songId });
    await this._activitiesService.addActivity({
      playlistId, songId, userId: credentialId, action: 'add',
    });
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  };

  getPlaylistSongsHandler = async (request) => {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getPlaylistById(playlistId);
    const songs = await this._service.getSongfromPlaylist(playlistId);
    return {
      status: 'success',
      data: {
        playlist: {
          id: playlistId,
          name: playlist.name,
          username: playlist.username,
          songs,
        },
      },
    };
  };

  deletePlaylistSongHandler = async (request) => {
    this._validator.validatePostPlaylistSongsPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongfromPlaylist({ playlistId, songId });
    await this._activitiesService.addActivity({
      playlistId, songId, userId: credentialId, action: 'delete',
    });
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  };
}

module.exports = PlaylistsHandler;
