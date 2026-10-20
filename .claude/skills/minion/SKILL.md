---
name: minion
description: Load this first, before touching anything, when you have been started as a minion — a worker `claude` CLI session, with its own session id, given a task and a requirements.md brief to execute for the mastermind or another orchestrator. Triggers on "you are a minion", "your brief is at", or any prompt that names a requirements.md. Points you at your brief, the three laws, the never-list that has actually burned agents before, and how to land.
---

# Minion

**First call refused with nobody to approve it? Stop and tell your parent — in one message.** A minion spawned with `permission_mode: acceptEdits` can Write and Edit but every Bash, node and MCP call (servex, site) is refused, and no approver exists in a Servex session. Say "my Bash/MCP calls are refused — respawn me with `permission_mode: bypassPermissions`" to your parent and end the turn. Never try a second mechanism to get the same thing done (three failed cross-session attempts cost a turn on 2026-10-02, `framework-home`; the CLI version of the same bug is 2026-09-19's). Servex's `minion` role now spawns with `bypassPermissions` by default, so this should be rare.

**Your part of the build order:** build (in the worktree), test, fix. Readmes and skills are your mastermind's to refine, not yours: say in your report which readme or doc your change made out of date, and it updates them. A module you create from scratch gets its first readme as part of building it. Your mastermind runs the docs, the review and the merge unless your brief hands them to you (the order is in `sub-mastermind`).

**A skill let you down?** Append one line to its `improvements.md` (`skill-improvement`); don't edit the shared `SKILL.md` itself. The system architect reads those files and applies them. Refining readmes is your mastermind's job, not yours.

## Read the folder's ai/log.jsonl first (the owner, 2026-09-29)

Any folder may have `ai/log.jsonl`: a short index of the AI work done there — sessions started or ended (with a title), tasks opened or landed, decisions — each line pointing to its detail file. Before your first edit in a folder, if `<folder>/ai/log.jsonl` exists, read its last 100 or so lines (never the whole file) and follow what it says. When you open or land a task there, or make a decision there, append ONE line with a pointer to the detail. Step-by-step progress never goes in it: that stays in your own task.jsonl.

## Quick fixes: take, write, smoke-test, merge, return

1. Call the Servex MCP tool `take_worktree()`; it gives `{id, path, branch, url}`.
2. Write into `path` and commit there.
3. Run `node Server/merge.mjs <path> <pages you touched>`: the smoke test plus the serialized merge. On a failure, fix and rerun. A full-size branch is refused until `node Server/review.mjs <taskdir> <worktree>` has run, and that needs a `requirements.md` in the task dir. **Run `review.mjs` from the MAIN tree, or pass an absolute MAIN path as `<taskdir>`** — it resolves `<taskdir>` against your cwd, and the merge gate reads only MAIN's `public/framework/ai/`, so a review written into your worktree's copy of the task dir is invisible to it and the merge is refused after a real, paid review (two minions hit this on 2026-10-02). `<worktree>` is the only worktree argument. Before trusting your worktree's `task.jsonl`, check whether MAIN already holds a copy that has drifted from it, and append the missing lines there with `append.mjs`.
4. Call `return_worktree(id)` when done or unused.
5. Servex always keeps one ready, so don't start your own worktree for a small fix.
6. **Never link a worktree's `node_modules` to the main tree's** (no junction, no symlink, no mklink). Deleting that worktree deletes through the link and empties the main `node_modules`, and Servex crash-loops (2026-09-22, and again 2026-09-29 13:53–15:02, which killed every agent). If `take_worktree()` says all are taken, run `node Server/worktree-up.mjs <slug>`: it makes a private worktree with its own server, which merge.mjs needs for its smoke test. If that fails too, message your parent; don't improvise one.
7. **Don't start servers by hand.** Your worktree's URL (from `take_worktree` or `worktree-up.mjs`) already serves it; Servex starts anything else (`start_server`). The `server-guard` hook refuses `node server.js` and `npm start`.
8. **A proof never posts as the owner.** Every server, a worktree's included, forwards chat and prompt posts to Servex, which appends them to the MAIN tree's live logs and wakes real assistants. So a proof that types into a composer, chat or ✦ sheet must stub posting (intercept the POST with `page.route` and answer it from a fixture), or post with `via:"test"` to a scratch path. Never post as `by:"owner"` (2026-09-29: a chat-hitl proof posted its demo sentence to ext/Chat/ai/chat.jsonl three times, each as the owner, and each woke two paid agents).
9. **A review finding is answered in the task log, not in review.md.** The merge gate reads `{"review":{"answer":{"n":2,"reply":"fixed: <commit> …"}}}` lines in the task dir's `task.jsonl` (`fixed:`, `declined:`, or `noted:` for a `[note]`), written through `append.mjs`. A line typed under the finding in review.md is invisible to it (2026-09-30: three minions answered that way and the merge stayed refused). Detail: `Server/doc/review.md`.

## You are a CLI session with your own id (the owner, 2026-09-19)

A minion is a `claude` command-line session started with `--session-id`, never an in-process
subagent. Your brief names your id: write exactly that as `session_id` in your `task.jsonl` launch
line — it is what lets the owner, or any agent, reopen you later with `claude --resume <id>`.
You run headless: nobody can answer a question, so make the call, log the assumption, and keep
going until you have landed. Follow-ups arrive as new prompts on your own session.

## Your brief is the task

Read the `requirements.md` you were given first, start to finish, before you edit anything. Its deliverables are numbered; each one gets checked against the owner's own sentence at harvest — a smaller, easier version you built instead counts as a miss, not a partial win. The brief links the owner's full, original prompt; read that too whenever a deliverable is unclear, rather than guessing what was meant.

If you were opened with `spawn_agent`'s `task: {dir}` option, you start with the readme chain for your directory; read deeper docs it names on demand. A plain CLI-started minion gets none of that automatically (`Servex/doc/readme-chain.md`).

## Before the first edit

Run `new-task` inside the task dir your brief names — it already exists; you write its `task.jsonl` launch line, with your own `session_id`. A rough prompt with no brief gets one too: Servex opens a task dir for every spawn, and your first turn names it.

**This skill and `new-task` are all you carry by default. Everything else is "read X when Y":** `code` before your first JS edit under `public/` · `layout` before building or restyling anything with a size · `css` before a declaration, `new-css-class` before a new class name · `make` before creating any file, folder, page, class or name · `ui-test` to prove a drag, resize or hover really works · `research` before writing down anything you researched · `finish-task` at landing · `skill-improvement` for any skill that misled you.

**Any page you build is seen on a 3440 screen.** Give it several columns, or a navigation column beside a centred main one, rather than one narrow column. Padding is opted into where it is needed, never a default others must undo: a region gets `.pad`, a framed box (background, border or rounded corners) gets `.card`, and a deliberate no is marked `.bleed`. Text never touches an edge, and framed boxes get a gap around them. The `page` skill's step 4 has the detail. When your task lands, a layout check screenshots its pages at four widths and flags wasted space. (In the logs of 40 tasks on 2026-09-24 and 25, the `layout` skill was never loaded, and the owner's top complaint was empty wide pages. These two lines are the part of it that matters most.)

