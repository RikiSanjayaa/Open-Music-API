const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(albumId, userId) {
    const queryCheck = {
      text: 'SELECT id FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const resultCheck = await this._pool.query(queryCheck);
    if (resultCheck.rowCount > 0) {
      throw new InvariantError('Album sudah di like');
    }

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal like album ');
    }
    await this._cacheService.delete(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus like dari album');
    }
    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikesNumber(albumId) {
    try {
      const likesCount = await this._cacheService.get(`likes:${albumId}`);
      return {
        count: JSON.parse(likesCount),
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likesCount = parseInt(result.rows[0].count, 10);
      await this._cacheService.set(`likes:${albumId}`, likesCount);
      return {
        count: JSON.parse(likesCount),
      };
    }
  }
}

module.exports = AlbumLikesService;
