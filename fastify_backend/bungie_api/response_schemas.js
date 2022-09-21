let response_common = {
    type: 'object',
    required: ["ErrorCode", "ThrottleSeconnds", "ErrorStatus", "Message", "MessageData", "DetailedErrorTrace"],
    properties: {
        "ErrorCode": { type: 'integer'},
        "ThrottleSeconnds": { type: "integer" },
        "ErrorStatus": { type: "string" },
        "Message": { type: "string"},
        "MessageData": {

        },
        "DetailedErrorTrace": { type: "string" }
    }
}
let User_Models_GetCredentialTypesForAccountResponse = {
    type: 'object',
    required: ["credentialType", "credentialDisplayName", "isPublic", "credentialAsString"],
    properties: {
        "credentialType": { type: "number"},
        "credentialDisplayName": { type: "string" },
        "isPublic": { type: "boolean" },
        "credentialAsString": { type: "string " }
    }
    
};


let GetCredentialTypesForTargetAccount = {
    data: {
        type: 'object',
        dependentSchemas: response_common,
        properties:{
            Response: User_Models_GetCredentialTypesForAccountResponse
        }
    }
};


module.exports = { GetCredentialTypesForTargetAccount};