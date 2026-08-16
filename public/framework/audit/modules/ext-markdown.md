# ext/markdown

`ext/markdown` is six files that turn `marked` (a vendored parser) into a
`View` addon: `md()` as a captured factory, `view.md()` patched onto every
view, and a promise-returning file-loading half (`md.file`, `md.details`)
that the entire `ext/doc` system is built on top of. It earns its place
completely — this is not a module in question, it is close to the single
most-imported piece of the framework, reached by nearly every `page.js` via
`app.js`'s re-export. The single most important thing to do to it is **not
in this directory**: `ext/doc`'s `patched()` check gives a false "Replaced at
runtime" banner on every method this module documents, purely because of how
a "function with properties" subject has to assign its members. That is a
systemic `ext/doc` bug this audit surfaces but cannot fix (out of fence).

## State

| | |
|---|---|
| files | 6 (`example.md`, `marked.esm.js`, `md.css`, `md.js`, `page.js`, `readme.md`) |
| lines of JS / CSS | 212 / 20 (`md.js` 152 + `page.js` 60 / `md.css` 20) — plus `marked.esm.js`, 77 lines, ~41KB, vendored and never edited |
| callers | ~197 files. 164 files do `import { md } from "/app.js"` (prose, framework-wide — effectively every `page.js`). 33 files import `md.js` directly for `.file`/`.details`: `ext/doc/Doc.js` (every `Doc`-based module's member pages, files-tab "about" pane, notes); `ext/Ask/chat.js` (chat bubbles, [/framework/ext/Ask/](/framework/ext/Ask/)); `ext/AITask/{AITask,message,feed,replay}.js` (task prose, replay, [/framework/ext/AITask/](/framework/ext/AITask/)); 27 files under `core/new/1/**` (the earlier design-proof sketch, not part of the live nav) |
| docs before | `readme.md` present but long (150 lines, five "Design decisions" plus a full incident writeup, no breakouts). `page.js` was a plain `Page`, not a `Doc` — no Files tab, no API tab, no per-member `.md`. Zero files under `doc/`. |
| docs after | `readme.md` rewritten to ~120 lines with a "Who uses this" table and four linked breakouts; `page.js` rewritten as `new Doc({ subject: md, … })`; 14 new files under `doc/` — 6 `doc/file/*.md`, 4 `doc/method/*.md` + `doc/property/cache.md`, 4 `doc/*.md` notes |

## What I changed

- `readme.md` — rewritten: conceptual overview, a short section per aspect,
  a "Who uses this" table (the framework-wide usage search), Decisions /
  Traps / Open. Four sections that ran long broke out to `doc/sanitization.md`,
  `doc/relative-links.md`, `doc/file-labels.md` (new, for today's fence
  feature), `doc/proposed.md` (the two carried-forward findings, re-verified
  still true).
- `page.js` — rewritten as `new Doc({ subject: md, properties: "cache",
  methods: "file details c resolve", notes: "sanitization relative-links
  file-labels proposed", files: "…" })`. Added two demos: a real fenced block
  naming a file (today's feature #1, rendered live, not just described), and
  a live `md.file()` call against a file that doesn't exist (today's feature
  #2 — the reader sees the actual "Not written yet" copy, not a claim about
  it).
- 14 new files under `doc/`, structured per the skill: conceptual overview,
  a short section per important thing, ranked improvements last for the
  6 `doc/file/*.md`.
- No `.js` outside `page.js`, no `.css`, and no file outside this directory
  was touched — the fences held.

## Recommendations

1. **`ext/doc`'s `patched()` check false-positives on every method of a
   "function with properties" `subject`.** *(claim)* `util/source/source.js:64`
   defines `patched(fn, name){ return fn.name !== name; }` — correct for a
   class method, where an ext replacing `View.prototype.append` really does
   leave `fn.name === ""` (member-expression assignment infers no name). But
   `subject: md`'s own methods (`md.file`, `md.details`, `md.c`,
   `md.resolve`) are *defined* via `md.x = function(){}` in `md.js` itself —
   the only legal way to attach a property to a function object — which
   gives the same empty `.name` for a completely unrelated reason. I
   confirmed this directly: `const o={}; o.file = async function(){}; o.file.name === ""`.
   `ext/doc/Doc.js:130-131` then renders "> Replaced at runtime — an ext has
   patched `md.file`" on a page where nothing ever patched anything. This is
   not a one-off: `demo.js` has the identical shape (`demo.stage = (fn) => …`),
   so any module documented with `subject: demo` inherits the same false
   banner. *Cost:* a one-line fix at the call site — `patched()` needs to
   distinguish "assigned outside the file that declared the subject" from
   "assigned because that's how a function-with-properties has to declare a
   method at all" (e.g. skip the check unless `Doc.is_class(subject)`, since
   only a class's *instances* have a prototype default for an assignment to
   shadow in the first place). *(simple, important — file:
   `public/framework/ext/doc/Doc.js:130`, root cause
   `public/framework/util/source/source.js:64`, both out of this audit's fence)*.
2. **`md.c(classes, content)` has no caller.** Re-verified today: zero call
   sites in `public/` outside its own definition and its own docs. Delete
   it and say classes go on with `.ac()` — `md("…").ac("note")` is the same
   length and is what every real call site already writes. *(simple, useful)*.
3. **`marked` is re-exported by `/app.js` to nobody.** `app.js` re-exports
   `marked` alongside `md`; no file in `public/` imports it from either
   location. Drop it from `app.js`, keep it reachable from `md.js` — a
   vendored parser is worth an escape hatch from the module that vendors it,
   but exporting it from the site's own public surface implies it's part of
   the framework's API, which it isn't. *(simple, useful)*.
4. **Outside-the-box: let `md.file()`'s cache double as the Files tab's
   fetch, framework-wide.** Right now `ext/files/files.js`'s `file_pane()`
   calls `code.file()` (a *second*, separately-cached fetch of the same
   `about`-hook `.md` file `Doc.browser()` already fetched through
   `md.file()`) for the source pane, while the "about" pane fetches the
   prose through `md.file()`. Two caches, two fetches, same url pattern,
   same file, different code paths. A single fetch-and-cache primitive
   shared by `md.js` and `ext/highlight`'s `code.file()` (same signature
   already: `(meta, url) => Promise<View>`) would cut one of the two hits
   per file shown in a `Doc`'s Files tab. *(medium, speculative — real
   savings only show up once a module's Files tab is opened, and the two
   caches never fight since they're keyed by the same absolute url, so
   nothing is actually broken today)*.

