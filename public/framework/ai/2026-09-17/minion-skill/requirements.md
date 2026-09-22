# minion-skill — the handoff: a skill that points a spawned minion at its task and the rules

**Three laws.** Less is more (ASAP). Clear beats brief by far (full plain sentences; a new agent understands each line without context). Prioritize.
**Length budget:** the skill is one page, under 70 lines. Your landing report is five sentences with links.

## The owner's words (2026-09-17)

> I don't know if you have a minion skill maybe when you're spawning minions you should have a rough skill that just points them at the specific task that they're working on I'm not sure how that handoff works but I guess I want to make sure that the requirements that I'm giving you in these prompts are detailed

The full prompt: `../mastermind-layout-browser/requirements.md`.

## Deliverables

1. **`.claude/skills/minion/SKILL.md`** — frontmatter `name: minion`, a `description` that triggers on "you are a minion", "your brief is at", or any Agent-tool prompt that names a `requirements.md`. Body, in this order, each a short section of plain sentences:
   - **Your brief is the task.** Read the `requirements.md` you were given first, in full; the deliverables are numbered and each is ticked against the owner's own sentence at harvest — a reduced version is a miss. The owner's full prompt is linked from the brief; read it when a deliverable is unclear.
   - **The three laws and the reader** (less is more; clear beats brief; prioritize; the overwhelmed newcomer: level 1 one screen, shown not told, detail one click down).
   - **Before the first edit:** load `code` (and `layout`, `css` when the work has a size or a style), then `new-task` in the task dir the brief names (it exists; you write the `task.jsonl` launch line with your `session_id`).
   - **While working:** log milestones as `log` lines (findings, decisions, measurements) with clock timestamps; `now` lines when what you are doing changes; never a findings.md.
   - **The never list** (one line each, with the evidence date the sources give): never kill or restart the dev server; never drive the owner's tabs; never `git stash`; never `find /`; never edit outside your fence; never measure the repo while another agent edits it; never write jsonl with Out-File; never start the owner's server on port 80 — your private server is the port your brief names, `PORT=<port> node server.js` from the repo root, killed at landing.
   - **How to wait** (foreground, in chunks under the tool timeout, or better: don't gate on a wait).
   - **Resolve, don't park.**
   - **Landing:** `documentation` if you touched a module, then `finish-task`; `skill-improvement` for any skill that misled you; the report is one screen of plain sentences with links, the numbers in the log.
   Sources to distil (read all three, keep the rules, cut the history): `public/framework/ai/2026-09-04/mastermind-platform/minion-rules.md`, `public/framework/ai/2026-09-08/mastermind-playwright/minion-rules.md`, and the "Briefs" section of `.claude/skills/mastermind/SKILL.md`. Where the two minion-rules files disagree, the newer wins; say so in your log.
2. **`.claude/skills/minion/improvements.md`** — the two-line header every skill has (any agent may append; one line each).
3. **One line** in `.claude/skills/mastermind/SKILL.md`, at the top of the "Briefs" section: every brief tells the minion to load the `minion` skill first, and the brief then carries only what is specific to the task. Change nothing else in that file.

## Rules

- `new-task` before the first edit (your dir exists: `ai/2026-09-17/minion-skill/`); `finish-task` at the end. No server needed.
- **Fence:** `.claude/skills/minion/**` (new) and that one line in `.claude/skills/mastermind/SKILL.md`; your task dir. Nothing else.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. Search with rg/Glob scoped to the repo.
- Don't write the owner's name anywhere; say "the owner".
- Findings as `log` lines; timestamps from the clock; never Out-File for jsonl.
