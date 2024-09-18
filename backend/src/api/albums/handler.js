const config = require('../../utils/config');

class AlbumsHandler {
  constructor(service, validator, service2, storageService) {
    this._service = service;
    this._validator = validator;
    this._service2 = service2;
    this._storageService = storageService;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album successfully added',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service2.getSongByAlbumId(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album successfully updated',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album successfully deleted',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const albumId = request.params.id;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    await this._service.updateAlbumCoverUrl({
      id: albumId,
      url: `http://${config.app.host}:${config.app.port}/albums/covers/${filename}`,
    });

    const response = h.response({
      status: 'success',
      message: 'Cover successfully uploaded',
    });
    response.code(201);
    return response;
  }
}

module.exports = AlbumsHandler;
