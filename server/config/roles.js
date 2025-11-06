export const roles = {
    SuperAdmin: {
        can: [

            "assessmentTypes:create",
            "assessmentTypes:read",
            "assessmentTypes:update",
            "assessmentTypes:delete",
            "ethnicities:create",
            "ethnicities:read",
            "ethnicities:update",
            "ethnicities:delete",
            "genders:create",
            "genders:read",
            "genders:update",
            "genders:delete",
            "audit:read",
            "assessmentRequest:create",
            "assessmentRequest:read",
            "assessmentRequest:update",
            "assessmentRequest:delete",
            "organizations:create",
            "organizations:read",
            "organizations:update",
            "organizations:delete",
            "contracts:create",
            "contracts:read",
            "contracts:update",
            "contracts:delete"
        ]
    },
    Clinic: {
        can: [
            "patients:create",
            "patients:read",
            "patients:update",
            "patients:delete",
            "doctors:create",
            "doctors:read",
            "doctors:update",
            "doctors:delete",
            "assessmentTypes:create",
            "assessmentTypes:read",
            "assessmentTypes:update",
            "assessmentTypes:delete",
            "ethnicities:create",
            "ethnicities:read",
            "ethnicities:update",
            "ethnicities:delete",
            "genders:create",
            "genders:read",
            "genders:update",
            "genders:delete",
            "audit:read",
            "assessmentRequest:create",
            "assessmentRequest:read",
            "assessmentRequest:update",
            "assessmentRequest:delete",
            "organizations:create",
            "organizations:read",
            "organizations:update",
            "contracts:read"
        ]
    },
    Doctor: {
        can: [
            "assessmentRequest:read",
            "audit:read"
        ]
    },
};