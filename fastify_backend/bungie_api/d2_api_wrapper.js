const D2APIInterface = require('./api_interface.js');
const bungie_root = "https://www.bungie.net";
const api_root = bungie_root+"/Platform";

// Functions categorized as "User" on the bnet API docs

async function GetCredentialTypesForTargetAccount(token, membership_id){
    let path = api_root+"/User/GetCredentialTypesForTargetAccount/"+membership_id+"/";
    return D2APIInterface.APIGet(path, token);
};

// Functions categorized as "Destiny2" on the bnet API docs
function GetDestinyManifest(){
    let path = api_root+"/Destiny2/Manifest/";
    return D2APIInterface.APIGet(path);
};

function SearchDestinyPlayerByBungieName(token, display_name, display_code, membership_type){
    if(!membership_type) membership_type = "-1"; // -1 is the enum value for all membership types. hopefully remove this hardcoding later.
    let body = {
        displayName: display_name,
        displayNameCode: display_code
    };
    let path = api_root+"/Destiny2/SearchDestinyPlayerByBungieName/"+membership_type+"/";
    return D2APIInterface.APIPost(path, body, token);

};

function GetLinkedProfiles(token, membership_id, membership_type){
    if(!membership_type) membership_type = "-1"; // -1 is the enum value for all membership types. hopefully remove this hardcoding later.
    let path = api_root+"/Destiny2/"+membership_type+"/Profile/"+membership_id+"/LinkedProfiles/";
    return D2APIInterface.APIGet(path, token);
};

function GetProfile(token, destiny_membership_id, components, membership_type){
    if(!membership_type) membership_type = "-1"; // -1 is the enum value for all membership types. hopefully remove this hardcoding later.
    let path = api_root + "/Destiny2/"+membership_type+"/Profile/"+destiny_membership_id+"/";
    let params = new URLSearchParams(components);
    path = new URL(path);
    path.search = params;

    return D2APIInterface.APIGet(path.toString(), token);

};

function GetMembershipDataById(token, membership_id, membership_type){
    if(!membership_type) membership_type = "-1"; // -1 is the enum value for all membership types. hopefully remove this hardcoding later.
    let path = api_root+"/User/GetMembershipsById/"+membership_id+"/"+membership_type+"/";
    return D2APIInterface.APIGet(path, token);
};





module.exports = {GetDestinyManifest, GetCredentialTypesForTargetAccount, GetMembershipDataById, GetLinkedProfiles, GetProfile, SearchDestinyPlayerByBungieName};