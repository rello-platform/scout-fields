/**
 * Canonical scout_* nurture-field registry for the Rello ecosystem.
 *
 * Widget-capture truth shared between Home Scout (contact-form widget +
 * admin editor), Rello CRM (MLO cockpit Custom Data panel), and Milo
 * Engine (nurture rule evaluation). Two tiers of registered widget-capture
 * fields:
 *
 *   1. **Milo-aware** (`MILO_AWARE_FIELDS`) — each entry has a real or
 *      one-hop-derived Milo nurture-rule consumer. Stored on
 *      `Lead.customFields` under the same `scout_<X>` key the field declares.
 *      Promotion of a Tier-2 field to Tier-1 requires citing the consumer
 *      file:line in the PR description.
 *
 *   2. **Rello-registered** (`RELLO_REGISTERED_FIELDS`) — persisted to Lead
 *      canonical columns or `Lead.customFields` but with no current Milo
 *      nurture-rule consumer. Promoted to Tier 1 when Milo gains a consumer.
 *
 * A third tier — custom MLO-only `scout_contact_*` keys derived at admin
 * time — is intentionally OUT OF SCOPE for this package. Tier-3 plumbing
 * stays in consumer-local code (the prefix + key-derivation function live
 * in Home Scout's `nurture-field-catalog.ts`).
 *
 * Tier-membership is structurally enforced via which array a field appears
 * in. There is no per-field boolean flag — that would allow flag-vs-array
 * drift.
 *
 * Per Kelly's 2026-05-13 product call, each role gets a starter set of
 * pre-populated fields when first opening the editor (all customizable).
 * Roles are read from `Tenant.ownerType` ("MLO" | "BROKER" | "AGENT").
 *
 * Provenance: lifted verbatim from
 * `~/The-Home-Scout/src/lib/nurture-field-catalog.ts` (HS canonical).
 * See SPEC-RELLO-PLATFORM-SCOUT-FIELDS-PACKAGE.md §4.H.
 *
 * v0.3.0 (2026-05-14): `options` entries are `{ value, label }` pairs.
 * Storage uses the slug-form `value` platform-wide (`Lead.customFields`,
 * HH `EnrichedLead.*Intent` typed columns, Milo nurture-rule eval). The
 * human-readable `label` is render-only — used by HS contact-form widget,
 * HS admin form-builder, and Rello CRM Custom Data panel display.
 * Promoting any new enum option or renaming an existing `value` is a
 * SemVer-MAJOR change (consumers' switch-cases / DB rows reference value).
 *
 * Migration provenance: see
 * `BUILD-|-FEATURE-ADDS/HH-INTAKE-CONTACT-FORM-INTENT-PASSTHROUGH/ANSWERS-PR-2-SCOPE-LOCKS.md`
 * Q1 lock — option (iii) catalog flip as the durable normalization fix
 * for the HS-widget-submits-labels vs. HH-coerce-expects-slugs gap that
 * PR-1 (HH 82d2cd7) exposed.
 */

export type TenantOwnerRole = "MLO" | "BROKER" | "AGENT";

export type ContactFormFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select";

export interface NurtureFieldDefinition {
  /** Custom-field key persisted to `Lead.customFields`. Always `scout_<X>`. */
  key: string;
  /** Default UI label (admin can override per-tenant in widgetSettings). */
  label: string;
  type: ContactFormFieldType;
  /** Select options (only when `type === "select"`). */
  options?: readonly { value: string; label: string }[];
  /** Baseline required-state (admin can override). */
  required?: boolean;
  /** Which roles get this field in their starter default set. */
  defaultForRoles: readonly TenantOwnerRole[];
  /** Help text for the admin editor. */
  description?: string;
}

