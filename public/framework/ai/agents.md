# agents.md: what every agent reads first, whoever made it

Lew42: a no-build, native-ESM web framework. The site is static, and `Server/` is dev only.

This is the base for any agent on this repo: a mastermind or a worker, Claude or another model. **All shared rules live here.** `CLAUDE.md` only imports this file (Claude Code reads it at start), and anything Claude-specific is the only thing that goes there. Never add a rule to `CLAUDE.md`; add it here. (the owner, 2026-11-06) This file rules; skills and readmes elaborate it. **Do not edit it without asking.**

The framework's own rules (presentation, readmes and docs, classes, pages, the live site, traps) live in [public/framework/readme.md](../readme.md) and the doc it links, [doc/rules.md](../doc/rules.md). The long form of the safety and cost rules is [doc/agent-rules.md](doc/agent-rules.md). The [ai readme](readme.md) indexes the AI system. (History: CLAUDE.md was split on 2026-10-22, and every old sentence was mapped in `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md`; old wording is kept in [doc/claude-md-archive.md](doc/claude-md-archive.md). CLAUDE.md's rules moved here on 2026-11-06.)

## Read, in this order

1. **[public/framework/readme.md](../readme.md)**: mandatory for every agent, the module index and the framework's rules. Before you write a page, a readme, a class or anything the owner reads, also read the rule it links ([doc/rules.md](../doc/rules.md)).
2. **Your role's readme**: [Servex/agents/roles/readme.md](../../../Servex/agents/roles/readme.md) lists them (minion, mastermind, reviewer, clarity). A Servex agent already has its readme in its system prompt; a VS Code tab reads it by hand.
3. The readme of the folder you will work in, root down to leaf, then its `doc/`.
4. **[handover.md](handover.md)** and `git log --oneline -20` (below, "Where to look").

## Laws

1. **Less is more: ASAP, As Simple As Possible.** Fastest working version first, then improve. Show, don't tell: a demo you can open beats a description. Question every word, line, section. Deep docs may breathe.
2. **Clear beats brief, by far.** Simple, but clear: explain it like I'm five. Start with the basics, in full, plain sentences, so the reader knows exactly what is being said before any detail arrives. Every page, demo and snippet makes its one takeaway obvious: a reader should be able to say what they are supposed to learn from it. Detail that can move somewhere better moves there and gets a link; don't restate every caveat everywhere. An extra sentence that clarifies a necessary point belongs. "Minimal speak" (clipped fragments, undefined words, jargon standing in for an explanation) is a failure, not economy. New coders are the audience. (the owner, 2026-09-04)
3. **Prioritize.** Time, quantity, quality, outcome: the most important things come first, for the most benefit to the user. Everything reads as a quick scan: a few short sections, then a link to the long form.
4. **Follow the owner's words.** Build what was asked, the way it was described, and lean into the owner's own names and preferences. Don't go in a different direction without a very good reason; if you do, say why. (the owner, 2026-09-30)
5. **Keep working; never wait on the owner.** Make the best decision, say what the alternative was, and keep going. Never create a request that blocks on the owner: they may never see it. If a limit stops you, queue the work and pick it up after. Only a real block you can't sidestep goes on the dashboard, and everything else keeps moving. Don't do anything dangerous. (the owner, 2026-09-30) **A real block (killing a process, deleting data, spending money) is filed as a task waiting on the owner (`{"wait":{"on":"owner"}}`, so `list_waiting` shows it), and the agent that filed it asks again at every check-in until it is answered. A question left in a report is a dropped task. Then fix the root cause, so the next case needs no approval.** (the owner, 2026-11-06: a process kill list from 11-04 waited for a yes nobody asked for again.) The owner often dictates long-winded rants, ideas, tasks or lectures while looking away and may never read your reply: **assume ephemeral chat logs will never be read again.** If it is not committed to the file system, nobody will ever know about it: **the committed repo state backed up to GitHub is the sole source of truth.** Never leave loose ends hanging on the assumption of a follow-up. If there is a safe, quick fix, attempt it; if not, **record the essence of the dictation immediately in the proper place** (notes, legitimate questions, tradeoffs or implications): a short `doc/*.md` file beside the relevant module, linked from that directory's `readme.md`. Files are what survive. (the owner, 2026-10-01, updated 2026-10-05)
6. **One of everything; don't repeat yourself.** Before you build, find what already exists and use it, or extend it. Never build a second version of a system. Every surface that shows the same thing (a chat, a sidebar, a card, a rail) uses the same component, so one fix updates all of them. (the owner, 2026-09-30)
7. **Compute, don't recall.** Anything a computer can work out (state, counts, costs, which tasks landed, log lines, records) is done by a node script or tool that reads the real state, never written by an AI from memory. AI handles judgment; record-keeping is code. (the owner, 2026-10-01)
8. **Name it and home it first.** Every new module or task settles its name and home location first. (the owner, 2026-10-16)
9. **Document the structure as you build.** Every system's readme states what it is, its exact on-disk structure, which tool writes its data and from where, and which class reads it, verified against the code, with no history. If an agent had to investigate to learn how a system works, the readme failed; fix the readme in the same task. (the owner, 2026-10-19)
10. **Index everything you create.** Every file, folder, task, child session or page you make is recorded in its parent the moment it exists: a task folder in its session record, a child session under its parent, a page in its parent's `children:` or a link, a system in its readme. Anything unindexed is forgotten. (the owner, 2026-10-23)
11. **Readmes are the index.** Each lists everything directly inside its folder (or links a sub-doc that does), and points to closely related modules elsewhere. When a lookup is hard, write the search recipe into the nearest readme once you've solved it. Finding past work: [indexing-past-work.md](indexing-past-work.md). Long form: [doc/rules.md](../doc/rules.md), "Readmes are the cheap index". (the owner, 2026-11-06)
12. **Every class gets one lean core test** (`X.test.mjs` beside it): make one instance, exercise the top ~50% of what it does, assert after each call, and stay well under 1 s. Add it when you build or first change a class that has none; don't over-test. How, and what earns more: [core/Test](../core/Test/readme.md).

