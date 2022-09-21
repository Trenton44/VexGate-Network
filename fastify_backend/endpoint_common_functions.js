function saveTokenData(session_store, api_response){
    session_store.auth_data = {
        access_token: api_response.access_token,
        token_type: api_response.token_type,
        access_expiration: Date.now() + api_response.expires_in,
        refresh_token: api_response.refresh_token,
        refresh_exipration: Date.now() + api_response.refresh_expires_in
   };
   session_store.user_data = { membership_id: api_response.membership_id };
   return true;
}
module.exports = {saveTokenData};