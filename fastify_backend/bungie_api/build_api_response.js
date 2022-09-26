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
    catch { return false; }
    if(searchObj == undefined) { return false; }
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
    try{ let typeExists = schema.type; }
    catch{ throw Error("Found nonexistent schema, this shouldn't happen."); }
    let indexed = false;
    if(traverseObject(["x-dictionary-key"], schema)){ indexed = true; }
    if(traverseObject(["x-mapped-definition"], schema)){ indexed = true; }
    if(traverseObject(["x-enum-values"], schema)){ indexed = true; }
    switch(schema.type){
        case "object":
            data = processTypeObject(key_list, schema, data, indexed);
            return transformData(key_list, schema, data);
        case "array":
            data = processTypeArray(key_list, schema, data, indexed);
            return transformData(key_list, schema, data);
        default:
            //If it's not an array or object, it should be able to be mapped from schema value -> data value.
            data = processTypeBasic(key_list, schema, data, indexed);
            return transformData(key_list, schema, data);
    }
}

//Process any appearance of an array type inside the api_doc json.
//Thankfully, arrays are just lists of other types, so this logic is easy.
//Currently, Bungie only ever puts one type of data into arrays at endpoints, so that's why the logic checks for
// If more than one at a time ever show up, this function is not daijoubu
function processTypeArray(key_list, schema, data, indexed){
    //all arrays i've found store the reference in the "items" keyword, so add that to the list of assumptions I've made here.
    let itemlist = traverseObject(["items", "$ref"], schema);
    if(itemlist){
        key_list = parseLocalSchemaLink(itemlist);
        schema = getSchemaFromLocalLink(key_list);
    }
    else { 
        // NOTE: COUNT THESE NOTES AS OUTDATED FOR NOW, BUT THEY MAY BE USEFUL IN SOME EXTREME CASE IN THE FUTURE
        //  I discovered during my ordeal with indexed properties (see processObjectProperties)
        //  that some arrays in the api (see Destiny.Entities.Items.DestinyItemPerksComponent) 
        //are NOT listed under items, but are listed under the parent schema's property key.
        //  So, if we can't find .items.$ref, we check for schema.items. If that fails, we check for [key_list[-1]]
        //  And if THAT doesn't exist, we stumped. So I'll throw an error for now to see if this ever is a problem.
        schema = schema.items; 
    }

    let new_data = data.map( (current, index) => { return propertyTypeProcessor(key_list, schema, current); });
    return new_data;
}

//Processes what we find at the bottom of the endless schemas upon schemas: your good 'ol bools, ints, strings, and etc.
//data actually gets mapped to points here. any custom mapping for specific data (like hash values -> corresponding def) will occur here too
function processTypeBasic(key_list, schema, data, indexed){ 
    return data; 
}

//Process any appearance of an object type inside the api_doc json.
// takes the data, and maps it to schema data as desired.
//Note, this works off the assumption that schemas only have one of the existing keywords:
//  -properties
//  -additionalProperties
//  -allOf
//If one appears with more, i will cry.
function processTypeObject(key_list, schema, data, indexed){
    if(schema.properties)
        return processObjectProperties(key_list, schema, data, indexed); //Handles the data recursion
    else if(schema.additionalProperties)
        return processObjectAdditionalProperties(key_list, schema, data, indexed);
    else if(schema.allOf)
        return processObjectAllOfRef(key_list, schema, data, indexed);
    else 
        throw Error("This object has no properties, God help us all."); //We really shouldn't ever come here, so adding a throw here as a red flag that somethin's up.
}

