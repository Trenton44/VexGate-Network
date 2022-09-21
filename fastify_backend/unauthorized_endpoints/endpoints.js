const path = require ('path');

const endpoints = require('./endpoint_functions.js');
const endpoint_schemas = require('./endpoint_schemas.js');
const D2APIHelper = require(path.join(__dirname, '..', '/bungie_api/helper_functions.js'));

let loadUnauthorizedEndpoints = (fastify, options, next) => {
    fastify.addHook('preHandler', (request, reply, next) => {
        console.log("this should always ping.");
        next();
    });
    fastify.get('/api/oAuthRequest', D2APIHelper.redirectAuthO);
    fastify.get('/api/oAuthResponse', { schema: endpoint_schemas.OAuthResponse }, D2APIHelper.responseAuthO);
    fastify.get('/print', async (request, reply) => {
        console.log(request.session.data);
        console.log(request.session.user);
        return true;
    });
    fastify.get('/login', function(request, reply){ reply.sendFile("index.html"); });
    fastify.get('/', function(request, reply){ reply.sendFile("index.html"); });
    next();
};

module.exports = loadUnauthorizedEndpoints;