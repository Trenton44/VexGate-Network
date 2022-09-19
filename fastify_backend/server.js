//Source code for the backend itself.

async function middlewareSystem(fastify, opts){
    fastify.use('/api/(.*)', function(request, reply){
        if(!request.session.authData)
            reply.code(303).redirect("/login");
    });
}

require('dotenv').config({path: '.env'});
const fs = require('fs')
const path = require ('path');
const D2APIInterface = require('./bungie_api/api_interface.js');
const D2APIWrapper = require('./bungie_api/d2_api_wrapper.js');
const D2APISchemas = require('./bungie_api/response_schemas.js');
let compiled_front_end = path.join(__dirname, '..', '/react_frontend/build');


const server_app = require('fastify')({
    logger: true,
    http2: true,
    https: {
        allowHTTP1: true,
        key: fs.readFileSync("/etc/pki/tls/private/fastify_selfsigned.key"),
        cert: fs.readFileSync("/etc/pki/tls/certs/fastify_selfsigned.crt")
    }
});



server_app.register(require('@fastify/cookie'));
server_app.register(require('@fastify/session'), { secret: process.env.SESSION_SECRET });

server_app.register(require('@fastify/middie')).register(middlewareSystem);
server_app.register(require('@fastify/static'), { root: compiled_front_end, prefix: '/assets/' });
server_app.addHook('preHandler', (request, reply, next) => {
    //session setup code goes here.
    let session = request.session;
    session.cookie.cookieName = "D2APIApp";
    session.cookie.secure = true;
    session.cookie.sameSite = 'strict';
    next();
});


server_app.get('/bnet_auth_request', async (request, reply) => {
    let redirect = D2APIInterface.generateAuthORedirect(request);
    reply.code(303).redirect(encodeURI(redirect));
});
server_app.get('/bnet_auth_response', { schema: D2APISchemas.OAuthResponse }, async (request, reply) => {
    console.log(request);
    if(request.session.state != decodeURIComponent(request.query.state)){
        request.session.destroy();
        //needs to return an error based on a schema. schemas are up next for implementation
        return false;
    }
    let [result, error] = await D2APIInterface.APITokenRequest(decodeURIComponent(request.query.code));
    if(error != undefined){ return "error"; }
    D2APIInterface.processAPITokenResponse(request, result.data);
    reply.code(303).redirect("/");
});

server_app.get('/api/getCredentialTypes', async (request, reply) => {
    let token = request.session.authData.access_token;
    let membership_id = request.session.user.membership_id;
    let [result, error] = await D2APIWrapper.GetCredentialTypesForTargetAccount(token, membership_id);
    if(error != undefined){ console.log(error); return error; }
    console.log(result.data.Response);
    request.session.user.accounts = result.data.Response;
    return result.data;
});
server_app.get("/api/character_ids", function(request, reply){

});
server_app.get('/api/getMember', async (request, reply) => {
    let token = request.session.authData.access_token;
    let membership_id = request.session.user.membership_id;
    let [result, error] = await D2APIWrapper.GetMembershipDataById(token, membership_id);
    if(error != undefined){ console.log(error); return error; }
    let data = result.data.Response;
    console.log(data);
    request.session.user.primary_membership_id = data.primaryMembershipId; //can be null,do no rely on this in the future, for testing only
    request.session.user.d2_accounts = {};
    data.destinyMemberships.forEach(function(current){
        request.session.user.d2_accounts[current.membershipId] = {
            membership_type: current.membershipType,
            applicatable_membertypes: current.applicableMembershipTypes,
            gamertag: current.bungieGlobalDisplayName+"#"+current.bungieGlobalDisplayNameCode,
            membership_id: current.membershipId,
            is_public: current.isPublic
        };
    });
});
server_app.get('/api/getCharIds', async(request, reply) => {
    //smallest request i know to obtain the character ids.
    let ses = request.session;
    let id = ses.user.primary_membership_id; // this will be passed from front end eventually.
    let token = ses.authData.access_token;
    let mem_type = ses.user.d2_accounts[id].membership_type;
    let [result, error] = await D2APIWrapper.GetProfile(token, d2_membership_id, { components: ["100"]}, mem_type);
    if(error != undefined){ console.log(error); return error; }
    let data = result.data.Response.profile.data;
    data.characterIds.forEach(function(current){ ses.user.d2_accounts[id].characters[current] = {}; });
    ses.user.last_played_d2 = data.dateLastPlayed; //updates this too, so saving it cause why not

    console.log(result.data.Response);
});

server_app.get('/print', async(request, reply) => {
    console.log(request.session.data);
    console.log(request.session.user);
    return true;
});


server_app.get('/*', function(request, reply){ console.log("At catchall"); reply.sendFile("index.html"); });


server_app.listen({ port: process.env.PORT_NUMBER, host: '0.0.0.0' }, function(err, address){ if(err){ process.exit(1); } });
