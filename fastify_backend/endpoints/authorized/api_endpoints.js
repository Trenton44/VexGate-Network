const path = require ('path');
const fastify = require('fastify')

const handler = require('./endpoint_handlers.js');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/wrapper.js'));

// Contains all endpoints that require bungie api authorization to access
// prehandler at start verifies that autorization is granted, returns error otherwise.
// These endpoints should only be used by fronted to obtain data, not load webpages.
let apiAuthorizedEndpoints = (fastify, options, next) => {
    //returns error if validation fails.
    fastify.addHook('preHandler', validateAccess);

    //endpoints accessible to appliation
    //Catch all 404 response
    fastify.get('/api/*', async (request, reply) => { return reply.code(404).send({error: "endpoint not found."}); });

    next();
}

//validates access to the endpoints contained in this file.
async function validateAccess(request, reply){
    return helper.validateTokens(request.session)
    .then( (result) => {
        //api endpoints need no other validation atm, so just return true
        return true;
    }).catch( (error) => {
        //return the error response generated in validateTokens to frontend
        return reply.code(400).send(error);
    });
}

module.exports = apiAuthorizedEndpoints;