---
name: minion
description: Load this first, before touching anything, when you have been started as a minion — a worker `claude` CLI session, with its own session id, given a task and a requirements.md brief to execute for the mastermind or another orchestrator. Triggers on "you are a minion", "your brief is at", or any prompt that names a requirements.md. Points you at your brief, the three laws, the never-list that has actually burned agents before, and how to land.
---

# Minion

## You are a CLI session with your own id (the owner, 2026-09-19)

A minion is a `claude` command-line session started with `--session-id`, never an in-process
subagent. Your brief names your id: write exactly that as `session_id` in your `task.jsonl` launch
line — it is what lets the owner, or any agent, reopen you later with `claude --resume <id>`.
You run headless: nobody can answer a question, so make the call, log the assumption, and keep
going until you have landed. Follow-ups arrive as new prompts on your own session.

## Your brief is the task

Read the `requirements.md` you were given first, start to finish, before you edit anything. Its deliverables are numbered; each one gets checked against the owner's own sentence at harvest — a smaller, easier version you built instead counts as a miss, not a partial win. The brief links the owner's full, original prompt; read that too whenever a deliverable is unclear, rather than guessing what was meant.

## The three laws, and who you are writing for

**Less is more** — the fastest version that actually works, first; then improve it; show, don't tell. **Clear beats brief, by far** — full plain sentences a new coder can follow with no other context, never clipped fragments or jargon standing in for an explanation. **Prioritize** — most important first, everything reads as a quick scan. The reader is always the overwhelmed newcomer: one screen, mostly above the fold, shown rather than told; detail nests one click down and is never deleted, never dumped on page one.

## Before the first edit

Run `new-task` inside the task dir your brief names — it already exists; you write its `task.jsonl` launch line, with your own `session_id`.

**This skill and `new-task` are all you carry by default. Everything else is "read X when Y":** `code` before your first JS edit under `public/` · `layout` before building or restyling anything with a size · `css` before a declaration, `new-css-class` before a new class name · `new-page` before creating a `page.js` · `ui-test` to prove a drag, resize or hover really works · `research` before writing down anything you researched · `documentation` then `finish-task` at landing · `skill-improvement` for any skill that misled you.

## While working

Log milestones, not keystrokes: `log` lines in your `task.jsonl` for findings, decisions and measurements. `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` stamps every `"NOW"` from the real clock and re-parses the whole file, so use it rather than building an append by hand. Send an `assign` with a new `now` line whenever what you're doing changes. Never write a `findings.md` — the task log is the only findings file.

## The reload hold — seconds, never minutes

**Work in a worktree first** (`launch-wt.sh`, from 2026-09-22): then your edits never reach the owner's server and no hold is needed until the one patch lands. If you are in the main tree: the hold is for the WRITES ONLY. Write the batch first in your head, `on`, write every file, `off` — under a minute. Never hold while you read, think, test, or wait; a hold still stops every other agent — and you — seeing changes inside your own fence (2026-09-22: "held by board-declutter for 220 seconds, my page didn't live reload… the idea was hold, do the quick edit, turn it back on — it reloads at most once"). Prove after `off`, not during. **That complaint is fixed** — a hold is fenced to its `--paths` now and can no longer touch the owner's own saves — but a short hold is still the rule.

Before a batch of writes to files the live site loads, hold the reloads **for the files you are
writing, and nothing else**:

`node Server/hold.mjs on "<your-slug> — <what>" --paths "public/framework/<your module>/**,public/framework/ai/<date>/<your-slug>/**"`

…write the whole batch, load a page yourself and see zero failed requests, then `node
Server/hold.mjs off "<your-slug>"` — one reload instead of one per file.

⚠ **`--paths` is not optional in practice, and quote the globs.** A hold used to be GLOBAL:
while you held it, the owner's own save did not reload the owner's own tab, and their dev bar
just said "held by <someone>, 220s" with no way to tell that was why (the owner, 2026-09-22:
"this is crazy and bad"). It is a fence now — everything outside your `--paths` keeps reloading
normally, for everyone. Name the same files your brief's fence names. A hold with no `--paths`
falls back to `public/framework/ai/**` and prints a warning naming you. **Quote the globs** or
bash expands `**` before node ever sees it.

