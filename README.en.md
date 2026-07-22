# majia-chatcut-koubo

![Skill Version](https://img.shields.io/badge/skill-v1.2.0-blue)

**A field-tested technique pack for agent-driven talking-head editing in ChatCut · Majia Field Edition** — an increment layer on top of the official ChatCut skills. The official skills teach agents *how to use the tools*; this pack teaches them *what a good cut looks like*, with the math behind every hard-won lesson.

<img src="https://raw.githubusercontent.com/maojiebc/majia-chatcut-koubo/main/docs/theme-preview.png" alt="v1.2.0 · 8 talking-head color themes overview (each with an agent playbook)" width="100%">

## What's inside

- **Dual-frame layout system** — 8 named layouts (landscape + portrait) with exact coordinates (`assets/compositions.json`), plus a five-state semantic decision engine: when to go full-frame, circle PiP, or split view — driven by on-screen evidence, never by a timer.
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

## Make it yours

The numbers in this pack (22 chars/line, 330px circle window, `magnification≈0.30`) are the author's measured starting points on his own footage — not cross-footage truths. Copy the templates in `templates/`, validate on a sample cut of your own material, and fill in your numbers. Bump the profile version when they change; never overwrite old data.

## 📋 Version History

**V1.2.0 (2026-07-22)** — Block-level motion vocabulary: graphics-block animations converge into a constrained three-axis enum (enter/exit/loop emphasis — bounce off by default, flicker banned, typewriter for text blocks only), each theme playbook gains a "motion tier" allow/deny set, plus a block×motion recommendation table ("consistency beats variety").

**V1.1.0 (2026-07-22)** — Theme playbooks: each of the 8 themes now ships an agent-facing playbook (measured token tiers, layout pairing, graphics-block preferences, caption-plate hard rules, and an embeddable style crib for MG generation), upgrading the theme pack from "palette + backgrounds" to an executable design system. New `graphics-blocks.md`: a ten-block taxonomy driven by evidence signals (CTA off by default — that's a red line, not a preference).

**V1.0.0 (2026-07-22)** — Initial release, distilled from 99 real agent-editing sessions across 11 days of ChatCut production work.

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
