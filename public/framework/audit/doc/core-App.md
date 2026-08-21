# core/App

**A 110-line class with one production caller, and the best-prepared docs I've
audited before this pass — every member already had a `.md`, and the readme's
Decisions/Proposed/Open sections were already rigorous.** It earns its place: url
resolution was deliberately pushed out to `Router`/`Page`, so what's left is a
six-step boot and one container element, nothing more. The single most important
thing done to it this pass: roughly **twenty `File.js:NN` line citations across
fifteen `.md` files had drifted** (2–8 lines each, in `App.js`, `app.js`, `Router.js`
and `Page.class.js`) since those docs were written, one citation pointed at a
`mark_links()` call site that no longer exists anywhere, and the `Files` tab was
**entirely missing** — no `files:` key, no `doc/file/*.md`. All fixed.

## State

| | |
|---|---|
| files | 6 (`App.js` 110 lines, `Font.js` 40, `mode.js` 45, `mode.css` 24, `page.js` 77, `readme.md` 151) |
| lines of JS / CSS | 195 (`App.js`+`Font.js`+`mode.js`+`page.js`) / 24 (`mode.css`) |
| callers | 3 real, live imports — `/app.js` (production boot, the only one), [`core/Sidebar/Sidebar.js`](/framework/core/Sidebar/) (imports `mode` for the footer toggle), `framework/start/example/app.js` (teaching copy). Everything else that mentions `App.js` — `core/page.js`, `core/Page/old/shell/page.js`, sandboxes, other modules' docs — quotes `new App()` inside a code example, not a live import. `core/new/0`, `core/new/1`, `core/new/starter` each vendor their **own** `App.js`. |
| docs before | `readme.md` already rich (Decisions/Proposed/Open, member-by-member reasoning); `page.js` a `Doc` (not `classdoc`) with `properties`/`methods`/`notes` all present and cross-checked; **zero `doc/file/*.md`, no `files:` key** — no Files tab; ~20 stale line citations; one dead citation; `log_label()` call-count claim (`Page.log_label()` "has seven") three refactors out of date |
| docs after | added `files:` + 6 `doc/file/*.md` (incl. `readme.md.md`); corrected every stale `App.js`/`app.js`/`Router.js`/`Page.class.js` citation against the live files; replaced the dead `framework/ui/page.js:29` citation with the two real current callers; corrected `log_label()`'s call count (seven → three, with the real line numbers); added a "Who uses this" section to the readme |

## What I changed

- `page.js` — added `files: "App.js Font.js mode.js mode.css page.js readme.md"`.
- `doc/file/App.js.md`, `Font.js.md`, `mode.js.md`, `mode.css.md`, `page.js.md`,
  `readme.md.md` — new, each with a ranked Improvements list.
- Thirteen existing `doc/*.md`, `doc/method/*.md`, `doc/property/*.md` files —
  corrected line citations against the current `App.js` (verified with `grep -n`,
  not by re-reading and eyeballing): `config.md`, `error.md`, `initialize.md`,
  `inject.md`, `load.md`, `loaded.md`, `render.md`, `assign.md`, `stylesheet.md`,
  `styles_loaded.md`, `constructor.md`, `loaders.md`, `fonts.md`, and the property
  docs `$app.md`, `$body.md`, `$pages.md`, `ready.md`, `root.md`, `router.md`.
  Also fixed citations into sibling core files (`Router.js`, `Page.class.js`) that
  had independently drifted, and rewrote `log_label.md`'s stale caller count.
- `readme.md` — corrected two of its own stale citations, corrected the
  `log_label()` caller-count claim, and added "Who uses this" (the Step 2 usage
  search) between the intro and Decisions.
- Verified: `node --check` clean; `curl` on `page.js` returns 200; every
  `properties`/`methods`/`notes`/`files` name has its `.md`; `files:` matches the
  directory exactly; no `classdoc` references anywhere in the directory.

## Recommendations

