async function getD2MembershipData(token, membership_id){
    return D2APIWrapper.GetMembershipDataById(token, membership_id)
    .then((result) => {
        let data = result.data.Response;
        let d2_account = {};
        data.destinyMemberships.forEach(function(current){
            if(current.crossSaveOverride != current.membershipType)
                return;
            d2_account.id = current.membershipId;
            d2_account.membership_type = current.membershipType;
            return;
        });
        return d2_account;
    })
    .catch((error) => {
        console.log("unable to get access via Id call"); return error;
    });
}






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