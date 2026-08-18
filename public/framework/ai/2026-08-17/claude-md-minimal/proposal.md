# Proposal — a minimal CLAUDE.md

**Status 2026-08-17 15:40 — done.** CLAUDE.md is 36 lines. Skills: `code`, `css`, `layout`, `documentation`, `finish-task`, `new-page`, `new-css-class`, `new-task` (68 lines), `mastermind` — every one with `improvements.md`; retired css-strategy, layout-design, claim-tab, code-architecture (renamed). Skill calls are hook-logged. Pace rule fixed everywhere. **Readme retreat done: 54 readmes 8,637 → 1,441 lines, records verbatim in `doc/decisions.md`** (`../readme-retreat/`). First lifecycle test (DevBar structure section) passed and its five frictions are already applied. Left for Mike: rank the 18 shots (`/framework/ai/2026-08-17/human-ranking/rank/`); the `--measure` 52→40em and depth-cap decisions in `ext/DesignTool/doc/learned.md`.

## 1. The draft (183 lines → 36)

```md
# CLAUDE.md

Lew42 — a no-build, native-ESM web framework and a static `Server/`.

**Do not edit.**

## Laws

1. **Less is more — ASAP, As Simple As Possible.** Fastest working version first, then improve. Show, don't tell — a demo Mike can open beats a description. Question every word, line, section. Code, pages, reports: absolutely minimal. Deep docs may breathe.
2. **Clarity is the one exception.** Say the important thing simply and link the long doc; don't restate every caveat everywhere. Weigh each extra word — but five readable lines beat one complex unreadable line. New coders are the audience.
3. **Prioritize.** Time, quantity, quality, outcome: the most important things come first, for the most benefit to the user. Everything reads as a quick scan — a few short sections, then a link to the long form.

## Ask before

- Breaking a constraint: no build step (`public/` runs as-is; imports are real `.js` URLs), no server at runtime (production is static), no new npm dependency (`npx` and global tools are fine).
- Major surgery: renaming a core API, moving a responsibility, anything with a dozen callers.

## Docs point, they don't explain

This file and every `readme.md` bring a topic to your attention; the detail is in `doc/*.md` beside the module (its Docs tab, at `/<module>/doc/`). Readmes are being cut back to that shape (2026-08-17): mostly suggestions, minimal direction, past problems named in a line with the doc linked. Every module: `readme.md`, `page.js` (show, don't tell), `doc/`. Nothing crawls — a page exists once its parent's `children:` names it.

## Where to look

- `readme.md` (root) — setup, branches, deploy
- `public/framework/readme.md` → `core/` `ext/` `styles/` `ui/` `web/` — each dir's readme is its entry
- `public/framework/ai/` — the task log: open a task before the first edit (`new-task`), log as you go
- `Server/` — dev server only
- Scratch — scripts, transcripts, intermediate JSON — goes in the session scratchpad, not the repo

## Traps that never throw

- No DOM after an `await`: capture the box synchronously, fill it in a callback.
- Every CSS rule inside a layer — `base theme site util`; the order lives once, in `framework.css`.
- Resolve URLs against `import.meta`, never the document.
- Only `p()`/`h1`–`h6` read backticks; one backtick inside `` css(`…`) `` kills every page.
- Imports flow down; a parent↔child import cycle breaks only on deep reload.
```

## 2. Decisions for Mike

1. **Traps stay (5 lines) or go to a pointer?** Rec: stay. `instructions-audit.md`'s one
   durable finding is that silent traps are the highest-value always-loaded text.
2. **`new-task` named once in CLAUDE.md?** You said CLAUDE.md needn't reference skills;
   RULE#14 exists because tasks were skipped. Rec: the one mention above.
3. **RULE#4 "default to checking in" — drop?** Law#1 (fastest working version, show a demo)
   and `new-task` §0 (autonomous by default) point the other way. Rec: drop; "Ask before"
   keeps the two cases that matter.
4. **Skills → two kinds** (§3, `.claude/skill-notes.md`). *Reference* skills load once or
   when stale (`code`, `css`, `layout`); *trigger* skills are small and run every time
   (`new-task`, `new-page`, `new-css-class`, `finish`). Skills remind each other they exist.
   `css` and `new-css-class` are built; the rest await your go.
5. ~~`doc/` vs `docs/`~~ **Done:** `./doc/` on disk *and* in routes, `ext/Doc`, tab "Docs".
6. ~~CSS @layer~~ **Done, revised:** the one `@layer` statement is framework.css's; **`/app.js`
   loads framework.css and prepends its `<link>`** (not `View.js` — a class file must not
   opt you into a stylesheet; not an inline `<style>` in `index.html` — that couples the
   layer signature to every hand-written html). `fly/index.html` links framework.css itself.
   Standard procedure for footguns from now on: a line in the readme, the detail in a doc.
7. **`instructions-audit.md`** — the receipts for the last cut (47 KB → 183 lines): every doc
   failure was a *confident false statement*, not a missing one; keep traps + preferences,
   delete restatements of what files say. Consistent with your laws. Rec: keep the file,
   drop the CLAUDE.md pointer to it.
8. **Push to main** — GitHub reports `protected: true`; an owner may still bypass. Root
   `readme.md` already says "you cannot push to main". Rec: omit from CLAUDE.md.
9. **Socket localhost-only** → one line in `dev/Socket/readme.md`, as a suggestion.
   Janitor trap → memory (already there). `pkill` trap → `Server/README.md`.

## 3. Skills

Two kinds — **reference** (load once; the dos and don'ts) and **trigger** (small; run every
time the thing happens; hookable). Why: `.claude/skill-notes.md`. Loads counted across the
209 transcripts in `~/.claude/projects/c--Code-lew42-monorepo/`.

| skill | lines | loaded | becomes |
|---|---|---|---|
| **css** (new, built) | 35 | — | reference, re-invoked when stale. Step 1 is *read framework.css itself* — exact definitions are the source of truth, the skill restates nothing. Ladder, layers, container-not-item, `new-css-class`, `analyze()`. `caveats.md` (13 one-liners, each pointing at the detail) and `strategy.md` (the five questions) beside it, read when they apply. Reminds you of `layout-design`, `new-task`, `documentation`. |
| **new-css-class** (new, built) | 20 | — | trigger: `css-scopes.txt` (bare `flex` reserves `flex-*`; `ui-` is a namespace → `ui-<thing>`; framework block off limits) + live census + owning-module prefix; a new module adds its prefix. |
| css-strategy | 139 | 1 | **retired** — its content is `css/strategy.md` + `caveats.md`. |
| code-architecture | 420 | 31 | **`code`** (reference, renamed) — ≤ 100 lines: OOP-first, assign, capture trap, page shape, naming, file/dir casing, no magic, comments ≈ 0. Its §6 CSS section is now three lines pointing at `css` (done). |
| layout-design | 313 | 7 | same pattern as css → **`layout`** (reference, separate): short SKILL.md that says *read `/framework/ext/DesignTool/library/`* and the three sizing questions; caveats beside it. `code` mentions it. |
| claim-tab | 97 | 0 | → 15 lines in `layout`; deleted. |
| documentation | 332 | 9 | **`finish`** (trigger, ~40 lines) — post-task, conclusive, authoritative; readme = the AI's index (every important doc summarized + linked); page.js shows; `doc/` detail, stands alone; parent links it. `doc/<note>.md` along the way when a caveat surfaces. Principles block already added to the current skill. |
| new-task | 243 | 31 | trigger; **cut** to ~50: the two JSON shapes, the hooks note, the landing line. |
| — | | | **`new-page`** (trigger, new): page.js shape, parent `children:`, `doc/`, three sizing questions in one line. |
| check-claude-usage | 101 | 47 | keep; trim. |
| fork-claude-session | 314 | 26 | reference; keep; trim. |
| mastermind | 232 | 2 | keep; yours — its briefs must carry Law#1 (see §7). |

**Descriptions are the always-loaded cost** (~1k tokens for nine today): one sentence each —
what it is, and *"load once before…"* or *"run every time you…"*.

**Hook:** `ledger.mjs` gets a `PostToolUse` matcher on `Skill` (five lines) so every skill
call lands in the task log — that is what makes trigger skills auditable, and lets
`new-page` log and link the page it created.

**Too strong → suggestion:** documentation's "all six artifacts, missing is a finding",
"`doc/file/readme.md.md`", "Improvements heading never omitted"; new-task's "refresh usage
every 15 min". **Stay rules:** assign-based constructor, `import.meta`, no `window.app` in
`framework/`, propose a new core name, four widths for any layout.

**CSS registry:** already exists and can't go stale — `grep -rl "View.stylesheet" public/`;
the class prefix is the namespace. A curated file would be the next thing to rot.

## 4. CSS @layer — DRY fix

**Fact (verified in a live tab):** `View.js` loads `framework.css` at module evaluation, before
any importer runs, so its `<link>` is first in `document.styleSheets` and its `@layer base,
theme, site, util;` fixes the order for every stylesheet loaded through `View.stylesheet()`.
The other 91 restatements (84 `.css`, 7 `` css`` `` templates) are redundant. code-architecture
§6's "Page.css is injected before framework.css" is stale — the load moved to `View.js`.

**One real exception:** a hand-written HTML file that `<link>`s its own CSS before the module
script (`fly/index.html` → `fly.css`) puts that sheet first, and *its* first `@layer` decides.

**Done:** `/app.js` loads framework.css and **prepends** its `<link>` (two lines), so it is
first in every document — even though core CSS like `Page.css` loads during import, before
app.js's body runs. `View.js` is CSS-free again; `fly/index.html` (imports View directly)
links framework.css itself, first. All restatements stripped; verified headless on Panel,
layers/site, `/fly/`, start/example (util > site > theme > base holds; only framework.css
declares). The trap is now: *every rule in a layer; four names; the order lives in
framework.css; a hand-written html links framework.css first.* Adding a layer = one line.
Rejected: an inline `<style>` in `index.html` (couples the layer signature to every html
file, and Page.css would still precede framework.css within layers).

## 5. `doc/` — decided

`./doc/` on disk **and** in routes, `ext/Doc`, tab label "Docs" (Mike: singular, like
`./comment/3/`). Execution: `Doc.js` (`docs` → `doc` in `SECTIONS`, `docs_section()`, `bar()`)
+ ~143 files linking `/<module>/docs/<note>/`. ⚠ Two real pages are *named* `docs` and must
not change: `/framework/styles/layouts/docs/` and `/framework/core/Page/overview/docs/`.

## 6. Readme retreat (next task, not this one)

54 readmes, 8,637 lines (avg 160; RULE#10 said one screen); 32 carry `## Decisions`.
Shape, ≤ 30 lines: **one line what · Use (a snippet) · Watch out (past problems, one line
each, doc linked) · More (page url, `doc/*.md`, key files by name).** How it reads (Mike):
no rules that might need breaking — they mislead the next agent; mostly suggestions; minimal
direction; a past problem is named simply, with the `doc/*.md` that has the detail, so the
AI can find help when it seems to apply. Existing Decisions/Open sections move verbatim to
`doc/decisions.md` (+ `notes: "decisions"`) — nothing deleted, one click down. Sonnet
workers, one per dir, briefed with the `finish` skill.

## 7. Verbosity — pages and reports

The mess is real: task pages, audit reports and readmes run 5–20× what they need. Law#1
already says *code, pages, reports: absolutely minimal*; what enforces it:
- every minion brief (mastermind, fork, Agent) opens with the three laws and a length
  budget for its deliverable — a report is a screen, a page leads with the thing itself;
- `finish` refuses to land a task page or readme that deliberates — verdicts only, detail
  one click down;
- the readme retreat (§6) is the back-fill.

## 8. Where every current rule goes

| now | goes |
|---|---|
| Precedence; LAW/RULE/SUGGESTION system | header line "this file rules"; the rest deleted |
| Prime objective | `framework/readme.md` (browsable, every `/path/`, mobile → 3440) |
| LAW#1–4 (no build, static, real URLs, no npm) | "Ask before" + root `readme.md` (already there; add the npm/npx line) |
| LAW#5 main, LAW#6 socket | omitted; `dev/Socket/readme.md` |
| Traps | 5 stay; classify → `core/View/readme.md`; pkill → `Server/README.md`; janitor → memory |
| RULE#1 propose surgery | "Ask before" |
| RULE#2 verdicts revisable, #3 name aloud, #6 little code, #7 five demo blocks, #8 no magic, #9 comments, #11 ≤ 100 lines, #13 page.js + link | `code` skill (mostly already there) |
| RULE#4 default check-in | dropped (decision 3) |
| RULE#5 short answers | Laws 1 & 3 |
| RULE#10 readme one screen | "Docs point" + `documentation` skill |
| RULE#12 no scratch | "Where to look", last line |
| RULE#14–15 tasks + logging | "Where to look", ai line + `new-task` |
| RULE#16 spent window | `check-claude-usage` skill + memory |
| SUGGESTION#1–2 | dropped |
