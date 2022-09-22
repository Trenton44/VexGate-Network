const path = require ('path');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/wrapper.js'));
const d2api = require(path.join(__dirname, '..', '..', '/bungie_api/api.js'));
const formatter = require("./json_response_structure.js");

async function api_characterIds(request, reply){
    request.log.info("User is requesting to access character ids under this d2 account.");
    let id = request.query.id; //this is a d2_membership_id.
    let token = request.session.auth_data.access_token;
    let membership_type = request.session.user_data.d2_account.membership_type;
    //component 100 returns basic info from api about character, most importantly character ids
    return d2api.GetProfile(token, id, { components: ["100"]}, membership_type)
    .then( (result) => {
        let data = result.data.Response.profile.data;
        return data.characterIds;
    }).catch( (error) => {
        return error;
    });
}

async function api_characterData(request, reply){
    request.log.info("User is requesting to access a character's data under this d2 account.");
    let d2_membership_id = request.query.d2_membership_id;
    let character_id = request.query.character_id;
    let token = request.session.auth_data.access_token;
    let membership_type = request.session.user_data.d2_account.membership_type;
    
    //components in order: Characters, Inventory, Equipment
    return d2api.GetCharacter(token, d2_membership_id, character_id, { components: ["200", "201", "205"] }, membership_type)
    .then( (result) => {
        let data = result.data.Response;
        data.inventory = formatter.characterInventoriesComponent(data.inventory);
        data.equipment = formatter.characterEquipmentComponent(data.inventory);
        data.character = formatter.characterInfoComponent(data.inventory);
        return data;
    }).catch( (error) => {
        console.log(error)
        return Error("unable to get character data.");
    });
}
module.exports = {api_characterIds, api_characterData}