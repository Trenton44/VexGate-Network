const fs = require('fs')
const path = require ('path');
require('dotenv').config({path: '.env'});
const fastify = require('fastify')
const fastifySession = require('@fastify/session');
const fastifyCookie = require('@fastify/cookie');

const authorized_endpoints = require('./authorized_endpoints/endpoints.js');
const unauthorized_endpoints = require('./unauthorized_endpoints/endpoints.js');
const compiled_front_end = path.join(__dirname, '..', '/react_frontend/build');

const server_app = fastify({
    logger: true,
    //http2: true,
    https: {
        allowHTTP1: true,
        key: fs.readFileSync("/etc/pki/tls/private/fastify_selfsigned.key"),
        cert: fs.readFileSync("/etc/pki/tls/certs/fastify_selfsigned.crt")
    }
});

server_app.register(fastifyCookie);
server_app.register(fastifySession,{
    secret: process.env.SESSION_SECRET,
    cookieName: "d2_api",
    cookie: {
        path: "/",
        maxAge: 3600000, //1 Hour in milliseconds
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    }
});
server_app.register(require('@fastify/static'), { root: compiled_front_end, prefix: '/assets/' });
server_app.register(authorized_endpoints);
server_app.register(unauthorized_endpoints);
server_app.listen({ port: process.env.PORT_NUMBER, host: '0.0.0.0' }, function(error, address){
    if(error)
        process.exit(1);
});