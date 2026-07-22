# CertiChain AI — Work in Progress

> **Purpose.** A living status report comparing the **Software Design Specification (SDS)** against the **actual codebase** as it stands today. It records what is complete, what is partially done, what is not started, and the concrete blockers and bugs found during the review. It is meant to be updated as work progresses.
>
> **Scope reviewed.** `blockchain/` (Hardhat + Solidity), `server/` (Express + TypeScript + MySQL), `client/` (React + TypeScript + Vite), against the SDS document `DAVID ELIAS KIMUTAI-2401102-BBIT-DL-SDS-CertiChain_AI_SDS.pdf`.
>
> **Status legend.** ✅ Complete · 🟡 Partial · 🔴 Not started / blocked · 🐞 Bug

---

## 1. Executive Summary

CertiChain AI is a **multi-tenant, blockchain-anchored academic certificate** platform with four roles (systemAdmin, institution admin, student, employer). The SDS describes a four-tier architecture (Presentation / Application / Data / Blockchain) and is thorough and internally consistent.

Implementation status by layer:

| Layer | SDS coverage | Implementation | Verdict |
|---|---|---|---|
| **Data (MySQL)** | Complete & detailed | Schema written; schema-bootstrapping disabled; models commented out | 🟡 |
| **Application (Express)** | Complete | **Authentication fully built & working**; users CRUD mostly done; institutions written but **won't compile**; certificates / verification / recommendations **stubbed** | 🟡 |
| **Blockchain (Solidity)** | Complete | Contract + interface written & sound; **test is stale and will fail**; no deploy artifacts committed; **no backend gateway** | 🟡 |
| **Presentation (React)** | Complete | Auth flows + dashboards for systemAdmin/institutionAdmin/student **functional with real data**; certificate/verify/recommendation pages **empty stubs** | 🟡 |

**Headline:** The platform's **identity foundation is solid and usable**. The **core product loop** — issue a certificate → anchor its hash on Ethereum → verify it → generate AI career recommendations — is **not yet wired together**. Several blockers (a missing repository, a stale Hardhat test, no backend blockchain client, and a handful of auth bugs) should be fixed before the next vertical slice.

**Overall completion estimate: ~35–40%.**

---

## 2. SDS Recap (what the design promises)

From the SDS, CertiChain AI must deliver:

- **Authentication component** — `/auth/register|login|refresh|logout|verify`, JWT access (15 min) + refresh (7 d) in httpOnly cookie, role-aware email validation, bcrypt(salt 10). ✔ *designed*
- **Institution component** — systemAdmin registers institutions + Ethereum wallet; multi-tenant isolation. ✔ *designed*
- **Certificate component** — admin issues (SHA-256 fingerprint incl. `institutionId`) → store metadata in MySQL → submit hash to chain → generate QR + PDF; revoke; public verify. ✔ *designed*
- **Users component** — CRUD with role-based authorization and tenant isolation. ✔ *designed*
- **AI Recommendation component** — from verified certificate → recommended roles, skill gaps, market insights, job matches; persisted. ✔ *designed*
- **Blockchain Gateway** — server signs tx with institution wallet; issue / verify / revoke on `CertificateRegistry`; only authorized issuers. ✔ *designed*
- **Data design** — 5 tables (`institutions`, `users`, `certificates`, `verification_logs`, `recommendations`), 3NF, parameterized SQL via mysql2, **no ORM**. ✔ *designed*
- **Testing strategy** — unit / integration / E2E, including Hardhat contract tests. ✔ *designed*
- **Constraints** — server-side wallet custody, no browser wallet for admins, single-region MySQL, non-upgradeable contract. ✔ *documented*

---

## 3. Codebase Map

