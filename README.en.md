# majia-chatcut-koubo

![Skill Version](https://img.shields.io/badge/skill-v1.4.1-blue)

> **ChatCut口播 · 马甲实战版** — the install slug stays `majia-chatcut-koubo`.

**A verifiable production system for agent-driven talking-head editing** — an increment layer above the official ChatCut skills, joining visual craft with governed rules, IR/SRT planning, approval, recoverable execution, evidence, media QA, delivery, and feedback.

<img src="https://raw.githubusercontent.com/maojiebc/majia-chatcut-koubo/main/docs/architecture.png" alt="v1.4.1 verifiable production system: Rule Registry → Creator OS IR/SRT → Explainable/Visual Decision Planning → Preview Approval → Recoverable Executor/Evidence → Media QA → Distribution Pack → Field Reports/Feedback Governance, with Capability Profile blocking unproven live routes" width="100%">

<img src="https://raw.githubusercontent.com/maojiebc/majia-chatcut-koubo/main/docs/theme-preview.png" alt="v1.4.1 · 8 talking-head color themes overview (each with an agent playbook)" width="100%">

## What's inside

- **Dual-frame layout system** — 8 named layouts (landscape + portrait) with exact coordinates (`assets/compositions.json`), plus a seven-state semantic decision engine: when to go full-frame, circle PiP, split view, protect privacy, or transition between evidence and presenter emphasis — driven by on-screen evidence, never by a timer.
- **Theme palette system** — 8 tested themes (tokens + SVG backgrounds + runnable HTML components), each with measured contrast tiers: which color can carry body text, which is headline-only.
- **Transition engineering** — endpoint contracts, the `N-1` normalization formula, layered easing, a four-tier reliability chain, and fps normalization (the classic 30fps-timeline-exports-at-60fps trap).
- **Face reframe & three-layer compositing** — the hard `reframe → mask` order, GL UV coordinate traps (bottom-origin Y axis; `radius` is actually a diameter), overscan math for black-edge prevention, and a "centered ≠ face-crammed" framing standard.
- **Captions & terminology** — breath-unit paging with worked examples, a machine-enforced single-line gate (`scripts/validate-caption-pages.mjs`), the translation-track P0 trap, and a self-maintainable terminology template.
- **Rule Registry** — 18 rules across content truth, captions, privacy, timeline integrity, execution safety, and export authorization, with stable IDs, source references, override semantics, enforcement levels, and machine-checked pass/fail fixtures.
- **Creator OS IR v0** — rational time with explicit domains and half-open intervals; bundled project, transcript, edit, state, owner, caption, and evidence documents with offline revision, evidence, coverage, ownership, privacy, and approval checks.
- **SRT text bridge** — standard SRT for human review plus a sidecar that preserves cue/page/word identity, exact ranges, revisions, and quantization residuals; renumbering is lossless and edits only produce auditable candidates.
- **Explainable content planning** — computes reproducible opening-density, evidence-coverage, confidence/risk, and destructive-edit signals; Hook-to-SoftCTA candidates only reference existing segments and words, remain pending human review, and never generate copy or a black-box virality probability.
- **Visual Decision Contract** — assigns one primary visual task per segment; B-roll candidates are scored across semantics, authenticity, timing, clarity, rights, and repetition, while sub-7 candidates route to human review and generated visuals cannot impersonate evidence.
- **Preview approval gate** — deterministically covers the opening 60 seconds, complex state, every privacy-risk range, and the ending; approval binds actor, full window scope, and plan/style/timeline fingerprints, and closes on any drift.
- **Recoverable execution and evidence foundation** — an offline fake adapter proves unique logical-ID binding, idempotent writes, revision locks, read-after-write reconciliation, scene compensation, checkpoint/resume, and evidence invalidation; no live ChatCut adapter claim is made.
- **Capability profile and live-route gate** — audits ChatCut build, tool-schema hash, TTL, mandatory probes, a redacted canary, and per-capability fallback; the repository fixture is explicitly `unverified`, so absent current evidence routes remain fake/manual/blocked.
- **Local Media QA and export authorization** — audits final-file hashes, codecs/timebase/dimensions/color/audio/duration, loudness/true peak/silence, black/freeze findings, privacy coverage, and deterministic inspection samples from supplied reports; it never exports or publishes media.
- **Distribution pack foundation** — platform rules carry source, observation, expiry, and confidence metadata; stale hard rules degrade to advisory, deliverables bind to master/revision/content-truth hashes, and publishing is forbidden.
- **Feedback governance foundation** — events retain only anonymous hashes, stable failure signatures, and allowlisted metrics; update suggestions require repeated samples, evidence, counterexamples, an owner, human review, and rollback, with no online auto-apply route.
- **Field report library** — `field-reports/` append-only cases preserve real production failures, ChatCut product issues, evidence levels, and workarounds; matching cases must be read before an iteration and the adopted/rejected decisions must be logged before experience is promoted into formal rules.

> **Live-environment boundary:** the repository validates offline schemas, anonymous fixtures, a fake adapter, report audits, and fail-closed routing. A real ChatCut adapter, real media probing/rendering, and platform publishing remain unverified and are never run automatically.

## Install

```bash
gh skill install maojiebc/majia-chatcut-koubo
# or
npx skills add maojiebc/majia-chatcut-koubo
# or
npx clawhub install majia-chatcut-koubo
```

## Development and release verification

```bash
npm ci
npm run verify

npm run validate:rules
node scripts/validate-rule-registry.mjs \
  --overrides fixtures/rules/overrides.valid.json

npm run validate:plans
npm run validate:planner
npm run validate:visual
npm run validate:srt
npm run validate:preview
npm run validate:recovery
npm run validate:capabilities
npm run validate:media
npm run validate:distribution
npm run validate:feedback

node src/cli/resolve-profile.mjs \
  --profile <profile.source.json> \
  --root <profile-config-root> \
  --strict \
  --out <profile-config-root>/generated/profile.resolved.json \
  --trace <profile-config-root>/generated/profile.merge-trace.json

node scripts/validate-caption-pages.mjs \
  --strict \
  --profile <profile.source.json> \
  --root <profile-config-root> \
  --input <captions.json>
```

The release gate validates every governed JSON document offline, audits the Rule Registry and protected overrides, validates the Creator OS plan bundle across files, runs the regression suite, and checks theme contrast, asset geometry/references, public-content safety, and version drift. New authored profiles should use `schemas/profile.source.schema.json`; `profile.schema.json` remains only as a compatibility shim. Resolver and plan artifacts can contain project-scoped identifiers, must stay inside an explicit `--root`, and are ignored by git by default. See the [V1.3.1 migration guide](docs/migration-v1.3.1.md) and the [public engineering roadmap](docs/roadmap.md).

## Make it yours

The numbers in this pack (22 chars/line, 330px circle window, `magnification≈0.30`) are the author's measured starting points on his own footage — not cross-footage truths. Copy the templates in `templates/`, validate on a sample cut of your own material, and fill in your numbers. Bump the profile version when they change; never overwrite old data.

## 📋 Version History

**V1.4.1 (2026-07-24)** — Added the Visual Decision Contract and four governed visual-selection rules: one primary task per segment, transparent six-axis scoring, human review below threshold, and no generated visual impersonating evidence. Also added an append-only `field-reports/` library with mandatory pre-iteration reading and receipts; the first public-sanitized AI Hero case records the failure chain, three evidence surfaces, and seven ChatCut product issues.

**V1.4.0 (2026-07-24)** — Upgraded from a technique pack to a verifiable production system: Rule Registry, Creator OS IR/Rational Time, SRT and explainable planning, preview approval, recoverable execution/evidence, Media QA/export authorization, governed distribution packs, feedback governance, and a capability live-route gate are now part of the offline release gates. Real ChatCut adaptation, media probing/rendering, and platform publishing remain explicitly unverified and non-automatic.

**V1.3.1 (2026-07-24)** — Contract hotfix and reproducible release foundation: pinned Node and lockfile CI; offline repository-wide JSON validation; separate source/resolved profile contracts with safe inheritance, merge provenance and CLI output; caption numeric semantics, word identity/intervals, narrow short-card exception, hard override cap, strict warnings and project/timeline provenance binding; release gates for contrast, asset references/geometry and documentation/version drift. Legacy caption JSON remains available for non-strict migration, while release mode requires provenance.

Full history: [CHANGELOG.md](./CHANGELOG.md) or [GitHub Releases](https://github.com/maojiebc/majia-chatcut-koubo/releases).

## 👤 Author / Contact

**Majia (@maojiebc)** · 超级马甲 (Super Majia)

If this skill helps you, find me on any of these channels — happy to chat about field experience, take feature requests, hear bug reports, or trade notes on user operations / data platforms / BI engineering work:

| Channel | Link |
|---|---|
| 📧 Email | [m9224@163.com](mailto:m9224@163.com) |
| 🐙 GitHub | [github.com/maojiebc](https://github.com/maojiebc) |
| 🪝 ClawHub | [clawhub.ai/p/maojiebc](https://clawhub.ai/p/maojiebc) |
| 🐦 X | [@maojiebc](https://x.com/maojiebc) |
| 📕 Xiaohongshu | [Super Majia](https://xhslink.com/m/4fQMJeHHWKC) |
| 📰 WeChat Official Account | [超级马甲](https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzY5NzIzODk2NA==#wechat_redirect) |

> Built from 14 years of user-operations work and multi-channel content matrix experience.
