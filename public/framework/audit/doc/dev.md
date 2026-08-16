# dev

`public/framework/dev/` is two small, well-built modules sharing a tier
index: `Socket` (one WebSocket, one localhost gate, live reload) and
`DevBar` (a right-docked rail of dev chrome, on every page). Both earn their
place — `Socket` is the entire reason a static site gets a reload-on-save
loop with zero build step, and `DevBar` is the one control surface a builder
actually uses all day. The single most important thing to do to this tier:
**fix `Doc`'s patch-detector false positive** (`ext/doc/Doc.js` via
`util/source/source.js`'s `patched()`) — it now mislabels correct, never-
patched code as "Replaced at runtime" on every method of a non-class
`subject` (confirmed on `md.file`, and now on `devbar.refresh`/`toggle` too),
which is outside this directory's fences to fix but not to report.

## State

| | |
|---|---|
| files | 14 — `DevBar/` (10: `DevBar.js ask.js devbar.css grip.css grip.js page.js parts.js readme.md settings.js tools.js`), `Socket/` (3: `Socket.js page.js readme.md`), `dev/page.js` (tier index) |
| lines of JS / CSS | 705 / 176 |
| callers | **Socket**: 5 — `public/app.js` (boots it), `ext/Ask/Ask.js`, `ext/Saver/FileSaver.js`, `ext/LayoutTool/audit/twin.js`, `dev/DevBar/tools.js` (reads status only). **DevBar**: 1 — `public/app.js` (`render()`/`navigated()`), which is also its entire public surface by design. |
| docs before | `Socket`: already migrated to `Doc` today — `readme.md` (111 lines, good), 10 `doc/method/*.md`, 3 `doc/property/*.md`, 3 `doc/*.md` notes, all well-written — but no `files:` list and zero `doc/file/*.md`, and several caller claims already stale (see below). `DevBar`: still a plain `Page` — no `Doc`, no API/Docs/Files tabs, zero `doc/*.md` of any kind; `readme.md` present and thorough (154 lines) but over the skill's one-screen bar. `dev/page.js`: a plain `Page` tier index, matching its `core/`/`ext/` siblings — left as-is. No `classdoc` references found anywhere in the directory. |
| docs after | `Socket`: `files:` added, 3 `doc/file/*.md` written, 5 stale docs corrected (see below). `DevBar`: `page.js` rewritten as `Doc` (`subject: devbar`, `methods: "refresh toggle"`, `notes: "docking sizing threads"`, `files:` the 10-file list); 2 `doc/method/*.md`, 3 `doc/*.md` notes, 10 `doc/file/*.md` written; `readme.md` rewritten — three long decisions broken out to notes, a "Who uses this" section added, "Known limits" kept as `## Open`. |

## What I changed

