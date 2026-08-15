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

## Precedence — this file rules

**When anything dissents from `CLAUDE.md`, `CLAUDE.md` prevails.** Skills,
readmes, `doc/*.md`, proposals, memory, a subagent's brief, and a confident
paragraph from a previous session are all *downstream* — they elaborate the
rules here, they do not amend them. A skill that contradicts a constraint above
is a bug in the skill; say so and fix it rather than following it.

Only the person at the keyboard outranks this file, and when they do, the
change lands **here** in the same breath — otherwise the next session inherits
the old rule and the correction evaporates. (Mike, 2026-08-14.)

## The prime objective

Everything the framework offers — layouts, sections, elements, components,
pages — is **organized, visual, and browsable**: you find any thing by clicking
through previews, in the fewest possible clicks. Every thing has its own
`/path/` and full docs there (basic usage, variants, advanced usage,
overrides). The set of building blocks is small, robust, and reusable — and
every layout works from mobile to mega (3440): widescreen space gets *used*
(unstacked), not left as gutters. Everything else in this file serves this.
(Mike, 2026-08-12.)

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

- **Capturing is synchronous — never build DOM after an `await`.** `View.captor` is one global with a push/pop stack, and `append_fn` restores it the instant your function *returns*, which for an `async` function is its **first `await`**. Every factory call after that appends to whatever the captor has since become. **Mechanical check: a factory call textually after an `await` is wrong.** The fix: capture the container synchronously, then fill it inside a **callback**, which re-establishes the captor — `$box.append(() => …)` or `$box.empty(() => …)`. Returning a promise is the other blessed shape.
- **The CSS layer order must be restated IN FULL in every stylesheet**: `@layer base, theme, site, util;`. The first `@layer` statement fixes the order, and a name first seen later is appended at the *end* — so one short list silently drops `site` past `util`.
- **Every rule must be inside a layer.** An unlayered rule beats *every* layer at any specificity.
- **`classify()` runs inside `super()`, before class fields initialize.** A `classes = "docs"` class field arrives too late; name the subclass instead.
- **Resolve module-relative urls against `import.meta`, never the document.** The SPA fallback makes the document url the *route*, so a document-relative fetch misses. `md.file(import.meta, …)`, `View.stylesheet(import.meta, …)`.
- **Mutual parent/child imports break only on deep reloads.** `import` hoists regardless of textual position, so a circular partner reads an uninitialized binding: `/a/` throws while `/a/b/` works. Imports flow **down**; the backref arrives by adoption.
- **`p()` and `h1`–`h6` handle backticks — and only backticks.** The prose factories turn `` `x` `` into a `<code>` span; bold, links and tables still render as literal text — use `md()` for anything formatted. Every *other* factory appends strings raw, backticks included: a backtick in `li()`, `td()`, or a string child renders literally.
- **A 404 stylesheet no longer hangs the app** — it resolves and warns, and the page renders unstyled. Check the console.
- **A backtick anywhere inside a `` css(`…`) `` template literal — including in a CSS comment — terminates the string.** Three files shipped it in one session and every page on the site died with `missing ) after argument list`. Before trusting the browser after editing one, copy the file to `.mjs` and `node --check` it.
- **Windows: `pkill -f "node server.js"` silently matches nothing.** The orphan then busy-loops libuv on a dead console handle and pins a full CPU core (several once burned ~4.7 cores). Capture the PID and `taskkill //F //PID $PID`, or from PowerShell `Stop-Process -Id <pid> -Force`. Prefer reusing the dev server already on port 80.
- **Mike's machine (only) runs a "Claude Janitor"** — a scheduled task, every 15 min, that force-kills any `claude.exe`/`node.exe` sustaining >90% of a core across two consecutive checks *and* older than 12 h. It exists because idle Claude Code sessions can busy-loop and pin cores (known upstream bug; 11 once burned ~13 cores). So on that machine a long-lived Claude session or node process can die out from under you — check `C:\Users\mike\.claude\janitor\janitor.log` before suspecting your own code, and reopen killed sessions with `claude --resume`. Other devs don't have it. Remove: `Unregister-ScheduledTask -TaskName "Claude Janitor"`, then delete `C:\Users\mike\.claude\janitor\`.

## Working agreements

**Propose before major surgery.** A rename touching a core class, its callers and a dozen doc references is a design decision with a large edit attached. Ask in three lines and wait. A sunk edit *presents* an unsettled direction as decided, and then argues for itself. Small, local, obviously-correct fixes don't need this; anything changing an API name, a call order, or where a responsibility lives does.

**A recorded decision is not a law.** Verdicts in readmes, proposals and memory were the best call on that day's evidence — reopen them when the evidence changes or they fight what's in front of you, and never argue from the record against the person at the keyboard. When *writing* one down, give it only the firmness it earned: "never" and "always" belong to things that actually break (the constraints and traps above). Everything else states its reasoning and its weight, so a later reader can tell a load-bearing rule from that day's preference. Over-firm documentation trains the reader to obey rules that never needed to exist.

**Say a new name out loud before you write it.** A name is the API and the documentation at once. Short and exactly right beats long and merely complete; earn length with rarity. If you can't name it clearly, that's the design talking — the method probably does two things or lives on the wrong class.

**Default to checking in; autonomy has to be granted.** Absent "work autonomously", investigate first, then give a short summary and the one or two decisions you actually need. When autonomy *is* granted the user has left the keyboard, so a question costs an hour of nothing — make the call, state the assumption plainly, keep going.

**Keep responses short and scannable — but never drop what matters.** Lead with the finding. Headings, so a long answer can be skimmed. Brevity does not license silence: if something could be important, one sentence with no elaboration is enough.

**Write as little code as possible, and as little CSS as possible.** A super simple base API that just works, then extend. The default path covers most cases with no configuration; everything beyond is an override or a subclass, opted into visibly by the file that wants it. An option is API surface forever.

**One demo system, five blocks.** Anything that shows an example is built from:
a `Page` (demos are pages — a directory, or an inline object child, declared in
`children:`), the gallery `preview()`/`previews()` (the only preview — clickable,
above the fold, no code), the `ext/demo` stage (the only resizable viewport), the
`ext/layout` panel (the only interactive control surface), and the utility
vocabulary. Before writing a new helper that previews, frames, or arranges an
example, name which block it extends — a new sibling helper with its own styles
is a proposal, not a commit. The census that forced this rule (fourteen
mechanisms, four of them preview cards): `framework/ai/2026-08-09/proposal.md`.

**No black magic.** Behavior you can't see from the file that implements it — a property read by a class that never mentions it, an inert marker interpreted by a `new` three files away. If a file names a class, that file should generally construct it. When coordination must cross files, make it visible at the call site.

**Comments: near zero.** A comment earns its place only by stating a trap or a constraint the code cannot show — one sentence, no history, no rationale, no restating the line below. Everything else lives in the module's `readme.md` or nowhere. This applies to CSS as much as JS. When in doubt, delete.

**Readmes: a concise summary of the current state.** One screen: what the module is, and the two or three things that will bite you. Long design discussion, alternatives and history move to `doc/*.md` beside it, referenced in one line. A readme is not a running commentary on past mistakes.

**Most files under 100 lines**, JS and CSS alike. A file over that is usually carrying commentary that belongs in the readme, or a second responsibility that belongs in a second file.

**Don't pollute the repo with your own scratch work.** Launcher scripts, agent transcripts, `.tmp-*` dirs, intermediate JSON — anything that exists to *run a process* rather than to be part of the site goes in the session scratchpad. The test: *would someone cloning this repo need this file?* A process's **conclusion** can absolutely be committed; the machinery that produced it cannot.

**A new module isn't done until it has a `page.js` and its parent links to it.** Nothing crawls the filesystem — an unimported page does not exist.

**If you're going to change the repo, open a task first.** Run the `new-task`
skill *before the first edit* — building anything, changing anything, fixing
anything, a refactor, a doc pass, a design change. Not "when it feels big
enough": the dashboard at `/framework/ai/` is how Mike sees what's in flight,
and work that never opened a task is invisible to him. Exempt: answering a
question, reading/investigating, and preparation — the moment that research
turns into an edit, open the task. When genuinely unsure, open one; a thin task
log costs nothing, a missing one costs the whole record. (Mike, 2026-08-15 —
this was being skipped.)

**The log is the channel.** `new-task` gives you `framework/ai/<date>/<slug>/`
and an append-only `task.jsonl` the day dashboard renders live. Log as you work
— `assign` for state, `log`/`action` lines for findings and deeds — and prefer
a log line over a chat paragraph: the log is browsable, the chat scrolls away.
(Convention adopted 2026-08-14; format: `ext/JSONL/readme.md`.)

**Where a log lives is moving: beside its page, not under a date.** Mike's call,
2026-08-15 — the date is a *field* (`requested_at`), not a path, and a task that
spans two days has to lie about one. The destination is `<page>/ai/<slug>/task.jsonl`
with the same `TaskJSONL` format, the dir listing as the index, and the aggregate
board at `/ai/`. **Half-landed:** the dev rail already opens and chats threads
there (`dev/DevBar/ask.js`), and every Ask RPC now takes a `task` path under
`public/`. Still to come, as the `ext/AI` task: the browsable `<page>/ai/` route,
the board crawling `*/ai/*/task.jsonl` everywhere, and the move off
`/framework/ai/`. Until that lands **`new-task` is still correct** — open new
tasks under `framework/ai/<date>/<slug>/`, because that is what the board reads.

## Where things are

- `public/` — the entire deployable site. `public/index.html` is the universal fallback document and loads one script, `/app.js`, which constructs the App and re-exports the framework, so every page can `import { Page, p } from "/app.js"`.
- `public/framework/core/` — `View`, `Page`, `Router`, `App`, `Sidebar`. Each has a `readme.md` (design record) and a `page.js` (the reader's introduction).
- `public/framework/ext/` — opt-in addons, free to patch core; **core never imports an ext**. This site opts in for every page, once, in `app.js`.
- `public/framework/styles/` — the CSS strategy, documented one page per layer.
- `public/framework/ai/` — the AI working log: a dir per day (`day.jsonl` + task dirs), a task dir per piece of work (`task.jsonl`). `ext/JSONL` assembles the logs; `ext/AITask` renders the dashboards; `ext/Timeline` draws the when; the `new-task` skill opens a task. `usage.json` is generated and gitignored.
- `public/framework/util/`, `public/framework/dev/` — `is`, `source`; the dev-only live-reload socket.
- `Server/` — dev-only Node server, never imported by browser code. `npm install && node server.js` (port 80; `PORT` to override). Express static over `public/`, then SPA fallback to `index.html`.
- Top-level dirs under `public/` named after devs (`alex/`, `arya/`, `castin/`, `edric/`, `michael/`) are personal sandboxes — transient, not framework conventions. They are also **downstream consumers**: rename freely inside `framework/`, alias on the way out.
- `public/framework/core/new/1/` is not a sketch — it's where the shipping design was proved, and its `readme.md` is the long-form record, with measurements. `new/0/` and `new/starter/` are earlier sketches. Don't import any of them. The Pager tier that lived at `core/legacy/` is deleted; `Pager` itself is vendored at `michael/pager/legacy/` for that sandbox's demos.
- Deploy: `wrangler.jsonc` serves `./public` with SPA fallback. `main` → https://monorepo.lew42.workers.dev/; every branch gets `<branch-with-dashes>-monorepo.lew42.workers.dev`.

**For house style — assign-based OOP, naming, the CSS ladder, the doc-writing
split — load the `code-architecture` skill.** For any specific class, read the
`readme.md` beside it; those records are better than a summary of them would be.
