//Source code for the backend itself.

require('dotenv').config({path: '.env'});
const path = require ('path');
const D2API = require('./bungie_api/d2_api_wrapper.js');
const bungieAuthO = require('./bungie_api/authO.js');
const fastify = require('fastify')({
    logger: true
});

const bungie_root = "https://www.bungie.net";
const api_root = bungie_root+"/Platform";
// So it turns out DestinyItemManager handles things in local storage, which makes sense. But I dont wanna do that, so we're gonna proceed as normal.
/* However, it seems my earlier method is a bit janky, so we're going to attempt to tidy up this situation with the following:
when a user access the webpage, server should check for an existing cookie, with our own session Id. if none exists, we make one for this user.
this way, when a user logs in via a link on the webpage going to bungie "not via a link to this server which then redirects to bungie, as the original was."
the redirect goes back to the server, which then will connect the bungie API Response to the user's session id. that way the token stays in server.


*/
fastify.get('/bnet_auth_response', async (request, reply) => {
    bungieAuthO.AuthOLoginRedirect(request, reply);
});

fastify.get('/test', function(request, reply) {
    console.log("requesting manifest from bungie");
    bungieAuthO.APIGet(api_root+"/Destiny2/Manifest/")
    .then(function(result){
        reply.send(result.data);
    }).catch(function(error){
        reply.send(error.data);
    }); 
});

fastify.listen({ port: process.env.PORT_NUMBER, host: '0.0.0.0' }, function(err, address){
    if(err){
        process.exit(1);
    }
})
