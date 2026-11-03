# AGENTS.md

Lew42: a no-build, native-ESM web framework. The site is static; `Server/` and `Servex/` are local dev only.

This is the base every agent reads first, whatever model or tool runs it. Claude Code gets it through `@AGENTS.md` in CLAUDE.md; Codex, Cursor, Copilot and OpenCode read it directly; Servex puts it in each agent's system prompt. Readmes elaborate it. **Do not edit it without asking the owner.**

## Read first, in this order

1. **This file.**
2. **The readme chain.** Before you change a folder, read every `readme.md` from the repo root down to that folder. [readme.md](readme.md) is the index of systems; [public/framework/readme.md](public/framework/readme.md) is the module index and the framework's rules.
3. **Your role's readme**, if you have a role ([Servex/agents/roles/readme.md](Servex/agents/roles/readme.md) lists them).
4. **What is going on:** [public/framework/ai/handover.md](public/framework/ai/handover.md) and `git log --oneline -20`.

A Servex agent already has 1 to 3 in its system prompt. Anyone else reads them with a file tool, and reads the chain again after a compaction.

## Laws

1. **Less is more — ASAP, As Simple As Possible.** Fastest working version first, then improve. Show, don't tell — a demo you can open beats a description. Question every word, line, section. Deep docs may breathe.
2. **Clear beats brief — by far.** Simple, but clear: explain it like I'm five. Start with the basics, in full, plain sentences, so the reader knows exactly what is being said before any detail arrives. Every page, demo and snippet makes its one takeaway obvious — a reader should be able to say what they are supposed to learn from it. Detail that can move somewhere better moves there and gets a link; don't restate every caveat everywhere. An extra sentence that clarifies a necessary point belongs. "Minimal speak" — clipped fragments, undefined words, jargon standing in for an explanation — is a failure, not economy. New coders are the audience. (the owner, 2026-09-04)
3. **Prioritize.** Time, quantity, quality, outcome: the most important things come first, for the most benefit to the user. Everything reads as a quick scan — a few short sections, then a link to the long form.
4. **Follow the owner's words.** Build what was asked, the way it was described, and lean into the owner's own names and preferences. Don't go in a different direction without a very good reason; if you do, say why. (the owner, 2026-09-30)
5. **Keep working; never wait on the owner.** Make the best decision, say what the alternative was, and keep going. Never create a request that blocks on the owner: they may never see it. If a limit stops you, queue the work and pick it up after. Only a real block you can't sidestep goes on the dashboard, and everything else keeps moving. Don't do anything dangerous. (the owner, 2026-09-30) The owner often dictates long-winded rants, ideas, tasks or lectures while looking away and may never read your reply: **assume ephemeral chat logs will never be read again.** If it is not committed to the file system, nobody will ever know about it: **the committed repo state backed up to GitHub is the sole source of truth.** Never leave loose ends hanging on the assumption of a follow-up. If there is a safe, quick fix, attempt it; if not, **record the essence of the dictation immediately in the proper place** (notes, legitimate questions, tradeoffs or implications): a short `doc/*.md` file beside the relevant module, linked from that directory's `readme.md`. Files are what survive. (the owner, 2026-10-01, updated 2026-10-05)
6. **One of everything; don't repeat yourself.** Before you build, find what already exists and use it, or extend it. Never build a second version of a system. Every surface that shows the same thing (a chat, a sidebar, a card, a rail) uses the same component, so one fix updates all of them. (the owner, 2026-09-30)
7. **Compute, don't recall.** Anything a computer can work out (state, counts, costs, which tasks landed, log lines, records) is done by a node script or tool that reads the real state, never written by an AI from memory. AI handles judgment; record-keeping is code. (the owner, 2026-10-01)
8. **Name it and home it first.** Every new module or task settles its name and home location first. (the owner, 2026-10-16)
9. **Document the structure as you build.** Every system's readme states what it is, its exact on-disk structure, which tool writes its data and from where, and which class reads it — verified against the code, no history. If an agent had to investigate to learn how a system works, the readme failed; fix the readme in the same task. (the owner, 2026-10-19)
10. **Index everything you create.** Every file, folder, task, child session or page you make is recorded in its parent the moment it exists: a task folder in its session record, a child session under its parent, a page in its parent's `children:` or a link, a system in its readme. Anything unindexed is forgotten. (the owner, 2026-10-23)

