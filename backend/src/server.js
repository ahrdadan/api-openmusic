require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const config = require('./utils/config');

// Albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// Songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// PlaylistSongs
const playlistSongs = require('./api/playlistSongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlistSongs');

// Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// PlaylistSongActivities
const playlistSongActivities = require('./api/playlistSongActivities');
const PlaylistSongActivitiesService = require('./services/postgres/PlaylistSongActivitiesService');

// Storage(local)
const StorageService = require('./services/storage/StorageService');

// Likes
const userAlbumLikes = require('./api/userAlbumLikes');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');

// Cache
const CacheService = require('./services/redis/CacheService');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const playlistSongsService = new PlaylistSongsService();
  const collaborationsService = new CollaborationsService();
  const playlistSongActivitiesService = new PlaylistSongActivitiesService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/albums/images'));
  const userAlbumLikesService = new UserAlbumLikesService();
  const cacheService = new CacheService();

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('open_music_jwt', 'jwt', {
    keys: config.jwt.access_token_key,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.access_token_age,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
        service2: songsService,
        storageService,
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
      plugin: authentications,
      options: {
        service: authenticationsService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
        usersService,

      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
        collabsService: collaborationsService,
        usersService,

      },
    },
    {
      plugin: playlistSongs,
      options: {
        service: playlistSongsService,
        validator: PlaylistSongsValidator,
        playlistsService,
        songsService,
        usersService,
        collabsService: collaborationsService,
        activitiesService: playlistSongActivitiesService,
        cacheService,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        validator: CollaborationsValidator,
        playlistsService,
        usersService,
      },
    },
    {
      plugin: playlistSongActivities,
      options: {
        service: playlistSongActivitiesService,
        playlistsService,
        collabsService: collaborationsService,
        usersService,
        songsService,
      },
    },
    {
      plugin: userAlbumLikes,
      options: {
        service: userAlbumLikesService,
        albumsService,
        cacheService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
        collabsService: collaborationsService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
