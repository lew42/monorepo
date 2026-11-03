# ext/DesignTool

A geometric layout analyzer — 26 files, ~2,470 lines of JS, all arithmetic, no
AI at runtime — that reads a page's rects, computed styles and line boxes once
and returns a score, a ranked list of what's wrong, and a proposed CSS
declaration for each. It earns its place: the calibration record
(`knowledge/thresholds.md`) shows it matching or beating three vision models on
detection at zero marginal cost, and it is the one tool on this site that
turns "this looks off" into a citable number. It had zero `doc/*.md` files and
a plain `Page` (no API/Docs/Files tabs) before this pass. The single most
important thing to do to it: **regenerate `audit/findings.json`** — the
committed baseline still points two rows at `/framework/ext/classdoc/`, a url
that started 404ing the moment `ext/Doc` was renamed today.

## State

| | |
|---|---|
| files | 26 |
| lines of JS / CSS | ~2,469 / 136 |
| callers | 1 real import (`styles/rules/demos.js`, live-scores 6 nesting demos); 2 non-functional references (`ext/page.js`'s `children:` list, `dev/DevBar/tools.js`'s quick-jump entry) |
| docs before | `readme.md` existed and was substantial (~210 lines) but un-broken-out per the skill's two-paragraph rule, and had no "who uses this" section; `page.js` was a plain `Page` — no API/Docs/Files tabs, no member pages; **zero** `doc/*.md` files anywhere in the module |
| docs after | `readme.md` restructured (2 sections broken out, "Used by" section added); `doc/cost.md`, `doc/addressing.md` (2 notes); `doc/file/*.md` × 26 (every file, mirroring the tree); `page.js` rewritten as `new Doc({...})` with `notes: "cost addressing"` and `files:` matching the directory exactly |

## What I changed

- `readme.md` — broke out "What it costs" → `doc/cost.md` and "The address is a
  path, not an index" → `doc/addressing.md` (each summarized in one paragraph
  and linked); added a "Used by" section from a framework-wide grep; added one
  line to Open naming the `pages.js` drift risk below.
- `doc/cost.md`, `doc/addressing.md` — the two breakouts, new.
- `doc/file/*.md` × 26 — one per file in the module, including `audit/`,
  `tests/` and `knowledge/`'s own files (never `doc/` itself), each with a
  ranked Improvements list.
