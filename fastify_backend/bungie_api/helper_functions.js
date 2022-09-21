const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
require('dotenv').config({path: '../.env'});

const D2APIWrapper = require('./d2_api_wrapper.js');

const bungie_root = "https://www.bungie.net";
const api_root = bungie_root+"/Platform";
const auth_url = bungie_root+"/en/OAuth/Authorize";
const token_url = api_root+"/App/OAuth/token/";
const refresh_url = api_root+"/App/OAuth/token/";



//Returns nothing but the d2 membership id of the primary account. This is what the webpage will first load.
async function getD2MembershipID(token, membership_id){
    return D2APIWrapper.GetMembershipDataById(token, membership_id)
    .then((result) => {
        let data = result.data.Response;
        let d2_membership_id = "";
        data.destinyMemberships.forEach(function(current){
            if(current.crossSaveOverride == current.membershipType)
                d2_membership_id = current.membershipId;
        });
        return d2_membership_id;
    })
    .catch((error) => {
        console.log("unable to get access via Id call"); return error;
    });
}


//FUNCTIONS FOR OAUTH REQUEST/RESPONSE WITH BUNGIE API
function AuthORedirectURL(session_store){
    let request_body = {
        client_id: process.env.BUNGIE_CLIENT_ID,
        response_type: "code",
        state: crypto.randomBytes(16).toString("base64")
    };
    session_store.state = request_body.state;
    request_body = new URLSearchParams(request_body);
    let redirect_url = new URL(auth_url);
    redirect_url.search = request_body;
    return encodeURI(redirect_url);
};
function requestAccessToken(authorization_code){
    let request_body = {
        method: "POST",
        url: token_url,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: new URLSearchParams({
            client_secret: process.env.BUNGIE_CLIENT_SECRET,
            client_id: process.env.BUNGIE_CLIENT_ID,
            grant_type: "authorization_code",
            code: authorization_code,
        })
    };
    return axios(request_body)
}
function requestRefreshToken(refresh_token){
    let request_body = {
        method: "POST",
        url: refresh_url,
        headers: {"X-API-Key": process.env.BUNGIE_API_KEY},
        data: new URLSearchParams({
            client_secret: process.env.BUNGIE_CLIENT_SECRET,
            client_id: process.env.BUNGIE_CLIENT_ID,
            grant_type: "refresh_token",
            refresh_token: refresh_token, //this was decrypted in original code here, will need to add this functionality
        })
    };
    return axios(request_body)
}



module.exports = {getD2MembershipID, AuthORedirectURL, requestAccessToken, requestRefreshToken};

/*[result, error] = await D2APIHelper.getD2MembershipID(request.session.auth_data.access_token, request.session.user_data.membership_id);
    if(error != undefined){ return "error"; }
    return reply.code(303).redirect("/user/"+result); */