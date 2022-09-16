const D2APIInterface = require('./api_interface.js');
const bungie_root = "https://www.bungie.net";
const api_root = bungie_root+"/Platform";

function GetCredentialTypesForTargetAccount(membership_id, token){
    let path = api_root+"/User/GetCredentialTypesForTargetAccount/"+membership_id+"/";
    return D2APIInterface.APIGet(path, token);
}

function GetMembershipDataById(membership_id, token){
    let path = api_root+"/User/GetMembershipsById/"+membership_id+"/-1/";
    return D2APIInterface.APIGet(path, token);
}
module.exports = {GetCredentialTypesForTargetAccount, GetMembershipDataById};