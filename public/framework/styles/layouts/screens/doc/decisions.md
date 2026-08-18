# Screens — decisions and record

*Written 2026-08-18, Figma wave 3, Minion E, node `181:1456`.*

## The survey's names checked out here

`minion.md` and `wave-3.md` both warn the survey table is wrong about names and about which
node holds what, "shifted by one" in the 163-series. `get_metadata` on `181:1456` returned
exactly the seven names the survey claims — `home`, `profile`, `settings`, `homepage`,
`landing-page`, `about-page`, `contact-page` — no shift, no substitution. Worth recording as
the counter-example: the warning is real elsewhere, but not universal.

## Four frames, three existing layouts — link, don't rebuild

`homepage` and `landing-page` are two different Figma frames that both decompose to the same
existing shape — [landing](../landing/)'s full-bleed hero / card band / CTA band / footer.
`about-page` (hero, one reading column, a pull-quote) is [document](../document/)'s own shape.
`contact-page` (header, a labelled form, footer) is, almost line for line,
[stack](../stack/)'s existing demo — a labelled `Email` field, a labelled `Message` field,
`Send`/`Cancel`. **Verdict: zero new code for these four** — `page.js` links each with a one-
line shape description, following `wire/`'s and `anatomy/`'s own precedent for "the overlap
is the answer, not a duplication."

## Three frames, no existing shape — a new directory

`home`, `profile`, `settings` are a phone-width app (status bar, a scrolling stack of cards,
a fixed bottom tab bar) with no desktop twin in this node and no existing `styles/layouts/`
page of that shape — `dashboard/` is the closest ("numbers over panels") but has no bottom
tab bar and no per-row checklist idiom. **Verdict: `screens/` is the genuinely-needed new
directory** the wave-3 brief flagged as conditional. All three built from words already in
the vocabulary — `flex`, `split`, `v-center`, `surface`, `wash`, `grid gap auto` — plus one
existing `ui/` component (`.ui-avatar`) and two native form controls.

## Dilemma: no toggle-switch class exists

The Figma's `settings` frame draws a pill-shaped toggle switch (an ellipse ring plus a
sliding knob) for two rows. Nothing in the vocabulary makes one — `minion.md`'s "vocabulary,
including what does NOT exist" doesn't mention it either, because it's a leaf control, not a
layout primitive. **Assumed:** `<input type="checkbox">`, already themed by `framework.css`'s
`accent-color` (the same mechanism [ui/progress](/framework/ui/progress/) documents for
`<progress>`/`<meter>`). It reads as a checkbox, not a pill, but costs zero new CSS and is
themed identically in light and dark. A `.ui-toggle` component (CSS-only, like `.ui-badge`)
would close this gap for every future mockup that wants one — logged, not built, since `ui/`
is fenced off this task.

## The rewrite

Every string on these three screens is a true sentence about this framework, not the
fictional `web.js` site the rest of this directory draws — the owner's brief for this node
explicitly encouraged it. Specifics: the "today" checklist's three rows (no build step,
native ESM imports, layout is a class string) are checked because they're true, not because
a habit was logged. The "profile" stat cards are the exact three numbers
[ui/stats/page.js](/framework/ui/stats/) already ships (`build steps`, `core classes`,
`tokens`) — copied, not re-typed, so the two pages read the same facts. The "settings" list's
two counts (`28` layouts, `19` UI components) are this directory's and `ui/`'s own real
counts as of this task.

## Colour and spacing — converged, nothing new

No new colour: `--prim` (accent), `--surface`, `--wash`, `--line`, `--ink`/`muted` — the same
six tokens every other layout in this directory uses. No new spacing value beyond the
default: every card is a plain `.pad` at 1em, `--gap` ranges `0.1em`–`1.4em` for nesting depth
only, same as `wire/` and `anatomy/`'s own two-value budgets.

## Measured

Three screens × five widths (400 / 1280 / 1440 / 1920 / 3440), read at the bare `/full/` url:
`document.documentElement.scrollWidth === clientWidth` at all 15 (zero overflow), and the
scrolling content band's `scrollHeight / clientHeight` read exactly **1.00** at all 15 — no
hidden overflow the horizontal check alone would have missed. Zero console errors. Checkbox
`.checked` state and `<progress>` value/max confirmed live via `getComputedStyle`/DOM read
scoped to `.layout-full`, not a bare `document.querySelector` (the Router's hidden-sibling
trap prior minions hit). Screenshots:
[`figma/shots/screens-today-1920.png`](/framework/ai/2026-08-18/figma/shots/screens-today-1920.png),
`screens-today-400.png`, `screens-profile-1920.png`, `screens-prefs-1920.png`,
`screens-index-1920.png`.
