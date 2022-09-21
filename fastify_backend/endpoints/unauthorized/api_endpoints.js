const path = require ('path');
const handler = require('./endpoint_handlers.js');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/unique_functions.js'));

function apiUnauthorizedEndpoints(){
    fastify.addHook('preHandler', async function(request, reply){
        //nothing necessary here atm, but I'm keeping it for consistency with authorized endpoints
    });

    fastify.get('/api/test', endpoints.test);

    //these two /api endpoints are for authorizing with the bungie api, and processing the response from bungie
    fastify.get('/api/oAuthRequest', async function(request, reply){
        //redirect to bungie AuthO portal.
        reply.code(303).redirect();
    });
    fastify.get('/api/oAuthResponse', handler.);


}



module.exports = apiAuthorizedEndpoints;