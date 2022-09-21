const path = require('path');
const D2APIHelper = require(path.join(__dirname, '..', '/bungie_api/helper_functions.js'));
const HelperFunc = require(path.join(__dirname, '..', 'endpoint_common_functions.js'));
/*
    The flow of each of these functions should be as follows:
    -obtain user parameters from querystring, and token data from session
    -make bungie api request.
    -filter the results to only data the frontend needs. output schema needs to match this.
    -return filtered data to frontend

    Errors should be handled by generating an appropriate error object and returning it to the frontend.
    frontend is responsible for recovering.
*/

async function redirectToD2API(request, reply){
    let url = D2APIHelper.AuthORedirectURL(request.session);
    reply.code(303).redirect(url);
}
async function handleD2APIResponse(request, reply){
    //add a check for an error here, in case the response is a failure.
    if(request.session.state != decodeURIComponent(request.query.state)){
        request.session.destroy();
        return reply.code(400).send("Unable to validate session, user must re-authenticate.");
    }
    return D2APIHelper.requestAccessToken(request.query.code)
    .then( (result) => {
        HelperFunc.saveTokenData(request.session, result.data);
        return D2APIHelper.getD2MembershipID(request.session.auth_data.access_token, request.session.user_data.membership_id)
        .then( (d2_id) => {
            return reply.code(303).redirect("/user/"+d2_id);
        }).catch( (error) => {
            return "unable to access d2 id, please let me know this messed up.";
        });
    }).catch( (error) => {
        return reply.code(400).send(error);
    });
}

module.exports = {redirectToD2API, handleD2APIResponse};