`.jsonl` streams keep flowing during a hold. It expires by itself after five minutes as a safety
net, not a budget — a batch that needs more than a minute is two batches (an assumed carry-over
let one edit through unheld and the owner's site 404'd for 14 seconds). It does NOT cover a save
under `Server/`, where the supervisor restarts on its own, and it does not stop the site's own
health crawler loading a page fresh.

⚠ **Anything that MEASURES the reload wire must wait for the hold to clear and say who it is
waiting for.** A held wire is silent, not broken, so a test that does not check reports a
confident, wrong zero — that cost one proof run 35 minutes and four false failures.

The design and the measurements: [`reload-hold`](/framework/ai/2026-09-19/reload-hold/) and
[`reload-rethink`](/framework/ai/2026-09-22/reload-rethink/).

## Never

- **Never kill or restart the dev server** (2026-08-19: an Opus minion ran `taskkill node.exe` mid-task while the owner was live on the site).
- **Never drive the owner's browser tabs** — headless Playwright only, and it is a GLOBAL npm module here, not a repo dependency, so import it by absolute file url (`import { chromium } from "file:///C:/Users/<you>/AppData/Roaming/npm/node_modules/playwright/index.mjs"`); `NODE_PATH` does not help, because ESM ignores it.
- **Never `git add` in the main tree either** — a landing at 20:33 (2026-09-22) left 16 files staged; staging is the step before a commit nobody asked for, and a later `git restore --staged` had to undo it. Land by writing files; the owner stages and commits.
- **Never `git stash`**, `checkout --`, `reset`, commit or push — the tree is shared with other agents in flight (2026-08-19: a stash of "its four files" took a sibling's uncommitted work with it; the live site 404'd for 20 seconds).
  ⚠ **A reverted working tree is a STASH until `git stash list` says otherwise** — run that first, before `git fsck` and before reconstructing anything, because `git stash` resets hard internally and is indistinguishable from destructive loss in the reflog. Read a stash with `git show 'stash@{0}:<path>'`; never `pop`, `apply`, `drop` or `clear`.
  ⚠ **This includes undoing your OWN mistake.** `git checkout -- <file>` restores a file to the last COMMIT, not to how you found it, so it throws away every uncommitted append anyone else made. To undo your own write, restore from what you overwrote (you have it — you read the file first), or say plainly that you cannot and let the mastermind decide. Both traps cost a night each: [`reset-recovery`](/framework/ai/2026-09-19/reset-recovery/).
