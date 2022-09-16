//Source code for the backend itself.

require('dotenv').config({path: '.env'});
const fs = require('fs')
const path = require ('path');
const D2API = require('./bungie_api/d2_api_wrapper.js');
const bungieAuthO = require('./bungie_api/authO.js');

let compiled_front_end = path.join(__dirname, '..', '/react_frontend/build');
const bungie_root = "https://www.bungie.net";
const api_root = bungie_root+"/Platform";

const server_app = require('fastify')({
    logger: true,
    http2: true,
    https: {
        allowHTTP1: true,
        key: fs.readFileSync("/etc/pki/tls/private/fastify_backend_selfsigned.key"),
        cert: fs.readFileSync("/etc/pki/tls/certs/fastify_backend_selfsigned.crt")
    }
});
server_app.register(require('@fastify/static'), {
    root: compiled_front_end,
});
server_app.register(require('@fastify/cookie'));
server_app.register(require('@fastify/session'), { secret: process.env.SESSION_SECRET });

server_app.addHook('preHandler', (request, reply, next) => {
    //session setup code goes here.
    let session = request.session;
    session.cookie.cookieName = "D2APIApp";
    session.cookie.secure = true;
    session.cookie.sameSite = 'strict';
    next();
});

server_app.get('/', function(request, reply){ reply.sendFile("index.html"); });

server_app.get('/bnet_auth_request', function(request, reply) {
    let redirect = bungieAuthO.generateAuthORedirect(request);
    reply.code(303).redirect(encodeURI(redirect));

});
server_app.get('/bnet_auth_response', async (request, reply) => {
    if( request.session.state != decodeURIComponent(request.query.state)){
        request.session.destroy();
        //This is where we would return an error object
        return false; 
    }
    await bungieAuthO.APITokenRequest(decodeURIComponent(request.query.code))
    .then(function(result){
        bungieAuthO.processAPITokenResponse(request, result.data);
        return true;
    }).catch(function(error){
        return error;
    });
    reply.code(303).redirect("/");
});

server_app.get('/test', async (request, reply) => {
    return {token: request.session.authData.access_token}; 
});

server_app.listen({ port: process.env.PORT_NUMBER, host: '0.0.0.0' }, function(err, address){ if(err){ process.exit(1); } });