/**
 * Tier 1 — Milo-aware (42 fields). Each entry has a real or one-hop-derived
 * Milo nurture-rule consumer. Adding to this array requires citing the
 * consumer file:line in the PR description.
 *
 * v0.2.0 (2026-05-14) promoted `scout_loan_purpose` + `scout_referral_source`
 * from Tier 2 (`RELLO_REGISTERED_FIELDS`) following Milo Engine Wave 2
 * consumer wire-up: R4 `applyR4ReferralSource` + R6 `applyR6LoanPurposeRouting`
 * in `~/Milo-Engine/src/lib/contact-form-intent.ts`.
 *
 * v0.4.0 (2026-06-15) added 33 role-gated catalog fields (9 baseline → 42;
 * NURTURE-AUDIT 06142026 STEP 1) — byte-matched to the HS forward-contract
 * catalog. One-hop consumer for all 33: `renderScoutValue` →
 * `resolveFieldDefinition` in `~/Milo-Engine/src/lib/composition-prompt.ts:1880`.
 * One of them (`scout_age_62_plus`) is COMPLIANCE-HELD — see
 * `COMPLIANCE_HOLD_KEYS`.
 */
export const MILO_AWARE_FIELDS: readonly NurtureFieldDefinition[] = [
  {
    key: "scout_message",
    label: "Message",
    type: "textarea",
    required: true,
    defaultForRoles: ["MLO", "BROKER", "AGENT"],
    description:
      "Free-text message; drives Milo intent-classification nurture branch.",
  },
  {
    key: "scout_buying_intent",
    label: "What are you looking to do?",
    type: "select",
    options: [
      { value: "looking-to-buy", label: "Looking to buy" },
      { value: "looking-to-sell", label: "Looking to sell" },
      { value: "refinance", label: "Refinance" },
      { value: "pre-approval", label: "Pre-approval" },
      { value: "general-question", label: "General question" },
    ],
    defaultForRoles: ["BROKER", "AGENT"],
  },
  {
    key: "scout_buying_stage",
    label: "Where are you in the process?",
    type: "select",
    options: [
      { value: "signed-purchase-agreement", label: "Signed purchase agreement" },
      { value: "2-6-months", label: "2-6 months" },
      { value: "offer-pending", label: "Offer pending" },
      { value: "researching", label: "Researching" },
    ],
    defaultForRoles: ["MLO", "AGENT"],
  },
  {
    key: "scout_timeline",
    label: "When do you want to take action?",
    type: "select",
    options: [
      { value: "immediate", label: "Immediate" },
      { value: "30-days", label: "30 days" },
      { value: "60-90-days", label: "60-90 days" },
      { value: "6-plus-months", label: "6+ months" },
    ],
    defaultForRoles: ["MLO", "BROKER", "AGENT"],
  },
  {
    key: "scout_preferred_contact_method",
    label: "How should we reach you?",
    type: "select",
    options: [
      { value: "phone", label: "Phone" },
      { value: "text", label: "Text" },
      { value: "email", label: "Email" },
    ],
    defaultForRoles: ["BROKER"],
  },
  {
    key: "scout_property_type",
    label: "Property type",
    type: "select",
    options: [
      { value: "single-family", label: "Single Family" },
      { value: "condo", label: "Condo" },
      { value: "townhome", label: "Town Home" },
      { value: "multi-family", label: "Multi-Family" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_credit_range",
    label: "Estimated credit score",
    type: "select",
    options: [
      { value: "780-plus", label: "780+" },
      { value: "740-779", label: "740-779" },
      { value: "700-739", label: "700-739" },
      { value: "660-699", label: "660-699" },
      { value: "620-659", label: "620-659" },
      { value: "580-619", label: "580-619" },
      { value: "below-580", label: "Below 580" },
    ],
    defaultForRoles: ["MLO"],
  },
  {
    key: "scout_loan_purpose",
    label: "Loan purpose",
    type: "select",
    options: [
      { value: "purchase", label: "Purchase" },
      { value: "refinance", label: "Refinance" },
    ],
    defaultForRoles: ["MLO"],
  },
  {
    key: "scout_referral_source",
    label: "How did you hear about us?",
    type: "text",
    defaultForRoles: ["BROKER"],
  },

  // -------------------------------------------------------------------------
  // v0.4.0 (2026-06-15) — NURTURE-AUDIT 06142026 STEP 1.
  //
  // Registers the role-gated contact-question catalog Home Scout shipped as a
  // forward contract at `~/The-Home-Scout/src/lib/contact-question-catalog.ts`
  // (HS @ a08db41). Option `value`s here BYTE-MATCH the HS catalog's `opts()`
  // slugifier (`label.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")`)
  // so HS, Rello, and Milo share one enum and a rename is a compile error.
  //
  // All entries are Tier-1 (Milo-aware): every key reaches Milo's
  // `renderScoutValue` slug→label resolver via `resolveFieldDefinition` in
  // `~/Milo-Engine/src/lib/composition-prompt.ts:1880` (one-hop consumer — the
  // citation the header rule requires). STEP 2 (a separate agent) wires the
  // nurture-branching consumers; do NOT add branching logic here.
  //
  // Role-gating mirrors the HS catalog pack roles: mortgage packs → MLO/BROKER
  // hats; real-estate packs → AGENT hat (see `resolveCatalogAccess` in the HS
  // catalog). `defaultForRoles` reflects that gate.

  // ===== MORTGAGE (MLO / BROKER) =====
  // Qualifying
  {
    key: "scout_down_payment",
    label: "Down payment saved",
    type: "select",
    options: [
      { value: "none-yet", label: "None yet" },
      { value: "under-5", label: "Under 5%" },
      { value: "5-10", label: "5–10%" },
      { value: "10-20", label: "10–20%" },
      { value: "20", label: "20%+" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_first_time_buyer",
    label: "First-time buyer?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_price_range",
    label: "Price range you're considering",
    type: "select",
    options: [
      { value: "under-300k", label: "Under $300k" },
      { value: "300-500k", label: "$300–500k" },
      { value: "500-750k", label: "$500–750k" },
      { value: "750k-1m", label: "$750k–1M" },
      { value: "1m", label: "$1M+" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_pre_approved",
    label: "Already pre-approved?",
    type: "select",
    options: [
      { value: "no", label: "No" },
      { value: "with-another-lender", label: "With another lender" },
      { value: "yes", label: "Yes" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_occupancy",
    label: "Primary, second home, or investment?",
    type: "select",
    options: [
      { value: "primary-residence", label: "Primary residence" },
      { value: "second-home", label: "Second home" },
      { value: "investment", label: "Investment" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  // Self-employed → Bank Statement cockpit
  {
    key: "scout_income_type",
    label: "How are you paid?",
    type: "select",
    options: [
      { value: "w-2-employee", label: "W-2 employee" },
      { value: "self-employed", label: "Self-employed" },
      { value: "1099-contractor", label: "1099 contractor" },
      { value: "business-owner", label: "Business owner" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_years_self_employed",
    label: "Years self-employed",
    type: "select",
    options: [
      { value: "under-1", label: "Under 1" },
      { value: "1-2", label: "1–2" },
      { value: "2", label: "2+" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_files_tax_returns",
    label: "Do you file 2 years of tax returns?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  // Investor → DSCR / Non-QM cockpit
  {
    key: "scout_is_investment",
    label: "Is this an investment property?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_rentals_owned",
    label: "How many rentals do you own?",
    type: "select",
    options: [
      { value: "0", label: "0" },
      { value: "1-3", label: "1–3" },
      { value: "4", label: "4+" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_expected_rent",
    label: "Expected monthly rent",
    type: "text",
    defaultForRoles: ["MLO", "BROKER"],
    description:
      "Numeric monthly rent. HS catalog declares type 'number'; the package " +
      "ContactFormFieldType has no 'number' member, so it is registered as " +
      "free-text (no options) — the value is the raw amount either way.",
  },
  {
    key: "scout_buying_in_llc",
    label: "Buying in an LLC?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  // VA cockpit
  {
    key: "scout_va_eligible",
    label: "Veteran, active-duty, or eligible spouse?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_va_first_use",
    label: "Used your VA benefit before?",
    type: "select",
    options: [
      { value: "first-use", label: "First use" },
      { value: "used-before", label: "Used before" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  // Construction loan
  {
    key: "scout_construction_type",
    label: "Building, buying, or renovating?",
    type: "select",
    options: [
      { value: "building", label: "Building" },
      { value: "buying", label: "Buying" },
      { value: "renovating", label: "Renovating" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_owns_lot",
    label: "Do you own the lot?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  // Refinance nurture
  {
    key: "scout_current_rate",
    label: "Roughly your current rate?",
    type: "select",
    options: [
      { value: "under-4", label: "Under 4%" },
      { value: "4-5", label: "4–5%" },
      { value: "5-6", label: "5–6%" },
      { value: "6-7", label: "6–7%" },
      { value: "7", label: "7%+" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },
  {
    key: "scout_refi_goal",
    label: "Refinance goal",
    type: "select",
    options: [
      { value: "lower-payment", label: "Lower payment" },
      { value: "cash-out", label: "Cash out" },
      { value: "drop-mortgage-insurance", label: "Drop mortgage insurance" },
      { value: "shorter-term", label: "Shorter term" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },

  // ⚠️ COMPLIANCE-HOLD — scout_age_62_plus (HECM / reverse mortgage).
  // Age is a PROHIBITED-BASIS attribute (ECOA/Reg B). This entry exists ONLY
  // so HS, Rello, and Milo share the same registry key + enum; it is
  // compliance-review-required and MUST NOT be wired into any nurture
  // BRANCHING / inference / targeting until counsel signs off (STEP 2's rule
  // too). It is deliberately ABSENT from `COMPLIANCE_HOLD_KEYS`-cleared
  // active lists and from every HS preset (verified in the HS catalog tests).
  // Registry membership ≠ branching authorization. Do NOT branch on it.
  {
    key: "scout_age_62_plus",
    label: "Are you 62 or older?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["MLO", "BROKER"],
  },

  // ===== REAL ESTATE (AGENT) =====
  // Buyer nurture
  {
    key: "scout_buy_sell",
    label: "Buying, selling, or both?",
    type: "select",
    options: [
      { value: "buying", label: "Buying" },
      { value: "selling", label: "Selling" },
      { value: "both", label: "Both" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_search_area",
    label: "Areas you're interested in",
    type: "text",
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_re_price_range",
    label: "Price range",
    type: "select",
    options: [
      { value: "under-300k", label: "Under $300k" },
      { value: "300-500k", label: "$300–500k" },
      { value: "500-750k", label: "$500–750k" },
      { value: "750k-1m", label: "$750k–1M" },
      { value: "1m", label: "$1M+" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_beds_baths",
    label: "Beds / baths needed",
    type: "text",
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_move_timeline",
    label: "When do you want to move?",
    type: "select",
    options: [
      { value: "immediate", label: "Immediate" },
      { value: "1-3-mo", label: "1–3 mo" },
      { value: "3-6-mo", label: "3–6 mo" },
      { value: "6-mo", label: "6+ mo" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_rent_or_own",
    label: "Do you rent or own now?",
    type: "select",
    options: [
      { value: "rent", label: "Rent" },
      { value: "own", label: "Own" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_working_with_agent",
    label: "Working with another agent?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_sell_before_buy",
    label: "Need to sell before buying?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["AGENT"],
  },
  // Seller nurture
  {
    key: "scout_sell_reason",
    label: "Why are you selling?",
    type: "text",
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_sell_timeline",
    label: "When do you want to sell?",
    type: "select",
    options: [
      { value: "immediate", label: "Immediate" },
      { value: "1-3-mo", label: "1–3 mo" },
      { value: "3-6-mo", label: "3–6 mo" },
      { value: "6-mo", label: "6+ mo" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_found_next_home",
    label: "Found your next home?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_home_value_range",
    label: "Estimated home value",
    type: "select",
    options: [
      { value: "under-300k", label: "Under $300k" },
      { value: "300-500k", label: "$300–500k" },
      { value: "500-750k", label: "$500–750k" },
      { value: "750k-1m", label: "$750k–1M" },
      { value: "1m", label: "$1M+" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_amount_owed",
    label: "Roughly what you owe",
    type: "select",
    options: [
      { value: "under-300k", label: "Under $300k" },
      { value: "300-500k", label: "$300–500k" },
      { value: "500-750k", label: "$500–750k" },
      { value: "750k-1m", label: "$750k–1M" },
      { value: "1m", label: "$1M+" },
    ],
    defaultForRoles: ["AGENT"],
  },
  {
    key: "scout_occupancy_status",
    label: "Occupied, vacant, or tenant-occupied?",
    type: "select",
    options: [
      { value: "owner-occupied", label: "Owner-occupied" },
      { value: "vacant", label: "Vacant" },
      { value: "tenant-occupied", label: "Tenant-occupied" },
    ],
    defaultForRoles: ["AGENT"],
  },
] as const;

/**
 * Keys that are registered (so the slug enum is shared platform-wide) but
 * carry a COMPLIANCE-HOLD: they are prohibited-basis or otherwise
 * counsel-gated and MUST NOT be consumed by any nurture branching / inference
 * / targeting until counsel signs off. Registry membership ≠ branching
 * authorization. STEP 2 (branching) MUST exclude every key in this set.
 *
 * Currently: `scout_age_62_plus` (age — ECOA/Reg B prohibited basis; HECM).
 */
export const COMPLIANCE_HOLD_KEYS: ReadonlySet<string> = new Set([
  "scout_age_62_plus",
]);

/** True if `key` is registered but compliance-held (do NOT branch on it). */
export function isComplianceHold(key: string): boolean {
  return COMPLIANCE_HOLD_KEYS.has(key);
}

/**
 * Tier 2 — Rello-registered (0 fields as of v0.2.0). Reserved for future
 * fields that persist to `Lead` canonical columns or `Lead.customFields` but
 * have no Milo nurture-rule consumer yet. Promotion to Tier 1 requires
 * citing the consumer file:line per the header rule.
 *
 * v0.2.0 (2026-05-14) promoted `scout_loan_purpose` + `scout_referral_source`
 * to Tier 1 following Milo Engine Wave 2 consumer wire-up.
 */
export const RELLO_REGISTERED_FIELDS: readonly NurtureFieldDefinition[] = [] as const;

/**
 * Resolve a stored field-key to its registry definition. Searches Tier 1
 * first, then Tier 2. Returns null for unknown keys (typically
 * `scout_contact_<slug>` Tier-3 MLO-only custom fields handled by consumer
 * code, or unregistered keys).
 */
export function resolveFieldDefinition(
  key: string,
): NurtureFieldDefinition | null {
  return (
    MILO_AWARE_FIELDS.find((f) => f.key === key) ??
    RELLO_REGISTERED_FIELDS.find((f) => f.key === key) ??
    null
  );
}

/**
 * True ONLY if `key` is a Tier-1 (Milo-aware) field. False for Tier 2,
 * Tier 3, and any non-registered key.
 */
export function isMiloAware(key: string): boolean {
  return MILO_AWARE_FIELDS.some((f) => f.key === key);
}

/**
 * True if `key` is a registered Tier-1 or Tier-2 contact-form field. False
 * for Tier-3 (`scout_contact_*`) admin-bespoke keys and any non-registered
 * key.
 */
export function isRelloRegistered(key: string): boolean {
  return (
    MILO_AWARE_FIELDS.some((f) => f.key === key) ||
    RELLO_REGISTERED_FIELDS.some((f) => f.key === key)
  );
}

/**
 * Discriminated tri-state classifier for a stored contact-form field key.
 * Maps a key to exactly one of the three registry tiers — used by the admin
 * editor to render tier-aware badges + copy in place of the prior binary
 * Milo-aware / Custom split that mis-labeled Tier 2 as Custom.
 *
 *   - `"milo-aware"`        — Tier 1 (`MILO_AWARE_FIELDS`)
 *   - `"rello-registered"`  — Tier 2 (`RELLO_REGISTERED_FIELDS`, no Milo consumer yet)
 *   - `"custom-mlo"`        — Tier 3 (`scout_contact_*` MLO-only) AND any unregistered key
 */
export type FieldTier = "milo-aware" | "rello-registered" | "custom-mlo";

export function fieldTier(key: string): FieldTier {
  if (MILO_AWARE_FIELDS.some((f) => f.key === key)) return "milo-aware";
  if (RELLO_REGISTERED_FIELDS.some((f) => f.key === key))
    return "rello-registered";
  return "custom-mlo";
}

/**
 * Role-default starter set. Pulls from BOTH Tier 1 and Tier 2 based on each
 * field's `defaultForRoles`. Admin can add / remove / reorder; values
 * persist to `AgentConfig.widgetSettings.contactForm`.
 */
export function getDefaultFieldsForRole(
  role: TenantOwnerRole,
): readonly NurtureFieldDefinition[] {
  return [...MILO_AWARE_FIELDS, ...RELLO_REGISTERED_FIELDS].filter((f) =>
    f.defaultForRoles.includes(role),
  );
}
