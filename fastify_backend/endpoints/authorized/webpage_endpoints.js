const path = require ('path');
const fastify = require('fastify')

const handler = require('./endpoint_handlers.js');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/wrapper.js'));

// Contains all webpages that require access to data from bungie api
// pre-handler verifies 
//  -user is authenticated
//  -user has a membership_id
// if user has no d2_membership_id, one is obtained before moving to endpoint, as it is required for some.
// if authorization check fails, should reply with a redirect to the /login endpoint
let webpageAuthorizedEndpoints = (fastify, options, next) => {
    //validate authorization and necessary data exist to proceed.
    fastify.addHook('preHandler', validateAccess);

    //webpage for user using the d2_membership_id, not bungie membership_id
    //this is the default redirect, with the id so that the frontend react router has it
    fastify.get('/user/:id', async (request, reply) => { return reply.sendFile("index.html"); });

    //root should redirect to /user/:id by default. if user is not logged in, prehander will redirect to /login
    fastify.get('/', function(request, reply){ 
        console.log("redirecting to /user");
        reply.code(303).redirect("/user/"+request.session.user_data.d2_account.id);
    });

    next();
}
//validates access to the endpoints contained in this file.
// redirects unauthorized access to /login
async function validateAccess(request, reply){
    console.log("user has requested access to a authorized endpoint.");
    console.log("validating tokens");
    await helper.validateTokens(request.session)
    .catch( (error) => {
        console.log(error);
        return reply.code(303).redirect("/login");
    });

    //check for membership_id. this should be obtained with the access tokens
    // so if we're this far and it's missing, something's gone horribly wrong.
    if(request.session.user_data.membership_id == undefined){
        return reply.code(303).redirect("/login");
    }
    
    // ensure that at least one d2 account has data stored in this session.
    // validating that passed data from the frontend matches the session's will be the problem of the endpoints,
    // we just want to ensure something is there as a minimum.
    if(request.session.user_data.d2_account != undefined)
        return true;
    
    //no data found, but we know membership_id exists, so we will pull d2 data from bungie.
    return d2helper.getD2MembershipData(request.session.auth_data.access_token, request.session.user_data.membership_id)
    .then( (result) => {
        request.session.user_data.d2_account = result;
        return true;
    }).catch( (error) => {
        //well, something went wrong, so user's gonna have to login.
        return reply.code(303).redirect("/login");
    });
}


module.exports = webpageAuthorizedEndpoints;