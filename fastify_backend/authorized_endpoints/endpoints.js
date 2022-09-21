const path = require ('path');

const endpoints = require('./endpoint_functions.js');
const endpoint_schemas = require('./endpoint_schemas.js');

let loadAuthorizedEndpoints = (fastify, options, next) => {
    fastify.addHook('preHandler', async (request, reply) => {
        console.log("this should be processed before accessing any /api endpoint.");
        //check for authentication, if none exists, reply with error
        return endpoints.validateAccess(request.session, reply);
    });
    fastify.get('/api/getMember', endpoints.getMember);
    //return 404 for all /api routes not used
    fastify.get('/api/*', async (request, reply) => { return reply.code(404).send({error: "endpoint not found."});});
    //all routes not explicitly declared should be handled client-side, via react-router.
    fastify.get('/user/:d2ID', async (request, reply) => { return reply.sendFile("index.html"); });
    next();
};

module.exports = loadAuthorizedEndpoints;