class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.name = 'songs';
  }

  async postItemHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSong(request.payload);
    const response = h.response({
      status: 'success',
      data: { songId },
    });
    response.code(201);
    return response;
  }

  async getItemsHandler(request) {
    const titleQuery = request.query.title;
    const performerQuery = request.query.performer;

    const songs = await this._service.getSongs(titleQuery, performerQuery);

    return {
      status: 'success',
      data: { songs },
    };
  }

  async getItemByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: { song },
    };
  }

  async putItemByIdHandler(request, h) {
    const { id } = request.params;

    await this._validator.validateSongPayload(request.payload);
    await this._service.editSongById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  async deleteItemByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