## ⚠ One folder per session (the owner, asked many times; 2026-11-06)

A session has exactly ONE folder: `public/framework/ai/sessions/YYYY/MM/DD/<folder>/`, the day it began. The dated folder is the only address (a bare-uuid url is a browser-only redirect for old links); never create, name or write a folder `sessions/<uuid>/`. Your session's folder is printed at start ("Your session is …; its one folder is …"). In code, find it with `SessionFolders.at(store).of(id)` (its own folder) or `.record_of(id)` (where its record sits, nested for a spawned agent) ([core/Session/SessionFolders.mjs](../core/Session/SessionFolders.mjs)), never by building a path; make it with `.create(id, {first})` (or `Session.create({id, name, parent, first})`), the one creator. A check fails loudly on a flat folder: `node Server/SessionConsolidate.mjs --check`. Details: [sessions/doc/one-folder.md](sessions/doc/one-folder.md).

## Memory, history, safety (long form: [doc/agent-rules.md](doc/agent-rules.md))

- **Context must not die in sessions:** decisions and insight go to the page or module they concern, linked to the source prompt, never left in chat. Post an update or log line at least every ~5 minutes of work.
- **File each ask the first time:** as a task on the session's record or a one-line note in the readme it concerns (`core/Task/readme.md`, "Using tasks").
- **Work as a task:** open a task before real work, log as you go, close it with an outcome and evidence ([doc/task-buckets.md](doc/task-buckets.md)). A fresh agent must be able to continue from the task folder alone.
- **Link, don't regenerate:** reference the prompt, session, task or doc by link; never retype what is written.
- **Never destructive:** don't delete logs, merge records or overwrite history; if something must go, move it aside and say so. Git is the undo. Never push with force or skip hooks.
- **Moves and renames are scripted, never retyped:** a node script with a dry run and a manifest of every old to new path. Then link anything that exists in the repo but not on the site.
- **Commit after every working step:** smoke-test, then commit by exact path, in a worktree; merge after reviewing the diff; keep GitHub current: `merge.mjs` pushes michael/dev after each landing, and a commit made straight on michael/dev is pushed too. (the owner, 2026-10-29)
- **Stream, don't poll:** anything real-time is a JSONL append and a `live()` tail, never `setInterval` + `fetch`.

## Cost and roles (long form: [doc/agent-rules.md](doc/agent-rules.md))

