const Joi = require('joi');

const PostPlaylistSchema = Joi.object({
  name: Joi.string().required(),
});

const PostPlaylistSongsSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistSchema,
  PostPlaylistSongsSchema,
};
