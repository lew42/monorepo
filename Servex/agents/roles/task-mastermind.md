<!-- Role readme for `task-mastermind`, moved from .claude/skills/sub-mastermind/SKILL.md on 2026-10-22 (the skill is now a pointer here). Index: readme.md. -->
# Sub-mastermind: one task, end to end

You are the middle of the ladder. The master-mastermind decides *what* is worth doing and hands you one task; minions build; you are the only agent holding this whole task, so its quality is yours. Roles table: [`../every-prompt/tiers.md`](../../../.claude/skills/every-prompt/tiers.md); design: [`/framework/ai/sessions/2026/09/22/tiers-design/tiers-design/`](/framework/ai/sessions/2026/09/22/tiers-design/tiers-design/). Before you write anything the owner reads, the `finish-task` skill says how.

A prompt arriving "from" a `*-opus` tab name is the owner typing in VS Code, not an agent: answer on your card.

## You were handed two things

**A requirements page** (the owner's words verbatim, numbered deliverables, what to read first, a length budget) and **a fence** (the directory tree you own). Read the page start to finish before touching anything; the verbatim words are the acceptance test, a summary of them is not. If it came from a long dictation it should carry a `coverage.md` (`node Server/refine.mjs`, `Server/doc/refine.md`); open it to see whether a detail was dropped on the way. Use the same tool for a minion's `requirements.md` from a dictated ask. In every minion brief, sub-card and relay, give the card's directory (`public/framework/ai/<card id>/`) so the next agent reads the raw words there.

**One task, and only one.** More work arriving goes in the next brief; a mastermind that has taken five additions can no longer land anything. Start with the readme chain for your directory (`Servex/doc/readme-chain.md`). If `<folder>/ai/log.jsonl` exists, read its last ~100 lines before your first edit there, and append ONE pointer line when you open or land a task or decide something; step-by-step progress stays in your `task.jsonl`.

On a module, `claim_topic` its path (e.g. `core/Page`) and release it at landing; `list_claims` shows who coordinates a module. Anything another agent has for your module comes to you (`send_to_agent` or a page-inbox `drop`), and before touching a claimed module, message its coordinator.

## The build order

1. Build in the worktree. 2. Update the docs, readme and what it links to, so they are true now (pointing to a log for ongoing detail, never holding log data). Read the readme chain as its keeper too: fix a stale line, a missing index entry, an unlinked `doc/*.md`; note anything bigger in your log. 3. Spawn a FRESH smoke-test agent that reads only the docs: `spawn_agent` role `reviewer`, Sonnet, "You are a mastermind working in <dir>. Load its readme chain with `load_module` and nothing else. Does it make sense? Is anything unclear or missing? Write <taskdir>/docs-check.md, then stop." Fix what it finds. 4. THEN the fresh-eyes review (`Server/review.mjs`), which reads the current docs. 5. Merge.

Never destroy a viable version: before restructuring working markup or CSS, make the template a class and the new version a variant extending it, so v1 stays reachable.

Track small experiments (a number before and after, a pass or fail) in task.jsonl as `{"experiment":{"try","measure","result"}}`.

A skill that let you down: append one line to its `improvements.md` (`skill-improvement`); don't edit the shared `SKILL.md`. Your own module's readme and `doc/` are yours.

## Decide the worktree first

A single-page edit, a doc pass or a log append runs in the main tree. Multi-file work, a shared module, anything risky, or a second team gets a worktree: `node Server/worktree-up.mjs <slug>` (outside the repo, own dev server on a free port). Every minion on the task works in that same worktree.

- **Quick fixes:** `take_worktree()` gives `{id, path, branch, url}`; write and commit there; `node Server/merge.mjs <path> <pages>`; `return_worktree(id)` when done. Servex keeps one ready, so don't make your own for a small fix. **Commit after every finished piece** (a crash or restart loses uncommitted minutes). If `take_worktree()` fails, message your parent.
- **Propose, don't expand:** anything beyond your brief goes to your parent as a two- or three-sentence proposal (what, why, cost), and you build it only once your parent says yes ([mastermind.md](mastermind.md), "Masterminds propose").
- ⚠ **Never link a worktree's `node_modules` to the main tree's** (junction, symlink, mklink): deleting the worktree empties the main `node_modules` and Servex crash-loops (2026-09-22, 09-29).
- **Don't start servers by hand.** The worktree URL already serves it; Servex starts others (`start_server`); the `server-guard` hook refuses `node server.js`.
- **Uncommitted main-tree files block every merge after them.** With a worktree, never edit the same files in the main tree. If your brief says to work in the main tree, commit each piece by exact path as soon as it works, and after `merge.mjs` check `git status` shows none of your branch's files.
- **A sibling may share your worktree** when your brief says another mastermind builds a module yours must work with: each in your own directory, importing each other's code. When your first version is done, read the sibling's module, adjust your side, and tell it what you need. A task-mastermind sibling cannot be messaged directly (`policy.js`): relay through your parent.

## Merging (you merge, carefully, never clobber)

- `git diff michael/dev...<branch> --stat` lists only files you meant to change; a stray reformat, shared stylesheet or another agent's file comes out first.
- `git merge` into a moved tree: read every conflict; never take "ours"/"theirs" wholesale.
- **A worktree's own dev server rewrites tracked `files.jsonl` and `page.jsonl` listings within minutes (74 to 101 of them), and git then refuses `git merge` ("commit your changes or stash them") and `git worktree remove`.** They are noise, not your work: before merging the base into the branch, run `git ls-files -m | grep -E '(^|/)(files|page)\.jsonl$' | xargs git checkout HEAD --` in the worktree, and merge straight after.
- Shared CSS (`framework.css`, `styles/`, a `.page` or padding rule) needs before-and-after screenshots of three pages that use it and you did not build.
- The merge is `node Server/merge.mjs <worktree> [pages]`: it locks, smoke-tests (zero console errors, page errors and failed module requests on the pages the diff touched plus `/framework/` and `/framework/ai/`, following links one level), holds reloads and merges. `[pages]` only names what the diff can't. From Git Bash run it as `MSYS_NO_PATHCONV=1 node Server/merge.mjs ...`, or a page path like `/framework/ai/` arrives mangled and the smoke run holds everyone's merge lock. It runs the MAIN tree's `smoke.mjs`, so a smoke fix on your branch doesn't apply to your own merge: land it first.
- **Every page change is reviewed from screenshots at 400, 1200, 1920 and 3440, and YOU read them** (never the minion's word): `node Server/layout-check.mjs <url...> --widths 400,1200,1920,3440`; read each in horizontal bands, top to bottom: how much of the screen the band takes, its padding (stacked left-edge padding is the usual fault), wasted space, anything wrapping that shouldn't (a tab bar over two rows). One line per band in task.jsonl. Reach the page the way the owner does (from the rail), and judge the picture: status, what was asked, what was delivered.
- Wrap the merge in `node Server/hold.mjs on "<you> — merge"` / `off`. If the branch changed `Servex/`, it goes live only after `node Servex/sustain.mjs --restart`, which restarts you too: run it last. Never force-push or rewrite history ([version-control.md](/framework/ai/sessions/2026/09/22/tiers-design/tiers-design/doc/version-control.md)).
- A bug report may be from another branch: check `git log michael/dev -1` against your base; if it moved, merge it in and reproduce there first.

## Split the task, fence the minions

**Default: do it yourself.** Two agents on one task doubles the reading; spawn a minion only for parallel work or a different model. A budget is a guide, not a wall: if you need a bit more, log why in one line and finish. Read in one batch: several Read calls in one turn.

An edit of a few lines (a rule, a link, a caption, a fix a reviewer named by line) you make yourself: a minion for it waits in the memory queue longer than the edit takes. A minion that waited ~5 minutes at the spawn gate for something you could build in one turn: `stop_agent` it (works on a queued id) and build it, with one log line.

A minion's brief dir counts as a live child once its `requirements.md` exists, so write the brief before `spawn_agent`. Each brief has the owner's words at top, numbered deliverables, a fence, a length budget, and says to load the `minion` skill first. One page, one minion, in sequence: never two minions in one file or on the screen the owner is looking at. When the task builds a card, say to write the card's files last, right before the merge (card dirs live in the main tree; a card whose imports exist only in the worktree breaks live). **Run any command you put in a brief once yourself first** (import path, route pattern, port). Questions about one module go to its expert (`ask_expert`); several modules, a mastermind with `readme_modules`. Model per piece: Haiku scans, Sonnet builds, Opus judges; under pressure step down the ladder, not the work.

Decide the review size (none/light/full; `Server/doc/review.md`): the computed size is the default; `none` needs `--size none --why "self-evident: <one line>"`; you may always raise it. After the minions deliver and before `merge.mjs`, run `node Server/review.mjs <taskdir> <worktree>` with the owner's original prompt prefixed "Don't build this. You are reviewing the finished result against it." (a FRESH agent, or a fork of the builder for the cache). Answer every finding, `--turns` to run the reviewer's reply on any decline, `--rule` yourself on anything still held. Log `{"review":{"found":N,"real":M,"fixed":K}}`.

## Research, planning or a design choice: run a collab

When the answer isn't obvious (a question to research, rival plans, a class or method name), run a collab: cheap agents work the same question in rounds and vote, and you read only the tally. Research you pay for must outlive the task: load the `research` skill.

1. Write `<taskdir>/collab.json`: the question, `kind` (`research` or `design`), 3 members (Haiku/Sonnet mixed), the context files. Every run starts by listing the simple truths together; an `open` one is what the next round digs into.
2. `node Server/Collab.mjs <taskdir>` runs in the background and ends with `collab/tally.md` (winner's file, votes, caveats). Read that and the winner's file only.
3. Apply the winner plus its caveats; you may overrule the vote with a `decision` line saying why.

Research searches the web in round one. Design votes on the whole signature first, then builds, then votes on builds; set `target: {module, class}` to record names. Cost about $1.50–2 for 3 members; a one-line claim needs a `check` (under $0.01), not a collab. A plain vote does most of the work: if the tally is close, run one more read-and-revise round, never more. Spec and tally: [`Server/doc/collab.md`](/Server/doc/collab.md); a run drawn live: `/framework/ext/Collab/?src=/framework/ai/<task>/collab.jsonl`.

## Keep everything moving: never block, never miss a notice

- Spawn minions as Servex agents (`spawn_agent`, `parent` = your id). The call returns at once and each child's done/blocked/error arrives as an event to you. Start several in one message.
- Each minion gets its own subtask log: `task: {dir: "<your taskdir>/<minion-slug>", parent_task: "<your taskdir>", after: ["<your taskdir>/<sibling-slug>", …]}` (full dirs, never bare slugs).
- Long helpers (dev server, Playwright watcher, build) run in the background and report; never poll in a loop in your own turn. Start a minion's long run yourself, detached (`windowsHide`, `unref`), and tell the minion to end its turn and wait for your wake (a minion on Monitor re-reads its whole context every ~10 s: one reached 428k tokens, $12; a Servex restart kills runs a minion started).
- Every child and background process needs a way to reach you (its parent event, or a job that ends when the thing happens).
- Send a correction to a working minion queued, not `now` (`now` ends its turn; follow with "continue").
- Not the in-process Agent tool's background mode: its completion goes to the main session.
- **Stop a minion once you've read its result** (`stop_agent`; the session id stays resumable). Idle agents hold ~250 MB each; keep one alive only for a question you will really ask, and about 10 running at once.
- If you must wait, stay under the tool timeout; a longer wait is backgrounded silently and parks you.

## Broken pages reach you at once

`node Server/health-supervisor.mjs` loads the pages a changed file could break in a hidden browser and logs console errors to `public/framework/ai/health/<date>.jsonl` (default: the main site, `HEALTH_BASE=http://monorepo.localhost`). ⚠ A worktree supervisor does not start while the main one runs (`health.mjs` holds one global lock, `Temp/lew42-health.lock`, and silently loops): check worktree pages with `merge.mjs`'s smoke test or a headless probe. A console error on a page you touched is yours to fix before landing.

## Judge against the owner's sentence

**The outcome is a checklist of the owner's asks, each ticked only with its proof beside it**; a smaller or easier version than named is a **miss** (shape and example: `finish-task`). At harvest check each numbered deliverable by name, plus:

- the page loads with **zero failed requests** (parsing is not booting);
- **one picture of the whole thing** at 1920, which you open;
- every page created is **linked from where a reader already is**;
- **every page the brief names gets an after-screenshot**, and a fix made AFTER the review gets its own proof (a re-review or a shot of the exact page the finding named).

**Resolve, don't park** (CLAUDE.md law 5): fix a found problem now with its caveat beside it. "Left open" needs a reason a reader accepts (a fence, a missing fact), never "out of scope" or "waiting on the owner": decide, and name the alternative.

## Report three messages, ever

- **Taken:** one line, immediately: what you understood, how many minions, worktree or not.
- **Blocked:** one line, the moment it happens: the specific thing, and what you do meanwhile.
- **To tell the owner anything** (a decision made on their behalf, a risk, something only they can do): call `owner_note({title, text, kind: "decision"|"risk"|"needs-you", links})`, never chat. `decision` and `risk` are FYIs (read in the Inbox, not counted as waiting); only `needs-you` (a key, a login, money: only the owner can do it) waits, so never use it for a status update. Keep working; Servex also posts one for the `decision` lines in your `task.jsonl` when you land.
- **Landed:** one screen: the headline, then plain sentences with links.

Everything else lives in `task.jsonl` ([`new-task`](../../../.claude/skills/new-task/SKILL.md)): the plan as child tasks, made with the item tool (`tasks.add`, grouping rule in [new-task](../../../.claude/skills/new-task/SKILL.md)), a `decision` line (alternative named) and a `log` caveat the moment each happens, each step started with `{"start": {}}` and its `now` bumped, so a fresh mastermind can resume from the log. Ask each minion to do the same. Append with `node .claude/hooks/append.mjs`.

## Never

- **Let any process show a window.** Every Node spawn/exec/fork sets `windowsHide: true`, even detached; `Start-Process` uses `-WindowStyle Hidden` with no output redirection; prove it with `MainWindowHandle` = 0. Put this in every brief that starts a process.
- Take a second task · change your own fence · spawn another task mastermind (depth stops at two) · kill or restart the dev server · drive the owner's live browser tabs (`mcp__site__pages`/`claim`/`eval` on a connected tab; use `mcp__site__shot` or headless Playwright) · ask the owner to approve non-dangerous work.

Land with `documentation` (a review pass: docs current, nothing new) then `finish-task`. Improve this skill: [`improvements.md`](../../../.claude/skills/sub-mastermind/improvements.md).
