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
            "Looking to buy",
            "Looking to sell",
            "Refinance",
            "Pre-approval",
            "General question",
        ],
        defaultForRoles: ["BROKER", "AGENT"],
    },
    {
        key: "scout_buying_stage",
        label: "Where are you in the process?",
        type: "select",
        options: [
            "Signed purchase agreement",
            "2-6 months",
            "Offer pending",
            "Researching",
        ],
        defaultForRoles: ["MLO", "AGENT"],
    },
    {
        key: "scout_timeline",
        label: "When do you want to take action?",
        type: "select",
        options: ["Immediate", "30 days", "60-90 days", "6+ months"],
        defaultForRoles: ["MLO", "BROKER", "AGENT"],
    },
    {
        key: "scout_preferred_contact_method",
        label: "How should we reach you?",
        type: "select",
        options: ["Phone", "Text", "Email"],
        defaultForRoles: ["BROKER"],
    },
    {
        key: "scout_property_type",
        label: "Property type",
        type: "select",
        options: ["Single Family", "Condo", "Town Home", "Multi-Family"],
        defaultForRoles: ["AGENT"],
    },
    {
        key: "scout_credit_range",
        label: "Estimated credit score",
        type: "select",
        options: [
            "780+",
            "740-779",
            "700-739",
            "660-699",
            "620-659",
            "580-619",
            "Below 580",
        ],
        defaultForRoles: ["MLO"],
    },
    {
        key: "scout_loan_purpose",
        label: "Loan purpose",
        type: "select",
        options: ["Purchase", "Refinance"],
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
