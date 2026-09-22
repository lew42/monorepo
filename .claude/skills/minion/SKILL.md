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

Load the `code` skill (and `layout`, `css` too, when the work has a size or a style to it). Then run `new-task` inside the task dir your brief names — it already exists; you write its `task.jsonl` launch line, with your own `session_id`.

## While working

Log milestones, not keystrokes: `log` lines in your `task.jsonl` for findings, decisions and measurements, timestamped from the clock read right before you write each one, never typed from memory. `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` does the stamping and re-parsing for you — every `"NOW"` becomes the real clock — so prefer it to a hand-built append (verified 2026-09-21). Send an `assign` with a new `now` line whenever what you're doing changes. Never write a `findings.md` — the task log is the only findings file.

## The reload hold — block live reload for a batch of writes

If your batch touches a file the live site loads (a shared module, `.css`, a page every tab already has open), take the hold FIRST: `node Server/hold.mjs on "<your-task-slug> — <what>"`. Every dev server watching this repo — the owner's, the mastermind's, your own private one — then queues every change instead of reloading anyone, while `.jsonl` streams (chat, the AI board) keep flowing untouched; write your whole batch; `node --check` on each file is automatic (the syntax-guard hook); then `node Server/hold.mjs off "<your-task-slug>"` — one reload, once, for everything you changed. It expires on its own after 5 minutes if you forget. Skip it for a single harmless file; use it the moment "someone's tab might flash mid-edit" is even a maybe. `ai/2026-09-19/reload-hold/requirements.md` has the full design.

## Never

- **Never kill or restart the dev server** (2026-08-19: an Opus minion ran `taskkill node.exe` mid-task while the owner was live on the site).
- **Never drive the owner's browser tabs** — headless Playwright only.
- **Never `git stash`**, `checkout --`, `reset`, commit or push — the tree is shared with other agents in flight (2026-08-19: a stash of "its four files" took a sibling's uncommitted work with it; the live site 404'd for 20 seconds).
  ⚠ **If the working tree has REVERTED — files you saw are suddenly missing or back to an old
  version — run `git stash list` FIRST, before `git fsck` and before reconstructing anything.**
  `git stash` runs a `reset --hard` internally, so the reflog shows only "reset: moving to HEAD"
  and it looks exactly like destructive loss. 2026-09-19: a stash of 1,389 files was read as a
  destructive reset, ~150 files were written off as gone for good, and four tasks spent a night
  rebuilding from transcripts what `stash@{0}` held intact the whole time. Read a stash with
  `git show 'stash@{0}:<path>'` — never `pop`, `apply`, `drop` or `clear`.
  ⚠ **This includes undoing your OWN mistake.** `git checkout -- <file>` does not restore the file to how you found it — it restores it to the last COMMIT, throwing away every uncommitted append anyone else made. 2026-09-19: an agent overwrote `ai/usage.jsonl` outside its fence, reached for `git checkout --` to put it back, and silently destroyed five days of samples; it then reported the file "restored, confirmed clean" in good faith, because it looked clean. To undo your own write, restore from what you overwrote (you have it — you read the file first) or say plainly that you cannot, and let the mastermind decide.
