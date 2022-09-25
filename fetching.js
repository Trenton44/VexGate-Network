const api_doc = require("./fastify_backend/bungie_api/openapi.json");
const manifest_def = require("./fastify_backend/bungie_api/manifest_files/en/jsonWorldContent.json");

let api_link = "/Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/";
let data = {};


//helper function
function parseSchemaRef(refstring, delim) {
    if(delim == undefined){ delim = "/"; } 
    let newstring = refstring.split(delim);

    if(newstring[0] === "#"){ return newstring.slice(1); }
    else { return newstring;}
}

//helper function
function getSchemaFromLink(link){
    link = link.slice(0);
    let reference = api_doc[link[0]];
    link.shift(); //we just found the first section, so remove it from the search loop.
    link.forEach((i) => { 
        reference = reference[i]; });
    return reference;
}

//this is verified to work for all endpoints with get or post request types (all endpoints use status_code 200 it seems)
function schemaLinkFromAPIPath(url, request_type, status_code){
    let link = api_doc.paths[url][request_type].responses[status_code]["$ref"];
    return parseSchemaRef(link, "/");
}

//
function schemaLinkFromResponsesPath(obj){
    //api_doc.components.responses[keys[i]].content['application/json'].schema.properties.Response;
    let result = obj.content["application/json"].schema.properties.Response;
    if(result.type == 'array')
        return result.items["$ref"];
    else{
        try{
            result = result["$ref"];
            if(result == undefined)
                throw "no.";
            return result;
        }
        catch {
            return Error();
        }
    }
}

//this will be a recursive function
// go through properties and match data to the schema. 
// if a $ref is encountered, go another level in, with that schema link and corresponding data.
// return the data once done. Ideally, at the final stage, we'll check for a custom-built formatter, and 
// can format it on the spot there, or return in original format otherwise
// either way, this will let me return hash data recursively. That's the real end goal.


function propertyProcessor(name, schema, data){
    switch(schema.type){
        case "Integer":
            processIntegerProperty(name, schema, data);
            break;
        case "Object":
            processObjectProperty(name, schema, data);
            break;
        case "Array":
            break;
        default:
            throw Error("A new property type approaches: "+schema.type);
    }
}

function processIntegerProperty(name, schema, data){
    console.log(name);
    if(schema["x-enum-values"] != undefined){
        console.log("this value is mapped to a enum.");
    }
        
    if(schema["x-mapped-definition"] != undefined){
        console.log("this value is mapped to a definition.");
        //mapped to a definition, which should all be enums?
        //This tells us where to find the definition.
        link_to_def_schema = parseSchemaRef(schema["x-mapped-definition"]["$ref"]);
        propertyProcessor(link_to_def_schema, getSchemaFromLink(link_to_def_schema), data);
    }
    if(schema["x-dictionary-key"] != undefined){
        console.log(name);
        console.log(schema);
        throw Error("found an integer property with x-dictionary-key");
    }
    console.log("Found this, looks to be an actual integer.");
    return schema;
}
function processObjectProperty(name, schema, data){
    console.log(name);
    if(schema["x-dictionary-key"] != undefined){
        console.log("keys in this value are mapped, we'll come back to this.");
    }
    if(schema["x-destiny-component-type-dependency"] != undefined){
        console.log("this is based on the component "+schema["x-destiny-component-type-dependency"]+". we can ignore for now, will use this to compare for data later.");

    }
    let prop_store_count = 0;
    if(schema.properties != undefined){
        prop_store_count += 1;
        console.log("Found data in properties");
        for( [name, property] of Object.entries(schema.properties)){
            propertyProcessor(name, property, data)
        }
        return true;
    }
    if(schema.additionalProperties != undefined){
        prop_store_count += 1;
        console.log("Found data in additionalProperties");
        if(schema.additionalProperties["$ref"] != undefined){
            if(schema["x-destiny-component-type-dependency"] != undefined){
                console.log("this property is based on components");
                console.log("ignore for now.");
            }

            //easiest solution, pass the data with the schema and go.
            link_to_def_schema = parseSchemaRef(schema.additionalProperties["$ref"]);
            return propertyProcessor(link_to_def_schema, getSchemaFromLink(link_to_def_schema), data);
        }
        console.log("Well, this additionalProperties is apparently a normal value.");
        console.log(name, schema.additionalProperties)
        

    }
    if(schema.allOf != undefined){
        //going to assume for now that any allOf appearance will have just one value, $ref.
        prop_store_count += 1;
        console.log("Found data in allOf");
        //it wants allOf, so just pass all the data in with the schema.
        //allof is an array of 1 object, so we want array pos 0, prop $ref
        link_to_def_schema = parseSchemaRef(schema.allOf[0]["$ref"]);
        propertyProcessor(link_to_def_schema, getSchemaFromLink(link_to_def_schema), data);

    }
    if(prop_store_count > 1){
        throw Error("foundsomething with multiple object properties to parse.");
    }
    console.log(name);
    console.log(schema);
    throw Error("This object apparently has zero data.");
}
let obj = api_doc.components.schemas;
keys = Object.keys(obj);
keys.sort();
let split_keys = [];
for(i in keys){
    split_keys[i] = parseSchemaRef(keys[i]);
    split_keys[i].unshift("schemas");
    split_keys[i].unshift("components");
}


for(j in split_keys){
    keys_sep = split_keys[j];
    //console.log(keys_sep);
    current_schema = getSchemaFromLink(keys_sep);
    //console.log(current_schema);
    //processSchemaContainingData(keys_sep[keys_sep.length - 1], current_schema, {});
    for(i in split_keys){

    }
}


//Some notes:
// most responses conform to the function, and have ref in the Response object
// responses with type 'array' though, have an items list, with the ref object in it.


//Outliers of schemas:
/*
BungieMembershipType[] -> array
Config.ClanBanner.ClanBannerSource -> object
Destiny.HistoricalStats.Definitions.DestinyActivityModeType[] -> array
Destiny.HistoricalStats.Definitions.PeriodType[] -> array
Destiny.HistoricalStats.DestinyHistoricalStatsResults -> object
 */

/* 
Here's how we're gonna break down the schemas:
look for schema type first. I've confirmed that, as of 09/23/2022:
schema type "integer" -> it's an enum value. will that change in the future? who knows.
schema type "object" -> nothing specific here, but we can process it with properties & additionalProperties.
schema type "array" -> every one of these stores it's data in .items, so we can use that and go from there.

*/