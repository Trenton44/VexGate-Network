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

let OAuthResponse = {
    query: {
        type: 'object',
        required: ["state", "code"],
        properties: {
            "state": { type: 'string' },
            "code": { type: 'string' }
        }
    },
    data: {
        type: 'object',
        required: ["access_token", "token_type", "exipres_in", "refresh_token", "refresh_expires_in", "membership_id"],
        properties: {
            "access_token": { type: "string" },
            "token_type": { type: "string" },
            "exipres_in": { type: "integer" },
            "refresh_token": { type: "string" },
            "refresh_expires_in": { type: "integer" },
            "membership_id": { type: "string" }
        }
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


module.exports = { OAuthResponse, GetCredentialTypesForTargetAccount};