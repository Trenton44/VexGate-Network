const path = require ('path');
const handler = require('./endpoint_handlers.js');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/unique_functions.js'));

// Contains all webpages that require access to data from bungie api
// pre-handler verifies 
//  -user is authenticated
//  -user has a membership_id
// if user has no d2_membership_id, one is obtained before moving to endpoint, as it is required for some.
// if authorization check fails, should reply with a redirect to the /login endpoint

function webpageAuthorizedEndpoints(fastify, options, next){
    //validate authorization and necessary data exist to proceed.
    fastify.addHook('preHandler', validateAccess);

    //webpage for user using the d2_membership_id, not bungie membership_id
    //this is the default redirect, with the id so that the frontend react router has it
    fastify.get('/user/:id', async (request, reply) => { return reply.sendFile("index.html"); });

    //root should redirect to /user/:id by default. if user is not logged in, prehander will redirect to /login
    fastify.get('/', function(request, reply){ 
        reply.code(303).redirect("/user/"+request.session.user_data.d2_account.id);
     });

     next();
}
//validates access to the endpoints contained in this file.
async function validateAccess(request, reply){
    await helper.validateTokens(request.session)
    .then( (result) => { return result; })
    .catch( (error) => {
        //regardless of the error, we want the user to be redirected to /login.
        return reply.code(303).redirect("/login");
    });

    //check for membership_id. this should be obtained with the access tokens
    // so if we're this far and it's missing, something's gone horribly wrong.
    if(request.session.user_data.membership_id == undefined)
        return reply.code(303).redirect("/login");

    // ensure that at least one d2 account has data stored in this session.
    // validating that passed data from the frontend matches the session's will be the problem of the endpoints,
    // we just want to ensure something is there as a minimum.
    if(request.session.user_data.d2_account == undefined){
        //no data found, but membership_id exists, so we will pull it from bungie.
        return d2helper.getD2MembershipData(request.session.auth_data.access_token, request.session.user_data.membership_id)
        .then( (result) => {
            request.session.user_data.d2_account = result;
            return true;
        }).catch( (error) => {
            //well, something went wrong, so user's gonna have to login.
            return reply.code(303).redirect("/login");
        });
    }
    //all is well, the user should be able to access everything.
    return true;
}

module.exports = webpageAuthorizedEndpoints;