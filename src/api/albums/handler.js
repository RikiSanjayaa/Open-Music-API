class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.name = 'albums';
  }

  postItemHandler = async (request, h) => {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      data: { albumId },
    });
    response.code(201);
    return response;
  };

  getItemsHandler = async () => {
    const albums = await this._service.getAlbums();
    return {
      status: 'success',
      data: { albums },
    };
  };

  getItemByIdHandler = async (request) => {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: { album },
    };
  };

  putItemByIdHandler = async (request, h) => {
    const { id } = request.params;

    this._validator.validateAlbumPayload(request.payload);
    await this._service.editAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });
    response.code(200);
    return response;
  };

  deleteItemByIdHandler = async (request) => {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  };
}

module.exports = AlbumsHandler;
