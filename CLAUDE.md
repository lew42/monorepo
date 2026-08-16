# CLAUDE.md

Lew42 framework site: a no-build, native-ESM web framework and the static site that hosts it.

This file holds only what **doesn't go stale**: hard constraints, traps that fail
silently, and how to work with the humans here. A statement about code belongs
next to that code, or it belongs nowhere — this file says what to watch out for
and where to look. (Receipts: `.claude/instructions-audit.md`.)

## Precedence — this file rules

**When anything dissents from `CLAUDE.md`, `CLAUDE.md` prevails.** Skills,
readmes, `doc/*.md`, proposals, memory, a subagent's brief, a previous
session's conclusion — all *downstream*: they elaborate the rules here, they do
not amend them. A skill that contradicts a constraint here is a bug in the
skill; say so and fix it. Only the person at the keyboard outranks this file,
and when they do, the change lands **here** in the same breath. (Mike, 2026-08-14.)

## The rule system — LAWS > RULES > SUGGESTIONS

Every instruction in this repo carries one of three weights, and says which
(Mike, 2026-08-15):

- **LAW** — never broken. "Always" and "never" live here, and only here. A law
  a real situation *forces* you to break was never a law — demote it to a RULE
  in the same breath, recording the case that broke it.
- **RULE** — dos and don'ts. Obey by default; deviate only with the reason
  stated at the site of the deviation, and the rule left standing behind you.
- **SUGGESTION** — tips and maybe-wisdom. Free to ignore, cheap to read, and
  where future rules come from.

Weight is **earned, not assigned**: a suggestion that keeps proving out becomes
a rule; a rule nothing has broken in long service may become a law. Adjust
weights *while conducting operations*, so they accurately shape future work — a
demotion forced by reality lands immediately in the owning document with the
evidence; a promotion to LAW is proposed to Mike, never self-granted. Numbers
are stable references (`LAW#4`, `RULE#9`), citable from any readme or doc:
append new entries, never renumber, and a moved entry leaves its number behind
as a one-line pointer.

The traps section is neither: a trap is a **fact** — you cannot disobey it,
only be bitten by it.

## The prime objective

Everything the framework offers — layouts, sections, elements, components,
pages — is **organized, visual, and browsable**: you find any thing by clicking
through previews, in the fewest possible clicks. Every thing has its own
`/path/` and full docs there (basic usage, variants, advanced usage,
overrides). The set of building blocks is small, robust, and reusable — and
every layout works from mobile to mega (3440): widescreen space gets *used*
(unstacked), not left as gutters. Everything else in this file serves this.
(Mike, 2026-08-12.)

## LAWS (never violate)

- **LAW#1 — No bundler, no build step, no transpilation.** Everything in `public/` is served as-is and must run in the browser as native ES modules.
- **LAW#2 — Static compatibility.** `server.js` is local dev only; production is pure static hosting (Cloudflare Workers static assets). Nothing may depend on server-side logic at runtime.
- **LAW#3 — Import paths are real URLs** — root-absolute (`/app.js`) or relative with an explicit `.js`. No bare specifiers.
- **LAW#4 — Never add an npm dependency without asking**, devDependencies included. The three-package list (`chokidar`, `express`, `ws`, all dev-server-only) is a feature. Tooling for the person at the keyboard — a browser driver, a profiler — installs **globally** and resolves at runtime. A work-in-progress prototype doesn't earn an npm script either.
- **LAW#5 — Never push to `main`** (protected). Branch `<yourname>/<branch-name>`; `git switch main && git pull` first.
- **LAW#6 — `framework/dev/Socket` connects only on localhost.** Keep it that way — it's part of static compatibility.

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
- **A backtick anywhere inside a `` css(`…`) `` template literal — including in a CSS comment — terminates the string.** Every page on the site dies with `missing ) after argument list`. Before trusting the browser after editing one, copy the file to `.mjs` and `node --check` it.
- **Windows: `pkill -f "node server.js"` silently matches nothing.** The orphan then busy-loops libuv on a dead console handle and pins a full CPU core. Capture the PID and `taskkill //F //PID $PID`, or from PowerShell `Stop-Process -Id <pid> -Force`. Prefer reusing the dev server already on port 80.
- **Mike's machine (only) runs a "Claude Janitor"** — a scheduled task that force-kills any `claude.exe`/`node.exe` pinning a core across two consecutive 15-min checks *and* older than 12 h (idle sessions can busy-loop; known upstream bug). A long-lived Claude session or node process can die out from under you — check `C:\Users\mike\.claude\janitor\janitor.log` before suspecting your own code; reopen with `claude --resume`. Remove: `Unregister-ScheduledTask -TaskName "Claude Janitor"`, then delete `C:\Users\mike\.claude\janitor\`.

