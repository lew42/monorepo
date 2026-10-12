# tiers-design — the whole system on one page: roles, logs, coordination, version control

Minion: Opus, effort high. Session id `4c7e3a94-d766-46b1-9808-79eb8f00c190`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then ALL of
[`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md) — this task is
the integrating design over sections B, C, D, E, F and H. Paper only: pages, docs and new skill
drafts; no server code.

## The owner's words (2026-09-22 15:05)

> be careful and thorough to architect a proper fast-assistant, master-assistant, mastermind,
> sub-mastermind, minion system, with proper logs, coordination, version control strategy and
> workflow, etc.

and earlier today: "a master-mastermind that is the executive decision maker, to keep things
moving, and then each task gets its own mastermind who creates the worktree, and can spawn
minions to work on it. not every minion needs a worktree."

## What exists — read first

- `.claude/skills/every-prompt/tiers.md` — the four roles today, one sentence each. Continue it.
- The skills that define the roles now: `mastermind`, `master-assistant`, `every-prompt` (the
  fast assistant), `minion`, `auditor`. Each has an `improvements.md`. The 2026-09-19 skill
  audit (`ai/2026-09-19/system-eval/` — 45 skills, seven ranked changes, none applied) and
  `ai/2026-09-19/skill-roles/`, `skills-shrink/`.
- Three sibling tasks running now, whose pages you read if they have landed and whose briefs
  you read either way: `log-model` (the event schema and conflict rule), `worktree-design`
  (where worktrees go, who gets one, the SSD answer), `agent-host` (spawn/send/interrupt, the
  message envelope, readable ids). Your design must fit theirs; where you disagree, say so in a
  `decision` line and design for both.
- What actually went wrong before, so the design prevents it and not something imaginary:
  `ai/2026-09-19/mistake-audit/`, the mastermind skill's "Briefs" list (nested background
  minions parking forever; two masterminds running blind; follow-ups a cold agent cannot
  execute), `ai/handover.md`'s three lessons.

## Deliverables

1. **The page — `ai/2026-09-22/tiers-design/page.js`.** Level 1 is one diagram: the owner's
   voice at the top, the fast assistant, the master assistant, the master-mastermind, per-task
   masterminds (each with its worktree or not), minions — with the arrows labelled by what
   flows (verbatim words · cards · briefs · `agent_msg` envelopes · log events) and which log
   each writes. Under it, five headings, each one screen at most, each a `doc/*.md` one click
   down:
2. **`doc/roles.md`** — for each of the six roles: what it does, what it never does, model and
   effort, what it is spawned with (skills loaded, `cwd` main tree or worktree, visibility), its
   id shape (`agent-host`'s `<role>-<name>`), how it is stood down. The sub-mastermind gets the
   most care: what a master-mastermind hands it (a boiled-down requirements page and a fence),
   what it may spawn, what it reports back and when, and the one rule that stops it parking
   (its minions foreground, or via Servex where completion is an event, not a notification).
3. **`doc/coordination.md`** — the protocol. Logs carry everything; a direct message is only
   "blocked" or "done". The envelope (`from`, `reply_to`). How the fast assistant routes a
   prompt to the right mastermind when several run (the ledger's `topics` today; what replaces
   it). What a mastermind does every cycle (the mastermind skill's six steps — keep, cut, or
   move each one into Servex). How a follow-up from the owner reaches the minion already on
   that page. What "done" means and who verifies it — the acceptance test is the owner's
   sentence.
4. **`doc/version-control.md`** — the workflow: the main tree vs a worktree per task team (take
   `worktree-design`'s rule), branch names, who commits (today nobody commits — the owner does,
   after two days of loss; propose what changes and what stays), how a judge merges the best of
   two teams, what a clean landing looks like in git terms, and the never-list that git has
   earned (stash, reset, checkout --).
5. **`doc/skills.md`** — the audit (section H). Every skill in `.claude/skills/` in a table:
   role(s) that load it, always-loaded or on-demand, lines, keep/merge/split/retire, one
   reason. Then the lean always-loaded set per role (aim: under 400 lines total for a minion).
   Draft the two role skills that do not exist yet as real skill dirs —
   `.claude/skills/sub-mastermind/SKILL.md` and `.claude/skills/log-assistant/SKILL.md` —
   short, in the house voice; changes to EXISTING skills go as proposals in `doc/skills.md`
   (running minions are reading them right now — do not edit them).
6. **`doc/phases.md`** — the owner's three phases re-cut against what exists after today:
   what phase 1 still lacks once `servex-port`, `agent-host`, `log-model` and
   `worktree-design` land; the ordered list of tasks for phase 2 with a one-line brief each,
   which the master-mastermind can dispatch as they are.

## Fence

Your task dir (`page.js`, `doc/*.md`, `shots/`), `ai/2026-09-22/page.js` `children:`, and the
two NEW skill dirs named above. Nothing else — no existing skill, no `Servex/`, no `Server/`.

## Length

Page: one screen above the fold (the diagram and five links). Each doc: one to two screens,
plain sentences, a table where a table is shorter. Landing report: ten sentences, the shape of
the system in the first two.
