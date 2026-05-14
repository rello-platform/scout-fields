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
/**
 * Tier 1 — Milo-aware (9 fields). Each entry has a real or one-hop-derived
 * Milo nurture-rule consumer. Adding to this array requires citing the
 * consumer file:line in the PR description.
 *
 * v0.2.0 (2026-05-14) promoted `scout_loan_purpose` + `scout_referral_source`
 * from Tier 2 (`RELLO_REGISTERED_FIELDS`) following Milo Engine Wave 2
 * consumer wire-up: R4 `applyR4ReferralSource` + R6 `applyR6LoanPurposeRouting`
 * in `~/Milo-Engine/src/lib/contact-form-intent.ts`.
 */
export const MILO_AWARE_FIELDS = [
    {
        key: "scout_message",
        label: "Message",
        type: "textarea",
        required: true,
        defaultForRoles: ["MLO", "BROKER", "AGENT"],
        description: "Free-text message; drives Milo intent-classification nurture branch.",
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
];
/**
 * Tier 2 — Rello-registered (0 fields as of v0.2.0). Reserved for future
 * fields that persist to `Lead` canonical columns or `Lead.customFields` but
 * have no Milo nurture-rule consumer yet. Promotion to Tier 1 requires
 * citing the consumer file:line per the header rule.
 *
 * v0.2.0 (2026-05-14) promoted `scout_loan_purpose` + `scout_referral_source`
 * to Tier 1 following Milo Engine Wave 2 consumer wire-up.
 */
export const RELLO_REGISTERED_FIELDS = [];
/**
 * Resolve a stored field-key to its registry definition. Searches Tier 1
 * first, then Tier 2. Returns null for unknown keys (typically
 * `scout_contact_<slug>` Tier-3 MLO-only custom fields handled by consumer
 * code, or unregistered keys).
 */
export function resolveFieldDefinition(key) {
    return (MILO_AWARE_FIELDS.find((f) => f.key === key) ??
        RELLO_REGISTERED_FIELDS.find((f) => f.key === key) ??
        null);
}
/**
 * True ONLY if `key` is a Tier-1 (Milo-aware) field. False for Tier 2,
 * Tier 3, and any non-registered key.
 */
export function isMiloAware(key) {
    return MILO_AWARE_FIELDS.some((f) => f.key === key);
}
/**
 * True if `key` is a registered Tier-1 or Tier-2 contact-form field. False
 * for Tier-3 (`scout_contact_*`) admin-bespoke keys and any non-registered
 * key.
 */
export function isRelloRegistered(key) {
    return (MILO_AWARE_FIELDS.some((f) => f.key === key) ||
        RELLO_REGISTERED_FIELDS.some((f) => f.key === key));
}
export function fieldTier(key) {
    if (MILO_AWARE_FIELDS.some((f) => f.key === key))
        return "milo-aware";
    if (RELLO_REGISTERED_FIELDS.some((f) => f.key === key))
        return "rello-registered";
    return "custom-mlo";
}
/**
 * Role-default starter set. Pulls from BOTH Tier 1 and Tier 2 based on each
 * field's `defaultForRoles`. Admin can add / remove / reorder; values
 * persist to `AgentConfig.widgetSettings.contactForm`.
 */
export function getDefaultFieldsForRole(role) {
    return [...MILO_AWARE_FIELDS, ...RELLO_REGISTERED_FIELDS].filter((f) => f.defaultForRoles.includes(role));
}