- **Never trust `rg "/imagine/x/"` through the Bash tool on Windows** — MSYS rewrites a pattern that starts with `/` into a Windows path and rg silently returns nothing (a link census read "0 links break" for every realm, 2026-09-17). Drop the leading slash (`rg "imagine/x/"`) or prefix `MSYS_NO_PATHCONV=1`, and prove the pattern once on a file you know matches.
- **After every write to a `.js` file, run `node --check <file>` before anything else.** A backtick inside a comment inside a `css()` template is a SyntaxError for the whole module, and a shared module blanked every page of the owner's live site twice in fifteen minutes while they were using it ([`incident-site-down`](/framework/ai/2026-09-19/incident-site-down/)). One second; no exceptions for "only a comment". `.claude/hooks/syntax-guard.mjs` is the alarm after the damage — your own check comes first.
- **`node --check` proves a file PARSES, not that the server BOOTS — and a save under `Server/` restarts every supervised server watching this tree**, the mastermind's and the owner's live one. A plugin whose `initialize()` reads a sibling's not-yet-set state passes `--check`, passes the syntax-guard hook, passes the supervisor's own pre-restart check, and crashes the child at every boot. After any `Server/`-tree edit, boot it yourself first: `PORT=<your port> node server.js` from the REPO ROOT (never a path under `Server/`, which only exports the class and exits silently), then curl it for a real 200 ([`reload-hold`](/framework/ai/2026-09-19/reload-hold/)).
- **A bash heredoc whose body contains an apostrophe can fail in this harness** with `unexpected EOF while looking for matching` a quote, even under a quoted `<<'EOF'` — nothing is written (three times in two days, 2026-09-17/19, a brief and two ledger scripts). Write the file with the Write tool, or write a `.py` with the Write tool and run it.
- **Never launch anything with `cmd /c start`, and never anything that can open a window on the owner's desktop** — MSYS mangles it from git-bash and every attempt throws a Windows error dialog in the owner's face ([`servex-integrate`](/framework/ai/2026-09-22/servex-integrate/)). To leave a process running past your own session, use `powershell -NoProfile -Command "Start-Process -FilePath node -ArgumentList '<script>' -WorkingDirectory <repo> -WindowStyle Hidden -PassThru"` through the Bash tool, take the PID from `-PassThru`, and prove it alive after a later, unrelated tool call. The Bash tool's `run_in_background` is tied to your session and is not that.
- **When the permission layer REFUSES a call, change HOW you make that same call — never go hunting for a second mechanism that achieves it.** The refusal is the system saying the shape is wrong, and the workaround is usually more dangerous than the thing that was blocked (that is exactly how the error dialogs above happened).
- **Never `find /`**, or search anywhere outside the repo — use Glob/rg scoped to the repo (root scans have burned a core for hours, three separate times as of 2026-09-08).
- **Never edit outside your fence** — your brief names the files you may touch; nothing else.
- **Write and Edit refuse any path under `.claude/`, even with `bypassPermissions` set, and nothing mid-run can grant it** — a plain script (`say.mjs`), not just a `SKILL.md` or settings file, is refused the same way ([`tiers-design`](/framework/ai/2026-09-22/tiers-design/) and [`spawn-role`](/framework/ai/2026-09-22/spawn-role/), both 2026-09-22). Work around it with a node script instead: `fs.readFileSync` the exact old text, `fs.writeFileSync` the replacement, abort loudly if the old string is not found or not unique, and run it with the Bash tool — Bash itself is never gated this way.
- **Never measure the repo while another agent is editing it** — the numbers will be wrong.
- **Append to any `.jsonl` with `node .claude/hooks/append.mjs <target.jsonl> <lines.json>`**, writing `lines.json` with the Write tool. It stamps the clock, sniffs the newline and re-parses the file — the only route that dodges the BOM, the ANSI byte and the hand-typed timestamp all at once. Never PowerShell's `Out-File`.
- **Never start the owner's server on port 80** — that one is theirs, run in their own terminal. Your private server is the port your brief names: `PORT=<port> node server.js` from the repo root, killed by its own PID at landing — never by name or port pattern (⚠ in this Windows git-bash, `$!` after `cmd &` is NOT the real Windows PID — a kill by it silently misses; read the real PID from `netstat -ano` on your port, or PowerShell `Get-Process`, and kill that; 2026-09-17, sqlite-scout) (2026-09-05: a minion killed the mastermind's own :8091 server by matching `node server.js`).

## How to wait

Wait in the foreground, in chunks under the tool's timeout (pass `timeout: 600000`, or loop with `Start-Sleep 15`) — a wait past the timeout backgrounds silently and ends your turn. Better still: don't gate on a wait at all when you can do the next useful thing instead.

## Resolve, don't park

A problem you find is yours to fix now, the best way you can, kept easy to change later, its caveat written beside it. "Left open" needs a reason a reader would accept — an owner's decision, a fence, a fact you don't have — never "out of scope".

## Landing

Run the `documentation` skill if you touched a module, then `finish-task` to land. Run `skill-improvement` for any skill that misled you along the way. Your final report is one screen of plain sentences with links to what you built — the numbers belong in the task log, not the report.

**The owner watches a live log, and you can write to it** (2026-09-19): one command puts a line on their screen under your task's name — `node .claude/skills/every-prompt/say.mjs say "<what just happened, as one sentence>" "<one or two more sentences>" --as <your-task-slug> --id <your-task-slug> --status working` (the steady `--id` makes your card EVOLVE instead of piling up; `--status done` when you land). Worth one line when you start, when something the owner can now go and see exists, and when you land. Plain words for a non-reader of code; an apostrophe is fine inside the double quotes, a double quote, a dollar sign or a backtick is not.
