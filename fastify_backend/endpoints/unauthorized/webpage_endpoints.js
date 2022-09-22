const path = require ('path');
const fastify = require('fastify')
const handler = require('./endpoint_handlers.js');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/wrapper.js'));

//login page, which returns frontend so react router can route to /login
let webpageUnauthorizedEndpoints = (fastify, options, next) => {
    fastify.addHook('preHandler', async function(request, reply){
        //nothing necessary here atm, but I'm keeping it for consistency with authorized endpoints
    });
    fastify.get('/login', async function(request, reply){ return reply.sendFile("index.html"); });

    next();
}

module.exports = webpageUnauthorizedEndpoints;