- **Usage pace:** a mastermind runs `node Server/usage-now.mjs` when it starts and before each spawn. Over pace: Sonnet by default, no Opus without a stated reason, fewer agents. **Bands (the owner, 2026-11-07): under 80% of pace, work normally; from 80%, slow down (no new masterminds, Sonnet/Haiku only); never pass 100%. Background audits only under 50%.**
- **Audits go to Haiku, under 100k tokens:** aim for 30–60k per request; a node script chunks big inputs. Sonnet is for UI and object-oriented code.
- **Mind the token burn:** let a script read and calculate, batch tool calls, no session replays or long audits unless asked, keep sessions short.
- **Context size:** keep a working agent rather than switching for context size alone; compact around 300k. Decisions go in the module's docs as they are made ([doc/context.md](doc/context.md)).
- **No hard fences between roles:** a capable agent just does the job; the mastermind is the one that decides and splits work.

## Explaining to the owner

- **Show an API as JavaScript or pseudocode** (`page.tabs.add({name: "today"})`), not as a JSON delta, unless the owner asks what the delta looks like. Say which object the call operates on (`page`, `page.items`, a card). (the owner, 2026-11-06)
- **Context first, detail on demand.** Open with the thing the owner already knows (the class, the session id with its icon, the page) and link it; one level of detail per click. Never name something that exists without a link to it (`https://monorepo.lew42.com/...`). Show, don't tell: a link to where it works beats a paragraph. Headings and bullets, no filler, no caveats about past mistakes unless they change what happens next. (the owner, 2026-11-09)

## Ask before

- **Everything else: decide.** If git can revert it, make the best decision, do it in small merges, and say what you chose. Only destructive or irreversible steps (deleting, killing processes, force-pushing, spending past the budget) wait for the owner. (the owner, 2026-11-09: "make the best decision you can, as long as it's not destructive")
- **An idea from the owner is a problem to solve, not a build order.** Plan first: a plan page with the MVP on top and the alternatives below, then a fresh reviewer who hasn't seen your reasoning checks the shape. If the owner doesn't answer, don't wait: build the MVP, demo it (a link where it works, on /live/done/), and build the next phase only if it's a priority and usage allows. He judges the demo. (the owner, 2026-11-09: "we're sometimes pulling the trigger too fast when we don't have the right shape yet")

- Breaking a constraint: no build step (`public/` runs as-is; imports are real `.js` URLs), no server at runtime (production is static), no new npm dependency (`npx` and global tools are fine).
- Major surgery (renaming a core API, moving a responsibility, anything with a dozen callers): since 2026-11-09, plan it, then decide it yourself in small revertible merges; ask only when it can't be undone with git.

## Where to look

- **First, every new session:** [handover.md](handover.md) (the state of the world, what is open) and `git log --oneline -20` (what landed recently). Query the logs only when you need a detail; never read them whole. (the owner, 2026-10-09)
- **Past work, any question about what was asked or done:** [indexing-past-work.md](indexing-past-work.md): one `git grep` over the session logs (rg is not installed), the owner's own words per channel, the raw transcripts, git history, and a map of every index we already have. A search that misses or needs a second try gets its working query added there.
- `readme.md` (root): setup, branches, deploy.
- [public/framework/readme.md](../readme.md): THE module index (every module, one line, one link) and the framework's rules.
- `public/framework/ai/`: the task log. Open a task before the first edit (`new-task`), log as you go, land it (`finish-task`).
- `Server/`: dev server only.
- `Servex/`: the agent system (roles, sessions, spawning, the quick-fix pool, the heartbeat, merge and review). Its docs are `/framework/servex/`; the owner's routed asks and their owners are in [asks.jsonl](asks.jsonl).
- [doc/audits.md](doc/audits.md): every audit of what the owner asked against what was done; for new loose ends, the prompt audit (`node Server/PromptAudit.mjs --days 7`, doc [doc/prompt-audit.md](doc/prompt-audit.md)). Check it before building another audit.
- Scratch (scripts, transcripts, intermediate JSON) goes in the session scratchpad, not the repo.

## Probable direction: agents in the dev server (the owner, 2026-11-06; not built)

SDK agents would run inside each project's dev server, not in Servex. That gives one item cache shared by the browser, the agents and MCP. Servex would shrink to a manager, and each project would get its own scoped MCP and `spawn_agent`. Tradeoffs, open questions and the alternative: [Servex/readme.md](../../../Servex/readme.md#probable-direction-agents-run-in-the-projects-dev-server-the-owner-2026-11-06-not-built). Until it is built, nothing changes: agents still run in Servex.

## Where this file goes

How it reaches an agent, and why it is a system prompt and not a message: [doc/agent-base-proposal.md](doc/agent-base-proposal.md). Claude Code reaches it through `CLAUDE.md`, which imports it.
