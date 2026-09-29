# When Shared CSS Changes Need Screenshots — Revised

## The Three Size Tiers (Hard Rule)

Review size is determined by *what changed*, not by CSS scope:

| Size | When | Review | Screenshots |
|------|------|--------|-------------|
| **none** | CSS or docs only, ≤20 lines, no new file | None | No |
| **light** | Code changed, but no new page/module/Servex part | Fresh Sonnet: code diff only | No |
| **full** | New page, module, tool, or Servex change | Fresh Opus + UX review | Yes (1280/1920/3440) |

**There is no line in `review.md` saying "shared CSS change → always require screenshots."** A shared CSS edit under 20 lines with no new file is `none` by rule — no review, no screenshot — unless the mastermind decides it is risky enough to raise.

## The Two Types of Mastermind Discretion (Judgment Calls)

### 1. Raising Size (Always Allowed, No Documentation Required)

The mastermind may escalate a CSS change's size tier for extra scrutiny. A shared CSS refactor affecting multiple pages could be bumped from `none` to `light` or `full` if the change:
- **Cascades across components** — a small tweak ripples site-wide
- **Affects layout or responsive behavior** — code review alone misses rendering issues across browsers
- **Touches customer-facing pages** — visual bugs harm user experience  
- **Has unclear scope** — the actual effect is not obvious from code

Raising size requires no justification and brings review (and screenshots if raised to `full`).

### 2. Lowering Size (Allowed, With Documented Reason via `--why`)

The mastermind may lower a computed size — e.g., full → light — **only** by running:
```
node Server/merge.mjs ... --why "self-evident: <one line reason>"
```
This is logged as a decision in `task.jsonl`, so the override is auditable. This is legitimate discretion tied to the review *process*, not a way to skip it.

## The Escape Hatch: `--no-review` (Not an Agent Decision)

`Server/merge.mjs` accepts a `--no-review "why"` flag that **skips the gate outright**, printing loud `!!!` warnings and logging the reason. This escape hatch *exists* — it is real code, not theoretical.

**However, it is explicitly NOT a routine agent decision:**
- The sub-mastermind skill's "Never" list forbids unilateral confidence-based decisions (like killing the server or driving the owner's tabs)
- Skipping a merge safety net on a "hunch that this one's safe" reads the same way
- `--no-review` is a human/owner-level override with exceptional, logged justification — not something an agent quietly uses because it feels confident the change is safe

## The Hard Rules vs. Judgment

**Hard rules (non-negotiable):**
- Screenshot requirement is *always* tied to size: none/light = no, full = yes
- `light` or `full` sizes always require a passing review before merge — `Server/merge.mjs` enforces this in code, every time
- Any `[fix]` finding with no answer blocks merge
- `--no-review` is not a routine agent discretion; it is an exceptional, logged override

**Judgment calls (mastermind only):**
- Whether to raise a CSS change's computed size (no justification needed)
- Whether to lower a size with `--why "self-evident"` (one-line reason, logged)
- Whether to invoke `--no-review` in truly exceptional cases (loudly warned, not routine)

## In Practice

- A 15-line CSS fix with no visible impact and no new file → `none`, no review, no screenshots
- A 40-line CSS refactor touching multiple components → could stay `light` (code review, no screenshots) if the mastermind judges the scope clear, or bump to `full` if cascading effects are unclear
- A new CSS framework for a new page → automatically `full`, Opus review + screenshots
- A "I'm really confident this is safe" feeling → never grounds skipping the gate, whether it's `none` computed into light/full or `--no-review` used outright

---

## Sources

- `Server/doc/review.md` — size table (lines 56–62), merge gate section (lines 90–101), lowering size with `--why` (lines 64–65)
- `Server/merge.mjs` — the `--no-review` flag and its warning text
- `.claude/skills/sub-mastermind/SKILL.md` — "Never" list forbidding unilateral decisions (line 92)
- Industry best practices: [BrowserStack Visual Regression Testing](https://www.browserstack.com/percy/visual-regression-testing), [CSS-Tricks Playwright Testing](https://css-tricks.com/automated-visual-regression-testing-with-playwright/)
