# CLAUDE.md

Lew42 framework site: a no-build, native-ESM web framework and the static site that hosts it.

This file holds only what **doesn't go stale**: hard constraints, traps that fail
silently, and how to work with the humans here. Anything about *what a method is
called* belongs next to the code — see the map at the bottom.

> A statement about code belongs next to that code, or it belongs nowhere.
> `CLAUDE.md` says what to watch out for and where to look. The moment it says
> what a method is named, it has taken on an obligation nothing can enforce —
> there is no test that fails when this file goes stale. (Receipts:
> `.claude/instructions-audit.md`.)

## Constraints (never violate)

- **No bundler, no build step, no transpilation.** Everything in `public/` is served as-is and must run in the browser as native ES modules.
- **Static compatibility.** `server.js` is local dev only; production is pure static hosting (Cloudflare Workers static assets). Nothing may depend on server-side logic at runtime.
- **Import paths are real URLs** — root-absolute (`/app.js`) or relative with an explicit `.js`. No bare specifiers.
- **Never add an npm dependency without asking**, devDependencies included. The three-package list (`chokidar`, `express`, `ws`, all dev-server-only) is a feature. Tooling for the person at the keyboard — a browser driver, a profiler — installs **globally** and resolves at runtime. A work-in-progress prototype doesn't earn an npm script either.
- **Never push to `main`** (protected). Branch `<yourname>/<branch-name>`; `git switch main && git pull` first.
- **`framework/dev/Socket` connects only on localhost.** Keep it that way — it's part of static compatibility.

## Traps that never throw

The highest-value lines in this file. You cannot find these by reading the code
and you cannot find them by testing, because nothing fails loudly.

- **Capturing is synchronous — never build DOM after an `await`.** `View.captor` is one global with a push/pop stack, and `append_fn` restores it the instant your function *returns*, which for an `async` function is its **first `await`**. Every factory call after that appends to whatever the captor has since become. **Mechanical check: a factory call textually after an `await` is wrong.** Capture the container synchronously, fill it later naming the target (`$box.append(…)`), or return a promise.
- **The CSS layer order must be restated IN FULL in every stylesheet**: `@layer base, theme, site, util;`. The first `@layer` statement fixes the order, and a name first seen later is appended at the *end* — so one short list silently drops `site` past `util`.
- **Every rule must be inside a layer.** An unlayered rule beats *every* layer at any specificity.
- **`classify()` runs inside `super()`, before class fields initialize.** A `classes = "docs"` class field arrives too late; name the subclass instead.
- **Resolve module-relative urls against `import.meta`, never the document.** The SPA fallback makes the document url the *route*, so a document-relative fetch misses. `md.file(import.meta, …)`, `View.stylesheet(import.meta, …)`.
- **Mutual parent/child imports break only on deep reloads.** `import` hoists regardless of textual position, so a circular partner reads an uninitialized binding: `/a/` throws while `/a/b/` works. Imports flow **down**; the backref arrives by adoption.
- **`p()` only handles backticks.** Bold, links and tables render as literal text — use `md()` for anything formatted.
- **A 404 stylesheet no longer hangs the app** — it resolves and warns, and the page renders unstyled. Check the console.
- **Windows: `pkill -f "node server.js"` silently matches nothing.** The orphan then busy-loops libuv on a dead console handle and pins a full CPU core (several once burned ~4.7 cores). Capture the PID and `taskkill //F //PID $PID`, or from PowerShell `Stop-Process -Id <pid> -Force`. Prefer reusing the dev server already on port 80.

## Working agreements

**Propose before major surgery.** A rename touching a core class, its callers and a dozen doc references is a design decision with a large edit attached. Ask in three lines and wait. A sunk edit *presents* an unsettled direction as decided, and then argues for itself. Small, local, obviously-correct fixes don't need this; anything changing an API name, a call order, or where a responsibility lives does.

**Say a new name out loud before you write it.** A name is the API and the documentation at once. Short and exactly right beats long and merely complete; earn length with rarity. If you can't name it clearly, that's the design talking — the method probably does two things or lives on the wrong class.

**Default to checking in; autonomy has to be granted.** Absent "work autonomously", investigate first, then give a short summary and the one or two decisions you actually need. When autonomy *is* granted the user has left the keyboard, so a question costs an hour of nothing — make the call, state the assumption plainly, keep going.

**Keep responses short and scannable — but never drop what matters.** Lead with the finding. Headings, so a long answer can be skimmed. Brevity does not license silence: if something could be important, one sentence with no elaboration is enough.

**Write as little code as possible, and as little CSS as possible.** A super simple base API that just works, then extend. The default path covers most cases with no configuration; everything beyond is an override or a subclass, opted into visibly by the file that wants it. An option is API surface forever.

**No black magic.** Behavior you can't see from the file that implements it — a property read by a class that never mentions it, an inert marker interpreted by a `new` three files away. If a file names a class, that file should generally construct it. When coordination must cross files, make it visible at the call site.

**Comments: only what the code can't say.** Walls of explanation in a core class read as anxiety and bury the code the reader came for. Design rationale, alternatives weighed and history go in the neighbouring `readme.md`. A comment that restates the line below it is worse than nothing, because it is the part that goes stale first.

**Don't pollute the repo with your own scratch work.** Launcher scripts, agent transcripts, `.tmp-*` dirs, intermediate JSON — anything that exists to *run a process* rather than to be part of the site goes in the session scratchpad. The test: *would someone cloning this repo need this file?* A process's **conclusion** can absolutely be committed; the machinery that produced it cannot.

**A new module isn't done until it has a `page.js` and its parent links to it.** Nothing crawls the filesystem — an unimported page does not exist.

## Where things are

- `public/` — the entire deployable site. `public/index.html` is the universal fallback document and loads one script, `/app.js`, which constructs the App and re-exports the framework, so every page can `import { Page, p } from "/app.js"`.
- `public/framework/core/` — `View`, `Page`, `Router`, `App`, `Sidebar`. Each has a `readme.md` (design record) and a `page.js` (the reader's introduction).
- `public/framework/ext/` — opt-in addons, free to patch core; **core never imports an ext**. This site opts in for every page, once, in `app.js`.
- `public/framework/styles/` — the CSS strategy, documented one page per layer.
- `public/framework/util/`, `public/framework/dev/` — `is`, `source`; the dev-only live-reload socket.
- `Server/` — dev-only Node server, never imported by browser code. `npm install && node server.js` (port 80; `PORT` to override). Express static over `public/`, then SPA fallback to `index.html`.
- Top-level dirs under `public/` named after devs (`alex/`, `arya/`, `castin/`, `edric/`, `michael/`) are personal sandboxes — transient, not framework conventions. They are also **downstream consumers**: rename freely inside `framework/`, alias on the way out.
- `public/framework/core/new/1/` is not a sketch — it's where the shipping design was proved, and its `readme.md` is the long-form record, with measurements. `new/0/` and `new/starter/` are earlier sketches; `core/legacy/` is the dead Pager tier. Don't import any of them.
- Deploy: `wrangler.jsonc` serves `./public` with SPA fallback. `main` → https://monorepo.lew42.workers.dev/; every branch gets `<branch-with-dashes>-monorepo.lew42.workers.dev`.

**For house style — assign-based OOP, naming, the CSS ladder, the doc-writing
split — load the `code-architecture` skill.** For any specific class, read the
`readme.md` beside it; those records are better than a summary of them would be.
