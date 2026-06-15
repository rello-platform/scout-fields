# @rello-platform/scout-fields

Canonical `scout_*` nurture-field registry for the Rello ecosystem. A single source of truth for the widget-capture fields the Home Scout contact-form widget renders, the Rello CRM MLO cockpit displays, and the Milo Engine nurture rules consume. Consuming this package makes a `scout_*` key rename a **compile error** in every consumer instead of silent drift across three repos.

## Install

```bash
npm install "github:rello-platform/scout-fields#v0.4.0"
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
| 1 | `MILO_AWARE_FIELDS` | 42 | Has a real or one-hop-derived Milo nurture-rule consumer |
| 2 | `RELLO_REGISTERED_FIELDS` | 0 | Persisted but no current Milo consumer (promoted to Tier 1 when one lands; empty array reserved for future Tier-2 fields) |
| 3 | _(consumer-local)_ | n/a | `scout_contact_<slug>` admin-bespoke fields — `fieldTier()` returns `"custom-mlo"` and `resolveFieldDefinition()` returns `null` |

Tier-membership is structurally enforced via which array a field appears in. There is no per-field boolean flag.

## Compliance-held keys

Some keys are **registered** (so the slug enum is shared platform-wide between Home Scout, Rello, and Milo) but carry a **compliance hold**: they are prohibited-basis or otherwise counsel-gated and MUST NOT be consumed by any nurture branching / inference / targeting until counsel signs off. **Registry membership ≠ branching authorization.**

```ts
import { COMPLIANCE_HOLD_KEYS, isComplianceHold } from "@rello-platform/scout-fields";

isComplianceHold("scout_age_62_plus"); // true — do NOT branch on it
```

Currently held: `scout_age_62_plus` (age — ECOA / Reg B prohibited basis; HECM/reverse). It is registered so HS/Rello/Milo share the same enum, but every branching consumer must exclude `COMPLIANCE_HOLD_KEYS`.

## Provenance

- Spec: `~/RELLO TO BE BUILT/BUILD-|-FEATURE-ADDS/RELLO-PLATFORM-SCOUT-FIELDS-PACKAGE/SPEC-RELLO-PLATFORM-SCOUT-FIELDS-PACKAGE.md`
- DISCOVERED: `~/RELLO TO BE BUILT/APP REBUILDS/HOME SCOUT/DISCOVERED/DISCOVERED-RELLO-PLATFORM-SCOUT-FIELDS-PACKAGE-EXTRACTION-260513.md`
- Pattern reference: `@rello-platform/slugs`, `@rello-platform/permissions` (canonical platform registries)
- Source extraction: `~/The-Home-Scout/src/lib/nurture-field-catalog.ts` (HS canonical, pre-extraction)

## Versioning

- `v0.4.0` (2026-06-15) — **NURTURE-AUDIT 06142026 STEP 1.** Registered 33 role-gated contact-question fields byte-matched to the Home Scout forward-contract catalog (`~/The-Home-Scout/src/lib/contact-question-catalog.ts` @ HS `a08db41`): 19 mortgage fields (`scout_down_payment`, `scout_first_time_buyer`, `scout_price_range`, `scout_pre_approved`, `scout_occupancy`, `scout_income_type`, `scout_years_self_employed`, `scout_files_tax_returns`, `scout_is_investment`, `scout_rentals_owned`, `scout_expected_rent`, `scout_buying_in_llc`, `scout_va_eligible`, `scout_va_first_use`, `scout_construction_type`, `scout_owns_lot`, `scout_current_rate`, `scout_refi_goal`, `scout_age_62_plus`) gated to `["MLO","BROKER"]`, and 14 real-estate fields (`scout_buy_sell`, `scout_search_area`, `scout_re_price_range`, `scout_beds_baths`, `scout_move_timeline`, `scout_rent_or_own`, `scout_working_with_agent`, `scout_sell_before_buy`, `scout_sell_reason`, `scout_sell_timeline`, `scout_found_next_home`, `scout_home_value_range`, `scout_amount_owed`, `scout_occupancy_status`) gated to `["AGENT"]`. `MILO_AWARE_FIELDS` now has 42 entries (was 9). One-hop Milo consumer for all 33: `renderScoutValue` → `resolveFieldDefinition` at `~/Milo-Engine/src/lib/composition-prompt.ts:1880`. Added `COMPLIANCE_HOLD_KEYS` + `isComplianceHold()`; `scout_age_62_plus` is registered but compliance-held (prohibited-basis age — must not be wired into branching until counsel signs off). Branching consumers are STEP 2 (separate). Additive — no breaking change.
- `v0.3.0` (2026-05-2x) — option shape flipped from `readonly string[]` to `readonly { value, label }[]` so the widget submits + stores canonical slug-form values (HS-widget-submits-labels vs HH-coerce-expects-slugs normalization).
- `v0.2.0` (2026-05-14) — Tier promotion: `scout_loan_purpose` + `scout_referral_source` moved from `RELLO_REGISTERED_FIELDS` → `MILO_AWARE_FIELDS` following Milo Engine Wave 2 consumer wire-up (`~/Milo-Engine/src/lib/contact-form-intent.ts` — R6 `applyR6LoanPurposeRouting` @ commit `1416f29`; R4 `applyR4ReferralSource` @ commit `1714867`). Per the package's documented Tier-2→Tier-1 promotion rule. `MILO_AWARE_FIELDS` now has 9 entries (was 7); `RELLO_REGISTERED_FIELDS` is empty (was 2 — preserved as forward-compat reservation).
- `v0.1.0` (2026-05-14) — initial extraction; arrays + types + helpers lifted verbatim from HS canonical. Tier-3 plumbing (`CUSTOM_MLO_FIELD_PREFIX` + `deriveCustomFieldKey`) intentionally stays HS-local. 7 Tier-1 + 2 Tier-2 fields.

v0.x is reserved for additive entries, new helpers, or new types. v1.0 is deferred until the first breaking change (e.g. `NurtureFieldDefinition` shape change or array entry removal). Consumer pin bumps are atomic with package tags — the same wave PR that tags a new version also bumps `package.json` pins in every consumer.
