const NotFoundError = require('../../exceptions/NotFoundError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.name = 'songs';
  }

  async postItemHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const {
        title, year, genre, performer, duration, albumId,
      } = request.payload;

      const songId = await this._service.addSong({
        title, year, genre, performer, duration, albumId,
      });
      const response = h.response({
        status: 'success',
        data: { songId },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(400);
      return response;
    }
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

  async getItemByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);
      return {
        status: 'success',
        data: { song },
      };
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(404);
      return response;
    }
  }

  async putItemByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._validator.validateSongPayload(request.payload);
      await this._service.editSongById(id, request.payload);

      const response = h.response({
        status: 'success',
        message: 'Song berhasil diperbarui',
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof NotFoundError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(400);
      return response;
    }
  }

  async deleteItemByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);
      return {
        status: 'success',
        message: 'Song berhasil dihapus',
      };
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(404);
      return response;
    }
  }
}

module.exports = SongsHandler;
