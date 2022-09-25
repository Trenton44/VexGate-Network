const api_doc = require("./fastify_backend/bungie_api/openapi.json");
const manifest_def = require("./fastify_backend/bungie_api/manifest_files/en/jsonWorldContent.json");

const x_type_headers_list = ["x-mapped-definition", "x-mobile-manifest-name", "x-enum-reference", "x-enum-values", "x-destiny-component-type-dependency", "x-dictionary-key", "x-preview"];

//helper function
function parseSchemaRef(refstring, delim) {
    if(delim == undefined){ delim = "/"; } 
    let newstring = refstring.split(delim);

    if(newstring[0] === "#"){ return newstring.slice(1); }
    else { return newstring;}
}

//helper function 
function getListofXTypeHeaders(schema, name){
    let list = [];
    for(prop in schema){
        let check_result = x_type_headers_list.find( (element) => {
            return element == prop;
        });
        if(check_result != undefined){
            list.push(prop);
        }
    }
    return list;
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
let test = (count) => {
    return "\t".repeat(count);
}
let print = (count, message) => {
    console.log(test(count) + message);
}
function propertyProcessor(name, schema, count){
    print(count, "Name: "+name);
    switch(schema.type){
        case "object":
            return parseSchemaObject(name, schema, count);
            break;
        case "array":
            return parseSchemaArray(name, schema, count);
            break;
        case "integer":
            return parseBasicType(name, schema, count);
            break;
        case "number":
            return parseBasicType(name, schema, count);
            break;
        case "boolean":
            return parseBasicType(name, schema, count);
            break;
        case "string":
            return parseBasicType(name, schema, count);
            break;
        default:
            throw Error("invalid type: "+schema.type);
    }
}

function parseBasicType(name, schema, count){
    print(count, "Parsing Basic Type");
    let header_list = getListofXTypeHeaders(schema, name);
    if(header_list.length > 1)
        throw Error("Yo this thing got more than one x-type-header.");
    
    print(count, "header_list: "+header_list.toString());
    print(count, "Name: "+name+" Type: "+schema.type+" format: "+schema.format);
    return true;
}
function parseSchemaArray(name, schema, count){
    print(count, "Parsing Array "+ name.toString());
    let header_list = getListofXTypeHeaders(schema, name);
    print(count, "Headers: "+header_list.toString());
    if(schema.items["$ref"] != undefined){
        print(count, "it's a $ref");
        schema_name = parseSchemaRef(schema.items["$ref"]);
        schema_link = getSchemaFromLink(schema_name);
        return propertyProcessor(name, schema_link, count+1);
    }
    else{
        print(count, "Must assume that items is of a property.");
        return propertyProcessor(name, schema.items, count+1);
    }
}

function parseSchemaObject(name, schema, count){
    print(count, "Parsing Object "+ name.toString());
    let header_list = getListofXTypeHeaders(schema, name);
    print(count, "Headers: "+header_list.toString());
    if(schema.properties){
        let sub_property_results = {};
        for(prop in schema.properties){
            property = schema.properties[prop];
            print(count, "Property: "+prop);
            if(property["$ref"] != undefined){
                schema_name = parseSchemaRef(property["$ref"]);
                schema_link = getSchemaFromLink(schema_name);
                sub_property_results.prop = propertyProcessor(schema_name, schema_link, count+1);
            }
            else{
                sub_property_results.prop = propertyProcessor(prop, property, count+1);
            }
        }
        
        
        return sub_property_results
    }
    if(schema.allOf){
        if(schema.allOf[0]["$ref"] != undefined){
            print(count, "allOf has a ref, stop here and send data to ."+schema.allOf[0]["$ref"]);
            schema_name = parseSchemaRef(schema.allOf[0]["$ref"]);
            schema_link = getSchemaFromLink(schema_name);
            return propertyProcessor(schema_name, schema_link, count+1);
        }
        else{
            throw Error(test(count)+"First instance in allOf not $ref, unsupported.");
        }
    }
    if(schema.additionalProperties){
        if(schema.additionalProperties["$ref"] != undefined){
            print(count, "additionalProperties is a schema ref: "+schema.additionalProperties["$ref"]);
            schema_name = parseSchemaRef(schema.additionalProperties["$ref"]);
            schema_link = getSchemaFromLink(schema_name);
            return propertyProcessor(schema_name, schema_link, count+1);
        }
        else{
            print(count, "We can only assume this is a standard property to parse.");
            return propertyProcessor(name, schema.additionalProperties, count+1);
        }
    }
    return Error("Nothing was found inside of object.");
}

let list = api_doc.components.schemas;
let keys = Object.keys(list);


let num = 100;
//propertyProcessor(keys[num], list[keys[num]], num);
let key = "Destiny.Responses.DestinyCharacterResponse";
propertyProcessor(key, api_doc.components.schemas[key], 0);
/*
for(i of keys){
    console.log("BEGINNING SCHEMA "+i+"\n\n");
    propertyProcessor(i, list[i], 0);
    console.log("ENDING SCHEMA "+i+"\n\n");
}
*/
console.log("Completed.");
