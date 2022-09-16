//Source code for the backend itself.


const prettify = (promise) => {
    return promise
    .then(result => ([result, undefined]))
    .catch(error => ([undefined, error]));
};

require('dotenv').config({path: '.env'});
const fs = require('fs')
const path = require ('path');
const D2APIInterface = require('./bungie_api/api_interface.js');
const D2APIWrapper = require('./bungie_api/d2_api_wrapper.js');
let compiled_front_end = path.join(__dirname, '..', '/react_frontend/build');


const server_app = require('fastify')({
    logger: true,
    http2: true,
    https: {
        allowHTTP1: true,
        key: fs.readFileSync("/etc/pki/tls/private/fastify_backend_selfsigned.key"),
        cert: fs.readFileSync("/etc/pki/tls/certs/fastify_backend_selfsigned.crt")
    }
});
server_app.register(require('@fastify/static'), { root: compiled_front_end });
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

server_app.get('/bnet_auth_request', async (request, reply) => {
    let redirect = D2APIInterface.generateAuthORedirect(request);
    reply.code(303).redirect(encodeURI(redirect));
});
server_app.get('/bnet_auth_response', async (request, reply) => {
    if(request.session.state != decodeURIComponent(request.query.state)){
        request.session.destroy();
        //needs to return an error based on a schema. schemas are up next for implementation
        return false;
    }
    let [result, error] = await prettify(D2APIInterface.APITokenRequest(decodeURIComponent(request.query.code)));
    if(error != undefined){ return "error"; }
    D2APIInterface.processAPITokenResponse(request, result.data);
    reply.code(303).redirect("/");
});

server_app.get('/test', async (request, reply) => {
    let id = request.session.user.membership_id;
    let token = request.session.authData.access_token;
    let [result, error] = await prettify(D2APIWrapper.GetMembershipDataById(id, token));
    if(error != undefined){ return error; }
    return result.data;
});

server_app.listen({ port: process.env.PORT_NUMBER, host: '0.0.0.0' }, function(err, address){ if(err){ process.exit(1); } });