```
CertiChain_AI_MySQL/
├── README.md                  # Workspace setup + start commands
├── DOCUMENT_STRUCTURE.md      # Proposal/report outline
├── CertiChain_Diagrams.html   # Diagrams
├── debug.log                  # Stray crash log (can be removed)
├── blockchain/                # Hardhat 3 workspace
│   ├── contracts/
│   │   ├── CertificateRegistry.sol      # Core contract — written
│   │   └── interfaces/ICertificateRegistry.sol
│   ├── test/CertificateRegistry.ts      # ⚠ stale, will fail
│   ├── scripts/deploy.ts
│   ├── hardhat.config.ts                # hardhat / localhost / sepolia
│   └── package.json                     # ethers, chai, hardhat 3
├── server/                    # Express 5 + TS + MySQL (mysql2)
│   └── src/
│       ├── server.ts                    # only /auth + /users mounted
│       ├── config/{db.ts, DbConnection.ts}
│       ├── database/schema.sql          # all 5 tables defined
│       ├── controllers/                 # auth✓ users✓ institution✓ certificate(stub)
│       ├── services/                    # auth✓ users✓ institution✓ certificate(stub)
│       │   └── blockchain/certificateHash.ts   # SHA-256 fingerprint util ✓
│       ├── repositories/                # ⚠ auth, users ONLY — no institution repo
│       ├── routes/                      # auth✓ users✓ institution✓ cert/rec/vlog(stub)
│       ├── middlewares/                 # auth✓ role✓
│       ├── email/authEmail.ts           # nodemailer OTP + welcome ✓
│       ├── types/                       # shared TS interfaces ✓
│       ├── models_sequelize_typescript/ # ALL COMMENTED OUT (legacy ORM attempt)
│       └── contracts/ICertificateRegistry.json  # ABI
└── client/                    # React 19 + Vite + Tailwind v4
    └── src/
        ├── App.tsx                      # routing for all 4 roles ✓
        ├── context/                     # Auth✓ Users✓ Theme✓ IssueCert(stub) Wallet(EMPTY)
        ├── components/                  # ProtectedRoute, DashboardLayout, modals ✓
        ├── pages/
        │   ├── auth/                    # Login✓ Register✓
        │   ├── LandingPage.tsx          # ✓
        │   ├── student/                 # Dashboard✓ / MyCerts(stub) / Verify(stub) / Career(stub)
        │   ├── admin/                   # Dashboard✓ / ManageUsers✓ / Issue(stub) / Manage(stub) / Analytics(stub)
        │   └── systemAdmin/             # Login✓ Dashboard✓ RegisterInstitution✓
        └── services/api.ts              # axios baseURL ✓
```

---

## 4. Module-by-Module Status

### 4.1 Authentication — ✅ Largely complete & functional

**Implemented:** register, login, JWT access/refresh, refresh rotation, logout (clears cookie), `authMiddleware`, `roleMiddleware`, OTP email (nodemailer), welcome email, rate limiting on auth routes, CORS + helmet + cookie-parser.

| Item | Status | Notes |
|---|---|---|
| `/auth/register` | ✅ | Role-aware email regex (student `@students…ac.ke`, admin `admin@…ac.ke`, employer general) |
| `/auth/login` | ✅ | bcrypt compare, sets `refreshToken` httpOnly cookie, returns access token |
| `/auth/refresh` | ✅ | Verifies cookie, mints new access token |
| `/auth/logout` | ✅ | Clears cookie |
| `/auth/verify` | ✅ | Protected profile lookup |
| Forgot/reset password flow | 🟡 | Wired end-to-end but contains bugs (see §6) |
| `/auth/wallet` (PUT) | 🔴 | Controller + service exist, **route is commented out** in `auth.routes.ts` |
| OTP **on login** | 🐞 | `signInController` sends an OTP email on every login but never verifies it / never gates the session — currently noise, not a security check |

### 4.2 Users — ✅ Mostly complete

CRUD endpoints + service + repository done (`findAll`, `findById`, `create`, `update`, `delete`). Frontend `ManageUsers` page + `AddUsersModal` functional.

| Item | Status | Notes |
|---|---|---|
| `GET/POST/PUT/DELETE /api/users` | ✅ | Working |
| Role middleware on user routes | 🐞 | `authMiddleware` + `roleMiddleware(["admin"])` are **commented out** in `users.routes.ts` — endpoints are currently public |
| `/users/profile` (self) | 🔴 | SDS lists it; not implemented |

### 4.3 Institutions — 🟡 Written but broken / not mounted

Controller, service, routes, and `RegisterInstitution.tsx` page are all written and look correct. **But the layer beneath is missing.**

| Item | Status | Notes |
|---|---|---|
| `institution.controller.ts` | ✅ | get/add/update/delete handlers complete |
| `institution.service.ts` | ✅ logic, 🐞 import | Imports `InstitutionRepository` from `../repositories/institution.repository` — **that file does not exist** |
| `institution.repository.ts` | 🔴 | **Missing entirely** — backend will fail to compile/resolve once the route is mounted |
| `/api/institution` mount | 🔴 | Commented out in `server.ts` (so the broken import is currently dormant) |
| SystemAdmin UI | ✅ | `RegisterInstitution.tsx` (219 lines) + `SystemDashboardPage.tsx` functional |

