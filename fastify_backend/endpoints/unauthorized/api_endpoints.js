const path = require ('path');
const fastify = require('fastify');

const handler = require('./endpoint_handlers.js');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/wrapper.js'));

let apiUnauthorizedEndpoints = (fastify, options, next) => {
    fastify.addHook('preHandler', async function(request, reply){
        //nothing necessary here atm, but I'm keeping it for consistency with authorized endpoints
        return true;
    });

    //fastify.get('/api/test', handler.test);

    //these two /api endpoints are for authorizing with the bungie api, and processing the response from bungie
    fastify.get('/api/oAuthRequest', async function(request, reply){
        //redirect to bungie AuthO portal.
        let [url, state] = d2helper.AuthORedirectURL();
        request.session.state = state;
        console.log(request.session.state);
        reply.code(303).redirect(url);
    });
    fastify.get('/api/oAuthResponse', handler.oAuthResponse);

    next();
}



module.exports = apiUnauthorizedEndpoints;