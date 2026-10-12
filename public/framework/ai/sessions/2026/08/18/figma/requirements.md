# Figma → framework — the owner's list, verbatim

File: `https://www.figma.com/design/0rZv3Z6Hnqkxa2UQJ5xOOG/July-2026` · every entry below is
`?node-id=<id>`.

| # | node-id | the owner's words |
| --- | --- | --- |
| 1 | `23-181` | desktop |
| 2 | `23-1144` | mobile — **pairs with #1**; "you might need to assist with the logical transition between them… we have `.flex.auto`, etc, which makes it pretty easy" |
| 3 | `181-1456` | "a set that sort of matches the color scheme above. feel free to use existing colors in place of the ones used. feel free (**encouraged**) to rewrite any text to express anything about our framework. these are mockups, but don't have to be generic." |
| 4 | `51-1477` | "good layouts to demonstrate (with their (super simple) code examples)… **should be a good one for testing purposes**. Can we get these outcomes? These super generic filler layouts should work as expected on Mega and Mobile? With some wrapping of course…" |
| 5 | `181-1457` | "more generic layouts: there's a bunch inside, **the parent container should not be mocked up, each of the children should**" |
| 6 | `54-1055` | "could be worked up as one set" |
| 7 | `71-2459` | **dark mode** |
| 8 | `80-2916` | "rather massive… instruct an opus minion to work on that one, and have him **break each section into a separate task for a sub minion**" |
| 9 | `65-1507` | "another big one" |
| 10 | `91-1096` | "just for practice…" |
| 11 | `109-369` | "**some of my favs**… remind them to intelligently separate the whole thing into smaller pieces, and then reassemble into the full thing, whenever it's appropriate." |
| 12 | `163-613` | mega + desktop + mobile — "**they're not great on mega… just do your best**" |
| 13 | `163-614` | ditto |
| 14 | `163-615` | ditto |
| 15 | `163-616` | ditto |
| 16 | `163-617` | — |
| 17 | `163-618` | — |
| 18 | `163-619` | — |
| 19 | `181-1458` | — |

## The standing rules — every minion gets these

1. **REUSE. Do NOT create new text styles** — pick the most similar one we already have. Same for
   colours: "feel free to use existing colors in place of the ones used."
2. **Converge on one, two or three values** for padding and spacing. The test the owner named:
   *"a `div.card.pad` with an `h2` should look the same in any one of these… right?"* The framework
   already answers this — `--pad` (`.pad`, default `1em`), `--gap`, `--column` (`14em`),
   `--measure` (`34em`). **Set a token; never write a new rule.**
3. **Page layout is the first decision and it drives everything** — the `layout` skill's five
   questions, answered before the first factory call.
4. **Ask questions when anything is unclear** (which existing style to use, which colour, whether a
   card maps to an existing component). Put them in `questions.md` in your task dir AND in your
   final report. Do not guess silently.
5. **Break a big design into pieces, then reassemble.** Where a design is massive, each section is
   its own sub-task.
6. **Cannot mock a card up? Skip it — leave a visible placeholder.** Do not stall, do not invent.
7. **Log every design dilemma.** The owner: *"Make note of any design dilemmas. We want to figure
   out this workflow."* The dilemmas are a first-class deliverable, not overhead.
8. Text may be rewritten to say something true about this framework. Encouraged.

## The home, and the prior art — READ BEFORE PROPOSING A NEW ONE

`public/framework/styles/layouts/` **already exists with 28 layouts**, and it was already built
partly from this Figma file — `layouts/hero/page.js` opens: *"The Figma names the same band three
times — 'Hero — Full Bleed' at 1920, 'Stacked Hero' at 800, 'Mobile Hero Sizing' at 400. Here it is
one row."* That is the responsive-transition answer the owner is asking about, already solved once.

- `styles/layouts/readme.md` — the shape: `demo.layout({ meta, title, group, parts, layout(){} })`
- `styles/layouts/web.js` — one site's content (`site.topbar()`, `site.hero()`); reuse it
- `styles/layouts/doc/decisions.md`, `doc/twin.md`, `doc/css-cost.md`
- ⚠ **No stylesheet in any layout dir** — the vocabulary plus inline per-layout state.

## Budget and usage

The weekly window is the constraint (68% used at 02:05, ~75% elapsed, resets 2026-08-19 22:00
local). The pilot prices one design before anything fans out. Every minion reports its own cost.