1. **`instantiate()`'s missing `.catch()` is a real, already-recorded bug worth
   fixing.** A throw in `config()` or `render()` (outside `load()`'s own try) is a
   silent unhandled rejection that also leaves `app.ready` pending forever — two
   symptoms, one missing line. `App.js`, inside `instantiate()`
   (`try { … } catch (e){ this.error(e); }` around the body). Not applied — it's a
   behaviour change and outside my fences — but it's the highest-value single line
   in the class. *(simple, important)*
2. **The line-citation drift itself is the systemic finding.** Twenty citations
   across fifteen files, all wrong by a small, file-specific offset, plus one
   citation to a call site (`framework/ui/page.js:29`) that no longer exists at
   all — a whole refactor's worth of silent staleness with nothing to catch it.
   Every citation was individually plausible (off by 2–8 lines reads as "close
   enough" until you `grep -n` it), which is exactly why nobody noticed. Fixed
   this pass; will drift again the next time `App.js` gains or loses a comment
   line unless something greps for it. *(simple, important — done)*
3. **A CI-free check that fetches this module's docs' own citations and diffs
   them against the real line would catch this class of drift automatically** —
   a regex over `` `Foo.js:NN` `` patterns, resolved against the file. Cheap to
   write, would need to run periodically (nothing here runs periodically). Named
   as the direct fix for finding 2. *(medium, useful)*
4. **`log_label()` on `App` is genuinely dead** — zero callers anywhere, unlike
   `Page.log_label()`'s three. The readme already proposes deleting it or wiring
   `Page.container()`'s hardcoded `"app.$pages"` string through it; either is a
   one-line change outside my fences. Leaving it in its current unresolved state
   is, per the readme's own words, "the only wrong answer." *(simple, useful — needs the owner)*
5. **Outside-the-box:** `mode.js` and `Font.js` are each covered by exactly one
   `notes:` entry (`mode`, `fonts`) rather than getting their own `subject:`-style
   member breakdown, because neither is a member of `App`. That's the right call
   today, but if a third sibling module ever joins this directory, `App/page.js`
   would want a `children:` tab per sibling instead of folding each into a single
   note — worth naming now, before there's a third one to retrofit. *(medium,
   speculative)*

## Where this module overlaps others

**Router and Page**, and the readme says so explicitly: `App` used to own url
resolution (`load_page`, `path_to_page_url`, `mark_links`, `load_ancestors`) and
all of it moved out, on the stated principle that the moment resolving a segment
can `await` an import, it stopped being boot logic. What's left doesn't overlap
either — `App` is the element with a lifecycle, `Page` is a tree node, `Router`
walks it. The one live fossil of the old shape is `App.path_to_page_url()`,
whose only real caller now lives in `arya/lib/`, a downstream package that
happens to share a repo. No overlap with Editor/Panel/DevBar/demo — this module
is upstream of all of them (they run inside `$pages`, which `App` merely builds).

## Skill feedback

**The skill's "Auditing an existing module" checklist has no branch for "the
member docs are already excellent but the citations inside them are quietly
wrong."** Step 4 ("Every `.md` still true. A renamed method, a changed default,
a trap that was fixed.") gestures at this but doesn't name **line-number
citations** as a category worth grepping for specifically — I only found the
scale of the problem because `App.js` happened to have comments added since the
docs were written, which shifted *every* downstream reference by a small amount
in two clusters. A module that was edited more subtly (one line added, nothing
removed) would show the same drift and be just as invisible without a targeted
`grep -n` pass. A one-line addition to Step 4 — *"grep every `\`File\.ext:\d+\`\`
citation in the module's docs against the real file"* — would have made this a
checklist item instead of something I stumbled into.

Second, smaller: **the skill doesn't say whether `readme.md` itself gets a
`doc/file/readme.md.md`.** I only got it right because I checked `ext/Doc`'s own
precedent (`doc/file/readme.md.md` exists there) before writing anything — and a
sibling module's audit (`core/Page`) independently made the same check and
flagged the exact same ambiguity as its own top Improvement. Two auditors
rediscovering the same one-line answer in the same afternoon is the skill
missing a sentence, not a coincidence.
