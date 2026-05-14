# @rello-platform/scout-fields

Canonical `scout_*` nurture-field registry for the Rello ecosystem. A single source of truth for the widget-capture fields the Home Scout contact-form widget renders, the Rello CRM MLO cockpit displays, and the Milo Engine nurture rules consume. Consuming this package makes a `scout_*` key rename a **compile error** in every consumer instead of silent drift across three repos.

## Install

```bash
npm install "github:rello-platform/scout-fields#v0.2.0"
```

## Usage

```ts
import {
  MILO_AWARE_FIELDS,
  RELLO_REGISTERED_FIELDS,
  resolveFieldDefinition,
  isMiloAware,
  isRelloRegistered,
  fieldTier,
  getDefaultFieldsForRole,
  type NurtureFieldDefinition,
  type ContactFormFieldType,
  type TenantOwnerRole,
  type FieldTier,
} from "@rello-platform/scout-fields";

// Render the contact-form widget's full field catalog:
for (const field of [...MILO_AWARE_FIELDS, ...RELLO_REGISTERED_FIELDS]) {
  console.log(field.key, field.label, field.type);
}

// Classify a stored Lead.customFields key:
fieldTier("scout_buying_intent");      // "milo-aware"
fieldTier("scout_loan_purpose");       // "rello-registered"
fieldTier("scout_contact_anything");   // "custom-mlo"

// Resolve a key to its definition (null for unregistered):
const def = resolveFieldDefinition("scout_credit_range");

// Starter set for a tenant's role:
const starterFields = getDefaultFieldsForRole("MLO");
```

## Shape

```ts
interface NurtureFieldDefinition {
  readonly key: string;                                 // wire format, e.g. "scout_buying_intent"
  readonly label: string;                               // default UI label (admin can override)
  readonly type: ContactFormFieldType;                  // "text" | "email" | "phone" | "textarea" | "select"
  readonly options?: readonly string[];                 // present only when type === "select"
  readonly required?: boolean;                          // baseline required-state
  readonly defaultForRoles: readonly TenantOwnerRole[]; // "MLO" | "BROKER" | "AGENT" starter set membership
  readonly description?: string;                        // admin-editor help text
}
```

## Tier model

Two registered tiers ship in this package. A third tier — custom MLO-only `scout_contact_*` keys derived from admin-entered labels — is intentionally out of scope. Tier-3 plumbing (the `scout_contact_` prefix + the label-to-key derivation function) lives in consumer-local code.

| Tier | Constant | Cardinality | Meaning |
|------|----------|-------------|---------|
| 1 | `MILO_AWARE_FIELDS` | 9 | Has a real or one-hop-derived Milo nurture-rule consumer |
| 2 | `RELLO_REGISTERED_FIELDS` | 0 | Persisted but no current Milo consumer (promoted to Tier 1 when one lands; empty array reserved for future Tier-2 fields) |
| 3 | _(consumer-local)_ | n/a | `scout_contact_<slug>` admin-bespoke fields — `fieldTier()` returns `"custom-mlo"` and `resolveFieldDefinition()` returns `null` |

Tier-membership is structurally enforced via which array a field appears in. There is no per-field boolean flag.

## Provenance

- Spec: `~/RELLO TO BE BUILT/BUILD-|-FEATURE-ADDS/RELLO-PLATFORM-SCOUT-FIELDS-PACKAGE/SPEC-RELLO-PLATFORM-SCOUT-FIELDS-PACKAGE.md`
- DISCOVERED: `~/RELLO TO BE BUILT/APP REBUILDS/HOME SCOUT/DISCOVERED/DISCOVERED-RELLO-PLATFORM-SCOUT-FIELDS-PACKAGE-EXTRACTION-260513.md`
- Pattern reference: `@rello-platform/slugs`, `@rello-platform/permissions` (canonical platform registries)
- Source extraction: `~/The-Home-Scout/src/lib/nurture-field-catalog.ts` (HS canonical, pre-extraction)

## Versioning

- `v0.2.0` (2026-05-14) — Tier promotion: `scout_loan_purpose` + `scout_referral_source` moved from `RELLO_REGISTERED_FIELDS` → `MILO_AWARE_FIELDS` following Milo Engine Wave 2 consumer wire-up (`~/Milo-Engine/src/lib/contact-form-intent.ts` — R6 `applyR6LoanPurposeRouting` @ commit `1416f29`; R4 `applyR4ReferralSource` @ commit `1714867`). Per the package's documented Tier-2→Tier-1 promotion rule. `MILO_AWARE_FIELDS` now has 9 entries (was 7); `RELLO_REGISTERED_FIELDS` is empty (was 2 — preserved as forward-compat reservation).
- `v0.1.0` (2026-05-14) — initial extraction; arrays + types + helpers lifted verbatim from HS canonical. Tier-3 plumbing (`CUSTOM_MLO_FIELD_PREFIX` + `deriveCustomFieldKey`) intentionally stays HS-local. 7 Tier-1 + 2 Tier-2 fields.

v0.x is reserved for additive entries, new helpers, or new types. v1.0 is deferred until the first breaking change (e.g. `NurtureFieldDefinition` shape change or array entry removal). Consumer pin bumps are atomic with package tags — the same wave PR that tags a new version also bumps `package.json` pins in every consumer.
