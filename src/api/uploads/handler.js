const config = require('../../utils/config');

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;
  }

  postUploadImageHandler = async (request, h) => {
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const { id: albumId } = request.params;
    const filename = await this._service.writeFile(cover, cover.hapi);

    const filepath = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;

    await this._albumsService.addCoverToAlbumById(albumId, filepath);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  };
}

module.exports = UploadsHandler;
