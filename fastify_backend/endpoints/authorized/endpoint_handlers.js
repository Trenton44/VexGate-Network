const path = require ('path');
const helper = require(path.join(__dirname, '..', 'common_functions.js'));
const d2helper = require(path.join(__dirname, '..', '..', '/bungie_api/wrapper.js'));
const d2api = require(path.join(__dirname, '..', '..', '/bungie_api/api.js'));
const formatter = require("./response_schemas.js");
const DestinyDefinitions = require(path.join(__dirname, '..', '..', '/bungie_api/jsonWorldContent.json'));

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
    
    //components in order: Characters, Inventory, Equipment, item perks, instancedItem's data, & item stats
    return d2api.GetCharacter(token, d2_membership_id, character_id, { components: ["200", "201", "205", "302", "300", "304"] }, membership_type)
    .then( (result) => {
        let data = result.data.Response;
        /*let character = data.character.data;
        let inventory = data.inventory.data.items;
        let equipment = data.equipment.data.items;
        let character_stats = {};
        for(stat in character.stats){
            stat_def = DestinyDefinitions.DestinyStatDefinition[stat];
            character_stats[stat_def.displayProperties.name] = {
                name: stat_def.displayProperties.name,
                icon: "https://www.bungie.net"+stat_def.displayProperties.icon,
                description: stat_def.displayProperties.description
            }
        }
        inventory = inventory.map(function(current, index){
            if(!current.itemInstanceId){

            }
            return {
                state: current.state,
            };
        });
        let formatted_data = {
            character: {
                class: DestinyDefinitions.DestinyClassDefinition[character.classHash].displayProperties.name,
                race: DestinyDefinitions.DestinyRaceDefinition[character.raceHash].displayProperties.name,
                race_description: DestinyDefinitions.DestinyRaceDefinition[character.raceHash].displayProperties.description,
                gender: DestinyDefinitions.DestinyGenderDefinition[character.genderHash].displayProperties.name,
                light: character.light,
                emblem_data: {
                    background_path: "https://www.bungie.net"+character.emblemBackgroundPath,
                    hash: character.emblemHash,
                    emblem_path: "https://www.bungie.net"+character.emblemPath
                },
                time_played: character.minutesPlayedTotal,
                stats: character_stats,
                title_data: {
                    name: DestinyDefinitions.DestinyRecordDefinition[character.titleRecordHash].displayProperties.name,
                    icon: "https://www.bungie.net"+DestinyDefinitions.DestinyRecordDefinition[character.titleRecordHash].displayProperties.icon,
                    description: DestinyDefinitions.DestinyRecordDefinition[character.titleRecordHash].displayProperties.description
                }
            },
            inventory: {

            }
        }*/
        return data;
    }).catch( (error) => {
        console.log(error)
        return Error("unable to get character data.");
    });
}
module.exports = {api_characterIds, api_characterData}

