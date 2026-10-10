# Owner-check — line-confidence image filter, item by item

Checked against the repo, not just [requirements.md](requirements.md). [Outcome](../../../ai/2026-10-01/line-filter/) under review: [Try Line art](/imagine/lines/).

| # | item | verdict | evidence |
|---|---|---|---|
| 1 | 3D scanning tech matters, worth investing in | done | framing captured in [blog post](/blog/ai/lines-to-3d/post.md) intro; no action needed, context only |
| 2 | turning images into 3D representations is important | done | same blog post frames this as the goal; no separate deliverable expected |
| 3 | worth focusing resources to perfect the process | done | context only; the task itself is that focus (requirements.md, task.jsonl) |
| 4 | deterministic pass turning simple objects (e.g. a box) into custom 3D shapes | partly | only the first rung (line map) is built; requirements.md explicitly scopes out 3D ("Do the line map FIRST; no 3D yet") and filter.md Limits confirms "There is no 3D... yet" |
| 5 | rough shapes (8-corner boxes), LLM-assisted region/object identification | missing | no region/object recognition or shape-fitting code anywhere in public/imagine/lines/ |
| 6 | parts of an object (e.g. a table) stay logically linked | missing | not attempted; lines.js scores pixels only, no grouping into objects |
| 7 | boundaries come out of the linear analysis | done | this is the core of lines.js — coherence + along-line support trace object edges (lines.js:34-58) |
| 8 | you should be able to see the border of a table | done | lines.js produces exactly this: box/room samples trace all edges (samples.js, filter.md "Three ingredients") |
| 9 | logical analysis to help reconstruct the 3D scene | missing | no reconstruction step; filter.md Limits: "no 3D... yet" |
| 10 | hedge ("not 100% sure") | done | no action implied |
| 11 | a solver that wiggles numbers to fit a 3D model | missing | no solver/optimizer code anywhere in the module |
| 12 | placing the camera in the scene is important | missing | no camera-placement logic; out of scope per requirements.md |
| 13 | extrapolate a wall's corners from its visible edges | missing | filter.md Limits: "the corner map is a separate later rung" — not built |
| 14 | a wall corner should score a high linear ranking | partly | lines.js does rank long straight runs highly, but filter.md Limits says the opposite happens at corners today: "Corners often lose coherence" |
| 15 | linear ranking isn't just raw color difference; subtle differences should count | done | lines.js noise floor + response formula (lines.js:40-41); test.mjs seam-vs-noise test, 41× ratio (test.mjs:18, outcome line 2) |
| 16 | how linear is it (define linearity) | done | coherence = (λ1−λ2)/(λ1+λ2) via structure tensor (lines.js:38, filter.md "Direction") |
| 17 | transition into talking about scale | done | no action implied, leads into item 18 |
| 18 | determine real-world scale (closer = bigger, further = smaller) | missing | no scale estimation anywhere; filter.md/requirements.md scope this out |
| 19 | need 3D point positions and a unit system | missing | no 3D point output; lines.js returns a 2D confidence map only |
| 20 | linearity = length + straightness + signal strength/consistency, not raw brightness; must be statistically relevant over a non-trivial stretch | done | lines.js along-line support loop (lines.js:48-58) uses length + coherence + relative magnitude; test.mjs's faint-seam-beats-random-texture assertion is exactly this (test.mjs:11-18) |
| 21 | strength and consistency of the pattern | done | same as above — `support`/`response` terms (lines.js:41,54) |
| 22 | a subtle signal over a long stretch, in the right spot relative to other edges | done | test.mjs seam test (grey step vs loud noise) mirrors this scenario directly; filter.md opens with this exact example |
| 23 | a filter/graph that highlights all the lines | done | lines.js + tool.js render exactly this; [Try it](/imagine/lines/) |
| 24 | the more linear, the stronger/darker — i.e. line art | done | tool.js `paint()`: `v = 255 × (1 − score^gamma)` (lines.js/tool.js:44) |
| 25 | maybe write our own filter rather than use an existing one | done | lines.js is a from-scratch pure function, no npm packages (readme.md "no npm packages") |
| 26 | "see if you could do that" | done | built and working at /imagine/lines/ |
| 27 | grayscale, whiten non-lines, darken lines by confidence; wondered if some things should be filled solid black | partly | the whiten/darken-by-confidence part is done (tool.js `paint()`); filling regions (e.g. text) solid black rather than outlining was considered and explicitly not done — see item 28 |
| 28 | color text in solid black rather than just outlining it | missing | not implemented; the filter treats text like any other edge (traced, not filled) — the owner's own next remark (item 29) walks this back anyway |
| 29 | actually, outlining text (for the per-pixel linear analysis) is probably right | done | matches what's built — blog post part 2: "Text gets traced as outlines like everything else" |
| 30 | compare each pixel with its neighbors to get a gradient | done | lines.js per-pixel left/right/top/bottom differences (lines.js:21-28) |
| 31 | track direction/step pattern trend (delta in a given direction) | done | structure tensor outer-product accumulation does exactly this (lines.js:29-33) |
| 32 | use hue, saturation and brightness for the delta | done | lines.js computes hue (circular), sat, val explicitly (lines.js:9-19, 25-28) |
| 33 | compare deltas across a region to see the pattern, not just one pixel | done | windowed tensor averaging via summed-area table (lines.js:34, 65-80) |
| 34 | gradient = continuous directional flow; direction matters, like a 2D gradient tool's start/end/speed | done | structure tensor `angle` term and direction-aligned support (lines.js:39, 47-57); filter.md "Direction" |
| 35 | "that's what we're doing here" | done | confirms item 34, no separate action |
| 36 | an image filter: input any image, output mostly-white/black grayscale | done | tool.js mount() file/drop/sample input, grayscale canvas output; readme.md |
| 37 | "I don't know if there's a use case" | done | hedge, no action implied |
| 38 | keep it grayscale for now, don't color surfaces in yet | done | nothing in lines.js/tool.js adds color; output stays grayscale only |
| 39 | the point for now is just to see the line art / linear calculation | done | that is the entire built page; filter.md, readme.md |
| 40 | theorize later about turning this into 3D space | missing | correctly deferred — requirements.md: "Do the line map FIRST and land it"; filter.md Limits: "no 3D... yet" |
| 41 | rough heights/widths/coordinates, an anchor point per 3D object (not a priority yet) | missing | correctly deferred, same as item 40; no 3D/anchor code exists |

## Summary

Every concrete ask about the **line-confidence filter itself** (items 7, 15, 16, 20–27, 29–39) is built and has working evidence: [lines.js](/imagine/lines/doc/files/) (the pure scorer), [tool.js](/imagine/lines/doc/files/) (the page), [test.mjs](/imagine/lines/doc/files/) (node tests), and the [review](review/report.md) (7 requirements lines, all "yes").

Everything about **going from the line map to 3D** (items 4–6, 9, 11–13, 18–19, 40–41) is correctly left for later — the owner's own brief says "no 3D yet," and [filter.md](/imagine/lines/doc/filter.md) names the gap explicitly rather than hiding it.

One real shortfall: item 14 — a wall corner should rank *high*, but filter.md documents that corners currently *lose* coherence (the opposite of what the owner described). That's a known, named gap, not a silent miss, but it is a place the current math underdelivers against the owner's words.
