const fs = require('fs')
const path = require ('path');
require('dotenv').config({path: '.env'});
const fastify = require('fastify')
const fastifySession = require('@fastify/session');
const fastifyCookie = require('@fastify/cookie');

const D2APIInterface = require('./bungie_api/api_interface.js');
const D2APIWrapper = require('./bungie_api/d2_api_wrapper.js');
const D2APISchemas = require('./bungie_api/response_schemas.js');
const endpoint_schemas = require('./schemas.js');
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

server_app.register(function(fastify, options, next){
    fastify.addHook('preHandler', (request, reply, next) => {
        console.log("this should be processed before accessing any /api endpoint.");
        if(!request.session.authData)
            reply.code(400).send({error: "Not authorized to access."});
        next();
    });
    fastify.get("/api/retrieveCharacterIds", {schema: endpoint_schemas.retrieveCharacterIds}, async (request, reply) => {

        //smallest request i know to obtain the character ids.
        let id = request.query.d2_membership_id;
        let token = request.session.authData.access_token;
        let mem_type = request.session.d2_accounts[id].membership_type;
        let [result, error] = await D2APIWrapper.GetProfile(token, id, { components: ["100"]}, mem_type);
        if(error != undefined){ console.log(error); return error; }
        let data = result.data.Response.profile.data;
        data.characterIds.forEach(function(current){ ses.user.d2_accounts[id].characters[current] = {}; });
        ses.user.last_played_d2 = data.dateLastPlayed; //updates this too, so saving it cause why not
    
        console.log(result.data.Response);
    });
    fastify.get('/api/getCredentialTypes', {schema: endpoint_schemas.requireMembershipId}, async (request, reply) => {
        let id = request.query.membership_id;
        let token = request.session.authData.access_token;
        let [result, error] = await D2APIWrapper.GetCredentialTypesForTargetAccount(token, id);
        if(error != undefined){ console.log(error); return error; }
        let data = result.data.Response;
        console.log(data);
        return result.data;
    });
    fastify.get('/api/getLinkedProfiles', {schema: endpoint_schemas.requireMembershipId}, async (request, reply) => {
        let id = request.query.membership_id;
        let token = request.session.authData.access_token;
        let [result, error] = await D2APIWrapper.GetLinkedProfiles(token, id);
        if(error != undefined){ console.log(error); return error; }
        let data = result.data.Response;
        console.log(data);
    });
    fastify.get('/api/getMember', async (request, reply) => {
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
    next();
});

server_app.register(function(fastify, options, next){
    fastify.addHook('preHandler', (request, reply, next) => {
        console.log("this should always ping.");
        next();
    });

    fastify.get('/api/oAuthRequest', async (request, reply) => {
        let redirect = D2APIInterface.generateAuthORedirect(request);
        reply.code(303).redirect(encodeURI(redirect));
    });

    fastify.get('/api/oAuthResponse', { schema: D2APISchemas.OAuthResponse }, async (request, reply) => {
        //Need to add checking to make sure this is only accessible from bungie
        if(request.session.state != decodeURIComponent(request.query.state)){
            request.session.destroy();
            //needs to return an error based on a schema. schemas are up next for implementation
            return false;
        }
        let [result, error] = await D2APIInterface.APITokenRequest(decodeURIComponent(request.query.code));
        if(error != undefined){ return "error"; }
        D2APIInterface.processAPITokenResponse(request.session, result.data);
        reply.code(303).redirect("/");
    });
    server_app.get('/print', async(request, reply) => {
        console.log(request.session.data);
        console.log(request.session.user);
        return true;
    });
    fastify.get('/login', function(request, reply){ reply.sendFile("index.html"); });
    fastify.get('/', function(request, reply){ reply.sendFile("index.html"); });
    next();
});

server_app.listen({ port: process.env.PORT_NUMBER, host: '0.0.0.0' }, function(error, address){
    if(error)
        process.exit(1);
});