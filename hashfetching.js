const api_doc = require("./fastify_backend/bungie_api/openapi.json");
const manifest_def = require("./fastify_backend/bungie_api/manifest_files/en/jsonWorldContent.json");

function parseSchemaRef(refstring){ return refstring.split("/").slice(1); }
function getSchemaFromRef(parsed_link){
    let reference = api_doc[parsed_link[0]];
    parsed_link.shift(); //we just found the first section, so remove it from the search loop.
    parsed_link.forEach((i) => {
        reference = reference[i];
    });
    return reference;
}
function getAPIResponseSchema(url, request_type, status_code){
    let result = api_doc.paths[url][request_type].responses[status_code]["$ref"];
    return result;
}
function getAPIResponseContractLink(schema){
    let result = schema.content //All should be inside content
    result = result["application/json"]; //For now, assuming all content is coming as application/json
    result = result.schema.properties.Response["$ref"]; //we want the schema ref inside of the Response properties
    return result;
}
function getRequestedSchemas(components_schema_list, requested_components_int){
    
}

let api_link = "/Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/";
let api_response = {};
let components = [];
let api_request_type="get";
let status_code = "200";

let schema_link = parseSchemaRef(getAPIResponseSchema(api_link, api_request_type, status_code));
console.log("link: "+schema_link);
console.log();
let schema = getSchemaFromRef(schema_link);
console.log("Schema: "+JSON.stringify(schema));
console.log();
let schema_contract_link = parseSchemaRef(getAPIResponseContractLink(schema)); 
console.log("link: " + schema_contract_link);
console.log();
let schema_contract = getSchemaFromRef(schema_contract_link); 
console.log("Schema: "+JSON.stringify(schema_contract));
console.log();

component_list = schema_contract.properties;
for(i in component_list){
    
    if()
    component_schema = component_list[i].allOf[0]["$ref"];
}






function checkforXTypeHeader(keylist){
    for(i in keylist){
        for(j in XTypeHeaderList){
            if(i == j)
                return i;
        }
    }
    return false;
}
function processXTypeHeader(header){
    switch(header){
        case "x-mapped-definition":
        case "x-mobile-manifest-name":
        case "x-enum-values":
        case "x-destiny-component-type-dependency":
            console.log("its a component");
            return components["Destiny.DestinyComponentType"]["x-enum-values"];
        case "x-dictionary-key":
        case "x-preview":
    }
}

XTypeHeaderList = ["x-mapped-definition", "x-mobile-manifest-name", "x-enum-values", "x-destiny-component-type-dependency", "x-dictionary-key", "x-preview",];

//IMPORTANT NOTES:
/* As best as I can tell: 
    Integer types can be one of three things:
        -An actual integer
        -An x-mapped-definition
        -An x-enum-values
    Array types will have an items array with one of the following:
        -a $ref, which means it's got a schema
        -a "type" (and maybe a "format"), which means it's storing actual variables
            Note that the schema property might have an x-mapped-definition along with .items (Ex: Destiny.Entities.Characters.DestinyCharacterProgressionComponent)
            I believe that means that the data values are coded to the x-mapped-definition, while the items are keyed by the other schema
        -NOTE: Destiny.Components.Items.DestinyItemReusablePlugsComponent
            This has an array "items", with a $ref. but it ALSO has a x-dictionary-key, which i believe means
            That the keys of the array are mapped to an x-dictionary-key.
            SideNote: x-dictionary-key is apparently only used to strongly type the vars so i think i can ignore that for now.
        -the items array could have a type/format, and x-enum-reference, which holds the $ref instead of "items"
        implying that each value in the array is mapped to an enum
    As a side side note: I didn't add x-destiny-component-type-dependency in this array notes
    That's a whole other can of worms that I don't have the brain power to think about tonight

    Object types: can have one of the following:
    -properties, in which case return a recursive calc of each property
    -additionalProperties, which can just be one or many
        Note that Destiny.Milestones.DestinyPublicMilestoneChallengeActivity has an object booleanActivityOptions,
        which is mapped to x-dictionary-key. 
        Common.Models.CoreSettingsConfiguration has a property systems,
        which has additionalProperties.$ref AND is x-dictionary-key mapped.


Notes on General Consensus:
x-type-headers can be on any property type, and tell you something important about the property
each property can then store it's ref in a few places, or just be a normal type

To process these properties:
    Objects:
        -check for x-type headers
        -if exist, handle processing based on header
        -check for properties in each keyword, iterate through all existing
        -recursively check each property with a schema, return true if it's just a standard type (for now, data here later.)
    Integers:
        -check for x-type headers
        -if exist, handle processing based on header
        return specified values

NEW OUTLIER, X-DICTIONARY-KEY CAN BE AN X-ENUM-REFERENCE
Destiny.Definitions.DestinyRaceDefinition genderedRaceNames

DictionaryComponentResponseOfint64AndDestinyCharacterComponent
 has a property type data with this as an outlier:
 "data": {
          "type": "object",
          "additionalProperties": {
            "x-destiny-component-type-dependency": "Characters",
            "$ref": "#/components/schemas/Destiny.Entities.Characters.DestinyCharacterComponent"
          },
          "x-dictionary-key": {
            "type": "integer",
            "format": "int64"
          }
        },
*/