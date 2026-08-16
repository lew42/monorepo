# ext/highlight

Syntax highlighting bolted onto core's `code` element factory — one import
turns on `code.js`/`.fn`/`.file`/`.lang`/five languages and highlights every
markdown fence on the site, synchronously, with no flash of plain code. It
earns its place completely: this is not a module in question, it's opted in
once (`app.js:141`) and reached by over sixty `page.js` files plus every
fenced code block in every readme on the site. The single most important
thing to do to it is **not in this directory**: documenting it with
`subject: code` (the only honest choice available) makes `ext/doc`'s API tab
render a literally malformed banner — `` an ext has patched `.lang` `` with
the `code.` missing — on every method this module has. Independently
confirmed by `ext-markdown.md`'s auditor hitting the same root cause from a
different subject; my repro adds a second, compounding bug specific to
`code` that theirs doesn't have (below). Neither is fixable from here.

## State

| | |
|---|---|
| files | 12 (`highlight.js`, `highlight.css`, `example.js`, `page.js`, `readme.md`, `editor.md`, `hljs/core.min.js`, 5× `hljs/languages/*.min.js`) |
| lines of JS / CSS | 335 / 118 (`highlight.js` 251 + `example.js` 6 + `page.js` 78 / `highlight.css` 118) — plus ~44 KB of vendored, never-edited hljs grammars |
| callers | ~62 files call `code.*()` directly (framework-wide — near-default way a doc page shows code); 2 soft dependencies with no import (`ext/demo/demo.js`, `ext/files/files.js:64`); every fenced code block on the site, implicitly, via the two `View.prototype` hooks. Representative direct callers in `readme.md`'s new "Who uses this" table: `core/App/page.js`, `ext/doc/page.js`, `ext/markdown/page.js`, `styles/elements/code/page.js`, `ui/kbd/page.js`. |
| docs before | `readme.md` present and unusually good (142 lines, already broke `doc/choice.md` and `doc/hooks.md` out correctly). `page.js` was a plain `Page`, not a `Doc` — no API tab, no Files tab, no per-member `.md`. Zero files under `doc/method/`, `doc/property/`, `doc/file/`. No `classdoc` references found (nothing to fix there). |
| docs after | `readme.md` restructured (~154 lines): new "The FILENAME label" section, new "Who uses this" section, a new `subject: code` Decision, a third breakout (`doc/chaining.md`, extracted from an inline SHARP EDGE section that ran ~35 lines). `page.js` rewritten as `new Doc({ subject: code, … })` with two new demos for the file label. 20 new files under `doc/`: 12 `doc/file/*.md` (6 of them the vendored hljs bundle, kept to 2-4 sentences each), 4 `doc/method/*.md`, 1 `doc/property/cache.md`, 1 new note (`doc/chaining.md`) alongside the 2 pre-existing ones. |

## What I changed

- `readme.md` — conceptual overview kept, three sections added (FILENAME
  label, `subject: code` Decision, Who-uses-this), one section extracted
  (`doc/chaining.md`), Proposed folded into Open.
- `page.js` — `Page` → `Doc`. `subject: code`, `methods: "lang fn file ext"`,
  `properties: "cache"`, `notes: "choice hooks chaining"`, `files:` naming
  all 12. Two new demos for `code.js(src, file)` and the matching fence
  spelling, cross-linked to `ext/markdown`'s `file-labels` note.
- 20 new `doc/**/*.md` files (listed above), each ending in a ranked
  Improvements list where the skill calls for one.
- Verified, not assumed: the "zero imports" claim in `doc/choice.md` (grepped
  every vendored file for a literal `import`/`export` outside the expected
  single `export default`), the "zero external callers" claim about
  `highlight`/`hljs` (grepped all of `public/`), and the banner bug below
  (reproduced in isolation with `node -e`, not inferred from reading).
- No `.js` outside `page.js`, no `.css`, nothing outside this directory —
  fences held. `node --check` clean on both `page.js` versions I wrote;
  `curl localhost/framework/ext/highlight/page.js` → 200, and spot-checked
  four new `.md` files at their real urls, all 200.

## Recommendations

