import {
  MILO_AWARE_FIELDS,
  RELLO_REGISTERED_FIELDS,
  resolveFieldDefinition,
  isMiloAware,
  isRelloRegistered,
  fieldTier,
  getDefaultFieldsForRole,
} from "../dist/index.js";

console.assert(MILO_AWARE_FIELDS.length === 9, "MILO_AWARE_FIELDS must have 9 entries post-v0.2.0 tier promotion");
console.assert(RELLO_REGISTERED_FIELDS.length === 0, "RELLO_REGISTERED_FIELDS must be empty post-v0.2.0 tier promotion");
console.assert(isMiloAware("scout_buying_intent") === true);
console.assert(isMiloAware("scout_loan_purpose") === true);
console.assert(isMiloAware("scout_referral_source") === true);
console.assert(isRelloRegistered("scout_loan_purpose") === true);
console.assert(isRelloRegistered("scout_referral_source") === true);
console.assert(isRelloRegistered("scout_unknown") === false);
console.assert(fieldTier("scout_buying_intent") === "milo-aware");
console.assert(fieldTier("scout_loan_purpose") === "milo-aware");
console.assert(fieldTier("scout_referral_source") === "milo-aware");
console.assert(fieldTier("scout_contact_anything") === "custom-mlo");
console.assert(fieldTier("scout_unknown") === "custom-mlo");
console.assert(resolveFieldDefinition("scout_buying_intent")?.key === "scout_buying_intent");
console.assert(resolveFieldDefinition("scout_loan_purpose")?.key === "scout_loan_purpose");
console.assert(resolveFieldDefinition("scout_referral_source")?.key === "scout_referral_source");
console.assert(resolveFieldDefinition("scout_unknown") === null);
console.assert(getDefaultFieldsForRole("MLO").length > 0);
console.error("scout-fields v0.2.0 smoke OK");
