import {
  MILO_AWARE_FIELDS,
  RELLO_REGISTERED_FIELDS,
  resolveFieldDefinition,
  isMiloAware,
  isRelloRegistered,
  fieldTier,
  getDefaultFieldsForRole,
} from "../dist/index.js";

console.assert(MILO_AWARE_FIELDS.length === 7, "MILO_AWARE_FIELDS must have 7 entries");
console.assert(RELLO_REGISTERED_FIELDS.length === 2, "RELLO_REGISTERED_FIELDS must have 2 entries");
console.assert(isMiloAware("scout_buying_intent") === true);
console.assert(isMiloAware("scout_loan_purpose") === false);
console.assert(isRelloRegistered("scout_loan_purpose") === true);
console.assert(isRelloRegistered("scout_unknown") === false);
console.assert(fieldTier("scout_buying_intent") === "milo-aware");
console.assert(fieldTier("scout_loan_purpose") === "rello-registered");
console.assert(fieldTier("scout_contact_anything") === "custom-mlo");
console.assert(resolveFieldDefinition("scout_buying_intent")?.key === "scout_buying_intent");
console.assert(resolveFieldDefinition("scout_unknown") === null);
console.assert(getDefaultFieldsForRole("MLO").length > 0);
console.error("scout-fields smoke OK");
