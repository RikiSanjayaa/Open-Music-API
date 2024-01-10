/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('album_likes', 'unique_album_id_and_user_id', 'UNIQUE(album_id, user_id)');

  pgm.addColumns('albums', {
    cover_url: {
      type: 'TEXT',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('album_likes');
  pgm.dropColumns('albums', 'cover');
};
