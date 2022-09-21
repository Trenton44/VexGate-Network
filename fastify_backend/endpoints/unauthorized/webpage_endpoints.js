const path = require ('path');
const handler = require('./endpoint_handlers.js');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/unique_functions.js'));

//login page, which returns frontend so react router can route to /login
fastify.get('/login', function(request, reply){ reply.sendFile("index.html"); });