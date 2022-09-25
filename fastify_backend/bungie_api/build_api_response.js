/*
    IMPORTANT NOTE:
    currently, there are some values that exist in the API that are not documented by the api_doc schemas.
    So, for now, we need to include a check that looks to see if a given property exists in the schema, and if it doesn't, just ignore it and return the value

    Logs that helped me discover this issue: (dismantleProperties doesn't exist in docs)
        [
    'components',
    'schemas',
    'Destiny.Entities.Items.DestinyItemComponent'
    ]
    itemHash
    itemInstanceId
    quantity
    bindStatus
    location
    bucketHash
    transferStatus
    lockable
    state
    dismantlePermission
    TypeError: Cannot read properties of undefined (reading '$ref')
        at processObjectProperties (/home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:157:38)
        at processTypeObject (/home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:139:16)
        at propertyTypeProcessor (/home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:92:20)
        at /home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:114:63
        at Array.map (<anonymous>)
        at processTypeArray (/home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:114:29)
        at propertyTypeProcessor (/home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:95:20)
        at processObjectProperties (/home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:168:28)
        at processTypeObject (/home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:139:16)
        at propertyTypeProcessor (/home/ec2-user/Fastify-Destiny/fastify_backend/bungie_api/build_api_response.js:92:20)
*/

const api_doc = require("./openapi.json");
const test_data = require("./characterdata.json");
const x_type_headers_list = ["x-mapped-definition", "x-mobile-manifest-name", "x-enum-reference", "x-enum-values", "x-destiny-component-type-dependency", "x-dictionary-key", "x-preview"];
const data_transformer = require("./transform_data.js");
//takes the following: 
//  -The PATH of the endpoint AS SHOWN IN THE DOCUMENTATION! Ex: Destiny2.GetCharacter would be (with the braces) /Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/
//  -the type of request (get, post, etc.)
//  -The status code of the request (ideally 200)
function processAPIEndpointData(path, request_type, status_code, endpoint_data){
    let key_list = ["paths", path, request_type, "responses", status_code, "$ref"];
    let api_path = traverseObject(key_list, api_doc);
    if(!api_path)
        throw Error("api path returned bad. wha happn");
    let api_endpoint_schema_link = parseLocalSchemaLink(api_path);
    let schema = getSchemaFromLocalLink(api_endpoint_schema_link);

    key_list = ["content", "application/json", "schema","properties", "Response", "$ref"];
    let response_schema_link = traverseObject(key_list, schema);
    if(!response_schema_link)
        throw Error("Couldn't parse key_list");

    //gotta parse that ref link to iterable json keys.
    let parsed_response_object_schema_link = parseLocalSchemaLink(response_schema_link);
    let response_object_schema = getSchemaFromLocalLink(parsed_response_object_schema_link);
    //and now, let the data mapping/recursion begin.
    return propertyTypeProcessor(parsed_response_object_schema_link, response_object_schema, endpoint_data);
}

//defaults to the api_doc
function traverseObject(keylist, searchObj){
    if(searchObj == undefined){ searchObj = api_doc; }
    try{
        keylist.forEach( (key) => { 
            searchObj = searchObj[key]; 
        });
    }
    catch {
        return false;
    }
    return searchObj;
}


