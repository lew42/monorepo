---
name: documentation
description: Create and audit a module's docs — readme.md, doc/*.md, and a page.js built on ext/doc's Doc class. Load BEFORE FINISHING ANY TASK that touched a module under public/framework/ (or any module with a page.js), and whenever asked to document, audit docs, write a readme, add a doc page, or check whether docs are current. Covers the six-artifact checklist, the readme/page.js split, the four kinds of doc file, the file label on code blocks, and the browsability rules that keep a wall of demos from happening.
---

# Documentation

**Run this before you call a task done.** Code you changed and did not document is
half-landed: the next reader — usually another AI, with no memory of your session —
sees the file and not the reason. This skill is the checklist and the shape.

Everything here is **writing files**. No registration, no build step, no UI. Declare
a name in `page.js`, write the `.md` next door, and it is a browsable url.

## The six artifacts

For every module you touched, all six must be current. Missing is a finding; stale
is worse than missing, because stale still reads as true.

| # | artifact | answers |
|---|---|---|
| 1 | `readme.md` | why is it shaped this way — for the maintainer |
| 2 | `doc/<note>.md` | a topic bigger than one member, at its own url |
| 3 | `doc/method/<name>.md` | what this member does, and what bites |
| 4 | `doc/property/<name>.md` | what this value is, and who sets it |
| 5 | `doc/file/<path>.md` | what this **file** is for — one per file in the module |
| 6 | `page.js` | how do I use it — for the reader, shown not told |

`page.js` is what makes 1–5 browsable: it is a `Doc`, and every list in it names
files that must exist.

## 1. `page.js` — one `Doc`, and the tabs fall out

```js /framework/core/View/page.js
import { View, Doc, md, code, demo } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "View",
	description: "One sentence. It is the card's subtitle everywhere this page is previewed.",
	icon: "layers",

	subject:    View,                      // a class, a function with properties, an object — or omit it
	properties: "el capture",              // → API tab   + doc/property/<name>.md
	methods:    "append ac on style",      // → API tab   + doc/method/<name>.md
	notes:      "capturing",               // → Docs tab  = doc/<name>.md
	files:      "View.js View.css page.js readme.md",   // → Files tab + doc/file/<path>.md
	overview:   "demos",                   // → cards in the Overview's own rail
	children:   "guide",                   // → a top tab of its own, from guide/page.js

	content(){ /* the Overview — see §2 */ },
});
```

**Top tabs are sections; the inner left rail is sub sections.** That is the layout,
it is not configurable, and nothing at a call site ever says *"tab"* — you list
members and the grouping is derived. An empty section has no tab.

`subject` is whatever owns the members and is **optional**:

- a **class** — `subject: View`. Only a class gets the *Overrides* line.
- **the class an ext PATCHES** — `ext/catalog` patches `Page.prototype.catalog`, so
  its page declares `subject: Page, methods: "catalog"`. That is correct, not a
  hack: the page then shows the live patched source, and the *Replaced at runtime*
  banner appears exactly where it should. Same for `ext/tabs` and `ext/highlight`.
- a **function with properties** — `subject: md` documents `md.file`, `md.details`.
- a **namespace object** — `subject: ui` documents `ui.table`, `ui.timeline`.
- **nothing** — a module of loose functions is fully documented by `notes:` and
  `files:`. Most `ext/` modules are this shape. Use `Doc` anyway; the Files tab
  alone earns it.

⚠ Pass the **class**, never an instance: `import { App } from "/app.js"` — the
default export is the running app, which has no prototype, and every member page
comes up empty.

**⚠ Not every `page.js` should become a `Doc`.** Convert the *module index* — the
page a reader lands on. Leave a **leaf demo page** alone: `ui/` has 19 components
whose pages are already the site's one demo system (`demo.exhibit()` with
children-as-variants), and wrapping those in a `Doc` shows every variant twice,
once in the rail and once in the exhibit. The test: does this page *document a
module*, or *is it one example*? Only the first wants tabs.

