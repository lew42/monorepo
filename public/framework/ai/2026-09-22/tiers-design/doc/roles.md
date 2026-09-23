# The six roles

Six kinds of agent, and nobody does the job above them or the job below. The whole point of
having six is that each one can be cheap, small and replaceable: the tier that must answer in two
seconds never has to think, and the tier that thinks never has to be fast.

Read the arrows on [the page](../) first — this file is the detail behind each box.

| role | id | model · effort | always-loaded skills | where it runs |
| --- | --- | --- | --- | --- |
| Fast assistant | `assistant-fast` | Sonnet · low | `every-prompt` + `tiers.md` | main tree |
| Master assistant | `assistant-master` | Fable · high (Opus when the weekly is tight) | `master-assistant` | main tree, reads only |
| Master-mastermind | `mastermind` | Fable · high | `mastermind` (executive half) | main tree |
| Task mastermind | `mastermind-<task>` | Opus · high | `sub-mastermind` + `new-task` | main tree; it creates the worktree |
| Minion | `minion-<task>` | Sonnet builds · Opus judges · Haiku scans | `minion` | main tree **or** its task's worktree |
| Log assistant | `assistant-log` | Sonnet · low | `log-assistant` | main tree |

The id shape is `<role>-<name>`, the one the `agent-host` task is building, and a collision gets
`-2`. There is exactly one `mastermind` with no suffix; a second agent asking for that name is a
bug, and the registry should refuse it — two masterminds have run at once blind before.

**Visibility** is a field on every agent, and it decides what the dashboard renders: `owner` (this
agent's output is on the owner's screen — the fast assistant, the master-mastermind), `team`
(visible to its parent and on the task's page — a task mastermind, a minion), `internal` (a scan
or a lookup nobody will re-read). Without it a dashboard showing every event from every agent is
unreadable, which is the complaint the owner keeps making.

## Fast assistant

**Does.** Hears the owner. Echoes their words verbatim into the record before anything else. Names
the thing at once. Writes the card on the board, and updates that same card id as the work moves.
Routes the words to the agent that owns the topic and rings it. Ten seconds, start to finish.

**Never.** Reasons deeply, opens code, decides anything, waits for anyone, filters a word, or
renames something the owner has already seen.

**The rule it lives by:** it may be wrong about what a request MEANS, never about what was SAID.

**Stood down** with the owner — it is the front desk, so it is awake whenever they are.

## Master assistant

**Does.** Supervises all three tiers below it and says the one thing about to be forgotten. Gives
one or two sentences of opinion when the fast assistant or a mastermind asks. Keeps one page
current on how the process itself is going. When a mistake reaches the owner, it loads the
`auditor` skill and audits the system that let it through.

**Never.** Builds, spawns, edits any file but its own process page, decides what a mastermind
decides, answers at length, or waits.

**Stood down** with the owner.

## Master-mastermind

**Does.** There is one, and it is the executive. It owns the budget, the priority order and the
dispatch. It turns a long dictation into a small number of task briefs — the owner's words
verbatim, the numbered deliverables, the fence, the length budget. It spawns one **task
mastermind** per task. It judges what comes back against the owner's own sentence, spot-checks one
deliverable itself by opening it, and writes the report.

**Never.** Writes code, CSS, hooks or scripts. Edits the screen the owner is reading — appending a
log line is its only write to the live site. Runs a task itself. Asks for approval on
non-dangerous work.

**Stood down** only by the owner.

## Task mastermind — the sub-mastermind

This is the new role, and the one the design turns on. Today one mastermind holds every task at
once, which is why its skill is 405 lines and why it drowns. A task mastermind holds exactly one.

**What the master-mastermind hands it: two things and nothing else.**

1. **A boiled-down requirements page** — a `requirements.md` in the task's own dir. The owner's
   words verbatim at the top, the numbered deliverables, what already exists and must be read
   first, the length budget, the private port if it needs one. It is the acceptance test, so it is
   written in the owner's sentences, not in a summary of them.
2. **A fence** — the directory tree it owns. Everything outside it is somebody else's. A fence
   that forbids what a mandated skill writes is a trap, so the fence names the skill's writes too.

**What it does with them.** Reads the page start to finish before touching anything. Decides
whether the task needs a worktree (the rule is in [version-control.md](version-control.md)) and
creates it if so. Splits the task into minion-sized pieces with **non-overlapping file fences** —
one page, one minion, in sequence. Spawns the minions, watches their pages while they work, judges
each deliverable against the owner's sentence by name, merges, proves the seams itself, lands the
task, and reports one screen upward.

**Never.** Takes a second task — a new task is a new task mastermind, because a mastermind that
has taken five additions has stopped being able to land anything. Changes its own fence. Commits
on the main branch. Spawns another task mastermind: depth stops at two for now, because nobody has
yet proven that a three-deep tree can report failure upward without a human relaying it. What
would change that is one measured run in phase 2.

**What it reports back, and when.** Three messages, ever:

- **Taken** — one line, immediately: what it understood, how many minions, worktree or not.
- **Blocked** — one line, the moment it happens: the specific thing, and what it is doing meanwhile.
- **Landed** — one screen: the headline, then plain sentences with links, the numbers left in the log.

Everything else is in its task log, where anyone can read it without being sent it.

**The one rule that stops it parking.** Its minions either run in the **foreground of its own
turn**, or they are Servex-hosted agents whose completion arrives as an **event addressed to it**.
Never a background child whose completion notifies somebody else. This is not a theory: both Fable
sub-masterminds on 2026-08-21 parked at cycle one, each waiting forever on a nested background
minion whose completion notification went to the main session instead, and a human had to relay it
by hand. Servex is what finally fixes this properly — an agent held in a Map, sending its parent a
`done` event — so until Servex hosts them, foreground is the only safe shape.

## Minion

**Does.** Builds one thing, proves it, lands it, and stays wakeable for follow-ups on that same
page. It reports to its **task mastermind**, not to the owner and not to the board.

**Never.** Works outside its fence. Kills or restarts the dev server. Drives the owner's browser
tabs. Runs `git stash`, `reset`, `checkout --`, `commit` or `push` outside its own worktree
branch. Decides what the owner decides.

**Spawned with** the `minion` skill, plus the craft skill its work actually needs, loaded on
demand — `code` before the first JS edit, `layout` before anything with a size, `css` before a
declaration. Its `cwd` is the main tree for a single-page edit and its task's worktree for
anything multi-file.

**Stood down** by landing. It stays resumable by session id forever, which is the whole reason
minions are CLI sessions and not in-process subagents.

## Log assistant

The one role that exists purely to keep tokens out of file operations.

**Does.** Resolves a *semantic* conflict in the log, and nothing else: two agents proposing a
different name for the same thing, a `rename` aimed at a name the owner has already seen, a
`dispute` that needs a consensus. It reads only the contested entries and appends one `verdict`
event naming the winner and the reason.

**Never.** Mechanical appends. Every ordinary write to the log is programmatic and costs nothing;
paying an agent to append a line is the exact mistake this role exists to prevent. It never edits
an entry — nothing in this system edits an entry — and never touches a file outside the log.

**Woken by** the appender, when a write fails its naming check. It has no cycle, no wakeup and no
standing job; between conflicts it does not exist.