- **Socket**: added `files: "Socket.js page.js readme.md"` to `page.js` and wrote the 3 `doc/file/*.md` it was missing.
- **Socket — corrected stale docs**, found while verifying every claim against the current repo (`documentation` skill step "every `.md` still true"): `server.js` now reads `DevSocket.Socket.use(Runtime);` **uncommented** (changed today, commit `d553fd1`), and `ext/Saver/FileSaver.js` + `ext/LayoutTool/audit/twin.js` both call `Socket.singleton().async_rpc(...)`/`.rpc(...)` for real. Five docs claimed "zero callers"/"switched off at both ends" and were wrong: `doc/wire.md`, `doc/method/request.md`, `doc/method/rpc.md`, `doc/method/send.md`, `doc/method/singleton.md`, plus `readme.md`'s `## Proposed #1`. All corrected in place — the underlying recommendation (trim `ls`/`cmd`/`log`/`write`/`rm` wrapper methods, which *still* have zero callers even now) still holds and is now *stronger*, since both real callers already bypass those wrappers and spell `rpc`/`async_rpc` themselves.
- **Socket**: added a "Who uses this" section to `readme.md` (5 callers, table).
- **DevBar**: rewrote `page.js` as `new Doc(...)` — `subject: devbar` (a function with properties, `refresh`/`toggle`, same shape as `md`), full `files:` list, `notes:` for the three breakouts below. Overview content kept, with two new cross-links and one new `code.css` file label (`framework.css`).
- **DevBar**: wrote `doc/method/refresh.md`, `doc/method/toggle.md`.
- **DevBar**: broke three over-long `readme.md` decisions out to `doc/docking.md`, `doc/sizing.md`, `doc/threads.md` (each was 3+ paragraphs spanning multiple files — the skill's stated bar), summarized each to one paragraph in `readme.md`, linked, and added all three to `notes:`.
- **DevBar**: wrote all 10 `doc/file/*.md`.
- **DevBar**: rewrote `readme.md` — added "Who uses this," trimmed the three breakout decisions to pointers, kept the rest (traps, short decisions, Open) intact and accurate against a full re-read of every file.
- **DevBar**: flagged the `Doc` patch-detector false positive directly on `doc/method/refresh.md` and `doc/method/toggle.md` (both pages will show a wrong "Replaced at runtime" banner) since a reader hits that banner before they'd ever find this audit file.
- **Verified**: every name in every `page.js` list has its `.md` on disk (`ls` against each list, both directions); `files:` matches each directory exactly, minus `doc/`; `node --check` on both edited `page.js`; both return `200` from the already-running dev server (`/framework/dev/Socket/page.js`, `/framework/dev/DevBar/page.js`) — I did not start the server, it was already up.
- **Left unchanged, deliberately**: `dev/page.js` stays a plain `Page`. It's a tier index exactly like `core/page.js` and `ext/page.js` — lists children, no members of its own to document — so a `Doc` conversion would add three empty, self-hiding tabs for no reader benefit. Stated as the assumption per the brief's autonomy grant.

## Recommendations

1. **`Doc`'s patch-detector false-positives on every method of a non-class `subject`.** `util/source/source.js:64` — `patched(fn, name){ return fn.name !== name; }` — assumes a differing name means an ext reassigned the member at runtime. But a function-with-properties subject (`md`, now `devbar`) legitimately has **no** name on any of its members: `md.file = async function(...){}` is a member-expression assignment, which per JS semantics never gets an inferred name, patched or not — I verified this in isolation (`obj.file.name === ""` whether or not anything ever "patched" it). So `ext/markdown/api/file/`, `/api/details/`, `/api/c/`, `/api/resolve/`, and now `/framework/dev/DevBar/api/refresh/` and `/api/toggle/`, all show a **false** "Replaced at runtime" banner. Smallest fix: gate the banner on `Doc.is_class(this.subject)` in `Doc.js`'s `api()` (`Doc.js:130`) — a namespace-object subject has no meaningful "original vs. patched" story the way a class prototype does, so skip the check entirely for that shape rather than trying to make it accurate. **medium, important** — outside this directory's fences (`ext/doc/Doc.js`, `util/source/source.js`), so not applied; it silently mis-teaches a reader on every page it touches, today, in production. *Filed here per the brief: "if you find a real bug, put it top of your Recommendations."*
2. **Trim `Socket`'s unreached wrapper methods now that real callers exist to compare against.** `ls()`, `rm()`, `write()`, `cmd()`, `log()` remain callers-zero even after two real features (`FileSaver`, `LayoutTool/audit`) started using this module — both spell `rpc("rm", …)` / `async_rpc("write", …)` directly rather than reaching for the wrappers built for them. That's the strongest evidence yet for the readme's already-recorded option (c): reduce to `send`/`request`/`rpc`. **medium, important** — five methods and their doc pages to delete, three call sites already written the target way.
3. **DevBar's `grip.js` and `ext/Panel`'s `PanelDrag.js` independently solve "drag this edge, write one custom property per frame, commit on release."** Not the same code, not sharing a file, and not asked to change here — but see the overlap section below for the concrete extraction this could become.
4. **Outside-the-box: the `ai` section could be a site-wide index, not only a per-page one.** Every thread already lives at a real, crawlable path (`<page>ai/<slug>/task.jsonl`), and `ext/Ask` already has the bridge. A second, optional DevBar section — "recent threads across every page," sorted by `requested_at` — would need no new storage, just a `/directory.json` walk one level up from what `ask.js` already does. Genuinely speculative and not asked for: today's per-page model is simpler and matches "the log lives beside its page." **large, speculative.**

## Where this module overlaps others

**DevBar is an instance of a general shape the framework has built three
times, not once.** The shape: *a rail docked to one edge, reserving space
from `.app` via a summed CSS custom property, resizable by dragging that
edge, remembering its state through `ext/Saver`.* Three real, independent
implementations exist:

| | reservation | resize | persistence | content |
|---|---|---|---|---|
| **DevBar** | `--devbar`, summed into `.app`'s push | `grip.js` — pointer capture, one custom property/frame | `LocalStorageSaver`, flat settings doc | fixed array (`tools.js`), not a registry |
| **ext/layout**'s drawer | `--drawer`, same sum | none — fixed width | none — session only | one selection's properties |
| **ext/Panel** | none (lives *inside* the page flow, not docked) | `PanelDrag.js extends Sortable` — pointer drag, split resize | `ext/Saver` (`LocalStorageSaver`/`FileSaver`), full `Item`/`List` tree | `templates.js` T-vocabulary, a real registry |

The **docking contract** (the `--drawer + --devbar` sum in `framework.css`,
and the rule that a panel there pushes rather than covers) is already
unified — DevBar and `ext/layout` both honour it correctly, cross-link each
other's readmes, and neither owns it; it's a convention two modules follow,
not a shared class. That's the right amount of unification for something
this small: a third rail on the same edge just has to read the same two
tokens.

What is **not** unified, and could be with real savings: the **resize edge**.
`grip.js` (44 lines) and `PanelDrag.js`'s grip logic each reimplement
"pointer capture → write a custom property every move → commit once on
release," for the same UX reason in both places (a value mid-drag shouldn't
persist yet). A `dock.grip($el, { axis, onCommit })` primitive — living
somewhere content-agnostic like `ext/layout` or a new `ext/dock` — could
plausibly replace both, at the cost of `ext/Panel`'s version also handling
split-resize (two panels changing size together), which is a real
complication DevBar's single-edge case doesn't have. **I would not attempt
this unification uninvited** — it's a cross-module refactor with a real
design question (does `PanelDrag`'s Sortable inheritance still make sense
once the primitive is generic?) that belongs in a proposal, not an audit.