## Where this module overlaps others

**`ext/highlight`, not really — but they now share one contract they didn't
before.** `code.file()` (`ext/highlight`) and `md.file()` (this module) are
independently-written, same-shaped promise-returning fetchers with separate
caches — that duplication is old and was already the case before today. What
*is* new: today's fence-file-label feature makes the two modules co-own one
attribute (`data-file`) with two emitters and one CSS rule, agreeing without
either importing the other (a comment in each names the other by hand,
copied on purpose since "an `ext` may lean on an `ext`" but this coupling
isn't a lean, it's a convention two files have to keep independently in
sync). If a third emitter ever wants a file label, that convention needs a
name and probably a shared one-line helper, not a third copy of the
`data-file` string.

**`ext/doc` is this module's biggest consumer, not an overlap** — `Doc.js`
imports `md` directly and its whole Files/Docs tab machinery *is* `md.file()`
calls. No shared responsibility to question there, just a real, heavy
dependency worth knowing about before touching either file.

## Skill feedback

- **The skill has no guidance for a module whose caller count is in the
  hundreds.** Step 2 of the brief says "for each, note what they use it for
  and their page url" — literally followed, that's ~197 rows. I aggregated
  (one row for the ~164 `app.js` re-export consumers, one row per direct
  importer) and said so in the readme. The skill and brief should say
  explicitly that a module reached through a framework-wide re-export (`md`,
  `code`, `p`, `div`, …) gets an aggregate treatment, not a per-caller table
  — otherwise the next agent either burns a huge amount of the readme's "one
  screen" budget on a caller list, or guesses (as I did) that aggregating is
  fine.
- **The relative-link trap almost bit *this documentation itself*, and
  nothing in the skill or `ext/doc/readme.md` warns about it.** A link
  inside a `doc/*.md` file resolves (via `md.resolve`) against the *fetched
  file's own path*, which mirrors the `doc/` folder tree — not against the
  route a section actually renders at (`/api/<name>/`, `/docs/<name>/`).
  I wrote `[md.resolve](../resolve/)` inside `doc/method/file.md` on my
  first pass, reasoning by analogy from the physical directory layout; it's
  wrong, because `../resolve/` from `doc/method/file.md` resolves to
  `doc/resolve/`, a url that isn't a route (the real one is `/api/resolve/`).
  Caught it by reasoning through `md.resolve`'s own mechanics, not because
  anything in the skill flagged it — worth one line in `ext/doc/readme.md`
  or the skill's "rules that keep biting": *cross-links inside `doc/*.md`
  must be absolute; only a link to a real file (not a member page) may stay
  relative.*
- **"Every non-`doc/`, non-`ai/` file listed" (Step 4) is easy to verify
  mechanically but the skill doesn't say how** — I used `find . -maxdepth 1
  -type f` plus `find doc -type f` and eyeballed the diff against `files:`,
  `properties:`, `methods:`, `notes:`. A one-line shell recipe in the skill
  (or in `ext/doc/readme.md`'s Open section, which already flags that this
  check "belongs in the `documentation` skill, not in a crawler") would save
  every future agent from re-deriving it.
- Everything else in the skill was accurate and sufficient — the six-artifact
  list, the `doc/file/*.md` structure (overview → sections → ranked
  improvements), and the promise/`import.meta` traps all matched what the
  code actually does, with no gaps.