- `page.js` — rewritten as `new Doc({...})`. No `subject` (this module is
  loose functions across many files, each with its own default export — the
  skill's "nothing at all" shape); `notes: "cost addressing"`; `files:` lists
  all 26; `children: "tests audit knowledge"` unchanged. Content, the live
  self-measurement panel, and the `this.previews()` above-the-fold link to
  children are all preserved as-is — verified with `node --check` and a 200
  from the local dev server.
- This file.

No `.js` beyond `page.js` was edited, no `.css`, and no behavior changed —
every finding below is a recommendation, not an edit.

## Recommendations

1. **Regenerate `audit/findings.json` — it still carries 14 references to the
   pre-rename `/framework/ext/classdoc/...` urls.** By the time this pass
   started, `audit/pages.js` had *already* been corrected in the working tree
   (uncommitted): lines 39–40 now read
   ```
   "/framework/ext/Doc/",
   "/framework/ext/Doc/overview/urls/",
   ```
   where they previously read `"/framework/ext/classdoc/"` and
   `"/framework/ext/classdoc/overview/urls/"` (confirmed via `git diff HEAD`).
   But the **generated** baseline was not rebuilt from the corrected list:
   `grep -c classdoc audit/findings.json` returns 14, across both saved
   widths, and there is no row at all for the page under its new address. The
   audit table's "Saved run" view currently shows two rows pointing at a page
   that no longer exists. Fix is the one-command Playwright re-run already
   documented in `readme.md`. `pages.js` is not a `page.js`, so this pass
   could not run it directly. *(simple, important.)*
2. **`audit/pages.js` is a hand-typed, ungenerated url list with no crawl to
   catch drift — the classdoc incident is the general case, not a one-off.**
   Every future module rename or new top-level page is silent here until a
   human notices a 404 in the audit table. Same trade `ext/Doc`'s own `files:`
   list makes (a live crawl needs `directory.json`, which is gitignored and
   blank in production) — worth accepting explicitly rather than only
   implicitly, and worth a habit of regenerating this list whenever a module
   moves. *(large — a real fix is a build-time or `new-task`-time
   regeneration script; important.)*
3. **`tests/page.js` and the readme both imply `sweep()` is reachable from
   "the tests page," but `tests/page.js` imports `frame`, never `sweep`.**
   Either the claim is stale prose or a sweep control was designed and never
   wired in. One pass to reconcile doc and code. *(simple, useful.)*
4. **`audit/twin.js`'s "Accept into the review queue" button has no
   availability gate**, unlike `vision.js`'s `available()` check before
   rendering its "Ask Claude" button. Off localhost, `Socket` doesn't connect
   (a repo-wide constraint — see `CLAUDE.md`), so the accept button renders
   and then fails rather than not rendering. A few lines, mirroring the
   pattern that already exists one file over. *(simple, useful.)*
5. **`audit/page.js`'s live re-measure runs all ~116 `frame()` loads strictly
   in series**, which is the honest two-minute cost the readme quotes. A
   small concurrency limit (4–6 at once) would likely cut that substantially
   with no change to what gets measured — worth confirming concurrent iframe
   loads don't themselves skew timing-sensitive measurements before
   committing. *(medium, useful.)*
6. **Calibration numbers that currently live only as code comments —
   `score.js`'s `CAP = 25` / `POLISH_CAP = 15` and the specific incident
   counts that produced them (1332 over-wide paragraphs, 987 near-miss
   edges) — should join `knowledge/thresholds.md`**, which is otherwise a
   complete table of every calibrated number and its source. The one real gap
   in an unusually well cross-referenced knowledge base. *(simple, useful.)*
7. **Outside-the-box: let a rule optionally publish its fix as a named custom
   property instead of a raw selector + declaration**, so
   `{ sel: ".x", decl: "max-width: 52em" }` becomes something like
   `{ prop: "--dt-fix-measure", value: "52em" }`. The readme's own Open
   section names the real blocker on ever automating acceptance: "there is no
   reliable way back from a computed node to the rule that styled it." A
   rule-authored property name doesn't fix that in general, but it would make
   `twin.js`'s "accept" step partially machine-checkable (did the site's real
   CSS ever come to define `--dt-fix-measure`?) instead of purely a human's
   read-and-apply-by-hand. Substantial rework of every rule's `fix` shape for
   a benefit that stays speculative until a first rule actually tries it.
   *(large, speculative.)*

## Is this `ext/` or a dev tool?

**Verdict: leave it under `ext/`, as one module — but the module is honestly
two layers wearing one directory, and it's worth seeing them separately.**

The measurement **core** (`probe.js` → `ratios.js` → `rules.js`/`polish.js` →
`score.js` → `DesignTool.js`, plus `report.js`, `live.js`, `mirror.js`) is
pure, synchronous, browser-only arithmetic with **no server dependency at
all** — it runs fine on the deployed static site, in any branch, for any
visitor. It already has one genuine production caller doing exactly that:
`styles/rules/demos.js` imports `analyze()` to live-score six demo layouts on
`/framework/styles/rules/`, a page every site visitor can load. That is a
real `ext/` use — "opting in is an import, nothing else" — not a dev
convenience.

The **outer shell** (`audit/`, `tests/`, `vision.js`) is where the dev-tool
character actually lives: `audit/twin.js`'s "accept" button writes through
`Socket`, which connects only on localhost by repo-wide constraint;
`vision.js` explicitly gates itself off (`available()`) because "there is no
dev server to spawn a turn" anywhere but localhost; and the entire audit/tests
apparatus exists to help whoever maintains this site find and fix its own
layout bugs, not to serve an end visitor. `dev/DevBar/tools.js` already
treats the module this way — a quick-jump shortcut, the same shape as its
other dev-only destinations.

