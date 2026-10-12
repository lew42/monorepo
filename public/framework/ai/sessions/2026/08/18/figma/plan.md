# The fan-out plan — revised after the survey, 2026-08-18

## What the survey changed

Sizing one minion per node was **wrong**: 15 of 19 nodes are multi-frame. And the survey's own
counts proved unreliable (its `51-1477` row says 6 top-level children while its summary claims
"reproduced 8 layouts as expected", and the pilot's `specs.js` has 8; `23-181`, `71-2459` and
`163-616` each list fewer names than they count). **Frame names are trustworthy — they come
verbatim from Figma. Counts are not.** Everything below is planned off names.

Three findings from names alone, all decisive:

- **`163-613 / 614 / 615` are one screen at three widths**, not three screens — the frames are
  literally `sidebar-preview-3440 / -1920 / -400`, `miller-columns-*`, `tabbed-toc-*`. Each is
  **one** responsive build, not three. That is a large saving.
- **`23-181` and `23-1144` share an identical nine-section list** — the responsive pair, confirmed.
- **Four nodes are genuinely huge** by byte size: `109-369`, `163-617`, `163-619`, `181-1458`
  (522KB). Those need an Opus lead that splits before it builds.

## Staged, not fanned out — and why

Tonight's four minions cost **104k · 201k · 202k · 160k**. Eighteen designs at that rate is ~3M
tokens, which does not fit the weekly window. So: **waves of two, with a usage check between**, and
the cheapest model that the previous wave proved sufficient. Better twelve designs that are right
than nineteen started and stranded.

| wave | designs | model | status |
| --- | --- | --- | --- |
| 0 | `51-1477` → `layouts/wire/` | Opus | ✅ landed, 8 layouts, zero CSS written |
| **1** | `23-181`+`23-1144` (homepage, one owner) · `181-1457` (anatomy, children only) | Opus · **Sonnet** | **running** — also the Sonnet A/B |
| 2 | `163-613`, `163-614`, `163-615` — one responsive build each | Sonnet if wave 1 says yes | queued |
| 3 | `181-1456` (7 app screens) · `54-1055` (5 layouts) · `91-1096` (5 patterns) | Sonnet | queued |
| 4 | `71-2459` (dark mode — tests the theme, not the layout) · `163-616` | Opus | queued |
| 5 | `80-2916`, `65-1507`, `109-369` — Opus leads that split into sub-tasks first | Opus + subs | queued |
| 6 | `163-617`, `163-618`, `163-619`, `181-1458` — the four oversized | Opus + subs | **at risk** |
| — | practice `91-1096` folded into wave 3 | | |

**Drop order if the window tightens:** wave 6 first, then 5, then the practice design. The owner
said *"keep an eye on time, token windows, usage"* — the stop rule is `used% ≥ elapsed%`, not a
count of designs.

## The invariant every wave inherits

`minion.md` carries the priced workflow (`get_metadata` + one screenshot ≈ 5.3k; skip
`get_design_context`; the file binds no variables so there is no token-mapping step), the class
vocabulary **with its negative list**, and the standing rule that matters most:

> **Six of the pilot's eight designs already existed as layouts.** The overlap is the answer, not a
> duplication — demonstrate the class string and link the real layout; add a directory only for a
> shape we genuinely cannot already make.
