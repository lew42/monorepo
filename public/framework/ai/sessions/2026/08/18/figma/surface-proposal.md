# Proposal — a band-relative surface. **Not shipped; your call.**

Two minions hit this independently and the mastermind reproduced it. It is the last unfixed
vocabulary gap the Figma work found, and it is the reason "dark mode" is awkward today.

## The defect, measured twice

`.wash` and `.tint` are keyed to **the page's colour-scheme**, never to the element they sit on.
Inside `.theme-lew42`, measured on `/framework/styles/layouts/bold-editorial/full/`:

| | light page | dark page |
| --- | --- | --- |
| `.wash` | `rgb(242, 242, 242)` | `rgb(23, 23, 23)` |
| `.tint` | `rgb(248, 248, 248)` | `rgb(31, 31, 31)` |
| `--ink` (what an inverted band uses) | `rgb(63, 63, 63)` | `rgb(230, 230, 230)` |

So on a **dark band inside a light page**, `.wash` paints `#f2f2f2` — a *highlight* where a recess
belongs. Nothing throws. Same family as `.tint` having no class at all: the failure is silent.

## The fix that already works, at the call site

`color-mix(in srgb, currentColor 10%, transparent)` derives from the **band's own text colour**, so
it inverts with the band rather than with the page. Measured, same page:

| | light page | dark page |
| --- | --- | --- |
| `color-mix(in srgb, currentColor 10%, transparent)` | `0.247 grey / 0.1` | `0.902 grey / 0.1` |

Two minions shipped this inline tonight (`home/`, and `bold-editorial/` sidesteps it by never using
the inverting tone). **Two call sites is this tier's own bar for promoting a helper.**

## What I am proposing, and what I deliberately did not do

```css
/* beside .wash and .tint */
.inset { background: color-mix(in srgb, currentColor 8%, transparent); }
```

One line, additive, no existing users, cannot change a current render — the same shape as the
`.tint` fix that shipped tonight.

**I did not ship it**, for two reasons worth stating plainly:

1. **The name is API surface forever** (`code` skill §3), and `.inset` / `.recess` / `.sunken` are
   not obviously ranked. That is a taste call and it is yours.
2. I already made two `framework.css` calls tonight and **one of them, `--grow`, needed correcting
   twice** — first the comment was false, then the fix moved the wrap threshold. A third token at
   this hour, unattended, is where the mastermind should stop and write it down instead.

The workaround is live and correct at both call sites, so nothing is blocked either way.

## A second dilemma, unfixed and not proposed

A `dark`-tone band **inverts a second time** when the page is already dark — a light card floating
in a dark page. Found by the dark-mode minion, not reproduced by me. It is a design question about
what "dark tone" should mean (page-opposing, or absolute), not a bug with an obvious fix.

## Also worth one minute of yours

Three separate minions independently wrote the same `route(){ … full(…) }` three-liner tonight.
`400/entry.js` is the existing eight-line version. Promoting it to `layouts/entry.js` is a move of
responsibility across a directory boundary, so CLAUDE.md says ask — [questions.md](./questions.md) #3.
