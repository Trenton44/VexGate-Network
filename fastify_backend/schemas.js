let OAuthResponse = {
    query: {
        type: 'object',
        properties: {
            "state": { type: 'string' },
            "code": { type: 'string' }
        },
        required: ["state", "code"]
    },
    data: {
        type: 'object',
        properties: {
            "access_token": { type: "string" },
            "token_type": { type: "string" },
            "exipres_in": { type: "integer" },
            "refresh_token": { type: "string" },
            "refresh_expires_in": { type: "integer" },
            "membership_id": { type: "string" }
        },
        required: ["access_token", "token_type", "exipres_in", "refresh_token", "refresh_expires_in", "membership_id"]
    }
};


module.exports = { OAuthResponse };