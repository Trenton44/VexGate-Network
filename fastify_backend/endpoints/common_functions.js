async function validateTokens(store, reply){
    //if auth_data isn't set, user has never logged in.
    if(store.auth_data == undefined) return "Not authorized to access";

    //User has logged in previously, check to make sure access/refresh tokens are still valid.
    // note both tokens are saved using Date.now() + (token's expiration timer)
    let at_expire = session_store.auth_data.access_expiration;
    let rt_expire = session_store.auth_data.refresh_exipration;
    if(Date.now() > at_expire){
        //access token has expired, check the refresh token.
        //If it's expired, nothing we can do, they gotta log back in
        if(Date.now() > rt_expire) 
            return "Refresh token expired, user will need to re-authenticate"
        
        //refresh token is still valid, obtain new access/refresh from bungie api.
        let result = await D2APIHelper.requestRefreshToken(store.auth_data.refresh_token);
        //Save the token data & bungie membership_id to the session store
        helper.saveTokenData(store, result.data);
        return true;
    }
}

module.exports = {validateTokens};