//Some appearances of objects in the schema ref store values in the properties keyword.
// this handles that data and returns the mapped values.
function processObjectProperties(key_list, schema, data, indexed){
    let schema_prop_list = schema.properties;
    let parsed_properties = {};
    for(property in data){
        let passKeys = key_list.slice(0);
        let passSchema = schema_prop_list;

        if(traverseObject([property, "$ref"], passSchema)){
            passKeys = parseLocalSchemaLink(traverseObject([property, "$ref"], passSchema));
            passSchema = getSchemaFromLocalLink(passKeys);
        }
        else{
            //if we get here, there's a few possibilites:
            //  item is another schema property, pass the data
            //  Item is another schema property, but the data has been indexed, and now doesn't match up with the original schema's property value
            //  Item is not listed in the documentation.
            //  Unfortunately, while the x-type-header DOES give you a hint that it's an indexed property
            //  It DOESN'T tell you which one. So we have to do a hack solution that hopefully works across the api, at least until it doesn't.
            // in the event that schema["the indexed property obtained from the property var"], doesn't match the schema's actual property
            // We will check to see if the # of schema&data properties is 1. if it is, wonderful! We can go on with those
            //  if not, we're screwed, pack it up until they add a way to map indexed property -> schema property in the api docs
            if(traverseObject([property], schema_prop_list)){
                //property key exists in schema, we can pass the data and go on with our lives.
                passKeys.push(property);
                passSchema = schema_prop_list[property];
            }
            else{
                //if we make it to this point, we have one of two possiblities:
                //  -property is a property that just isn't mapped on the api docs
                //  -property is a property that has been indexed, and can't be matched with its corresponding schema property
                
                //if the length of keys doesn't match, it's either undocumented or indexed. either way, I can't do anything further with it without knowing the difference
                //  So I'll just return the data as is for now, and just won't be able to run any data transformations on subproperties of this
                if(Object.keys(schema_prop_list).length != Object.keys(data).length){
                    if(indexed){
                        console.log("Well, matching # of keys didn't help, BUT this item appears to have one of 3 headers: x-dictionary-key, x-mapped-definition, x-enum-values. So we're going to assume it's indexed.");
                    }
                    else {
                        console.log("CANNOT TELL THE DIFFERENCE HERE");
                    }
                    parsed_properties[property] = data[property];
                    continue;
                }
                else{
                    //if we get here, they ARE the same, which means that it's indexed.
                    //  So we pray that there's only one property in this list
                    //  Because if there's more, we can't map each property to it's corresponding schema without random guessing.
                    if(Object.keys(schema_prop_list).length == 1 && Object.keys(data).length == 1){
                        //The gods have been merciful, there is only one property, so indexed can be assumed to match schema prop
                        console.log("well, property "+ property+" inside of "+key_list.toString()+" an indexed value, but fortunately, it's the only one, so we know the schema "+schema_prop_list[Object.keys(schema_prop_list)[0]]+"matches.");
                        schema_property = Object.keys(schema_prop_list)[0];
                        passKeys.push(schema_property);
                        passSchema = schema;
                    }
                    else{
                        //The gods have forsaken us. 
                        //We really shouldn't be here. the checks for key length should've captured indexed & undocumented properties, so if we're here I'm completely stuck.
                        console.log(key_list);
                        console.log(schema);
                        console.log(data);
                        throw Error("There might be two indexed types here, all hope is lost.");
                    }
                }
            }
        }
        parsed_properties[property] = propertyTypeProcessor(passKeys, passSchema, data[property]);
    }
    return parsed_properties;
}

//Some appearances of objects in the schema ref store values in the additionalProperties keyword.
// this handles that data and returns the mapped values.
// Realistically, this could appear along with the properties keyword, and would only get the data that wasn't processed there.
// But that doesn't happen in the api currently, and that logic is hard, so it'll get implemented after a blueprint is established.
function processObjectAdditionalProperties(key_list, schema, data, indexed){
    //additionalProperties tend to follow a schema reference, so we handle that recursion here.
    let propSchema = traverseObject(["additionalProperties", "$ref"], schema);
    if(propSchema){
        key_list = parseLocalSchemaLink(propSchema);
        schema = getSchemaFromLocalLink(key_list); 
    }
    //If it's not holding a schema, it's gotta be holding another property type, so we continue the recursion.
    else 
        schema = schema.additionalProperties; 
    return propertyTypeProcessor(key_list, schema, data);
}

//Some objects in the doc, like the components, have a schema ref stored in an allOf keyword.
// This handles that and returns the values.
function processObjectAllOfRef(key_list, schema, data, indexed){
    let propSchema = traverseObject(["allOf", 0, "$ref"], schema);
    if(propSchema){
        key_list = parseLocalSchemaLink(propSchema);
        schema = getSchemaFromLocalLink(key_list);
        return propertyTypeProcessor(key_list, schema, data);
    }
    else{
        //every instance currently of allOf has one value, the $ref. should this ever change, I'll have to add the logic.
        throw Error(test(count)+"First instance in allOf not $ref, unsupported.");
    }
}

let api_doc_link = "/Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/";
let request_type = "get";
let code = "200";
let blah = processAPIEndpointData(api_doc_link, request_type, code, test_data);
const fs = require('fs');
fs.writeFile("parsedcharacterdata.json", JSON.stringify(blah), (result) => console.log("success"));

module.exports = processAPIEndpointData;
