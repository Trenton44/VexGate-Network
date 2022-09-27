const d2_definitions = require("./manifest_files/en/jsonWorldContent.json"); 

//Note, transform_config functions cannot be used on properties that are basic types, like integer, string, etc. Rule of thumbs is objects and arrays only.
//  Also, I as of now can't map indexed objects, so if a route has its keys indexed, subtree configs here just won't ever be reached.
const transform_config = {
    "components": {
        "schemas": {
            "Destiny.Entities.Characters.DestinyCharacterComponent": {
                "transform": function(data) {
                    let altered_stats = {};
                    for(i in data.stats){
                        let stat_def = d2_definitions.DestinyStatDefinition[i];
                        altered_stats[stat_def.displayProperties.name] = data.stats[i];
                    }
                    data.stats = altered_stats;
                    data.race_data = d2_definitions.DestinyRaceDefinition[data.raceHash];
                    data.gender_data = d2_definitions.DestinyGenderDefinition[data.genderHash];
                    data.class_data = d2_definitions.DestinyClassDefinition[data.classHash];
                    return data;
                }
            }
        }
    }
};

module.exports = transform_config;