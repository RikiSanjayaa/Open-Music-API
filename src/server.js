require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// env
const config = require('./utils/config');

// songs
const songs = require('./api/songs');
const SongsValidator = require('./validators/songs');
const SongsService = require('./services/postgres/SongsService');

// albums
const albums = require('./api/albums');
const AlbumsValidator = require('./validators/albums');
const AlbumsService = require('./services/postgres/AlbumsService');

// album likes
const albumLikes = require('./api/albumLikes');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');

// playlists
const playlists = require('./api/playlists');
const PlaylistsValidator = require('./validators/playlist');
const PlaylistsService = require('./services/postgres/PlaylistsService');

// users
const users = require('./api/users');
const UsersValidator = require('./validators/users');
const UsersService = require('./services/postgres/UsersService');

// authentications
const authentications = require('./api/authentications');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validators/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsValidator = require('./validators/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');

// activities
const activities = require('./api/activities');
const ActivitiesService = require('./services/postgres/ActivitiesService');

// exports
const _exports = require('./api/exports');
const ExportsValidator = require('./validators/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validators/uploads');

// cache
const CacheService = require('./services/redis/CacheService');

// exceptions
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const albumLikesService = new AlbumLikesService(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const activitiesService = new ActivitiesService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // external plugin
  await server.register([{ plugin: Jwt }, { plugin: Inert }]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false, // audience
      iss: false, // issuer
      sub: false, // subject
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // internal plugin
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        activitiesService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: activities,
      options: {
        service: activitiesService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: albumLikes,
      options: {
        service: albumLikesService,
        albumsService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: response.message,
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
