//Don't really need to simplify anything in this yet, so for now it just returns the data it got.
const DestinyDefinitions = require(path.join(__dirname, '..', '..', '/bungie_api/jsonWorldContent.json'));

function Common_DestinyDisplayPropertiesDefinition(data){
    return data;
}

function DestinyRaceDefinition(hash){
    return DestinyDefinitions.DestinyRaceDefinition[hash];
}
function DestinyGenderDefinition(hash){
    return DestinyDefinitions.DestinyGenderDefinition[hash];
}
function DestinyClassDefinition(hash){
    return DestinyDefinitions.DestinyClassDefinition[hash];
}
function Lore_DestinyLoreDefinition(hash){
    return DestinyDefinitions.DestinyLoreDefinition[hash];
}
function DestinyObjectiveDefinition(hash){
    return DestinyDefinitions.DestinyObjectiveDefinition[hash];
}
function Records_DestinyRecordTitleBlock(data){
    //leaving unfinished for now
    return data;
}
function DestinyStatDefinition(data){
    let stats = {};
    for (item in data){
        if(item.redacted){
            continue; //just skips over content for now.
        }
        stats[item.displayProperties.name] = {
            aggregationType: item.aggregationType,
            hasComputedBlock: item.hasComputedBlock,
            statCategory: item.statCategory,
            hash: item.hash,
            index: item.index,
        };
        stats[item.displayProperties.name].display_data = Common_DestinyDisplayPropertiesDefinition(item.displayProperties);
    }
    return stats;

}
function DestinyRecordDefinition(data){
    if(data.redacted){
        return {
            redacted: true
        };
    }
    let record_data = {
        scope: data.scope,
        presentationInfo: data.presentationInfo, //API says "see: " Destiny.Definitions.Presentation.DestinyPresentationChildBlock
        record_value_style: data.recordValueStyle,
        for_title_gild: data.forTitleGilding,
        shoulduse_largeicon: data.shouldShowLargeIcons,
        presentation_nodeType: data.presentationNodeType,
        trait_ids: data.traitIds,
        hash: data.hash,
        investment_table_index: data.index,
    }
    record_data.display_data = Common_DestinyDisplayPropertiesDefinition(data.displayProperties);
    lore_data = Lore_DestinyLoreDefinition(data.loreHash);
    record_data.objective_data = {};
    data.objectiveHashes.map(function(current, index){
        let objective_data = DestinyObjectiveDefinition(current);
        record_data.objective_data[objective_data.displayProperties.name] = objective_data;
    });
    record_data.title_data = Records_DestinyRecordTitleBlock(data.titleInfo);
    //the following need to be transcribed from API still, just pulling direct values for now.
    record_data.completion_data = data.completionInfo;
    record_data.state_data = data.stateInfo;
    record_data.requirements = data.requirements;
    record_data.expiration_data = data.expirationInfo;
    record_data.interval_data = data.intervalInfo;
    record_data.reward_items = data.rewardItems;
    record_data.trait_hashlist = data.traitHashes;
    record_data.parent_node_hashes = data.parentNodeHashes;


}
function Characters_DestinyCharacterComponent(data){
    let component_data = {
        membership_id: data.membershipId,
        membership_type: data.membershipType,
        character_id: data.characterId,
        last_played: data.dateLastPlayed,
        current_session_minutes: minutesPlayedThisSession,
        time_played: data.minutesPlayedTotal,
        light: data.light,
        race_hash: data.raceHash,
        class_hash: data.classHash,
        gender_hash: data.genderHash,
        race_type: data.raceType,
        class_type: data.classType,
        gender_type: data.genderType,
        emblem_data: {
            path: data.emblemPath,
            background_path: data.emblemBackgroundPath,
            hash: data.emblemHash, //Note, this maps to DestinyInventoryItemDefinition, will need to come back to this later.
            colors: data.emblemColor,
        },
        level: data.baseCharacterLevel,
        level_progression: data.levelProgression,
        level_progress: data.percentToNextLevel,

    };
    component_data.stats = DestinyStatDefinition(data.stats);
    component_data.race_data = DestinyRaceDefinition(data.raceHash);
    component_data.class_data = DestinyGenderDefinition(data.classHash);
    component_data.gender_data = DestinyClassDefinition(data.genderHash);
    component_data.title_data = DestinyRecordDefinition(data.titleRecordHash);

    return component_data;
}
function Inventory_DestinyInventoryComponent(data){
    data = data.items;
    
}
function DestinyInventoryItemDefinition(data){

}
function SingleComponentResponseofDestinyCharacterComponent(data){
    if(data.disabled){
        return null;
    }
    //if(data.privacy == 0) this may be needed later, but not sure how to process now.
    return Characters_DestinyCharacterComponent(data.data);

}
function SingleComponentResponseOfDestinyInventoryComponent(data){
    if(data.disabled){
        return null;
    }
    //if(data.privacy == 0) this may be needed later, but not sure how to process now.
    return Inventory_DestinyInventoryComponent(data.data);
}

module.exports = {SingleComponentResponseofDestinyCharacterComponent};