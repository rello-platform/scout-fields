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
export type TenantOwnerRole = "MLO" | "BROKER" | "AGENT";
export type ContactFormFieldType = "text" | "email" | "phone" | "textarea" | "select";
export interface NurtureFieldDefinition {
    /** Custom-field key persisted to `Lead.customFields`. Always `scout_<X>`. */
    key: string;
    /** Default UI label (admin can override per-tenant in widgetSettings). */
    label: string;
    type: ContactFormFieldType;
    /** Select options (only when `type === "select"`). */
    options?: readonly string[];
    /** Baseline required-state (admin can override). */
    required?: boolean;
    /** Which roles get this field in their starter default set. */
    defaultForRoles: readonly TenantOwnerRole[];
    /** Help text for the admin editor. */
    description?: string;
}
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
export declare const MILO_AWARE_FIELDS: readonly NurtureFieldDefinition[];
/**
 * Tier 2 — Rello-registered (0 fields as of v0.2.0). Reserved for future
 * fields that persist to `Lead` canonical columns or `Lead.customFields` but
 * have no Milo nurture-rule consumer yet. Promotion to Tier 1 requires
 * citing the consumer file:line per the header rule.
 *
 * v0.2.0 (2026-05-14) promoted `scout_loan_purpose` + `scout_referral_source`
 * to Tier 1 following Milo Engine Wave 2 consumer wire-up.
 */
export declare const RELLO_REGISTERED_FIELDS: readonly NurtureFieldDefinition[];
/**
 * Resolve a stored field-key to its registry definition. Searches Tier 1
 * first, then Tier 2. Returns null for unknown keys (typically
 * `scout_contact_<slug>` Tier-3 MLO-only custom fields handled by consumer
 * code, or unregistered keys).
 */
export declare function resolveFieldDefinition(key: string): NurtureFieldDefinition | null;
/**
 * True ONLY if `key` is a Tier-1 (Milo-aware) field. False for Tier 2,
 * Tier 3, and any non-registered key.
 */
export declare function isMiloAware(key: string): boolean;
/**
 * True if `key` is a registered Tier-1 or Tier-2 contact-form field. False
 * for Tier-3 (`scout_contact_*`) admin-bespoke keys and any non-registered
 * key.
 */
export declare function isRelloRegistered(key: string): boolean;
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
export declare function fieldTier(key: string): FieldTier;
/**
 * Role-default starter set. Pulls from BOTH Tier 1 and Tier 2 based on each
 * field's `defaultForRoles`. Admin can add / remove / reorder; values
 * persist to `AgentConfig.widgetSettings.contactForm`.
 */
export declare function getDefaultFieldsForRole(role: TenantOwnerRole): readonly NurtureFieldDefinition[];
//# sourceMappingURL=index.d.ts.map