# majia-chatcut-koubo

![Skill Version](https://img.shields.io/badge/skill-v1.3.1-blue)

> Chinese display name: **ChatCut口播 · 马甲实战版**. Install slug stays `majia-chatcut-koubo`.

**A field-tested technique pack for agent-driven talking-head editing in ChatCut · Majia Field Edition** — an increment layer on top of the official ChatCut skills. The official skills teach agents *how to use the tools*; this pack teaches them *what a good cut looks like*, with the math behind every hard-won lesson.

<img src="https://raw.githubusercontent.com/maojiebc/majia-chatcut-koubo/main/docs/architecture.png" alt="v1.3.1 increment-layer architecture: official ChatCut base → four pieces (dual-frame layout / theme palette / transition engineering / face reframe) → terminology template + caption gate → visible frame / audible sound / readable captions acceptance triad" width="100%">

<img src="https://raw.githubusercontent.com/maojiebc/majia-chatcut-koubo/main/docs/theme-preview.png" alt="v1.3.1 · 8 talking-head color themes overview (each with an agent playbook)" width="100%">

## What's inside

- **Dual-frame layout system** — 8 named layouts (landscape + portrait) with exact coordinates (`assets/compositions.json`), plus a seven-state semantic decision engine: when to go full-frame, circle PiP, split view, protect privacy, or transition between evidence and presenter emphasis — driven by on-screen evidence, never by a timer.
- **Theme palette system** — 8 tested themes (tokens + SVG backgrounds + runnable HTML components), each with measured contrast tiers: which color can carry body text, which is headline-only.
- **Transition engineering** — endpoint contracts, the `N-1` normalization formula, layered easing, a four-tier reliability chain, and fps normalization (the classic 30fps-timeline-exports-at-60fps trap).
- **Face reframe & three-layer compositing** — the hard `reframe → mask` order, GL UV coordinate traps (bottom-origin Y axis; `radius` is actually a diameter), overscan math for black-edge prevention, and a "centered ≠ face-crammed" framing standard.
- **Captions & terminology** — breath-unit paging with worked examples, a machine-enforced single-line gate (`scripts/validate-caption-pages.mjs`), the translation-track P0 trap, and a self-maintainable terminology template.

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

The release gate validates every governed JSON document offline, runs the regression suite, checks theme contrast, asset geometry/references, public-content safety, and version drift. New authored profiles should use `schemas/profile.source.schema.json`; `profile.schema.json` remains only as a compatibility shim. Resolver artifacts can contain project-scoped identifiers, must stay inside `--root`, and are ignored by git by default. See the [V1.3.1 migration guide](docs/migration-v1.3.1.md) and the [public engineering roadmap](docs/roadmap.md).

## Make it yours

The numbers in this pack (22 chars/line, 330px circle window, `magnification≈0.30`) are the author's measured starting points on his own footage — not cross-footage truths. Copy the templates in `templates/`, validate on a sample cut of your own material, and fill in your numbers. Bump the profile version when they change; never overwrite old data.

## 📋 Version History

**V1.3.1 (2026-07-24)** — Contract hotfix and reproducible release foundation: pinned Node and lockfile CI; offline repository-wide JSON validation; separate source/resolved profile contracts with safe inheritance, merge provenance and CLI output; caption numeric semantics, word identity/intervals, narrow short-card exception, hard override cap, strict warnings and project/timeline provenance binding; release gates for contrast, asset references/geometry and documentation/version drift. Legacy caption JSON remains available for non-strict migration, while release mode requires provenance.

**V1.3.0 (2026-07-24)** — Process increments + ChatCut field notes + local personal layer: references 6→10 (new per-slice operating manual / host field-notes archive / retention structure / recovery); SKILL gains confirmation gates (state-table-first hard gate / 60-second preview gate / verbatim-transcript-as-truth); machine gate upgrade (non-weakenable `rules/policy.json` + schemas + validator with profile inheritance, millisecond short-card rules and a `--terms` personal-terminology flag + 14 regression tests); theme token v1.1 contrast fixes (sea-salt body text now 7.67:1); formal local personal layer contract at `~/.config/majia-chatcut-koubo/` with `templates/local-config-example/`.

**V1.2.3 (2026-07-23)** — Dependency CVE fix: `assets/theme-kit/requirements.txt` pins `CairoSVG>=2.7` to `==2.9.0`, removing exposure to CVE-2026-31899 (exponential DoS via recursive SVG `<use>`); SKILL description gains preconditions / non-goals to tighten activation scope.

**V1.2.2 (2026-07-23)** — Chinese brand name: display name set to **ChatCut口播 · 马甲实战版** across SKILL / README / architecture diagram / GitHub About / ClawHub. The install slug `majia-chatcut-koubo`, frontmatter, and install commands are unchanged.

Full history: [CHANGELOG.md](CHANGELOG.md).

## 👤 Author / Contact

**Majia (@maojiebc)** · 超级马甲

| Channel | Link |
|---|---|
| 📧 Email | [m9224@163.com](mailto:m9224@163.com) |
| 🐙 GitHub | [github.com/maojiebc](https://github.com/maojiebc) |
| 🪝 ClawHub | [clawhub.ai/p/maojiebc](https://clawhub.ai/p/maojiebc) |
| 🐦 X | [@maojiebc](https://x.com/maojiebc) |
| 📕 Xiaohongshu | [超级马甲](https://xhslink.com/m/4fQMJeHHWKC) |
| 📰 WeChat | **超级马甲** |

> Distilled from 14 years of user-operations practice. Issues and collaboration welcome.