- **Never trust `rg "/imagine/x/"` through the Bash tool on Windows** — MSYS rewrites a pattern that starts with `/` into a Windows path and rg silently returns nothing (a link census read "0 links break" for every realm, 2026-09-17). Drop the leading slash (`rg "imagine/x/"`) or prefix `MSYS_NO_PATHCONV=1`, and prove the pattern once on a file you know matches.
- **After every write to a `.js` file, run `node --check <file>` before anything else.** A backtick inside a comment inside a `css(`…`)` template is a SyntaxError for the whole module, and a shared module (`ui/tree/tree.js`) blanked every page of the owner's live site twice in fifteen minutes on 2026-09-19 while the owner was using it. One second; no exceptions for "only a comment". `.claude/hooks/syntax-guard.mjs` blocks you the moment a `.js` write stops parsing — that is the alarm after the damage; your own check comes first.
- **`node --check` proves a file PARSES, not that the server BOOTS.** A `Server/*.js` edit can throw the moment its code actually RUNS — `initialize()` reading a property that only exists later in the plugin chain, say — and `--check` is silent about that; the FIRST thing to hit it is whatever restarts the child, which for `Server/run.js`/`server.js`'s own supervisor could be the owner's server or the mastermind's own. That exact crash took the mastermind's supervised `:8123` down for real on 2026-09-19 (`ai/2026-09-19/reload-hold/`: a plugin's `initialize()` touched a sibling plugin's state one event-tick before that sibling had set it). After any `Server/`-tree edit: boot it yourself, `PORT=<your private port> node server.js`, and `curl` it — confirm "Server listening" and a real 200 — BEFORE it can reach anyone else's restart.
- **A save under `Server/` restarts every supervised server watching this tree** — the mastermind's, and the owner's live one — and **a file that parses can still fail to boot**: `node --check`, the syntax-guard hook and the supervisor's own pre-restart check all pass it. On 2026-09-19 a `LiveReload.js` whose `initialize()` read a list its own `SocketServer` had not built yet took both servers down for four minutes, with the owner on the site. Boot your Server/ save yourself before it becomes the live server (your own `PORT=<yours> node server.js`, and fetch one page from it).
- **A bash heredoc whose body contains an apostrophe can fail in this harness** with `unexpected EOF while looking for matching` a quote, even under a quoted `<<'EOF'` — nothing is written (three times in two days, 2026-09-17/19, a brief and two ledger scripts). Write the file with the Write tool, or write a `.py` with the Write tool and run it.
- **Never `find /`**, or search anywhere outside the repo — use Glob/rg scoped to the repo (root scans have burned a core for hours, three separate times as of 2026-09-08).
- **Never edit outside your fence** — your brief names the files you may touch; nothing else.
- **Never measure the repo while another agent is editing it** — the numbers will be wrong.
- **Never write a `.jsonl` with PowerShell's `Out-File`** — it adds a BOM that makes the viewer silently drop line 1. Use the Write tool, or append with `Add-Content` / `[IO.File]::AppendAllText`.
- **Never start the owner's server on port 80** — that one is theirs, run in their own terminal. Your private server is the port your brief names: `PORT=<port> node server.js` from the repo root, killed by its own PID at landing — never by name or port pattern (⚠ in this Windows git-bash, `$!` after `cmd &` is NOT the real Windows PID — a kill by it silently misses; read the real PID from `netstat -ano` on your port, or PowerShell `Get-Process`, and kill that; 2026-09-17, sqlite-scout) (2026-09-05: a minion killed the mastermind's own :8091 server by matching `node server.js`).

## How to wait

Wait in the foreground, in chunks under the tool's timeout (pass `timeout: 600000`, or loop with `Start-Sleep 15`) — a wait past the timeout backgrounds silently and ends your turn. Better still: don't gate on a wait at all when you can do the next useful thing instead.

## Resolve, don't park

A problem you find is yours to fix now, the best way you can, kept easy to change later, its caveat written beside it. "Left open" needs a reason a reader would accept — an owner's decision, a fence, a fact you don't have — never "out of scope".

## Landing

Run the `documentation` skill if you touched a module, then `finish-task` to land. Run `skill-improvement` for any skill that misled you along the way. Your final report is one screen of plain sentences with links to what you built — the numbers belong in the task log, not the report.

**The owner watches a live log, and you can write to it** (2026-09-19): one command puts a line on their screen under your task's name — `node .claude/skills/every-prompt/say.mjs say "<what just happened, as one sentence>" "<one or two more sentences>" --as <your-task-slug> --id <your-task-slug> --status working` (the steady `--id` makes your card EVOLVE instead of piling up; `--status done` when you land). Worth one line when you start, when something the owner can now go and see exists, and when you land. Plain words for a non-reader of code; an apostrophe is fine inside the double quotes, a double quote, a dollar sign or a backtick is not.
