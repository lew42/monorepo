# ext/Panel

Blender-style split chrome, built once and reused honestly: one `Item`
subclass (`Panel`), one recursive view, and the persistence, drag and
control stacks the framework already had — no parallel mechanism invented
for arranging. It earns its place: `ext/editor`'s entire shell is a
`workspace()` call with editor-specific regions, not a lookalike built
beside it. The single most important thing to do to it is not a Panel
change at all — it's committing the code. `git log` on this path (and on
`ext/editor`) returns nothing; 972 lines of working code are one lost
working tree away from never having existed.

## State

| | |
|---|---|
| files | 8 (`Panel.js`, `PanelDrag.js`, `page.js`, `panel.css`, `readme.md`, `templates.css`, `templates.js`, `workspace.js`) |
| lines of JS / CSS | 524 / 248 |
| callers | 2 real importers — `ext/editor` (`/framework/ext/editor/`, builds its whole shell from `workspace`+`Panel`) and `framework/page.js` (`/framework/`, embeds one `panel("clock")` leaf) — plus a declared-child registration in `ext/page.js`'s `children:` list, which is what puts this module at its own url |
| docs before | `readme.md` present but 203 lines — a conceptual overview followed by the *entire* design record inline (eight worked decisions, three "kept with dissent" entries, an open-for-Mike list), three screens against the skill's one. `page.js` was a plain `new Page({...})`: prose and code blocks, no `Doc`, no members list, no Files tab. Zero `doc/*.md` files existed. |
| docs after | `readme.md` rewritten to 108 lines: conceptual overview, shape, a one-paragraph Templates summary, condensed Decisions (linked out), the three traps, a new "Who uses this" section, condensed Open. `page.js` rewritten as `new Doc({ subject: Panel, properties: "defaults", methods: "get leaf divide close absorb", notes: "decisions templates", files: … })`. 16 new `doc/*.md` files: 2 notes (`decisions.md`, `templates.md`), 8 file docs (one per module file, `readme.md.md` included), 5 method docs, 1 property doc. |

## What I changed

