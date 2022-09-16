const D2APIInterface = require('./api_interface.js');
const bungie_root = "https://www.bungie.net";
const api_root = bungie_root+"/Platform";


function GetDestinyManifest(){
    let path = api_root+"/Destiny2/Manifest/";
    return D2APIInterface.APIGet(path);
};

function GetCredentialTypesForTargetAccount(token, membership_id){
    let path = api_root+"/User/GetCredentialTypesForTargetAccount/"+membership_id+"/";
    return D2APIInterface.APIGet(path, token);
}

function GetMembershipDataById(token, membership_id, membership_type){
    if(!membership_type) membership_type = "-1"; // -1 is the enum value for all membership types. hopefully remove this hardcoding later.
    let path = api_root+"/User/GetMembershipsById/"+membership_id+"/"+membership_type+"/";
    return D2APIInterface.APIGet(path, token);
};

function GetLinkedProfiles(token, membership_id, membership_type){
    if(!membership_type) membership_type = "-1"; // -1 is the enum value for all membership types. hopefully remove this hardcoding later.
    let path = api_root+"/Destiny2/"+membership_type+"/Profile/"+membership_id+"/LinkedProfiles/";
    return D2APIInterface.APIGet(path, token);
};

module.exports = {GetDestinyManifest, GetCredentialTypesForTargetAccount, GetMembershipDataById, GetLinkedProfiles};