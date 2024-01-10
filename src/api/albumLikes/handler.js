class AlbumLikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;
  }

  postAlbumLikeHandler = async (request, h) => {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._albumsService.getAlbumById(albumId);
    await this._service.addAlbumLike(albumId, credentialId);
    const response = h.response({
      status: 'success',
      message: 'Menyukai Album',
    });
    response.code(201);
    return response;
  };

  deleteAlbumLikeHandler = async (request, h) => {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;
    await this._service.deleteAlbumLike(albumId, credentialId);
    const response = h.response({
      status: 'success',
      message: 'Batal Menyukai Album',
    });
    response.code(200);
    return response;
  };

  getAlbumLikesNumberHandler = async (request, h) => {
    const { id: albumId } = request.params;
    const data = await this._service.getLikesNumber(albumId);
    const likes = data.count;
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    if (data.isCache) {
      response.header('X-Data-Source', 'cache');
    }
    response.code(200);
    return response;
  };
}

module.exports = AlbumLikesHandler;
