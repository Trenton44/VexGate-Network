const D2APIWrapper = require('./bungie_api/d2_api_wrapper.js');
/*
    The flow of each of these functions should be as follows:
    -obtain user parameters from querystring, and token data from session
    -make bungie api request.
    -filter the results to only data the frontend needs. output schema needs to match this.
    -return filtered data to frontend

    Errors should be handled by generating an appropriate error object and returning it to the frontend.
    frontend is responsible for recovering.
*/
async function validateAccess(session_store, reply){
    if(!session_store.auth_data) //runs if auth data doesn't exist, null or undefined
    return reply.code(400).send({error: "Not authorized to access"});
    let at_expire = session_store.auth_data.access_expiration;
    let rt_expire = session_store.auth_data.refresh_exipration;
    if(Date.now() > at_expire){
        //console.log("Access token expired, requesting a new one.");
        if(Date.now() > rt_expire)
            return reply.code(400).send({error: "Refresh token expired, user will need to re-authenticate"});
        let [result, error] = await requestRefreshToken(session_store.auth_data.refresh_token);
        if(error != undefined)
        return reply.code(400).send({error: "unable to refresh access, user will need to re-authenticate"});
        saveToken(session_store, result.data);
    }
    return true;
}
function saveTokenData(token_store, api_response){
    token_store.auth_data = {
        access_token: api_response.access_token,
        token_type: api_response.token_type,
        access_expiration: Date.now() + api_response.expires_in,
        refresh_token: api_response.refresh_token,
        refresh_exipration: Date.now() + api_response.refresh_expires_in
   };
   token_store.user_data = { membership_id: api_response.membership_id };
   return true;
}
async function retrieveCharacterIds(request, reply){
    //smallest request i know to obtain the character ids.
    let id = request.query.d2_membership_id;
    let token = request.session.auth_data.access_token;
    let mem_type = request.session.d2_accounts[id].membership_type;
    let [result, error] = await D2APIWrapper.GetProfile(token, id, { components: ["100"]}, mem_type);
    if(error != undefined){ console.log(error); return error; }
    let data = result.data.Response.profile.data;
    data.characterIds.forEach(function(current){ request.session.user_data.d2_accounts[id].characters[current] = {}; });
    request.session.user_data.last_played_d2 = data.dateLastPlayed; //updates this too, so saving it cause why not
    console.log(result.data.Response);
};
async function getCredentialTypes(request, reply){
    let id = request.query.membership_id;
    let token = request.session.auth_data.access_token;
    let [result, error] = await D2APIWrapper.GetCredentialTypesForTargetAccount(token, id);
    if(error != undefined){ console.log(error); return error; }
    let data = result.data.Response;
    console.log(data);
    return result.data;
};
async function getLinkedProfiles(request, reply){
    let id = request.query.membership_id;
    let token = request.session.auth_data.access_token;
    let [result, error] = await D2APIWrapper.GetLinkedProfiles(token, id);
    if(error != undefined){ console.log(error); return error; }
    let data = result.data.Response;
    return data;
};
async function getMember(request, reply){
    let token = request.session.auth_data.access_token;
    let membership_id = request.session.user_data.membership_id;
    let [result, error] = await D2APIWrapper.GetMembershipDataById(token, membership_id);
    if(error != undefined){ console.log(error); return error; }
    let data = result.data.Response;
    console.log(data);
    request.session.user_data.primary_membership_id = data.primaryMembershipId; //can be null,do no rely on this in the future, for testing only
    request.session.user_data.d2_accounts = {};
    data.destinyMemberships.forEach(function(current){
        request.session.user_data.d2_accounts[current.membershipId] = {
            membership_type: current.membershipType,
            applicatable_membertypes: current.applicableMembershipTypes,
            gamertag: current.bungieGlobalDisplayName+"#"+current.bungieGlobalDisplayNameCode,
            membership_id: current.membershipId,
            is_public: current.isPublic
        };
    });
};

//get the bare minimum from bungie net to build the webpage components and start retrieiving actual data.
/*async function getEssentialPayload(request, reply){
    //Obtain bare minimum data needed by the session to setup the frontend for further requests

    let token = request.session.auth_data.access_token;
    let membership_id = request.session.user_data.membership_id;
    let [result, error] = await D2APIWrapper.GetMembershipDataById(token, membership_id);
    if(error != undefined){ return reply.code(400).send({error: "unable to access user data."}); }
    let data = result.data.Response;
    request.session.user_data.primary_account = {
        crossSaveIcons: [],
    };
    //data.destinymembership array follows structure of GroupsV2.GroupUserInfoCard
    data.destinyMemberships.forEach(function(current){
        var session_store = request.session.user_data.primary_account;
        // skip any accounts that are overriden by cross save.
        // will probably want to come back later and add the list of connected cross saves, but that's extra
        console.log(session_store.crossSaveIcons);
        if(current.crossSaveOverride != current.membershipType) {
            request.session.user_data.primary_account.crossSaveIcons.push(current.iconPath);
            return; //equivalent of continue in this function
        }
        request.session.user_data.primary_account.membership_type = current.membershipType;
        request.session.user_data.primary_account.gamertag = current.bungieGlobalDisplayName+"#"+current.bungieGlobalDisplayNameCode;
        request.session.user_data.primary_account.d2_membership_id = current.membershipId;
        request.session.user_data.primary_account.is_public = current.isPublic;
    });
    
    //Use the D2 accounts to retrieve character id's
}*/

module.exports = {validateAccess, saveTokenData, retrieveCharacterIds, getCredentialTypes, getLinkedProfiles, getMember};