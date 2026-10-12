# Wave 1 — two minions. Read `minion.md` first; it is most of your brief.

Everything in `public/framework/ai/2026-08-18/figma/minion.md` applies to you: the cheapest Figma
sequence, the vocabulary **and its negative list**, the check-the-28-existing-layouts rule, the
fences, the skills, the `scrollWidth === clientWidth` probe. Read it, and `requirements.md`, before
anything else. Do not re-derive what the pilot already priced.

Two new words shipped tonight that you SHOULD use:
- **`--grow`** — `.flex.auto > *` is `flex: var(--grow, 1) 1 var(--column)`. A child with
  `--grow: 2` is a fluid track twice its neighbour. **Never write an inline `flex` for this.**
- **`.tint`** — a third surface tone beside `.wash`, for greyscale wireframes.

---

## Minion A — the homepage, desktop AND mobile, one owner

`?node-id=23-181` (desktop) and `?node-id=23-1144` (mobile).

**You own both, because the transition between them is the actual work.** The survey confirms they
are the same page: both list `Navigation-Header · Hero-Section · Trust-Logos · Services-Section ·
Philosophy-Section · Portfolio-Section · Testimonials-Section · Contact-Section · Footer`.

This is the owner's own homepage and the highest-stakes design on the list. The owner:
*"getting them to flow properly might be tricky (although, we have `.flex.auto`, etc, which makes
it pretty easy)."* **Prove or refute that sentence with measurements.** The prior art is
`layouts/hero/page.js` — one `flex reverse wrap` row that is the 1920 and the 400 drawing at once,
with no breakpoint between them. Aim for that: **one class string per band, not two drawings.**

- A band that genuinely needs a query is a **finding** — say which band and why, do not hide it.
- Nine bands is a lot: build them as separate pieces, then assemble the page. Say so in your report.
- Text may be rewritten to say something true about this framework. Encouraged.
- Home: `public/framework/styles/layouts/home/` (new dir + one word in `BANDS`), unless reading
  `layouts/` convinces you it belongs elsewhere — then say where and why before you build.

## Minion B — layout anatomy

`?node-id=181-1457`. Frame names: `Burger · 3x Burgers · Burger with Columns · Burger with Columns
with Burger · Columns · Columns with Burger · 3x Columns`.

⚠ **The owner, verbatim: "the parent container should not be mocked up, each of the children
should."** Build the seven children. Do not build the wrapper.

These are compositional primitives — a "burger" is a stacked band, "columns" is a row — so this is
the design most likely to be **already expressible**, and most likely to collapse into one
Reference page rather than seven dirs. Check the 28 existing layouts first. If five of seven are
`stack`/`flex`/`grid` restated, **say so and demonstrate the strings** rather than adding dirs.

Home: `public/framework/styles/layouts/anatomy/` (new dir + one word in `BANDS`).

---

## Both of you

- **Do not touch each other's directories**, `framework.css`, `css-scopes.txt`, `ext/CSSDoc/`,
  `styles/elements/code/`, or `styles/layouts/wire/`. One `BANDS` line each in `layouts/page.js` —
  if you find the other's line already there, leave it alone and add yours.
- Questions → `figma/questions.md` (append; do not rewrite it, another agent's answers are in there)
  **and** your final report. Assume, state the assumption, keep going. The owner is asleep.
- Log to your own task dir under `ai/2026-08-18/figma/`, `date -Iseconds` timestamps, absolute paths.
- **Report your token spend.** The mastermind sizes wave 2 from it.