## RULES (the working agreements)

**RULE#1 — Propose before major surgery.** A rename touching a core class, its callers and a dozen doc references is a design decision with a large edit attached. Ask in three lines and wait. A sunk edit *presents* an unsettled direction as decided, and then argues for itself. Small, local, obviously-correct fixes don't need this; anything changing an API name, a call order, or where a responsibility lives does.

**RULE#2 — A recorded decision is not a law.** Verdicts in readmes, proposals and memory were the best call on that day's evidence — reopen them when the evidence changes or they fight what's in front of you, and never argue from the record against the person at the keyboard. When *writing* one down, give it only the firmness it earned — the LAW/RULE/SUGGESTION weights above. Everything else states its reasoning and its weight, so a later reader can tell a load-bearing rule from that day's preference.

**RULE#3 — Say a new name out loud before you write it.** A name is the API and the documentation at once. Short and exactly right beats long and merely complete; earn length with rarity. If you can't name it clearly, that's the design talking — the method probably does two things or lives on the wrong class.

**RULE#4 — Default to checking in; autonomy has to be granted.** Absent "work autonomously", investigate first, then give a short summary and the one or two decisions you actually need. When autonomy *is* granted the user has left the keyboard, so a question costs an hour of nothing — make the call, state the assumption plainly, keep going.

**RULE#5 — Keep responses short and scannable — but never drop what matters.** Lead with the finding. Headings, so a long answer can be skimmed. Brevity does not license silence: if something could be important, one sentence with no elaboration is enough.

**RULE#6 — Write as little code as possible, and as little CSS as possible.** A super simple base API that just works, then extend. The default path covers most cases with no configuration; everything beyond is an override or a subclass, opted into visibly by the file that wants it. An option is API surface forever.

**RULE#7 — One demo system, five blocks.** Anything that shows an example is built from:
a `Page` (demos are pages — a directory, or an inline object child, declared in
`children:`), the gallery `preview()`/`previews()` (the only preview — clickable,
above the fold, no code), the `ext/demo` stage (the only resizable viewport), the
`ext/layout` panel (the only interactive control surface), and the utility
vocabulary. Before writing a new helper that previews, frames, or arranges an
example, name which block it extends — a new sibling helper with its own styles
is a proposal, not a commit. The census that forced this rule:
`framework/ai/2026-08-09/proposal.md`.

**RULE#8 — No black magic.** Behavior you can't see from the file that implements it — a property read by a class that never mentions it, an inert marker interpreted by a `new` three files away. If a file names a class, that file should generally construct it. When coordination must cross files, make it visible at the call site.

**RULE#9 — Comments: near zero.** A comment earns its place only by stating a trap or a constraint the code cannot show — one sentence, no history, no rationale, no restating the line below. Everything else lives in the module's `readme.md` or nowhere. This applies to CSS as much as JS. When in doubt, delete.

**RULE#10 — Readmes: one screen of current state** — what the module is and what will bite you. Design discussion, alternatives and history move to `doc/*.md` beside it, referenced in one line.

**RULE#11 — Most files under 100 lines**, JS and CSS alike. A file over that is usually carrying commentary that belongs in the readme, or a second responsibility that belongs in a second file.

**RULE#12 — Don't pollute the repo with your own scratch work.** Launcher scripts, agent transcripts, `.tmp-*` dirs, intermediate JSON — anything that exists to *run a process* rather than to be part of the site goes in the session scratchpad. The test: *would someone cloning this repo need this file?* A process's **conclusion** can absolutely be committed; the machinery that produced it cannot.

**RULE#13 — A new module isn't done until it has a `page.js` and its parent links to it.** Nothing crawls the filesystem — an unimported page does not exist.