// The idea with these three functions is, after the data at a property has been configured, i check a custom config object to see if a matching key exists
// If it does exist, run transformations on the data based on what I have inside the config object.
// Some examples I want to note down so i don't forget
//      - x-type-headers: since this stuff is auto-mapped to schemas, i don't need x-destiny-component-type-dependency. 
//          However, i could use x-mapped-definition or x-enum-reference, and map to a default "identifier" or "number". then i can override that choice in a config object if i wish
//      - character stat list: I don't like that they're mapped by hash, so i can include an config object "Destiny.Entities.Characters.DestinyCharacterComponent", that has a value x-dictionary-key: identifier. then the transform goes there an remaps the keys to the stat name, not hash
//      - Destiny.Entities.Characters.DestinyCharacterComponent stores race, gender, etc as hashes. i could have a property in the config object raceHash: function(). that function takes the data and pulls the data from the hash, then saves it under raceHash, or save it as another key, race_data.
//This should only be called/set on objects and arrays. due to how the recursion keys work, we can't do it on basic types, see text above for how i know this now.
function transformData(key_list, schema, data){
    let reference = null;
    try{
        key_list.forEach( (key, index) => {
            if(index == 0) {
                reference = data_transformer[key];
                return;
            }
            reference = reference[key];
        });
    }
    //if no config for the current keylist exists, "try" will throw a "cannot access property of undefined". 
    //if that happens, we're done here.
    catch { return data; } 
    if(reference == undefined){ return data; }
    // keywords, reduce (to filter the data) 
    if(reference.transform instanceof Function)
        data = reference.transform(data);
    return data;
}

//Bungie open-api file currently uses local references, in the form of #/{link in json}.
// this function takes that and parses it into an array so i can iterate through the json file to the actual schema
function parseLocalSchemaLink(link, delimiter){
    //some of the keys in the api reference are combined together, Ex: components/schemas/Applications.ApiUsage puts Application.ApiUsage into one key.
    // I added this so I could split them while testing, leaving the functionality in in case it ever is needed
    if(!delimiter){ delimiter = "/";  }
        
    let newstring = link.split(delimiter); //split into an array

    if(newstring[0] === "#") { return newstring.slice(1); } //I don't want the leading #, so remove if it's there.
    else { return newstring; }
}

//Takes the resulting array from calling parseLocalSchemaLink(), 
// Iterates through the json file, key by key, to where the requested schema is located.
//The two are separated for now for the sake of simplicity
function getSchemaFromLocalLink(link){
    let reference = null;
    link.forEach( (key, index) => {
        if(index == 0) { 
            reference = api_doc[key];
            return; //equivalent of continue here.
        }
        reference = reference[key];

    });
    return reference;
}

//The big kahunga, the central function all processing gonna go through.
// directs processing based on the schema's type property. Doesn't actually do any data processing though.
function propertyTypeProcessor(key_list, schema, data){
    switch(schema.type){
        case "object":
            data = processTypeObject(key_list, schema, data);
            return transformData(key_list, schema, data);
        case "array":
            data = processTypeArray(key_list, schema, data);
            return transformData(key_list, schema, data);
        default:
            //If it's not an array or object, it should be able to be mapped from schema value -> data value.
            data = processTypeBasic(key_list, schema, data);
            return transformData(key_list, schema, data);
    }
}

//Process any appearance of an array type inside the api_doc json.
//Thankfully, arrays are just lists of other types, so this logic is easy.
//Currently, Bungie only ever puts one type of data into arrays at endpoints, so that's why the logic checks for
// If more than one at a time ever show up, this function is not daijoubu
function processTypeArray(key_list, schema, data){
    //all arrays i've found store the reference in the "items" keyword, so add that to the list of assumptions I've made here.
    let itemlist = traverseObject(["items", "$ref"], schema);
    if(itemlist){
        key_list = parseLocalSchemaLink(itemlist);
        schema = getSchemaFromLocalLink(key_list);
    }
    else { schema = schema.items; }

    let new_data = data.map( (current, index) => { return propertyTypeProcessor(key_list, schema, current); });
    return new_data;
}

//Processes what we find at the bottom of the endless schemas upon schemas: your good 'ol bools, ints, strings, and etc.
//data actually gets mapped to points here. any custom mapping for specific data (like hash values -> corresponding def) will occur here too
function processTypeBasic(key_list, schema, data){ 
    return data; 
}