### 4.4 Certificates — 🔴 Not started (the core feature)

| Item | Status | Notes |
|---|---|---|
| `certificate.service.ts` | 🔴 | 84 lines, **entirely comments** |
| `certificate.controller.ts` | 🔴 | Only commented snippets |
| `certificate.routes.ts` | 🔴 | Empty commented router |
| `certificate.model.ts` | 🔴 | Sequelize-typescript model fully written but **commented out** (and project uses raw SQL, not this ORM) |
| SHA-256 hash util | ✅ | `services/blockchain/certificateHash.ts` — deterministic fingerprint incl. `institutionId`, returns `0x…` SHA-256. **This is the one real building block already in place.** |
| QR code generation | 🔴 | Not started |
| PDF certificate export | 🔴 | Not started |
| Frontend pages | 🔴 | `IssueCertificates`, `ManageCertificates`, `MyCertificates` all empty stubs |
| `/api/certificate` mount | 🔴 | Commented out |

### 4.5 Verification — 🔴 Not started

| Item | Status | Notes |
|---|---|---|
| `verificationLog.routes.ts` | 🔴 | Empty (1 line) |
| `verificationLog.model.ts` | 🔴 | Commented out |
| Public verify endpoint | 🔴 | Not implemented |
| Frontend `VerifyCertificates.tsx` | 🔴 | Empty stub |

### 4.6 AI Recommendations — 🔴 Not started

| Item | Status | Notes |
|---|---|---|
| `recommendation.routes.ts` | 🔴 | Empty (1 line) |
| `recommendation.model.ts` | 🔴 | Commented out |
| AI engine integration | 🔴 | Not started; no AI provider dependency anywhere |
| Frontend `CareerRecommendations.tsx` | 🔴 | Empty stub |

### 4.7 Blockchain (Solidity) — 🟡 Contract solid, tests broken, gateway absent

| Item | Status | Notes |
|---|---|---|
| `CertificateRegistry.sol` | ✅ | Sound multi-tenant design: `registerInstitution`, `issueCertificate(hash, instId)`, `revoke`, `verify`, `getCertificate`, `isAuthorizedIssuer`, custom errors, events, `onlyAuthorizedIssuer` modifier |
| `ICertificateRegistry.sol` | ✅ | Clean interface; matches contract |
| Hardhat config (H3) | ✅ | hardhat / localhost / sepolia; sepolia uses `configVariable` |
| `deploy.ts` | ✅ | Minimal, correct |
| `test/CertificateRegistry.ts` | 🐞🔴 | **Stale & will fail** — calls `issueCertificate(certificateHash)` (1 arg) but contract requires `(certificateHash, institutionId)` (2 args); also never calls `registerInstitution` first, so `onlyAuthorizedIssuer` will revert |
| Server → chain gateway | 🔴 | **No `ethers` in server deps.** The Blockchain Gateway described in the SDS does not exist server-side yet |
| Deployment artifacts | 🟡 | `artifacts/` + `cache/` present locally but nothing committed in git; no recorded deployed address |

### 4.8 Frontend shell — ✅ Strong

Routing, `ProtectedRoute` (role-aware), `DashboardLayout` (role-specific sidebar), `AuthContext`, `UsersContext`, `ThemeContext`, `LandingPage`, role dashboards (student/admin/systemAdmin) are all built with real Tailwind v4 UI.

| Item | Status | Notes |
|---|---|---|
| Routing + role guards | ✅ | All 4 roles routed |
| `AuthContext` | ✅ | Token + user state |
| `WalletContext` | 🔴 | **Empty file (0 bytes)** — referenced in SDS as a component but not implemented |
| `IssueCertificateContext` | 🔴 | 6-line empty stub |
| API client (`api.ts`) | 🟡 | axios instance w/ baseURL; request interceptor (auth header) is commented out; uses cookie strategy instead |
| Charts libs (analytics) | 🔴 | No `recharts`/chart dep installed despite `Analytics.tsx` existing |

### 4.9 Data Layer — 🟡

| Item | Status | Notes |
|---|---|---|
| `schema.sql` | ✅ | All 5 tables, FKs, indexes, ENUMs, `utf8mb4` — matches SDS |
| Schema auto-bootstrap | 🐞 | Disabled in `DbConnection.ts` (commented out); relies on manual `schema.sql` run |
| `config/db.ts` pool | ✅ | mysql2 promise pool singleton |
| Sequelize-TS models | 🟡 | All present but **commented out** — leftover from an abandoned ORM path; the project now uses raw SQL. These files are dead weight and risk confusion. |
| OTP columns | 🐞 | Added twice (once in `CREATE TABLE`, once via `ALTER`) — harmless with `IF NOT EXISTS` style discipline but sloppy |

