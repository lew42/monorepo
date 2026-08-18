# CSSDoc — design brief (Opus)

**The three laws (CLAUDE.md) govern this brief.** Less is more (ASAP — fastest working version
first). Clarity is the one exception. Prioritize. **Length budget: the deliverable is ONE file,
`proposal.md`, and it must read in five minutes — target 150 lines, hard cap 250.** If you are
over, cut alternatives, not the decisive detail.

## Why this exists — a real defect from tonight, 2026-08-18

`framework.css` had two rules on the same element:

```css
code     { background: var(--wash); box-shadow: inset 0 0 0 1px var(--line); }  /* the inline chip */
pre > code { padding: 0; background: none; }                                    /* already in a padded box */
```

The second resets `padding` and `background` but **not** `box-shadow`. So the inline chip's
hairline leaked into every fenced block and drew a light rectangle on the dark `#3f3f3f` floor,
on every page with a code sample, for ~4 hours before the owner saw it. The agent that added
the shadow logged "verified computed" — and it had, on inline code, never inside a `pre`.

**The owner's diagnosis:** *"if we do something to `<code>`, we have several very different
places: inline code, and pre code."* One element, several contexts, and nothing in the repo
makes the set of rules landing on an element visible in one place.

**So the thing CSSDoc must make impossible:** changing one rule without seeing the others that
hit the same element. If a `code` doc page had listed both rules in cascade order, the missing
`box-shadow` reset would have been obvious at a glance.

## What to design

A documentation tier for CSS, the way `ext/Doc` is one for classes. Metadata per selector/rule,
plus **the live rule pulled from the stylesheet at runtime and parsed by the browser** — not a
hand-copied snippet that goes stale (the `files:` tab already proves hand-lists rot silently:
`ext/Doc/doc/files.md`).

### The five questions you must answer, with a verdict on each

1. **Where does it live?** A new `ext/CSSDoc/` module, or a new section type on `ext/Doc`
   (`styles: "code pre .flow"` → `doc/style/<name>.md`, a fifth tab or part of Files)?
   Argue it; the owner's instinct in the ask was `doc/style/<classname>.md`. Extending Doc is
   the house pattern ("extend, never configure"), but say so only if it survives contact.
2. **What is the unit of a page?** A class name (`.flow`), a selector (`pre > code`), or a
   *target* — one page per element/class that lists **every rule that lands on it**, in cascade
   order, with its layer and its file? The defect above argues for the third. Prove or refute.
3. **How is the live rule pulled?** Walk `document.styleSheets` → `cssRules`. Name the traps
   you actually verify in a browser: `@layer` blocks are `CSSLayerBlockRule` and nest;
   `@media` nests too; `@import`ed sheets are their own `CSSStyleSheet`; rule order within a
   layer is the cascade. Say which API gives layer name, source file, and `cssText`.
   **A working measurement beats a claim** — there is a dev server on `http://localhost`.
4. **What is the filename for a selector?** `pre > code` is not a filename. Propose a slug
   convention and show it round-tripping on five real selectors from `framework.css`, including
   one `:has()` and one `@media` variant.
5. **What does the page SHOW?** Lead with the thing itself (law 1). Sketch the page: what is
   above the fold, what is prose, what is generated. A live-rendered specimen of the element
   beside its rules is worth considering.

### Also answer, in one line each

- How it ties to the `new-css-class` skill (which already checks `styles/css-scopes.txt`).
- What the authoring cost is per new class — if it is more than ~2 minutes, it will not be done.
- What CANNOT be generated and must be written by a human/agent (the *why*, the caveat, the
  past defect) versus what must never be written by hand (the declarations themselves).
- The one thing most likely to make this rot, and the cheapest guard against it.

## Prior art to read before proposing — do not skip

- `public/framework/ext/Doc/readme.md` and `Doc.js` — the section/tab machinery you may extend.
- `public/framework/ext/Doc/doc/files.md` and `doc/reflection.md` — why lists are declared and
  hand-typed here, and why `files:` rots. Your design must answer both.
- `public/framework/framework.css` — the actual subject; ~600 lines, layered.
- `public/framework/styles/css-scopes.txt` and `.claude/skills/new-css-class/SKILL.md`.
- `.claude/skills/css/SKILL.md` — the ladder a declaration climbs.

## Deliverable and fences

- **Write exactly one file: `public/framework/ai/2026-08-18/cssdoc/proposal.md`.** Nothing else.
- **Do not implement.** No edits to `ext/`, `styles/`, `framework.css`, or any skill. This round
  is design only; the mastermind judges, then commissions the build.
- Log findings as `log` lines in `public/framework/ai/2026-08-18/cssdoc/task.jsonl` (append-only,
  `Add-Content` or bash `printf` — never `Out-File`/`Set-Content`, the BOM breaks the viewer).
  No `findings.md`.
- You MAY read anything, and you MAY run a headless browser against `http://localhost` to verify
  question 3. Global playwright: `createRequire(import.meta.url)("C:/Users/mike/AppData/Roaming/npm/node_modules/playwright")`.
- Scratch files go in the session scratchpad, never the repo.

## What a good proposal looks like

A verdict per question, each with its reason in one or two lines, and a worked example: the
`code` page as it would render, showing both rules that hit it and the layer each is in.
End with **the smallest thing that could ship tomorrow** — one module or one section, one page,
one real subject — and what it deliberately does not do yet.
