const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '2.0.0',
  register: async (server, {
    service, validator, service2, storageService,
  }) => {
    const albumsHandler = new AlbumsHandler(service, validator, service2, storageService);
    server.route(routes(albumsHandler));
  },
};