What should **stay separate**: persistence shape (DevBar's flat settings doc
vs. Panel's `Item` tree solve genuinely different problems) and content
vocabulary (DevBar's readme already argued against a registry, correctly —
dev-tool sections don't need distant contributors; Panel's templates
explicitly do).

## Skill feedback

The skill's `member()`/`patched()` machinery is presented as settled and
general ("Only a real class gets the *Overrides* line… `Doc.is_class` tests
the source text"), but the parallel **patch-detection** logic
(`banner: patched(fn, name) && …`) gets no equivalent caveat — the skill's
own worked example (`ext/highlight` patching `View.prototype.append`) is a
*class* case, and nothing in the skill or in `ext/doc/readme.md`'s Traps
section warns that the identical check produces a guaranteed false positive
the moment `subject` is a non-class "function with properties," which the
skill explicitly endorses as a first-class shape (`subject: md`). I only
caught this by testing `fn.name` in isolation; a skill reader documenting
`subject: someNamespace` for the first time has no way to know their page
will ship a wrong banner on every member, and the skill's own repeated
example (`md`) is already live evidence of it. Second, smaller: the skill's
audit checklist says "Load the page in a browser at 1600" as the final step,
but the brief this pass ran under explicitly forbids launching a browser —
worth a one-line note in the skill itself that step 8 is conditional on who's
running the audit, so a future agent doesn't have to reconcile the two
documents itself.
