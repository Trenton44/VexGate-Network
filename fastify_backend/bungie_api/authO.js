// Code for Auth0 authentication between the their api and this one
// As well as the get/post requests for interaction

const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config({path: '../.env'});
const bungie_root = "https://www.bungie.net";
const api_root = bungie_root+"/Platform";
let auth_url = new URL(bungie_root+"/en/OAuth/Authorize");
let token_url = new URL(api_root+"/App/OAuth/token/");
let refresh_url = new URL(api_root+"/App/OAuth/token/");



//All of these functions should probably have schema response validation implemented.

// This function is intended, unlike the rest, to be used with fastify as a redirect function
// the Bungie API doesn't allow for local server login, so to access and develop, a server on a webhost is required.
// Note: this may change based on notes from server.js
function AuthOLoginRedirect(request, response){
    request_body = {
        client_id: process.env.BUNGIE_CLIENT_ID,
        response_type: "code",
        state: crypto.randomBytes(16).toString("base64")
    };
    var request_body = new URLSearchParams(request_body);
    response.redirect(auth_url);
}
//validate return response's state, destroys session if false
function validateAuthOState(request, response){
    if(request.query.state != request.session.state){
        request.session.destroy();
        //This is where we would return an error object
        return false;
    }
    return true;
}

function APITokenRequest(authCode){
    let request_object = {
        method: "POST",
        url: token_url,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        data: new URLSearchParams({
            client_secret: process.env.BUNGIE_CLIENT_SECRET,
            client_id: process.env.BUNGIE_CLIENT_ID,
            grant_type: "authorization_code",
            code: authCode
        })
    };
    return axios(request_object);
}
function APITokenRefresh(refresh_token){
    request_object = {
        method: "POST",
        url: refresh_url,
        headers: {"X-API-Key": process.env.BUNGIE_API_KEY},
        data: new URLSearchParams({
            client_secret: process.env.BUNGIE_CLIENT_SECRET,
            client_id: process.env.BUNGIE_CLIENT_ID,
            grant_type: "refresh_token",
            refresh_token: refresh_token //this was decrypted in original code here, will need to add this functionality
        })
    };
    return axios(request_object);
}
//Saves the result of APITokenRefresh & APITokenRequest 
function processAPITokenResponse(request, token_data){
    /* Original code:
        tokenData.tokenExpiration = new Date().getTime()+((tokenData.expires_in)*1000);
        tokenData.refreshExpiration = new Date().getTime()+(tokenData.refresh_expires_in*1000);
        request.session.cookie.maxAge = tokenData.refreshExpiration;
        request.session.membership_id = tokenData.membership_id;
        request.session.tokenData = encryptData(tokenData); 
    */
   return true;
}

//General post/get functions for interacting with the API
function APIPost(path, body, token){
    request_object = {
        method: "POST",
        url: path,
        headers: {"X-API-Key":process.env.BUNGIE_API_KEY},
        data: body
    };
    if(token)
        request_object.headers.Authorization = "Bearer "+token;
    return axios(request_object);
}
function APIGet(path, token){
    request_object = {
        method: "GET",
        url: path,
        headers: {"X-API-Key":process.env.BUNGIE_API_KEY},
    };
    if(token)
        request_object.headers.Authorization = "Bearer "+token;
    return axios(request_object);
}

module.exports = {AuthOLoginRedirect, validateAuthOState, APITokenRequest, APITokenRefresh, processAPITokenResponse, APIPost, APIGet};