A module whose shape genuinely differs **subclasses** `Doc` and overrides
`sections()`, `bar()`, `well()` or `member_page()`. It does not get a new config
option — an option is API surface forever; an override lives in the file that
wanted it. See [`ext/doc/readme.md`](/framework/ext/doc/).

## 2. The Overview — show, don't tell

**Code first.** The first thing under the title is a code block or a `demo()`,
never a paragraph. Prose is a *caption*, not a preamble — which is why
`demo(fn, "the sentence")` puts the caption inside the box: prose can never detach
from its example.

**Label the file.** Any snippet a reader might paste, or that only makes sense
somewhere specific, gets its filename on top. An `import App … new App()` block is
meaningless until you know it is `/app.js`.

- in a `page.js`: `code.js(src, "/app.js")`
- in markdown: the fence's info string — <code>```js /app.js</code>

Skip the label only for a fragment that belongs nowhere in particular (a two-line
signature, a shell command).

**Variants are pages; a tour is a sequence.** The distinction is what the demos
*are*, not how many:

- **Variants of one thing** — three sizes, four modes, six layouts — go in the rail.
  The reader's question is "how do these differ", and a wall answers it by making
  them scroll between two things they wanted side by side.
- **A guided tour of different concepts** — `core/View`'s six demos walk capture,
  then chaining, then events — is a **sequence**, and a sequence down the page is
  correct. Each one is read once, in order, and never compared to its neighbour.

If you catch yourself writing "and here it is with X instead", that is a variant.
Use the rail:

```js
overview: "basic variants advanced overrides",   // sibling dirs, each with a page.js
overview: [{ title: "Basic", content(){ … } }],  // or inline configs
```

Each becomes a live card in a persistent rail with the detail beside it. **Show a
variant's effect, not its name** — for an option, put the two renders side by side
and the differing line in the code under them.

**End by naming the next page.** A section is a path, not a fan-out.

**Close with the design record**: `md.details(import.meta, "readme.md", "…")`.

## 3. `readme.md` — the maintainer's document

**Start with a conceptual overview**: what this module is, in two or three
sentences, touching every important aspect. Then **a short section per aspect** —
a heading and a paragraph or two.

**A section that needs more than two paragraphs breaks out into `doc/<name>.md`**,
is summarized in one paragraph in the readme, and is linked from it. Then add that
name to `notes:` so the breakout is *also* a page. A record written once, read
twice: by a maintainer through the readme's citation, and by a visitor at a url.

**One screen means the overview and its sections** — the part a newcomer reads
top to bottom. The three record sections below are exempt: an honestly argued
Decisions section routinely runs longer, and truncating it is how a decision loses
the reasoning that made it revisable. What must not grow is the *explanatory* half;
that is what breaks out to `doc/<name>.md`.

It carries:

- the conceptual overview, and a section per aspect
- **Decisions** — question → what was weighed → verdict, with the reasoning kept.
  Give a verdict only the firmness it earned: `never` and `always` belong to things
  that actually break.
- **Traps** — what fails *silently*. The highest-value lines in the file.
- **Open** — what is still unresolved, stated as a question.

A readme is not a running commentary on past mistakes, and not a method list — that
is `page.js`'s job and it goes stale here.

## 4. `doc/file/<path>.md` — one per file

**`doc/file/` mirrors the module's own directory tree, subdirectories and all** —
append `.md` to the path, do not flatten it. A file at `overview/urls/page.js` is
documented at `doc/file/overview/urls/page.js.md`. Flattening collides the moment
two subdirectories both hold a `page.js`, which is most of them.

**Every file, and that includes `readme.md`** — `doc/file/readme.md.md`. A readme is
a file in the module like any other, it appears in the Files tab like any other, and
two separate audit passes have now skipped it by assuming otherwise. The only
exclusions are `doc/` and `ai/`, which are documentation *about* the module rather
than part of it.

A **vendored** file (`marked.esm.js`, `hljs/*`) still gets one, kept to four lines:
what it is, what version, why it is vendored, and that it is never edited.

