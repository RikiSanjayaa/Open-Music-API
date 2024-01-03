const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async getActivities(playlistId, credentialId) {
    const playlistQuery = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    if (playlistResult.rows[0].owner !== credentialId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    const query = {
      text: `
        SELECT playlist_song_activities.*, users.username,songs.title
        FROM playlist_song_activities
        INNER JOIN users ON playlist_song_activities.user_id = users.id
        INNER JOIN songs ON playlist_song_activities.song_id = songs.id
        WHERE playlist_song_activities.playlist_id = $1
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async addActivity({
    playlistId, songId, userId, action,
  }) {
    const id = `activity-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)',
      values: [id, playlistId, songId, userId, action],
    };

    await this._pool.query(query);
  }
}

module.exports = ActivitiesService;