//Process any appearance of an object type inside the api_doc json.
// takes the data, and maps it to schema data as desired.
//Note, this works off the assumption that schemas only have one of the existing keywords:
//  -properties
//  -additionalProperties
//  -allOf
//If one appears with more, i will cry.
function processTypeObject(key_list, schema, data){
    if(schema.properties)
        return processObjectProperties(key_list, schema.properties, data); //Handles the data recursion
    else if(schema.additionalProperties)
        return processObjectAdditionalProperties(key_list, schema, data);
    else if(schema.allOf)
        return processObjectAllOfRef(key_list, schema, data);
    else 
        throw Error("This object has no properties, God help us all."); //We really shouldn't ever come here, so adding a throw here as a red flag that somethin's up.
}

//Some appearances of objects in the schema ref store values in the properties keyword.
// this handles that data and returns the mapped values.
function processObjectProperties(key_list, schema_prop_list, data){
    console.log("");
    let parsed_properties = {};
    for(property in data){
        console.log("checking property "+property);
        let passed_keylist = key_list;
        //check if property exists in the api schema
        propSchema = traverseObject([property], schema_prop_list);
        console.log("result: "+propSchema);
        if(!propSchema){
            console.log(property +" doesn't exist in api docs, so skip and ignore");
            parsed_properties[property] = data[property];
            continue;
        }
        console.log("Property "+property+" does exist in the schema.");
        propSchema = traverseObject([property, "$ref"], schema_prop_list);
        if(propSchema){
            console.log("Has $ref: "+propSchema);
            passed_keylist = parseLocalSchemaLink(propSchema);
            schema = getSchemaFromLocalLink(key_list);
        }
        else{
            passed_keylist = key_list.slice(0);
            passed_keylist.push(property);
            schema = schema_prop_list[property];
        }
        parsed_properties[property] = propertyTypeProcessor(passed_keylist, schema, data[property]);
    }
    return parsed_properties; //return the list of data, now mapped as desired with the properties.
}

//Some appearances of objects in the schema ref store values in the additionalProperties keyword.
// this handles that data and returns the mapped values.
// Realistically, this could appear along with the properties keyword, and would only get the data that wasn't processed there.
// But that doesn't happen in the api currently, and that logic is hard, so it'll get implemented after a blueprint is established.
function processObjectAdditionalProperties(key_list, schema, data){
    //additionalProperties tend to follow a schema reference, so we handle that recursion here.
    let propSchema = traverseObject(["additionalProperties", "$ref"], schema);
    if(propSchema){
        key_list = parseLocalSchemaLink(propSchema);
        schema = getSchemaFromLocalLink(key_list); 
    }
    //If it's not holding a schema, it's gotta be holding another property type, so we continue the recursion.
    else{ schema = schema.additionalProperties; }
    return propertyTypeProcessor(key_list, schema, data);
}

//Some objects in the doc, like the components, have a schema ref stored in an allOf keyword.
// This handles that and returns the values.
function processObjectAllOfRef(key_list, schema, data){
    console.log("this will probably fail.");
    let propSchema = traverseObject(["allOf", 0, "$ref"], schema);
    console.log("it didn't fail: "+propSchema);
    if(propSchema){
        console.log("it didn't fail: ");
        console.log(propSchema);
        key_list = parseLocalSchemaLink(propSchema);
        schema = getSchemaFromLocalLink(key_list);
    }
    else{
        //every instance currently of allOf has one value, the $ref. should this ever change, I'll have to add the logic.
        throw Error(test(count)+"First instance in allOf not $ref, unsupported.");
    }
    return propertyTypeProcessor(key_list, schema, data);
}
/*
let api_doc_link = "/Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/";
let request_type = "get";
let code = "200";
let blah = processAPIEndpointData(api_doc_link, request_type, code, test_data);
console.log(blah);
const fs = require('fs');
fs.writeFile("parsedcharacterdata.json", JSON.stringify(blah), (result) => console.log("success"));
*/
module.exports = processAPIEndpointData;