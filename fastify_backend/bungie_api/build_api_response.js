const api_doc = require("./openapi.json");
const manifest_def = require("./manifest_files/en/jsonWorldContent.json");

const x_type_headers_list = ["x-mapped-definition", "x-mobile-manifest-name", "x-enum-reference", "x-enum-values", "x-destiny-component-type-dependency", "x-dictionary-key", "x-preview"];

//takes the following: 
//  -The PATH of the endpoint AS SHOWN IN THE DOCUMENTATION! Ex: Destiny2.GetCharacter would be (with the braces) /Destiny2/{membershipType}/Profile/{destinyMembershipId}/Character/{characterId}/
//  -the type of request (get, post, etc.)
//  -The status code of the request (ideally 200)
function processAPIEndpointData(path, request_type, status_code, endpoint_data){
    let api_path = api_doc.paths[path][request_type].responses[status_code]["$ref"];
    console.log("api_path: "+ api_path);
    if(!api_path)
        throw Error("api path returned bad. wha happn");
    let api_endpoint_schema_link = parseLocalSchemaLink(api_path);
    let schema = getSchemaFromLocalLink(api_endpoint_schema_link);
    // At this point, we've got the schema for the Api response. 
    // Now we need the schema for the actual Response object inside it.
    // all responses are currently application/json. if that changes, I'll just add it the parameters being passed.
    let response_object_schema_link = schema.content["application/json"].schema.properties.Response["$ref"];
    //gotta parse that ref link to iterable json keys.
    let parsed_response_object_schema_link = parseLocalSchemaLink(response_object_schema_link);
    let response_object_schema = getSchemaFromLocalLink(parsed_response_object_schema_link);

    //and now, let the data mapping/recursion begin.
    return propertyTypeProcessor(parsed_response_object_schema_link, endpoint_data, endpoint_data);
}



//Bungie open-api file currently uses local references, in the form of #/{link in json}.
// this function takes that and parses it into an array so i can iterate through the json file to the actual schema
function parseLocalSchemaLink(link, delimiter){
    //some of the keys in the api reference are combined together, Ex: components/schemas/Applications.ApiUsage puts Application.ApiUsage into one key.
    // I added this so I could split them while testing, leaving the functionality in in case it ever is needed
    if(!delimiter){ delimiter = "/";  }
        
    let newstring = refstring.split(delim); //split into an array

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
        reference = reference[key]

    });
}

//The big kahunga, the central function all processing gonna go through.
// directs processing based on the schema's type property. Doesn't actually do any data processing though.
function propertyTypeProcessor(key, schema, data){
    switch(schema.type){
        case "object":
            return processTypeObject(key, schema, data);
        case "array":
            return processTypeArray(key, schema, data);
        default:
            //If it's not an array or object, it should be able to be mapped from schema value -> data value.
            return processTypeBasic(key, schema, data);
    }
}

//Process any appearance of an array type inside the api_doc json.
//Thankfully, arrays are just lists of other types, so this logic is easy.
//Currently, Bungie only ever puts one type of data into arrays at endpoints, so that's why the logic checks for
// If more than one at a time ever show up, this function is not daijoubu
function processTypeArray(key, schema, data){
    //all arrays i've found store the reference in the "items" keyword, so add that to the list of assumptions I've made here.
    if(schema.items["$ref"]){
        schema_keys = parseLocalSchemaLink(schema.items["$ref"]);
        next_schema = getSchemaFromLocalLink(schema_keys);
        //we got the schemas, but now we wanna parse each item in the data array with the schema.
        let new_data = data.map( (current, index) => { return propertyTypeProcessor(schema_keys, next_schema, current); });

        //Post mapping data manipulation should go here.

        return new_data;
    }
    else{
        //if it aint got a reference, "items" gotta be holding data about a property, so we use it and go into recursion.
        let new_data = data.map( (current, index) => { return propertyTypeProcessor(key, schema.items, current); });

        //Post mapping data manipulation should go here.

        return new_data;
    }
}

