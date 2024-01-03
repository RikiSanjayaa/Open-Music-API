const InvariantError = require('../../exceptions/InvariantError');
const { PostPlaylistSchema, PostPlaylistSongsSchema } = require('./schema');

const PlaylistValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostPlaylistSongsPayload: (payload) => {
    const validationResult = PostPlaylistSongsSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

};

module.exports = PlaylistValidator;
