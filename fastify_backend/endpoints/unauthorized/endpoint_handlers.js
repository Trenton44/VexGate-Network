const path = require ('path');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/wrapper.js'));

async function oAuthResponse(request, reply){
    if(request.session.state != decodeURIComponent(request.query.state)){
        request.session.destroy()
        return reply.code(400).send("Unable to validate session, user must re-authenticate.");
    }
    return d2helper.requestAccessToken(request.query.code)
    .then( (result) => { 
        //save or overwrite session's token data
        helper.saveTokenData(request.session, result.data); 
        console.log(request.session.auth_data);
        console.log(request.session.user_data);
        //redirect to root, which will cause prehandler to obtain d2_membership_id, and root will reroute to /user/:id
        return reply.code(303).redirect("/");
    }).catch( (error) => { 
        //Something went wrong, just display error text on the screen
        console.log(error);
        return reply.code(400).send("unable to obtain access token."); 
    });
}

module.exports = {oAuthResponse};