## Memory, history, safety (long form: `public/framework/ai/doc/agent-rules.md`)

- **Context must not die in sessions:** decisions and insight go to the page or module they concern, linked to the source prompt, never left in chat. Post an update or log line at least every ~5 minutes of work.
- **File each ask the first time:** as a task on the session's record or a one-line note in the readme it concerns (`core/Task/readme.md`, "Using tasks").
- **Link, don't regenerate:** reference the prompt, session, task or doc by link; never retype what is written.
- **Never destructive:** don't delete logs, merge records or overwrite history; if something must go, move it aside and say so. Git is the undo.
- **Moves and renames are scripted, never retyped:** a node script with a dry run and a manifest of every old to new path. Then link anything that exists in the repo but not on the site.
- **Commit after every working step:** smoke-test, then commit, in a worktree; merge after reviewing the diff; keep GitHub current: `merge.mjs` pushes michael/dev after each landing, and a commit made straight on michael/dev is pushed too. (the owner, 2026-10-29)
- **Stream, don't poll:** anything real-time is a JSONL append and a `live()` tail, never `setInterval` + `fetch`.

## Git (full rules: [public/framework/git/readme.md](public/framework/git/readme.md))

- **Trunk is `michael/dev`.** It is written only on the owner's PC: by `node Server/merge.mjs <worktree>` (landings, which then push it) and the log sweeper. `main` is production; only the owner updates it, by pull request.
- **Work in your own worktree and branch.** Push only your own branch (`git push origin HEAD`). From any other machine or a cloud session, never push `michael/dev` or `main`.
- **Never merge, rebase or pull into a tree someone else is working in.** Servex tells you when the trunk moves; integrate at a safe point (after a commit, before the next step, before landing): `git rebase michael/dev` on your own unpushed branch, then re-run your tests.
- **Test first.** For a fix or a behaviour change: commit the failing test, then the fix, as two commits.
- **Small commits that each pass.**

## Skills

A skill is a plain Markdown procedure in `.claude/skills/<name>/SKILL.md` (the open Agent Skills format). Claude Code loads them with its Skill tool; any other agent just reads the file when its moment comes. The index is [.claude/skills/readme.md](.claude/skills/readme.md).

## Cost and roles (long form: `public/framework/ai/doc/agent-rules.md`)

- **Usage pace:** a mastermind runs `node Server/usage-now.mjs` when it starts and before each spawn. Over pace: Sonnet by default, no Opus without a stated reason, fewer agents.
- **Audits go to Haiku, under 100k tokens:** aim for 30–60k per request; a node script chunks big inputs. Sonnet is for UI and object-oriented code.
- **Mind the token burn:** let a script read and calculate, batch tool calls, no session replays or long audits unless asked, keep sessions short.
- **No hard fences between roles:** a capable agent just does the job; the mastermind is the one that decides and splits work.

## Ask before

- Breaking a constraint: no build step (`public/` runs as-is; imports are real `.js` URLs), no server at runtime (production is static), no new npm dependency (`npx` and global tools are fine).
- Major surgery: renaming a core API, moving a responsibility, anything with a dozen callers.

## Where to look

- [readme.md](readme.md) (root): setup, systems, branches, deploy.
- [public/framework/readme.md](public/framework/readme.md): THE module index (every module, one line, one link) and the framework's rules.
- [public/framework/ai/](public/framework/ai/): the task log. Open a task before the first edit, log as you go, land it.
- [Servex/](Servex/readme.md): the agent system (roles, sessions, spawning, the quick-fix pool, merge and review). Its docs are `/framework/servex/`.
- [public/framework/git/readme.md](public/framework/git/readme.md): branches, landing, staying current, a new machine.
- [public/framework/ai/doc/audits.md](public/framework/ai/doc/audits.md): every audit of what the owner asked against what was done. Check it before building another audit.
- Scratch (scripts, transcripts, intermediate JSON) goes in your session scratchpad, not the repo.
