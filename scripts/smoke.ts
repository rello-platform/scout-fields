import {
  MILO_AWARE_FIELDS,
  RELLO_REGISTERED_FIELDS,
  COMPLIANCE_HOLD_KEYS,
  resolveFieldDefinition,
  isMiloAware,
  isRelloRegistered,
  isComplianceHold,
  fieldTier,
  getDefaultFieldsForRole,
  type NurtureFieldDefinition,
} from "../dist/index.js";

let failures = 0;
function check(cond: boolean, msg: string): void {
  if (!cond) {
    failures++;
    console.error(`FAIL: ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// v0.2.0 baseline invariants (unchanged)
// ---------------------------------------------------------------------------
check(isMiloAware("scout_buying_intent") === true, "scout_buying_intent milo-aware");
check(isMiloAware("scout_loan_purpose") === true, "scout_loan_purpose milo-aware");
check(isMiloAware("scout_referral_source") === true, "scout_referral_source milo-aware");
check(isRelloRegistered("scout_loan_purpose") === true, "scout_loan_purpose rello-registered");
check(isRelloRegistered("scout_unknown") === false, "scout_unknown NOT rello-registered");
check(fieldTier("scout_buying_intent") === "milo-aware", "scout_buying_intent tier");
check(fieldTier("scout_contact_anything") === "custom-mlo", "scout_contact_anything tier");
check(fieldTier("scout_unknown") === "custom-mlo", "scout_unknown tier");
check(resolveFieldDefinition("scout_buying_intent")?.key === "scout_buying_intent", "resolve scout_buying_intent");
check(resolveFieldDefinition("scout_unknown") === null, "resolve scout_unknown -> null");
check(getDefaultFieldsForRole("MLO").length > 0, "MLO has starter fields");
check(RELLO_REGISTERED_FIELDS.length === 0, "RELLO_REGISTERED_FIELDS empty");

// v0.3.0: options are { value, label } objects, value is slug-form
const intent = resolveFieldDefinition("scout_buying_intent");
check(
  intent?.options?.some((o) => o.value === "looking-to-buy" && o.label === "Looking to buy") === true,
  "scout_buying_intent has slug-form { value, label } options",
);

// ---------------------------------------------------------------------------
// v0.4.0 — NURTURE-AUDIT STEP 1 registration
// ---------------------------------------------------------------------------
check(MILO_AWARE_FIELDS.length === 42, `MILO_AWARE_FIELDS must be 42 post-v0.4.0 (9 baseline + 33 new) (got ${MILO_AWARE_FIELDS.length})`);

// No duplicate keys.
const keys = MILO_AWARE_FIELDS.map((f) => f.key);
check(new Set(keys).size === keys.length, "MILO_AWARE_FIELDS keys are unique (no redeclared field)");

// The original 9 keys still present exactly once.
for (const k of [
  "scout_message",
  "scout_buying_intent",
  "scout_buying_stage",
  "scout_timeline",
  "scout_preferred_contact_method",
  "scout_property_type",
  "scout_credit_range",
  "scout_loan_purpose",
  "scout_referral_source",
]) {
  check(keys.filter((x) => x === k).length === 1, `pre-existing key ${k} present exactly once`);
}

/**
 * BINDING contract — every new key + its EXACT option `value`s as slugified by
 * the HS catalog `opts()` rule at ~/The-Home-Scout/src/lib/contact-question-catalog.ts.
 * `null` options means a non-select (text) field; assert no options.
 * defaultForRoles asserts role-gating (mortgage -> MLO/BROKER, RE -> AGENT).
 */
const EXPECTED: Record<
  string,
  { type: NurtureFieldDefinition["type"]; values: string[] | null; roles: string[] }
> = {
  // ===== MORTGAGE → MLO/BROKER =====
  scout_down_payment: { type: "select", values: ["none-yet", "under-5", "5-10", "10-20", "20"], roles: ["MLO", "BROKER"] },
  scout_first_time_buyer: { type: "select", values: ["yes", "no"], roles: ["MLO", "BROKER"] },
  scout_price_range: { type: "select", values: ["under-300k", "300-500k", "500-750k", "750k-1m", "1m"], roles: ["MLO", "BROKER"] },
  scout_pre_approved: { type: "select", values: ["no", "with-another-lender", "yes"], roles: ["MLO", "BROKER"] },
  scout_occupancy: { type: "select", values: ["primary-residence", "second-home", "investment"], roles: ["MLO", "BROKER"] },
  scout_income_type: { type: "select", values: ["w-2-employee", "self-employed", "1099-contractor", "business-owner"], roles: ["MLO", "BROKER"] },
  scout_years_self_employed: { type: "select", values: ["under-1", "1-2", "2"], roles: ["MLO", "BROKER"] },
  scout_files_tax_returns: { type: "select", values: ["yes", "no"], roles: ["MLO", "BROKER"] },
  scout_is_investment: { type: "select", values: ["yes", "no"], roles: ["MLO", "BROKER"] },
  scout_rentals_owned: { type: "select", values: ["0", "1-3", "4"], roles: ["MLO", "BROKER"] },
  scout_expected_rent: { type: "text", values: null, roles: ["MLO", "BROKER"] },
  scout_buying_in_llc: { type: "select", values: ["yes", "no"], roles: ["MLO", "BROKER"] },
  scout_va_eligible: { type: "select", values: ["yes", "no"], roles: ["MLO", "BROKER"] },
  scout_va_first_use: { type: "select", values: ["first-use", "used-before"], roles: ["MLO", "BROKER"] },
  scout_construction_type: { type: "select", values: ["building", "buying", "renovating"], roles: ["MLO", "BROKER"] },
  scout_owns_lot: { type: "select", values: ["yes", "no"], roles: ["MLO", "BROKER"] },
  scout_current_rate: { type: "select", values: ["under-4", "4-5", "5-6", "6-7", "7"], roles: ["MLO", "BROKER"] },
  scout_refi_goal: { type: "select", values: ["lower-payment", "cash-out", "drop-mortgage-insurance", "shorter-term"], roles: ["MLO", "BROKER"] },
  scout_age_62_plus: { type: "select", values: ["yes", "no"], roles: ["MLO", "BROKER"] },
  // ===== REAL ESTATE → AGENT =====
  scout_buy_sell: { type: "select", values: ["buying", "selling", "both"], roles: ["AGENT"] },
  scout_search_area: { type: "text", values: null, roles: ["AGENT"] },
  scout_re_price_range: { type: "select", values: ["under-300k", "300-500k", "500-750k", "750k-1m", "1m"], roles: ["AGENT"] },
  scout_beds_baths: { type: "text", values: null, roles: ["AGENT"] },
  scout_move_timeline: { type: "select", values: ["immediate", "1-3-mo", "3-6-mo", "6-mo"], roles: ["AGENT"] },
  scout_rent_or_own: { type: "select", values: ["rent", "own"], roles: ["AGENT"] },
  scout_working_with_agent: { type: "select", values: ["yes", "no"], roles: ["AGENT"] },
  scout_sell_before_buy: { type: "select", values: ["yes", "no"], roles: ["AGENT"] },
  scout_sell_reason: { type: "text", values: null, roles: ["AGENT"] },
  scout_sell_timeline: { type: "select", values: ["immediate", "1-3-mo", "3-6-mo", "6-mo"], roles: ["AGENT"] },
  scout_found_next_home: { type: "select", values: ["yes", "no"], roles: ["AGENT"] },
  scout_home_value_range: { type: "select", values: ["under-300k", "300-500k", "500-750k", "750k-1m", "1m"], roles: ["AGENT"] },
  scout_amount_owed: { type: "select", values: ["under-300k", "300-500k", "500-750k", "750k-1m", "1m"], roles: ["AGENT"] },
  scout_occupancy_status: { type: "select", values: ["owner-occupied", "vacant", "tenant-occupied"], roles: ["AGENT"] },
};

for (const [key, exp] of Object.entries(EXPECTED)) {
  const def = resolveFieldDefinition(key);
  check(def !== null, `${key} is registered`);
  if (!def) continue;
  check(isMiloAware(key) === true, `${key} is Milo-aware`);
  check(def.type === exp.type, `${key} type is ${exp.type} (got ${def.type})`);
  if (exp.values === null) {
    check(def.options === undefined, `${key} (text) has NO options`);
  } else {
    const got = (def.options ?? []).map((o) => o.value);
    check(
      got.length === exp.values.length && got.every((v, i) => v === exp.values![i]),
      `${key} option values byte-match HS catalog: expected [${exp.values.join(",")}] got [${got.join(",")}]`,
    );
  }
  check(
    def.defaultForRoles.length === exp.roles.length &&
      exp.roles.every((r) => def.defaultForRoles.includes(r as never)),
    `${key} defaultForRoles == [${exp.roles.join(",")}] (got [${def.defaultForRoles.join(",")}])`,
  );
}

// ---------------------------------------------------------------------------
// COMPLIANCE-HOLD: scout_age_62_plus is registered but flagged hold.
// ---------------------------------------------------------------------------
check(COMPLIANCE_HOLD_KEYS.has("scout_age_62_plus"), "scout_age_62_plus in COMPLIANCE_HOLD_KEYS");
check(isComplianceHold("scout_age_62_plus") === true, "isComplianceHold(scout_age_62_plus) true");
check(isComplianceHold("scout_buying_intent") === false, "isComplianceHold(scout_buying_intent) false");
check(resolveFieldDefinition("scout_age_62_plus") !== null, "scout_age_62_plus IS registered (shared enum)");
check(COMPLIANCE_HOLD_KEYS.size === 1, "exactly one compliance-held key");

// Role-default sanity: each role gets a non-empty starter set; AGENT now gets RE fields.
check(getDefaultFieldsForRole("AGENT").some((f) => f.key === "scout_buy_sell"), "AGENT starter includes scout_buy_sell");
check(getDefaultFieldsForRole("MLO").some((f) => f.key === "scout_income_type"), "MLO starter includes scout_income_type");
check(
  getDefaultFieldsForRole("AGENT").every((f) => f.key !== "scout_income_type"),
  "AGENT starter does NOT include mortgage-gated scout_income_type",
);

if (failures > 0) {
  console.error(`scout-fields v0.4.0 smoke: ${failures} FAILURE(S)`);
  process.exit(1);
}
console.error("scout-fields v0.4.0 smoke OK");