**The escape hatch: a tree nobody may import.** `core/new/` is 425 files of
prior-art sketches that CLAUDE.md forbids importing. Documenting each one is work
nobody will read. For a tree like that, write file docs only for the handful a
reader would actually open — the entry points and the readmes — and say in the
module readme which files were skipped and why. **Naming what you skipped is the
deliverable**; silently covering 15 of 425 is indistinguishable from a thin pass.

Each one, in this order:

1. **A conceptual overview** — what this file is for, and why it exists separately.
2. **A short section per important thing in it** — the load-bearing decision, the
   trap, the seam another file depends on.
3. **Improvements, last** — a ranked list, simple + important first. Ranking is the
   deliverable: an unranked list of twelve ideas is twelve decisions handed back.
   **The heading is never omitted.** If you genuinely found nothing, write the
   heading and one line saying so — "Nothing ranked: 40 lines, one job, no callers
   waiting on it." An absent section reads as *not looked at*, and the next auditor
   pays to look again.

```md
## Improvements

1. **`common_dir()` cuts on a path that no longer exists.** One line, removes a
   whole class of silent mis-render. *(simple, important)*
2. **The tree could collapse.** Twelve files is fine; forty is not. *(medium, later)*
```

Keep each file's doc to a screen. It is read beside the source, in the Files tab.

## 5. `doc/method/*.md` and `doc/property/*.md`

The page already prints the **source**, so never restate it. Write what the source
cannot show: why it exists, what it guarantees, what bites, what a caller must
know. Every ⚠ that fails silently belongs here.

A **property** usually has no source at all — an instance field assigned in the
constructor leaves nothing on the prototype — so the prose is the whole page.

**Two shapes the lists cannot hold, and what to do instead:**

- **A second class, or a subclass.** `methods:` reads one `subject`, and three
  modules hit this on the same day — `ext/editor` (`History` + `Block`),
  `ext/Saver` (a base plus three backends), `ext/Draggable` (`Sortable extends
  Draggable`). **Declare the base as `subject:`, then subclass `Doc` and call
  `members()` again for the rest:**

  ```js
  class DragDoc extends Doc {
  	api(section){
  		super.api(section);
  		this.members(section, Sortable, { methods: "locate before row", prefix: "Sortable." });
  	}
  }
  ```

  `prefix` keeps the sets apart in the url (`/Draggable/api/Sortable.locate/`)
  **and** in the filename (`doc/method/Sortable.locate.md`), so a subclass's
  override cannot quietly overwrite the base's page or inherit its prose. Worked
  example: [`ext/doc/api/api/`](/framework/ext/doc/api/api/).

  Putting the second class in a `notes:` page instead is the older workaround. It
  loses the source pane and the url per member — use it only when the second class
  has one or two members worth naming.
- **A symbol member.** `[Symbol.iterator]` cannot be named in a whitespace-split
  string. Document it as a **note** (`notes: "iteration"`), which is the right home
  anyway — the interesting part is the protocol, not the function body.

## Auditing an existing module

In order. Each step's output is a finding, ranked simple + important first.

1. **Read every file in the directory**, including the ones you did not touch.
   Consider purpose, current state, simplicity, complexity, and future.
2. **`ls` against `files:`.** Every non-`doc/`, non-`ai/` file listed? Every listed
   file still there? This list goes stale silently — nothing crawls.
3. **Every name in every list has its `.md`** — and **every `.md` is in a list.**
   Both directions, and the second is the one that gets skipped. Forward: a missing
   file renders *"Not written yet — doc/method/x.md"*; open the page and look.
   Reverse: an orphaned `.md` sitting on disk with no entry in any list is prose
   somebody wrote that **no url reaches** — invisible, and it looks like coverage
   when you count files. `ext/AITask` had one.

   ```bash
   ls doc/*.md doc/method/*.md doc/property/*.md      # what exists
   grep -E "notes:|methods:|properties:|files:" page.js   # what is reachable
   ```
