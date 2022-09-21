const path = require ('path');

const endpoints = require('./endpoint_functions.js');
const endpoint_schemas = require('./endpoint_schemas.js');


let loadUnauthorizedEndpoints = (fastify, options, next) => {
    fastify.addHook('preHandler', (request, reply, next) => {
        console.log("this should always ping.");
        next();
    });
    fastify.get('/api/oAuthRequest', endpoints.redirectToD2API);
    fastify.get('/api/oAuthResponse', endpoints.handleD2APIResponse);
    fastify.get('/login', function(request, reply){ reply.sendFile("index.html"); });
    fastify.get('/', function(request, reply){ reply.sendFile("index.html"); });
    next();
};

module.exports = loadUnauthorizedEndpoints;