---

## 5. Gap Analysis (Design vs. Implementation)

| SDS requirement | Code reality | Gap |
|---|---|---|
| Institution CRUD with wallet | Controller+service+UI done | **Missing repository** (compile blocker) |
| Certificate issuance → MySQL → on-chain → QR/PDF | Only the hash util exists | **Entire pipeline unbuilt** |
| Blockchain Gateway (server signs tx) | None | **No `ethers` on server** |
| Public verification endpoint | None | Unbuilt |
| AI recommendations | None | Unbuilt, no provider |
| Smart-contract tests pass | Written but stale | **Will fail** (arity + missing setup) |
| `/users/profile`, `/users/:id` authz | Partial | Authz middleware disabled; self-profile missing |
| `WalletContext`, `IssueCertificateContext` | Empty | Unbuilt |
| Server-side wallet custody (constraint §5) | Not addressable yet | Depends on gateway existing |

---

## 6. Bugs & Blockers Found (verified against code)

> Each of these was confirmed by reading the file, not assumed.

1. 🔴 **BLOCKER — Missing `institution.repository.ts`.** `server/src/services/institution.service.ts` imports `InstitutionRepository` from a file that does not exist. The institution feature cannot be enabled until this repository is written (`findAll`, `findById`, `findByDomain`, `findByShortCode`, `create`, `update`, `softDelete`).
2. 🔴 **BLOCKER — No backend blockchain client.** `server/package.json` has **no `ethers`**. The Blockchain Gateway (issue/verify/revoke) cannot exist. Add `ethers` + a provider/signer module + an `ICertificateRegistry.json` consumer.
3. 🐞 **Stale Hardhat test will fail.** `blockchain/test/CertificateRegistry.ts` calls `issueCertificate(certificateHash)` but the contract signature is `issueCertificate(bytes32 certificateHash, bytes32 institutionId)`. It also never calls `registerInstitution(...)` first, so the `onlyAuthorizedIssuer` modifier reverts. Rewrite tests to the 2-arg API and add institution registration in the fixture.
4. 🐞 **`findUserByIdOtp` queries by the wrong column.** `auth.repository.ts` runs `SELECT ... FROM users WHERE id = ?` but binds the **email** value. The forgot-password lookup will never find a user. Should be `WHERE email = ?`.
5. 🐞 **`UpdatePassword` SQL typo.** `auth.repository.ts`: `UPDATE users SET passowrd = ?` — column misspelled, the reset will throw.
6. 🐞 **Reset-password re-hashes the wrong value.** `UpdatePasswordController` does `bcrypt.hash(existingUser.password, …)` — it hashes the **existing (already-hashed) password** instead of the new `password` from `req.body`. Should hash `password`, not `existingUser.password`.
7. 🐞 **`signUpService` ignores the requested role.** `auth.service.ts` always inserts `role: "student"` regardless of the `role` passed from the controller, so admin/systemAdmin self-registration via `/auth/register` is impossible. (This is partly a feature — roles may be admin-assigned — but it contradicts the controller's role handling and should be a deliberate decision, not a silent override.)
8. 🐞 **User routes are unauthenticated.** `users.routes.ts` has `authMiddleware` and `roleMiddleware` commented out, so `GET/POST/PUT/DELETE /api/users` are currently public. Re-enable before any deployment/demo.
9. 🐞 **`/auth/wallet` is disabled.** Controller + service exist but the route line is commented out in `auth.routes.ts`.
10. 🐞 **Login sends an OTP that is never verified.** `signInController` emails an OTP on every login but never checks it; at minimum it clutters users' inboxes, at worst it implies a security step that doesn't exist.
11. 🐞 **`authEmail.ts` imports from a stream module needlessly** (`import { from } from "node:stream/iter"`) — unused and odd; remove.
12. 🐞 **`debug.log`** (Electron/Crashpad error) is committed at repo root and is unrelated to the project — should be deleted and gitignored.
13. 🐞 **Dead ORM layer.** `models_sequelize_typescript/*` is fully commented out while the project uses raw SQL. Either delete it or finish the documented decision (SDS §3 is explicit: *"no ORM or query builder is used"* — recommend deletion).

---

## 7. Recommended Roadmap (vertical slices, in order)

The goal is to get the **core loop working end-to-end as early as possible**, then layer in the surrounding features.

### Phase 0 — Stabilize (1–2 days)
- [ ] Fix **bug #4, #5, #6** (forgot-password) so the auth surface is correct.
- [ ] Re-enable authz on `/api/users` (**#8**) and the `/auth/wallet` route (**#9**).
- [ ] Decide on the OTP-on-login behavior (**#10**): implement email verification properly or remove it.
- [ ] Reconcile `signUpService` role handling (**#7**) with your intended registration policy.
- [ ] Delete `debug.log` and the dead `models_sequelize_typescript/` dir (**#12, #13**).

### Phase 1 — Institutions end-to-end (2–3 days)
- [ ] Write `institution.repository.ts` (**#1**) — unblocks the whole feature.
- [ ] Mount `/api/institution` in `server.ts`.
- [ ] Confirm the systemAdmin `RegisterInstitution` UI posts to it.
- [ ] Persist the institution wallet address (needed by the gateway).

### Phase 2 — Blockchain Gateway (2–4 days)
- [ ] Add `ethers` to `server` (**#2**).
- [ ] Build `services/blockchain/registryGateway.ts`: provider + signer from env, load `ICertificateRegistry.json` ABI, expose `issue(hash, instId)`, `revoke(...)`, `verify(...)`.
- [ ] Decide custody model (SDS §5: server-side key) and wire a deployer/owner wallet + per-institution issuer wallet.
- [ ] **Fix the Hardhat test (#3)** and get `npx hardhat test` green locally.
- [ ] Deploy to local Hardhat node; record the address in `.env`.

### Phase 3 — Certificate issuance (3–5 days) — *the core feature*
- [ ] `certificate.repository.ts` (raw SQL against existing `certificates` table).
- [ ] `certificate.service.ts`: validate input → `createCertificateHash(...)` (already exists ✅) → insert MySQL row → call gateway → store `blockchain_tx_hash` + `blockchain_certificate_id` → return record.
- [ ] `certificate.controller.ts` + `certificate.routes.ts` (admin-only): `POST /certificates/create`, `GET /certificates`, `GET /certificates/:id`, `PUT /certificates/:id/revoke`, `GET /certificates/my`.
- [ ] QR code generation (e.g. `qrcode`) and PDF export (e.g. `pdfkit`).
- [ ] Frontend: `IssueCertificates` form, `ManageCertificates` table, `MyCertificates` view.

### Phase 4 — Verification (2–3 days)
- [ ] `POST /certificates/verify`: compare submitted hash against the contract via gateway, write a `verification_logs` row, return `{ valid, revoked, certificate, logId }`.
- [ ] Public form (no auth) in `VerifyCertificates.tsx`; QR-scan + hash-paste entry.

### Phase 5 — AI Recommendations (3–5 days)
- [ ] Pick a provider (OpenAI / local LLM). Add a `recommendation.service.ts` that reads a verified certificate and calls the engine.
- [ ] Persist results in `recommendations`. Expose `POST/GET /recommendations`.
- [ ] Build out `CareerRecommendations.tsx` (roles, skill gaps, market insights, job matches).

### Phase 6 — Polish & test (ongoing)
- [ ] Analytics page (`Analytics.tsx`) with real aggregates + a chart lib.
- [ ] `WalletContext` / `IssueCertificateContext` if browser-side wallet UX is ever needed (SDS §5 currently says admins don't use MetaMask — keep it server-side unless that decision changes).
- [ ] Implement the SDS §6 test plan (unit/integration/E2E) — currently **no test suite exists on server or client**.
- [ ] Sepolia deployment (last, per README/SDS).

---

## 8. Quick Health Metrics

| Metric | Value |
|---|---|
| Roles with a working login + dashboard | 3 of 4 (systemAdmin ✅, institution admin ✅, student ✅, employer 🔴 no dashboard) |
| SDS components implemented end-to-end | 2 of 6 (Auth ✅, Users 🟡; Institutions/Certificates/Recommendations/Gateway 🔴) |
| API routes mounted in `server.ts` | 2 of ~6 (`/auth`, `/users`) |
| Core loop (issue → anchor → verify) working | **No** |
| Server test suite | None |
| Client test suite | None |
| Smart-contract tests | Written but **failing/stale** |
| Open blockers (§6 🔴) | 2 |
| Open bugs (§6 🐞) | 11 |

---

## 9. Change Log

| Date | Author | Change |
|---|---|---|
| 2026-07-20 | Initial review | First pass: SDS vs. codebase comparison, gap analysis, bugs, roadmap |
