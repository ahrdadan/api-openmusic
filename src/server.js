import dotenv from 'dotenv';

import Hapi from '@hapi/hapi';
import albums from './api/albums/index.js';  // Pastikan .js ditambahkan di ESM
import songs from './api/songs/index.js';
import AlbumsService from './services/postgres/AlbumsService.js';
import SongsService from './services/postgres/SongsService.js';
import AlbumsValidator from './validator/albums/index.js';
import { SongsValidator } from './validator/songs/index.js';
import ClientError from './exceptions/ClientError.js';

dotenv.config();

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    debug: {
      request: ["error"],
    },
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator,
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  });

  server.ext("onPreResponse", (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    // penanganan client error secara internal.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