## While working

**Report by logging, not by chat (2026-10-20, [messaging.md](/Servex/agents/doc/messaging.md)).** Your parent tails your own log (`session.jsonl`, or `task.jsonl` in an older folder): Servex sends it your new lines once a minute. So write the overview there as it changes: what you are working on, what is open, what you decided, what landed. Not the fine detail. Your last words of a turn are one line pointing at the log; chat is only for a quick clarification.

Your plan is your child tasks (the item tool's `tasks`, see [new-task](../new-task/SKILL.md)). As each step starts, call `item` with `{"start": {}}` on it and set its `now`; append a `decision` (alternative named) or a `log` caveat **the moment it happens**, never at the end — if your session dies, a fresh agent resumes from the log plus the readme. Write a log line with the `log` tool (Servex MCP); a hook or a script without it uses `node .claude/hooks/append.mjs`. Never write a `findings.md`; the task log is the only findings file. Token cost is written by Servex.

## The reload hold — seconds, never minutes

**Work in a worktree first:** then your edits never reach the owner's server and no hold is needed until the merge (`merge.mjs` holds for you). In the main tree, hold for the WRITES ONLY, fenced to your files, and quote the globs or bash expands `**`:

`node Server/hold.mjs on "<your-slug> — <what>" --paths "public/framework/<your module>/**"`

…write the whole batch, load a page and see zero failed requests, then `node Server/hold.mjs off "<your-slug>"`. Never hold while you read, think or test. `.jsonl` streams keep flowing during a hold. It expires by itself after five minutes as a safety
net, not a budget — a batch that needs more than a minute is two batches (an assumed carry-over
let one edit through unheld and the owner's site 404'd for 14 seconds). It does NOT cover a save
under `Server/`, where the supervisor restarts on its own, and it does not stop the site's own
health crawler loading a page fresh.

⚠ **Anything that MEASURES the reload wire must wait for the hold to clear and say who it is
waiting for.** A held wire is silent, not broken, so a test that does not check reports a
confident, wrong zero — that cost one proof run 35 minutes and four false failures.

The design and the measurements: [`reload-hold`](/framework/ai/sessions/2026/09/19/reload-hold/) and
[`reload-rethink`](/framework/ai/sessions/2026/09/22/f875ec48-d91a-4890-b15f-db197b55aa13/reload-rethink/).

## Never

- **Never start a process that can show a window.** In Node, every `spawn`, `exec`, `execFile` and `fork` sets `windowsHide: true`, including detached ones, so the child gets a hidden console rather than none. A child with no console opens a window for every process it starts. In PowerShell, use `Start-Process -WindowStyle Hidden` with no `-Redirect…` flags, because redirecting its output shows the window anyway. Prove it: `(Get-Process -Id <pid>).MainWindowHandle` is `0`. Pop-up windows jumped in front of the owner on 2026-09-22, 09-24 and 09-25.
- **Never kill or restart the dev server** (2026-08-19: an Opus minion ran `taskkill node.exe` mid-task while the owner was live on the site).
- **Never drive the owner's browser tabs** — headless Playwright only, and it is a GLOBAL npm module here, not a repo dependency, so import it by absolute file url (`import { chromium } from "file:///C:/Users/<you>/AppData/Roaming/npm/node_modules/playwright/index.mjs"`); `NODE_PATH` does not help, because ESM ignores it.
- **Commit your own files, by exact path, after each working step** (CLAUDE.md: `git add <your files> && git commit`, or `git commit -- <paths>`); never `git add -A` or `.` in the main tree, which sweeps in other agents' files. Never push.
- **Never `git stash`**, `checkout --` or `reset` — the tree is shared with other agents in flight (2026-08-19: a stash of "its four files" took a sibling's uncommitted work with it; the live site 404'd for 20 seconds). The `git-guard` hook blocks these in the main tree.
  ⚠ **A reverted working tree is a STASH until `git stash list` says otherwise** — run that first, before `git fsck` and before reconstructing anything, because `git stash` resets hard internally and is indistinguishable from destructive loss in the reflog. Read a stash with `git show 'stash@{0}:<path>'`; never `pop`, `apply`, `drop` or `clear`.
  ⚠ **This includes undoing your OWN mistake.** `git checkout -- <file>` restores a file to the last COMMIT, not to how you found it, so it throws away every uncommitted append anyone else made. To undo your own write, restore from what you overwrote (you have it — you read the file first), or say plainly that you cannot and let the mastermind decide. Both traps cost a night each: [`reset-recovery`](/framework/ai/sessions/2026/09/19/reset-recovery/).
- **Never trust `rg "/imagine/x/"` through the Bash tool on Windows** — MSYS rewrites a pattern that starts with `/` into a Windows path and rg silently returns nothing (a link census read "0 links break" for every realm, 2026-09-17). Drop the leading slash (`rg "imagine/x/"`) or prefix `MSYS_NO_PATHCONV=1`, and prove the pattern once on a file you know matches.
- **After every write to a `.js` file, run `node --check <file>` before anything else.** A backtick inside a comment inside a `css()` template is a SyntaxError for the whole module, and a shared module blanked every page of the owner's live site twice in fifteen minutes while they were using it ([`incident-site-down`](/framework/ai/sessions/2026/09/19/incident-site-down/)). One second; no exceptions for "only a comment". It is the only check: `.claude/hooks/syntax-guard.mjs` exists but is not wired in `settings.json` (2026-10-09).
- **`node --check` proves a file PARSES, not that the server BOOTS — and a save under `Server/` restarts every supervised server watching this tree**, the owner's live one included. A plugin whose `initialize()` reads a sibling's not-yet-set state passes `--check` and crashes the child at every boot. So make `Server/` edits in a worktree and load its URL for a real 200 before you merge ([`reload-hold`](/framework/ai/sessions/2026/09/19/reload-hold/)).
- **A bash heredoc whose body contains an apostrophe can fail in this harness** with `unexpected EOF while looking for matching` a quote, even under a quoted `<<'EOF'` — nothing is written (three times in two days, 2026-09-17/19, a brief and two ledger scripts). Write the file with the Write tool, or write a `.py` with the Write tool and run it.
- **Never launch anything with `cmd /c start`, and never anything that can open a window on the owner's desktop** — MSYS mangles it from git-bash and every attempt throws a Windows error dialog in the owner's face ([`servex-integrate`](/framework/ai/sessions/2026/09/22/session-61d99357/servex-integrate/)). To leave a process running past your own session, use `powershell -NoProfile -Command "Start-Process -FilePath node -ArgumentList '<script>' -WorkingDirectory <repo> -WindowStyle Hidden -PassThru"` through the Bash tool, take the PID from `-PassThru`, and prove it alive after a later, unrelated tool call. The Bash tool's `run_in_background` is tied to your session and is not that.
- **When the permission layer REFUSES a call, change HOW you make that same call — never go hunting for a second mechanism that achieves it.** The refusal is the system saying the shape is wrong, and the workaround is usually more dangerous than the thing that was blocked (that is exactly how the error dialogs above happened).
- **Never `find /`**, or search anywhere outside the repo — use Glob/rg scoped to the repo (root scans have burned a core for hours, three separate times as of 2026-09-08).
- **Never edit outside your fence** — your brief names the files you may touch; nothing else.
- **Write and Edit may refuse a path under `.claude/`** (seen 2026-09-22 under `acceptEdits`; under `bypassPermissions` they worked on 2026-10-09). If refused, a small node script that replaces the exact old text, run with Bash, does the same edit.
- **Never measure the repo while another agent is editing it** — the numbers will be wrong.
- **Append to any `.jsonl` only with `append.mjs`**, `lines.json` written with the Write tool (why: `new-task`). Never PowerShell's `Out-File`.
- **Never kill a process by name or port pattern** (2026-09-05: a minion killed the mastermind's own server by matching `node server.js`). Kill only a PID you started; in git-bash `$!` is not the Windows PID, so read it from `netstat -ano` or `Get-Process`.

## How to wait

Keep things moving (the owner, 2026-09-24: "be very careful to manage concurrency, not block the session, keep things moving"). First choice: don't wait at all. Start the slow thing (a server, a build, a Playwright run) in the background and do the next useful thing meanwhile. Only a result you cannot continue without is worth a wait, and then wait in chunks under the tool's timeout (pass `timeout: 600000`, or loop with `Start-Sleep 15`): a wait past the timeout backgrounds silently and ends your turn.

**Never wait by polling with Monitor or repeated short checks.** Every check is a full turn that re-reads your whole context. On 2026-09-29 one Sonnet minion reached 428k tokens and $12, mostly spent waiting. For a run longer than about 10 minutes, start it detached, write where its output goes in task.jsonl, and end your turn. Your parent, or the heartbeat, wakes you. A Servex restart kills any run you started as your own child, so ask your mastermind to launch a run that must survive (detached, `windowsHide`, `unref`).

## Resolve, don't park

A problem you find is yours to fix now, the best way you can, kept easy to change later, its caveat written beside it. "Left open" needs a reason a reader would accept — a fence, or a fact you don't have — never "out of scope", and never "waiting on the owner": decide, and write the alternative beside it (CLAUDE.md law 5).

## Landing

Run `finish-task` to land, naming any readme or doc your change made out of date. **Land in your OWN task's `task.jsonl`, never your parent's:** a `landed_at` in the parent's log tells everyone the whole task is finished (2026-09-28: that got a live task's server stopped mid-work). With no task of your own, report to your parent and let it land. Run `skill-improvement` for any skill that misled you along the way. Your final report is one screen of plain sentences with links to what you built — the numbers belong in the task log, not the report.

**A reviewer's finding is answered, not debated:** reply in `task.jsonl` as `fixed` or `declined: <why>` (`Server/doc/review.md`).

**The owner follows your work through your task's card and `task.jsonl`**, which the board renders live: keep `now` current and log as things happen. (The `say.mjs` line to the v/3 board is retired, 2026-10-13.)

## One specific question per step (the owner, 2026-10-15)

AIs try to do too much at once. Do the one thing your brief asks, in small steps, each with one specific question or check. Source: [ask-8f9c9d80](/public/framework/ai/sessions/2026/10/15/voice-20261015/ask-8f9c9d80.md).

A class you build or rebuild gets a class page with a live-instance demo: `make` skill, section 4.