**What moving it would cost**, if the call went the other way (`ext/DesignTool`
→ `dev/DesignTool`, or splitting the pure core from the dev-only shell into
two directories): every absolute `/framework/ext/DesignTool/...` reference
would need updating — inside the module itself (this pass alone put ~30 such
references into `doc/file/*.md` and `readme.md`), in the three real external
touchpoints named above, in `audit/pages.js`'s own self-referential rows, and
in the half-dozen files elsewhere on the site that mention `ext/DesignTool` in
prose (`styles/rules/*.md`, `styles/layouts/space/*`, `ext/editor/readme.md`).
None of it is risky — it's a pure path rename with no logic change — but it's
wide: on the order of 30–40 files touched in one sitting for a reorganization
whose functional benefit is "the directory name states what's already true in
the readme." Cheaper and equally honest: keep the one directory, and close
recommendation 4 above (gate `twin.js`'s accept button the way `vision.js`
already gates its own button) so the dev-only parts *behave* dev-only
everywhere, not just where a reader happens to notice the `Socket` import.

## Where this module overlaps others

Not the Editor/Panel/`ext/layout`/DevBar/demo cluster — `DesignTool` is
read-only and has no editing, splitting, or arrangement ambition; it grades a
layout, it doesn't build one. Two overlaps worth naming instead:

- **`styles/layouts/space`** is the closest structural cousin: `ruler.js`
  already renders one spec at five simulated widths side by side specifically
  so a human (or this tool) can inspect it, and marks itself
  `data-layout-ignore` for DesignTool's benefit. Both modules exist to make a
  layout's behavior across widths *inspectable*; `space` renders the
  comparison, `DesignTool` scores it. Not a merge candidate — one is a demo
  staging rig, the other a grading engine — but the two are clearly built to
  be used together, and only one file (`ruler.js`'s comment) currently says
  so.
- **The `layout-design` skill** is this tool's human-facing counterpart by
  design, per the project's own memory record ("AI only calibrates"): the
  skill is the authored *how to build* guidance, `DesignTool` is the
  *how to verify* engine, and `knowledge/thresholds.md`'s "Good widescreen"
  incident is the sharpest evidence they're already talking to each other —
  advice taken straight from the skill produced a layout this tool correctly
  failed. They should stay separate (one is prose for a reader, one is code
  for a browser) but a two-way link between the skill and this readme would
  make the relationship discoverable without already knowing the memory file
  exists.

## Skill feedback

- **No guidance for a module that's genuinely "many files, each its own
  default export, no unifying object" — which is a common `ext/` shape, not
  an edge case.** The skill's four `subject` forms (class / function-with-
  properties / namespace object / nothing) read as exhaustive, but "nothing"
  is described only as "a module of loose functions," which undersells this
  case: `analyze`, `frame`, `sweep`, `mirror`, `defer`, `vision`, `report`,
  `live` are each a real, separately-important entry point, not an
  undifferentiated utility bag. I found, by reading `util/source/source.js`
  directly rather than the skill, that `member()` already *supports* a plain
  namespace object (`import * as NS from "./file.js"`) as a fourth `subject`
  shape — but using it here would have silently covered only the three
  exports of `DesignTool.js` and left `report`/`mirror`/`defer`/`vision`/
  `live` (each its own file's default export) invisible to the API tab,
  which is worse than not trying. I ended up documenting all eight through
  file docs and two notes instead — the right call, I think, but arrived at
  by spelunking `source.js`'s comments, not by anything the skill said. A
  worked example of this exact shape (many files, no subject, several
  standalone functions each worth a page) would have saved that detour.
- **The two-paragraph readme-breakout rule doesn't mention cross-reference
  count as a trigger, only length.** "The address is a path, not an index"
  was exactly two paragraphs — under the stated threshold — but is the thing
  three other files (`probe.js`, `mirror.js`, `knowledge/false-positives.md`)
  most need to link to. I broke it out anyway because it clearly wanted a
  url more than it wanted to stay inline; a line saying "or a section other
  files want to cite" would turn that from a judgment call into a rule.
- One thing that worked well and is worth keeping: once I found `ext/Doc`,
  `core/Page`, and `util/is` as calibration examples (by grepping for
  `new Doc(` myself — the skill doesn't point at any of them), the six
  artifacts were unambiguous and fast to produce for all 26 files. A single
  "see these three for calibration" pointer in the skill itself would save
  that grep every time.
