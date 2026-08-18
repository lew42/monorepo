# Wave 3 — read `minion.md` first; it is most of your brief.

`figma/minion.md` carries the priced Figma sequence, the class vocabulary **and its negative list**,
the fences, the skills and the verification probes. `figma/requirements.md` carries the owner's
eight standing rules. Read both. Do not re-derive what five earlier minions already paid for.

## ⚠ Verify your node before you trust your brief

`survey.md` is **wrong about names and about which node holds what** — its 163-series mapping is
shifted by one, caught twice by minions and confirmed by direct `get_metadata`. So: read your
node's real frame names first, **report what you actually found**, and build that. A brief that
disagrees with the file is the brief's bug.

## What five minions have already established — inherit it

- **Reuse wins.** Six of the pilot's eight designs already existed; wave 1's seven children
  collapsed into two class strings; wave 2's `163-613` was `layouts/gallery/` **verbatim and needed
  no code at all**. Check the ~30 layouts in `styles/layouts/` before you build anything. A
  demonstration plus a link is a complete, preferred deliverable.
- **`--grow` and `.tint` exist and work.** `--grow: 2` is now measured at exactly 2.00 across
  1280/1920/3440 (it was corrected mid-wave — the basis scales too). Never write an inline `flex`.
- **Two verification checks, not one.** `scrollWidth === clientWidth` is horizontal only. A page
  passed it while hiding seven bands in a collapsed 284px box. **Also assert your content region's
  `scrollHeight / clientHeight` is near 1**, and test an odd width — 1440 found what 400/1280/1920/
  3440 all missed.
- ⚠ Scope every DOM probe to the routed page. The SPA keeps unrouted branches mounted but hidden,
  so a bare `document.querySelector` reads other pages and lies to you.

## Minion E — `?node-id=181-1456`

Seven screens the survey names `home · profile · settings · homepage · landing-page · about-page ·
contact-page` (verify). The owner on this one: *"a set that sort of matches the color scheme above.
**feel free to use existing colors in place of the ones used. feel free (encouraged) to rewrite any
text to express anything about our framework.** these are mockups, but don't have to be generic."*

So this is the design where **rewriting the copy is wanted**, not tolerated. Make the text say true
things about this framework — no build step, native ESM, a page is a class, layout as a class
string. Seven screens is a lot: build the pieces, then assemble, and skip any card you cannot mock
with a visible placeholder.

Home: `public/framework/styles/layouts/screens/` — **only if a new dir is genuinely needed.**

## Minion F — `?node-id=54-1055`

The survey calls it five responsive layout examples; the owner said *"this could be worked up as one
set."* **One set means one page** — five variants demonstrated together, not five directories.

Home: `public/framework/styles/layouts/set/` — same condition.

## Both

- One word each in the right `BANDS` line of `layouts/page.js`. **Six minions have edited that file
  tonight** — add yours, leave every other line exactly as found.
- ⚠ Never touch `framework.css`, `css-scopes.txt`, `ext/`, `styles/elements/`, or another minion's
  dir (`wire/ anatomy/ home/ toc-studio/ gallery/`).
- Questions → append to `figma/questions.md` (never rewrite; there are already ten entries plus the
  mastermind's answers) **and** your final report. Assume, state it, keep going.
- **Report your token spend and the real frame names you found.**