1. **`ext/doc`'s API tab renders a broken sentence for every method this
   module has.** *(simple, important — bug, not this module's fix)* Two
   compounding gaps: `util/source/source.js:64`'s `patched(fn, name){ return
   fn.name !== name }` can't distinguish "an ext replaced this" from "an ext
   *added* this," because `code.lang = function(...){}` (member-expression
   assignment) never gets name inference either way — the same finding
   `ext-markdown.md`'s auditor made independently for `subject: md`. **My
   addition:** `code` itself is worse off than `md`. `md` is `export default
   function md(content){}` — a real declaration, `md.name === "md"`. `code`
   was built inside `View.elements()` as `fns[tag] = function(){ … }`
   (`core/View/View.js:417`) — also a member-expression assignment — so
   `code.name` is **also** `""`. `ext/doc/Doc.js:207`'s `Doc.label = subject
   => subject?.name ?? "the subject"` uses `??`, which only substitutes on
   `null`/`undefined` — not on `""` — so the fallback never fires and the
   banner prints `` an ext has patched `.lang` ``, missing the subject name
   entirely. Reproduced directly:
   ```js
   const fns = {}; fns.code = function(){};
   fns.code.lang = function(){};
   fns.code.lang.name;                          // ""
   fns.code?.name ?? "the subject";              // "" — not caught
   ```
   *Cost:* a real fix belongs in `ext/doc`/`util/source` (out of this fence);
   the narrowest one is skipping `patched()`'s banner unless
   `Doc.is_class(subject)`, since only a class's *instances* have a prototype
   default for an assignment to shadow in the first place — the same
   reasoning `overrides()` already uses one function away. **This finding is
   present in neither this module's fence nor, as of this audit, in
   `ext-doc.md`'s own Recommendations** — worth surfacing to whoever
   reconciles the fourteen audit files, since the fix's owner hasn't seen it
   from its own module's audit.
2. **`highlight(root)` and `hljs` are exported from `/app.js` with zero
   external callers.** *(simple, useful)* Verified by grep, not carried
   forward blind. The two synchronous hooks (`html_unsafe`, `prerender`)
   already cover every way markup reaches the DOM through a `View`; a
   third caller re-scanning a subtree by hand is a documented escape hatch
   for a case that hasn't happened. Drop both from `app.js:141`, keep them
   exported from `highlight.js` for a caller that needs them explicitly.
3. **`code.ext(url)` is public-looking, one caller.** *(simple, useful)*
   Reads as API because it hangs off `code` beside `code.js`/`code.file`; it
   exists only to serve `code.file()`, one line below it. Demote to a
   module-local `function ext(url)` — the value of this namespace is that
   every name on it renders something, and this one doesn't.
4. **`code.lang()`'s "ignored inline" comment doesn't mention it's also
   ignored in explicit `"pre"` context.** *(simple, useful)* A caller who
   wires `code.lang()` inside a hand-built `<pre>` — exactly what the
   unbuilt `Editor` in `editor.md` will do — and passes a `file` argument
   gets no error and no label, for a reason the source comment doesn't
   state. One clause fixes it; written up now in `doc/method/lang.md` in the
   meantime.
5. **Outside the box: `code.lang()`'s three-way `context()` dispatch and the
   `append()` guess-then-correct pattern are a smaller, sharper version of
   what the unbuilt `Editor` (`editor.md`) will need for the overlay's
   `<pre>`/`<textarea>` sync.** *(large, speculative)* Both already solve
   "know what you're building before you've been told where you'll land."
   If `Editor` ever gets built, it's worth asking whether `context()` should
   grow a fourth case for "inside an editor's view pane" rather than the
   editor working around `code.lang()` from outside — the same instinct
   that already made `"pre"` its own case instead of a special-cased inline.
   Ranked last because it's speculating about code that doesn't exist yet.

## Where this module overlaps others

**`ext/markdown`, genuinely, as of today — not duplicated work, co-owned
work.** `code.lang(src, file)` and a fence's info string second word now
agree on one `data-file` attribute with two emitters and one `highlight.css`
rule, neither module importing the other. That's the intended "an ext may
lean on an ext" pattern working correctly, but it means the convention lives
in two files' heads at once — if a third emitter ever wants a file label, it
needs a name (a shared one-line helper, or at least a named convention
doc), not a third copy of the string `"data-file"`.

**`ext/demo` and `ext/files`, softly, by design.** Both check `code.js`/
`code.file` at call time and fall back to plain `code()`/a raw fetch if this
ext isn't loaded — the same "lean without importing" contract as above,
just without the shared-attribute complication. Correctly not an overlap:
neither module would gain anything by merging with this one.

**Not `ext/editor` — verified, and the name collision is real.** `ext/editor`
(also audited today) is a drag-and-drop `Item`/`Panel` page builder — 318
lines, `blocks.js`, `History.js`, nothing about code or syntax. `editor.md`
here is an unrelated, unbuilt *design spec* for a textarea-overlay **code**
editor. Two genuinely different things sharing the word "editor" in the same
framework is exactly the kind of collision CLAUDE.md's "say a new name out
loud" rule exists to catch, and it slipped through because they're in
different modules that neither audit alone would notice. Worth a one-line
disambiguation in whichever readme lands second in the reconciliation pass —
"code editor" vs. "page/panel editor" costs nothing and prevents a search for
one from landing on the other.

## Skill feedback

**The skill has no guidance for when `subject:` itself is the wrong shape
for the available options, only for which of the three shapes to pick.**
"Classes and non-classes alike" in `ext/doc/readme.md` presents `subject:
View` / `subject: md` / `subject: ui` / no subject as parallel, freely
interchangeable choices with no cost difference between them. They aren't:
a subject built via `fns[tag] = function(){}` inside another module (my
case) produces worse `Doc` output than one declared as
`export default function md(){}` in its own file (the `ext-markdown` case),
and neither the skill nor `ext/doc/readme.md` says a "function with
properties" subject should be checked for how its *own* name was assigned
before committing to `subject:` — I only found it by independently
simulating the exact assignment shape in `node -e`, not by reading anything
that told me to look. A single sentence — *"before choosing `subject:`,
check `subject.name`; if it's empty, `Doc.label()`'s fallback won't catch
it and every patched-method banner will render with the name missing"* —
would have turned an hour of tracing through three files into one grep.
Second, smaller point: the skill's audit checklist (step 7, "who uses it")
gives no guidance for a caller count past a handful — I had the same problem
`ext-markdown.md`'s auditor names, and independently made the same call
(aggregate + a representative table), which suggests the skill should say so
explicitly rather than leaving two auditors to guess the same answer twice.