**RULE#14 — If you're going to change the repo, open a task first.** Run the `new-task`
skill *before the first edit* — the dashboard at `/framework/ai/` is how Mike
sees what's in flight; work that never opened a task is invisible to him.
Reading, investigating and answering questions are exempt — the moment that
turns into an edit, open the task. Unsure? Open one: a thin log costs nothing,
a missing one costs the whole record. (Mike, 2026-08-15 — this was being
skipped.)

**RULE#15 — Then log as you work** — `assign` for state, `log`/`action` lines
for findings and deeds — and prefer a log line over a chat paragraph: the log is
browsable, the chat scrolls away. (Format: `ext/JSONL/readme.md`.) The ledger
hooks are wired (2026-08-15): they append the edit `action` lines, resume/end
lines, and gate a stop on an unfinished step ledger — hand-write `action` only
for `run` deeds. (Subagents running under a session older than the wiring have
no hooks; they hand-log.) If `.claude/settings.json` ever loses its `hooks` key,
log everything by hand again. Task logs are moving to `<page>/ai/<slug>/` (the
`ext/AI` task owns the move); until it lands, `new-task` and
`framework/ai/<date>/<slug>/` remain correct.

**RULE#16 — Never let Mike wake to a spent window.** Autonomous work while
he's away paces itself — heavy waves right after a window reset, taper toward
morning — so the 5-hour window in effect when he returns has real runway,
nowhere near 90%. Weekly windows likewise stay under the guardrails
(`check-claude-usage`). Escape hatch: an explicit "ignore usage
recommendations" from Mike suspends this for that run — then blasting forth
is ok. (Mike, 2026-08-15.)

## SUGGESTIONS

- **SUGGESTION#1 — Readmes and docs adopt this same hierarchy.** A module's
  Decisions and Traps already carry implicit weights; naming them
  (module-scoped: `Panel RULE#2`) makes the firmness legible and citable, and
  `LAW#n`/`RULE#n` cite this file from anywhere. Promote to a RULE once a few
  modules have worn it well.
- **SUGGESTION#2 — Cite weights by number, don't paraphrase.** `RULE#12` is
  greppable and survives rewording; a paraphrase drifts.

## Where things are

- `public/` — the entire deployable site. `public/index.html` is the universal fallback document and loads one script, `/app.js`, which constructs the App and re-exports the framework, so every page can `import { Page, p } from "/app.js"`.
- `public/framework/core/` — the core classes. Each has a `readme.md` (design record) and a `page.js` (the reader's introduction).
- `public/framework/ext/` — opt-in addons, free to patch core; **core never imports an ext**. This site opts in for every page, once, in `app.js`.
- `public/framework/styles/` — the CSS strategy, documented one page per layer.
- `public/framework/ai/` — the AI working log: a dir per day (`day.jsonl` + task dirs), a task dir per piece of work (`task.jsonl`). `ext/JSONL` assembles the logs; `ext/AITask` renders the dashboards; `ext/Timeline` draws the when; the `new-task` skill opens a task. `usage.json` is generated and gitignored.
- `public/framework/util/`, `public/framework/dev/` — `is`, `source`; the dev-only live-reload socket.
- `Server/` — dev-only Node server, never imported by browser code. `npm install && node server.js` (port 80; `PORT` to override). Express static over `public/`, then SPA fallback to `index.html`.
- Top-level dirs under `public/` named after devs (`alex/`, `arya/`, `castin/`, `edric/`, `michael/`) are personal sandboxes — transient, not framework conventions. They are also **downstream consumers**: rename freely inside `framework/`, alias on the way out.
- `public/framework/core/new/1/` is not a sketch — it's where the shipping design was proved, and its `readme.md` is the long-form record, with measurements. `new/0/` and `new/starter/` are earlier sketches. Don't import any of them.
- Deploy: `wrangler.jsonc` serves `./public` with SPA fallback. `main` → https://monorepo.lew42.workers.dev/; every branch gets `<branch-with-dashes>-monorepo.lew42.workers.dev`.

**For house style — assign-based OOP, naming, the CSS ladder, the doc-writing
split — load the `code-architecture` skill.** For any specific class, read the
`readme.md` beside it; those records are better than a summary of them would be.
