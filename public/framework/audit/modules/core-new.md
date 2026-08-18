# core/new

Three prototype sketches — 425 files, 30,994 lines of JS, 2,208 lines of CSS —
that trace how `core/App`, `core/Page` and `core/Router` were designed:
`0/` proved App↔Page and CSS-only arrangement before any Router existed,
`starter/` added the first real Router and lazy children and hit the column
layout's structural limit, and `1/` solved it and is line-for-line what
shipped. None is imported anywhere live, and that is correct — this is a
design record, not dead code, and its single most important gap was that it
had **no readme at the top level and no `page.js` at any level**, so it was
invisible even to a reader who knew to look.

## State

| | |
|---|---|
| files | 425 (`0/` 20, `1/` 359, `starter/` 46) |
| lines of JS / CSS | 30,994 / 2,208 (362 JS/mjs files, 31 CSS files) |
| callers | **0 live imports**, framework-wide (grepped). Every other hit is a citation: `core/App/readme.md`, `core/Page` and `core/Router` docs, `core/Router/doc/measured.md`, `util/is/readme.md`, `util/source/readme.md`, `ext/markdown/readme.md`, `ext/DesignTool/audit/pages.js` (explicitly excludes this tree from its crawl), and `framework/readme.md`'s `instanceof` trap, which names this exact directory. `core/page.js` does not list `new` in `children:` — deliberately outside site nav. |
| docs before | no top-level `readme.md`, no `page.js` anywhere in the tree. Each tier (`0/`, `1/`, `starter/`) already had an excellent, current, self-auditing `readme.md` (the design record CLAUDE.md itself points to) |
| docs after | `readme.md` + `page.js` at `core/new/`, `0/`, `1/`, `starter/` (4 new page.js, 1 new readme); 15 `doc/file/*.md` for the handful of files worth opening per tier (`App.js`, `Page.class.js`, `Router.js` where present, `server.js`, `readme.md`); one bug fixed in `starter/readme.md` (its own tree diagram was labelled `0/`, copy-pasted from the sibling tier) |

## What I changed

- `core/new/readme.md` (new) — what each tier proved, why three and not one,
  confirms zero callers, states the `instanceof` trap up front.
- `core/new/page.js`, `0/page.js`, `1/page.js`, `starter/page.js` (new) — `Doc`
  pages, no `subject:` (importing a sketch class into a live doc page is
  exactly the risk CLAUDE.md warns against; `files:` fetches source over HTTP
  instead), `files:` kept to the handful worth opening, cross-linked in
  reading order. `core/new/page.js` declares `children: "0 starter 1"` so all
  three are reachable *within this tree*.
- 15 `doc/file/*.md`, one per listed file per tier.
- Fixed `starter/readme.md`: its file tree was headed `0/` instead of
  `starter/` — a real, if harmless, bug.
- All four `page.js` `node --check` clean; all four return 200 against the
  running dev server.

## Recommendations

1. **Keep `1/` whole.** *(simple, important)* It's the shipping design's proof
   and its own long-form record — `core/App/readme.md`, `core/Page/readme.md`
   and `core/Router/readme.md` all cite it for measurements they don't
   repeat. Deleting it would break those citations and lose the council
   round (`agents/`, 14 seats) that is the best evidence in the repo for *why*
   several core decisions (no `Page.entered()`, tabs stay links not
   `role="tab"`, `container()` kept at two levels) were made. Cost of keeping:
   359 files sitting in the deploy artifact, discoverable only by someone who
   reads this audit or the readme chain.
2. **Delete `0/`'s and `starter/`'s *code*, keep their readmes only.**
   *(medium, important)* Their entire value is already extracted into prose:
   `1/readme.md`'s "What replaced the Pager tier" and "Backed out" sections,
   plus each tier's own readme, restate every decision in words. The *code*
   adds nothing a reader can safely use (importing any of it is the one
   documented framework-wide trap) and costs 66 files / roughly 1,100 lines of
   JS that will need re-auditing every time someone runs a repo-wide grep or
   crawl and has to remember, again, that this directory is excluded. What's
   lost: the ability to `node 0/server.js` / `starter/server.js` and click
   through the actual working prototype rather than reading about it — real,
   but low-probability (nobody has run these servers per any evidence found;
   no port 8100/8200 reference outside their own files). If this is taken,
   also delete the corresponding `doc/file/*.md` I just wrote for the deleted
   files, and fold their one-paragraph summaries into `core/new/readme.md`.
3. **Add `new` to `core/page.js`'s `children:` — or don't, but decide on
   purpose.** *(simple, useful)* Right now `core/new/page.js` exists and is
   correct but is an orphan from the live site's perspective (my fences
   forbid editing `core/page.js` to fix this myself). The existing convention
   — `ext/DesignTool`'s crawl audit explicitly excludes `core/new/`, and
   `core/page.js` never listed it — reads as *deliberate*, not an oversight,
   so the honest recommendation is: leave it unlinked, and say so in one line
   in `core/page.js`'s own doc/audit, rather than silently fixing it as a
   side effect of this task.
4. **Outside the box: turn `1/agents/` (the council round) into its own
   linked page under `core/new/1/`, independent of whether `1/` as a whole
   survives.** *(medium, speculative)* The fourteen-seat round is arguably the
   single most reusable artifact in this whole tree — it's a worked example of
   getting independent-seat evidence on a real design question, which
   `council-process-lessons` (retired) tried to generalize and failed to. A
   short page pointing at `1/site/council/` and pulling out just "the one
   failure mode in four costumes" and the nineteen ranked requests could
   outlive the code around it.

## Where this module overlaps others

It doesn't overlap another **live** module — it's the ancestor of
`core/App`, `core/Page` and `core/Router`, not a sibling. The overlap is
temporal: `1/`'s `agents/` council and `core/`'s own `audit/modules/` (this
file's sibling) are the same genre of thing — independent-seat design
evidence — done twice, three weeks apart, once as a persona round and once as
this per-module audit sweep. Worth noticing if a third round ever gets
proposed: reuse the shape, don't reinvent it.

## Skill feedback

The skill's file-doc mandate ("one for **every** file in the module") is
correctly overridden here by this task's own special-case brief — but the
skill itself has no escape hatch for "425 files, most of them a working demo
site for a design that isn't shipping." A one-line note in the skill —
*"a module that is itself a historical/prototype record, not live code, may
document representative files only; say which and why"* — would have saved
me re-deriving that judgment call from CLAUDE.md's "don't gold-plate"
spirit rather than from the skill text, and would help the next agent that
hits a similar sandbox (`michael/`, `arya/`, `alex/`, `castin/`, `edric/` are
all named in CLAUDE.md as the same shape: transient, downstream, not
framework convention).