4. **Every `.md` still true.** A renamed method, a changed default, a trap that was
   fixed. Stale docs are the failure mode this whole system exists to prevent.
5. **The readme's sections.** Any longer than two paragraphs → break out to
   `doc/<name>.md`, summarize, link, and add to `notes:`.
6. **The Overview's demos.** Can a reader *see* it work, see the code that produced
   it, and compare its variants without scrolling? If not, that is a finding.
7. **Who uses it.** Grep the whole framework for importers and callers. Document
   them in the readme (one line each, with a link to their page). A module with no
   callers is itself the finding.
8. **Load the page in a browser** at 1600. Console errors, `.md-error` boxes,
   horizontal overflow. A doc page that throws is worse than no doc page.

## ⚠ Never cite a line number

`Router.js:47` is wrong within a week and nothing detects it. The 2026-08-15 audit
found **every** numeric citation in `core/Router` had drifted — some by 17 lines,
three pointing at a `console.log` that had been deleted — and the same rot in
`core/Sidebar`. They read as precise, which is what makes them expensive.

Cite the **enclosing method, selector or export** instead: *"in `mark_links()`"*,
*"the `.tab-bar` rule"*. Those move with the thing they name. If you truly need to
point at a line, quote the line itself — a quote that no longer matches is
greppable, where a number that no longer matches is invisible.

## The rules that keep biting

- **⚠ Never build DOM after an `await`.** Capturing is synchronous. In a `content()`,
  **return** `md.file(...)` — do not await it.
- **⚠ Resolve against `import.meta`, never the document.** `md.file(import.meta, …)`.
  The SPA fallback makes the document url the *route*.
- **⚠ Links inside a `doc/*.md` must be ABSOLUTE.** A fetched file's relative links
  resolve against **the file's own path** (`md.resolve` does this deliberately, so
  the same link works on GitHub) — which mirrors `doc/`, not the section's route.
  So `[capture](../property/capture.md)` from a note lands nowhere near
  `/View/api/capture/`. Write the route: `/framework/core/View/api/capture/`. Two
  separate audits wrote it wrong before catching it.
- **⚠ A module of loose functions still gets a real API tab.** A file exporting
  several unrelated functions has no single owner — so make one. Two spellings,
  both verified working:

  ```js
  import * as Ask from "./Ask.js";                  // the whole module, as the subject
  export default new Doc({ subject: Ask, methods: "ask chat thread start", … });

  subject: { source, member, patched, dedent }      // or hand-built, when you want a subset
  ```

  Prefer `import * as` — it cannot silently omit an export the way a hand-built
  object can, and one auditor nearly hid five of eight functions that way. This is
  the shape most `ext/` modules have, and the reason to reach for it over
  prose-only notes is that members then get real source panes and real urls.
- **⚠ A page nobody links to does not exist.** A new page must be in its parent's
  `children:`, or linked from the page it is about. Nothing crawls the filesystem.
- **⚠ A `Doc` that is ALSO a nav section needs `leaf: true`.** `framework/page.js`'s
  `sections()` lists a section's children as sidebar sub-entries — so converting a
  top-level page (`styles/`, `ui/`, `ext/`) to a `Doc` spills *Overview · API · Docs
  · Files* into the site sidebar as if they were pages. `leaf` is the page saying
  "I present myself, not my children." Only bites the handful of pages that are both.
- **⚠ `p()` and `h1`–`h6` handle backticks and only backticks.** Anything with bold,
  links or tables goes through `md()`.
- **⚠ A backtick inside a `` css(`…`) `` template literal kills the file.** Including
  inside a CSS comment.
- **Comments in code: near zero.** A comment earns its place only by stating a trap
  the code cannot show. Everything else belongs in these files.

## Done means

Every module you touched has all six artifacts current, its page loads clean at
1600, every list matches the filesystem, and the readme names who uses it. Say in
your summary which of the six you changed, and what you deliberately left — a
deferral you named is a finding; a deferral you did not is a hole.
