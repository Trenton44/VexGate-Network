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

module.exports = {retrieveCharacterIds, requireMembershipId};