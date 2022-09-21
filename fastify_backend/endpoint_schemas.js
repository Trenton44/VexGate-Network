let retrieveCharacterIds = {
    type: 'object',
    query: {
        type: 'object',
        required: ["d2_membership_id"],
        properties: {
            "d2_membership_id": { type: "string" }
        }
    }
};

let requireMembershipId = {
    type: 'object',
    query: {
        type: 'object',
        required: ["membership_id"],
        properties: {
            "membership_id": { type: "string" }
        }
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
module.exports = {retrieveCharacterIds, requireMembershipId, OAuthResponse};