// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Boom = require('@hapi/boom');
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.route(routes);
    server.ext('onRequest', (request, h) => {
        const contentLength = request.headers['content-length'];
        if (contentLength > 1000000) { // 1MB
            return h.response({ status: 'fail', message: 'Payload content length greater than maximum allowed: 1000000' }).code(413).takeover();
        }
        return h.continue;
    });
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