//Processes what we find at the bottom of the endless schemas upon schemas: your good 'ol bools, ints, strings, and etc.
//data actually gets mapped to points here. any custom mapping for specific data (like hash values -> corresponding def) will occur here too
function processTypeBasic(key, schema, data){
    //there should only be one piece of data at this point, and it's key should correspond with the schema.
    //So imma have it throw a fit if that's not the case.
    if(Object.keys(data)[0] != Object.keys(schema)[0]){
        throw Error("Data key " + Object.keys(data)[0] + " does not match up with Schema key " + Object.keys(schema)[0] + ".");
    }
    else{
        //well, they match, so i can really just return the data as is.
        //but if i wanna mess it up later, I'll do it here.
        return data;
    }
}

//Process any appearance of an object type inside the api_doc json.
// takes the data, and maps it to schema data as desired.
//Note, this works off the assumption that schemas only have one of the existing keywords:
//  -properties
//  -additionalProperties
//  -allOf
//If one appears with more, i will cry.
function processTypeObject(key, schema, data){
    let process_data = {};
    if(schema.properties){
        process_data = processObjectProperties(key, schema.properties, data); //Handles the data recursion
        //Post mapping data manipulation should go here.

        return process_data;
    }
    else if(schema.additionalProperties){
        process_data = processObjectAdditionalProperties(key, schema, data);
        //Post mapping data manipulation should go here.

        return process_data;
    }
    else if(schema.allOf){
        process_data = processObjectAllOfRef(key, schema, data);
        //Post mapping data manipulation should go here.

        return process_data;
    }
    else {
        //We really shouldn't ever come here, so adding a throw here as a red flag that somethin's up.
        throw Error("This object has no properties, God help us all.");
    }
}

//Some appearances of objects in the schema ref store values in the properties keyword.
// this handles that data and returns the mapped values.
function processObjectProperties(key, prop_list, data){
    //iterates through all properties in schema.properties, passed here as prop_list.
    let parsed_properties = {};
    for(prop in prop_list){
        //if the property has a reference to another schema, get that schema and continue recursion.

        current_prop = prop_list[prop]; 

        if(current_prop["$ref"] != undefined){
            schema_keys = parseLocalSchemaLink(current_prop["$ref"]); //get the list keys to next schema from value in this one.
            next_schema = getSchemaFromLocalLink(schema_keys); //pull the schema from api_doc, save here
            parsed_properties[prop] = propertyTypeProcessor(schema_keys, next_schema, data[prop]) // pass keys, schema, and the data inside this property
        }
        else{
            //if no reference to schema, it must be holding it's own property info.
            //in which case, we treat it as a new property, and back into the recursion chain we go
            parsed_properties[prop] = propertyTypeProcessor(prop, current_prop, data[prop]); //pass the key for this property only, the value of the prop in the schema, and the corresponding data.
        }
    }
    return parsed_properties; //return the list of data, now mapped as desired with the properties.
}

//Some appearances of objects in the schema ref store values in the additionalProperties keyword.
// this handles that data and returns the mapped values.
// Realistically, this could appear along with the properties keyword, and would only get the data that wasn't processed there.
// But that doesn't happen in the api currently, and that logic is hard, so it'll get implemented after a blueprint is established.
function processObjectAdditionalProperties(key, schema, data){
    //additionalProperties tend to follow a schema reference, so we handle that recursion here.
    if(schema.additionalProperties["$ref"]){
        schema_keys = parseLocalSchemaLink(schema.additionalProperties["$ref"]);
        next_schema = getSchemaFromLocalLink(schema_keys);
        return propertyTypeProcessor(schema_keys, next_schema, data);
    }
    //If it's not holding a schema, it's gotta be holding another property type, so we continue the recursion.
    else{
        return propertyTypeProcessor(key,schema.additionalProperties, data)
    }
}

//Some objects in the doc, like the components, have a schema ref stored in an allOf keyword.
// This handles that and returns the values.
function processObjectAllOfRef(key, schema, data){
    if(schema.allOf[0]["$ref"]){
        schema_keys = parseLocalSchemaLink(schema.allOf[0]["$ref"]);
        next_schema = getSchemaFromLocalLink(schema_keys);
        return propertyTypeProcessor(schema_keys, next_schema, data);
    }
    else{
        //every instance currently of allOf has one value, the $ref. should this ever change, I'll have to add the logic.
        throw Error(test(count)+"First instance in allOf not $ref, unsupported.");
    }
}

module.exports = processAPIEndpointData;