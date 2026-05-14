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

// New assertions for v0.3.0 (options {value, label} shape):
const buyingIntent = resolveFieldDefinition("scout_buying_intent");
console.assert(
  buyingIntent?.options?.[0]?.value === "looking-to-buy",
  "scout_buying_intent[0].value === 'looking-to-buy'"
);
console.assert(
  buyingIntent?.options?.[0]?.label === "Looking to buy",
  "scout_buying_intent[0].label === 'Looking to buy'"
);
console.assert(
  resolveFieldDefinition("scout_property_type")?.options?.find(
    (o) => o.value === "townhome"
  )?.label === "Town Home",
  "scout_property_type slug 'townhome' has label 'Town Home'"
);
console.assert(
  resolveFieldDefinition("scout_timeline")?.options?.some(
    (o) => o.value === "6-plus-months"
  ),
  "scout_timeline contains slug '6-plus-months' (not '6+ months')"
);
console.assert(
  resolveFieldDefinition("scout_credit_range")?.options?.find(
    (o) => o.value === "below-580"
  )?.label === "Below 580",
  "scout_credit_range slug 'below-580' has label 'Below 580'"
);
console.assert(
  resolveFieldDefinition("scout_loan_purpose")?.options?.[0]?.value === "purchase",
  "scout_loan_purpose[0].value === 'purchase' (Tier-1 since v0.2.0)"
);
// Negative — scout_message + scout_referral_source have no options
console.assert(
  resolveFieldDefinition("scout_message")?.options === undefined,
  "scout_message has no options (textarea)"
);
console.assert(
  resolveFieldDefinition("scout_referral_source")?.options === undefined,
  "scout_referral_source has no options (text)"
);

console.error("scout-fields v0.3.0 smoke OK");