- Rewrote `readme.md`: kept the conceptual overview, section-vs-panel and
  file-map sections; broke the inline design record out to
  `doc/decisions.md` and `doc/templates.md` (each summarized in a paragraph
  and linked, per the skill's two-paragraph rule); added a "Who uses this"
  section from the framework-wide grep in step 2; folded in the current,
  more accurate state from the 2026-08-14 Editor × Panel review (three live
  mounts, not two; `workspace.js` still over 100 lines after its split) so
  the readme stops repeating an optimistic snapshot.
- Rewrote `page.js` as `new Doc({...})`: added the members list (`Panel`'s
  five real verbs plus its one static), wired `notes:`/`files:`, wrapped the
  two throwaway `panel(fn)` / `panel("clock")` examples in one `demo()` call
  side by side (previously a `code.js` block followed by two separate raw
  live elements) so a reader compares the function-seed and name-seed forms
  without scrolling. Left the persisted `workspace()` embed as a plain
  `.bleed` box, unwrapped — see `doc/file/page.js.md` for why forcing a real
  document through demo chrome would misrepresent it. Added an explicit,
  two-way sentence naming `ext/editor` as built from the same class and call.
- Wrote all 16 `doc/*.md` files listed above. `doc/decisions.md` is the old
  readme's design record, condensed and updated where the 2026-08-14 review
  found the ground had moved. `doc/templates.md` folds in the useful parts
  of `framework/ai/2026-08-13/panel/templates.md` (an `ai/` task file, not
  itself part of the module's documentation) so that content has a real,
  permanent home instead of living only in a dated task log.
- Fixed nine internal cross-links that pointed at raw `doc/*.md` relative
  paths from inside *live-rendered* pages (file docs, method docs) — those
  need the routed url (`/framework/ext/Panel/docs/decisions/`), not a
  filesystem path; only `readme.md` itself should use the relative form.
  Caught by rereading against `ext/doc`'s own doc files, which showed the
  convention split in the wild before I'd have found it any other way.
- No `.js` behavior file was touched. No `classdoc` references found in this
  directory.

## Recommendations

1. **Commit `ext/Panel` and `ext/editor`.** *(simple, important)* Both exist
   only in the working tree; a lost checkout is a lost module. Everything
   below is a note about code that doesn't have a `git log` yet.
2. **A failed load is indistinguishable from an absent one, and the seed
   overwrites the file.** *(simple, important)* `FileSaver.load()` returns
   `null` for any non-ok response (`Saver/FileSaver.js:7`), so
   `workspace.js:41`'s `fresh = !(loaded instanceof Panel)` reads `true` on
   a genuine failure, rolls a random arrangement, and **saves it over
   `/data/panels.json`**. A dev-server restart mid-fetch is enough to
   trigger it. Fix is one more return shape on `Saver.load()` (404 vs.
   failure) and one guard clause here. Not something I could fix myself —
   `Saver` is outside this fence — but it's the highest-value real bug
   touching this module, found by the 2026-08-14 review and still open.
3. **Extract the saver-chooser.** *(simple, important)* The `dev`
   hostname test plus the `FileSaver`/`LocalStorageSaver` choice is
   byte-identical in `Panel/workspace.js:23-24` and `editor/page.js:19-20`.
   One `store(path, key)` in `ext/Saver`, imported by both, keeps the one
   place this needs to change in step, without hiding the choice the house
   rule wants visible at each call site — the helper *is* the visible line.
4. **Split `workspace.js`'s bar out.** *(medium, useful)* 191 lines; the
   2026-08-14 split pulled `PanelDrag` and the grip out of the original
   `panel.js` but left `workspace.js` carrying four things. `controls()`,
   `popover()`, `place()` and the `TONES`/`ALIGN`/`PLACE` tables (~45 lines)
   are one idea — a panel's chrome — and read as the next honest seam.
5. **A shared-document registry, or the cheap `MemorySaver` version.**
   *(medium, useful)* Three live mounts share `/data/panels.json` today
   (`Panel/page.js`'s default route, its `/full/` route, and
   `ai/2026-08-13/panel/page.js`), not the two the old readme recorded —
   `Page` caches views, so visiting any two leaves the last writer winning.
   The archive-page pattern (`MemorySaver`) is already used elsewhere in the
   house for exactly this.
6. **Outside-the-box: let a panel's `T` menu double as the site's component
   gallery, not just its own arrangement tool.** *(large, speculative)*
   Every section band, and eight standalone scenes, are already one lazy
   import away inside `templates.js` — which means `ext/Panel` is
   incidentally the only place on the site that can show *any* two
   arbitrary building blocks side by side, live, at any width, without a
   dedicated comparison page for each pair. A `/framework/compare/?a=hero&b=stats`
   built from two bare `panel("hero")`/`panel("stats")` calls in a row would
   cost near zero new code and answer "how do these two look together" for
   the entire `styles/sections` catalog at once — a job the gallery's
   `preview()`/`previews()` currently can't do because it shows one thing at
   a time. Ranked last because it's a new page with a URL scheme to design,
   not a fix to existing code, and nobody has asked for it.

## Where this module overlaps others

**Not the general case of `dev/DevBar`, `ext/layout`'s control panel, or
`ext/demo`'s stage** — despite the shared instinct that five names are
wearing one idea. Concretely, by call site:

- **`ext/editor` *is* a Panel.** `editor/page.js:8` imports `{ workspace,
  Panel }` from `Panel/workspace.js` directly; its seed
  (`editor/page.js:26-27`, `pane()`/`split()`) builds the exact same
  `new Panel({ data, grow })` nodes `scatter()` builds internally, and
  `editor/page.js:294` calls `workspace({ saver: panels, templates: REGIONS,
  seed })` — three keys, the same door `ext/Panel`'s own page uses. This
  isn't two modules that resemble each other; it's one class with two
  vocabularies. Nothing to unify — it already is.
- **`dev/DevBar` is not a split tree and doesn't want to be one.** It's a
  single toggleable rail (`dev-open` on `<html>`, one persisted boolean in
  `settings.js`) with no divide/close verbs, no grip, no nesting. Forcing it
  onto `Panel` would import structure it has no use for.
- **`ext/layout`'s drawer is a singleton property inspector, not chrome for
  arranging** — and it's already a *dependency* of Panel, not a sibling:
  `workspace.js:96` calls `layout.bar($body)` per leaf. Panel answers "how
  do several regions share this space"; layout's panel answers "what can I
  edit about the one thing I selected." Different shape, correctly reused
  rather than merged.
- **`ext/demo`'s stage is a single resizable box for previewing one render
  at simulated device widths**, not a multi-region tree — its handle drags
  one dimension of one box; Panel's grip writes `grow` fractions between
  *neighbours* in a tree. They don't want to be the same mechanism.

**The one thing genuinely duplicated across three of these five names is
five lines, not a class.** `PanelDrag.js:44-51`'s `coalesce()` — throttle a
pointer drag to one `requestAnimationFrame` tick — is lifted verbatim from
`ext/demo/stage.js:74-84`'s `drag()`, on purpose ("a widget has no business
depending on the demo chrome"), and `dev/DevBar/grip.js:13-15` explicitly
*declines* the same pattern in a comment explaining why its case doesn't
need it. **The smallest unified thing is one utility** — a `raf_drag(el,
move)` in `framework/util/`, imported by `PanelDrag.js` and by `stage.js` —
not a merge of Panel, DevBar, layout or demo into each other. That would
also delete the "lifted, not imported" comment, since the shared bit would
no longer live inside the demo module it's apologizing for depending on.

## Skill feedback

**Strongest point:** the skill's own worked example (`core/View/page.js`,
cited directly in its "Overview — show, don't tell" section) uses six
sequential `demo()` calls with **no** `overview:` rail, while two sections
earlier the skill says "a wall of demos means the reader sees one at a time
and scrolls to compare. Use the rail." These read as contradictory until you
notice the difference is *variants of one option* (rail) vs. *a guided tour
of different ideas in sequence* (fine as a wall) — but the skill never says
this distinction out loud. I had to infer it by reading `View/page.js`
directly and reasoning about why its own canonical citation breaks its own
rule. One added sentence — "a sequence teaching different concepts is not
the wall this warns about; a wall is the same concept shown N times" — would
have saved a real judgment call on this page (should the two `panel(fn)` /
`panel("clock")` demos be a rail? I concluded no, and put them side-by-side
in one `demo()` instead, but the skill gave no way to check that call).

Other friction, in descending order:

- **Whether `readme.md` itself needs a `doc/file/readme.md.md`.** The skill
  says "one for every file in the module (never for `doc/` or `ai/`)" — I
  had to go verify against `ext/doc`'s own directory (it has
  `doc/file/readme.md.md`) to confirm `readme.md` counts as "a file in the
  module" rather than being implicitly exempt as documentation-about-itself.
  Worth stating explicitly, since it's the one file whose exemption is most
  plausible-sounding and wrong.
- **The relative-vs-absolute link convention is entirely unstated.** The
  skill shows `md.file(import.meta, "readme.md", …)` and
  `[Name](../decisions.md)`-style examples never appear at all — I only
  found the real rule (relative `.md` paths inside `readme.md`; routed
  `/module/docs/name/` urls inside anything served through `md.file`, i.e.
  every `doc/*.md`) by grepping `ext/doc`'s own doc files for their internal
  cross-links and reverse-engineering the pattern. Nine links in my first
  draft were wrong because of this. A single sentence in the skill's "doc/
  file" or "notes" section would have prevented all nine.
- **No worked example of a class whose members should be documented but
  whose module also has a *second*, unexported-as-subject class**
  (`PanelDrag`). The skill's `subject:` section covers "class / function /
  namespace / nothing," not "two classes, only one of which is the spine."
  I resolved it by documenting `PanelDrag` only through its file doc and the
  Decisions note, never through `methods:` — defensible, but the skill gave
  no steer either way.
