# Refine demo — a Prompt class you can talk to, with a live debug view

Owner (2026-10-08). You are a **Sonnet 5.5 mastermind** owning one task end to end; build it yourself, spawn a Haiku 5.5 minion (parent = you, <60k tokens) only for cheap reading. Work in a worktree; smoke-test, then commit after each working step; read the diff; merge. Run `node Server/usage-now.mjs` before spawns. **Do NOT use OpenRouter** (paused; its accounting is untrusted): use Claude Haiku 5.5, the local model, or deterministic code. Keep `STATE.md` in the task dir current after every step so a fresh session can resume. Everything you create must be linked from the site. Non-destructive; chat replies one sentence.

## Read first
`public/framework/ext/Refine/doc/vision-2026-10-08.md` (the owner's whole design, both addenda: pipeline, per-sentence clarity and weight, flags, alternates, names, the `Prompt` class), `ext/Refine/readme.md` and its `doc/`, `Server/refine.mjs`, `ext/Refine/engine.js` + `structure.js`, `ux/Dictate`, and CLAUDE.md ("Write classes", "Show the class", "Name things", "Link every mention").

## Build (small, working, visible)
1. **A `Prompt` class** (`ext/Refine/Prompt.js`, class name = file name; follow the house pattern: `Prompt.View = ...` attached after the class, `render()` does `new this.constructor.View(...)`): holds `raw`, `clean` (numbered sentences), `refined` (cards with sub-cards), and per sentence `clarity`, `weight`, `flags`, `alternates`. Reuse `engine.js`/`structure.js` for the actual cleaning and structuring; don't write a second pipeline. Scores may be simple first (a rule/heuristic or a Haiku call per prompt, not per sentence loops); record what you chose.
2. **The `ext/Refine` page becomes a working demo**: a **dictation widget** (reuse `ux/Dictate`; must work on the phone page described in `framework/dev/mobile`) that refines **one prompt at a time**: speak, then see raw, clean, structured, with a yellow flag on low-clarity sentences (never nag) and click-through from a refined card to its source sentence. A button records the next prompt. If dictation is unavailable, a text box does the same.
3. **The live debug view next to it** (CLAUDE.md "Show the class"): a tree/card of the live `Prompt` instance, rendering each property by type (string, boolean, number, nested array/object; functions optional), updating as you use the demo; the class card (icon, name, core API, who calls it). Reuse the existing class-card / Doc code from `ext/Doc` and `framework/ai/system` if it fits; extend, don't duplicate. Try your best; the owner will look.
4. Docs: `ext/Refine` readme (short index) + one doc on the `Prompt` class; link the demo from the AI system page / the Refine entry on the site.

## Out of scope now
No refined-prompt hand-off to agents, no inbox filing, no multi-agent ranking of alternates, no hooks into VS Code. Note them as next steps.

Land with `finish-task`; commit with attribution; no loose files.
