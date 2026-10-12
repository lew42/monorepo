# Wave 2 — the responsive-variant designs. Read `minion.md` first.

`public/framework/ai/2026-08-18/figma/minion.md` is most of your brief: the priced Figma sequence,
the class vocabulary **and its negative list**, the fences, the skills, the verification probe.
Read it and `requirements.md`. Do not re-derive what three earlier minions already priced.

## What wave 1 proved — inherit it, do not rediscover it

- **Seven Figma children collapsed into TWO class strings** (`flex v`, and `flex auto` with
  `--grow: 2`). Expect the same: **most of these already exist.** Adding a directory is the
  exception, not the default.
- **`--grow` and `.tint` shipped tonight and work.** Use `--grow: 2` for a fluid track twice its
  neighbour; never an inline `flex`. `.tint` is the third surface tone beside `.wash`.
- ⚠ **Scope every DOM probe to `.layout-full`.** The SPA keeps unrouted branches mounted but
  hidden, so a bare `document.querySelector('[style*="--grow"]')` reads other pages' elements and
  lies to you. This cost wave 1 a detour.

## ⚠ Your node is ONE screen at three widths, not three screens

The survey read the frame names straight from Figma and they end in the width:

- **Minion C — `?node-id=163-613`** → `sidebar-preview-3440`, `sidebar-preview-1920`, `sidebar-preview-400`
- **Minion D — `?node-id=163-615`** → `tabbed-toc-3440`, `tabbed-toc-1920`, `tabbed-toc-400`

**So you are building ONE responsive thing, and the three frames are its acceptance test.** Do not
build three pages. The prior art is `layouts/hero/page.js`, where one `flex reverse wrap` row is the
1920 drawing and the 400 drawing at once, with no query between them.

The owner, on this series: *"they're not great on mega… just do your best."* So **3440 is where
judgement is required, and a design that is genuinely wrong at 3440 is a finding** — say what the
Figma does, say what you did instead, and why. Do not faithfully reproduce something bad.

**Check the existing layouts first.** `163-613` is a sidebar and `styles/layouts/sidebar/` and
`docs/` already exist; `163-615` is a tabbed table of contents and `ext/tabs/` and `ext/toc/` both
exist. If the design is an existing thing at three widths, the deliverable is a **demonstration and
a link**, plus whatever the Figma genuinely adds. Say which parts were already there.

## Homes and fences

- Minion C: `public/framework/styles/layouts/sidebar-studio/` — **only if you need a dir.**
- Minion D: `public/framework/styles/layouts/toc-studio/` — same condition.
- One word each in `BANDS` in `layouts/page.js`. **Three other minions have edited that file
  tonight** — add your word to the right band line, leave every other line exactly as found.
- ⚠ Never touch: `framework.css`, `css-scopes.txt`, `ext/CSSDoc/`, `styles/elements/code/`,
  `layouts/wire/`, `layouts/anatomy/`, `layouts/home/`, or each other's dirs.
- Questions → append to `figma/questions.md` (never rewrite it; answers from the mastermind and two
  other minions are already in there) **and** your final report.

## Done means measured

400 / 1280 / 1920 / 3440, `document.documentElement.scrollWidth === clientWidth` asserted at each,
zero console errors, screenshots in your task dir. **Report your token spend** — wave 3 is sized
from it.
