# Module audit: a process that reads every module and proposes what to fix (plan, nothing built)

The owner's ask (2026-10-24, item 4 of [the brief](../sessions/2026/10/24/session-e00f55c9/context-haiku-audits/requirements.md)). A **manager** picks the modules and the settings; a cheap **Haiku auditor** reads each module's files, most important first, and writes a short note per file; each module ends with an `audit.md` that ranks what to change; the changes become proposed tasks in the [queue](task-queue.md). It runs when nothing else is running.

## What already exists (law 6: extend it)

- **The per-file note system.** `doc/file/<path>.md` beside a module, rendered next to the source in the Files tab (`ext/Doc` into `ext/files`'s `about` hook): 349 notes today. The first trial of the past-work search found it in about 116k tokens of Haiku reading ([findings](../sessions/2026/10/24/session-e00f55c9/past-work-per-file-docs/findings.md)). The auditor writes its per-file docs there, so no second system.
- **The 2026-08-15 doc audit** ([framework/audit](/framework/audit/)): one report per module for 30 modules, a dated snapshot with a ranked fix list. Its lesson is the method, not the reports: `file.js:N` citations rot, so cite a method or selector. The new audit replaces the snapshot with one that lives beside each module and reruns.
- **Process templates** ([core/Task/doc/process.md](/framework/core/Task/doc/process.md)): a task whose steps node runs in order, each step a fresh session with its model and effort. The audit is one more template in `core/Task/processes/` (`AuditProcess`, `static template = "audit"`, one line in `index.js`), like `InvestigateProcess`.
- **The queue** ([task-queue.md](task-queue.md), `core/Task/TaskQueue.js`): a task with a `priority` line is ranked by importance, re-asks and estimated cost.

## The steps (each one a clean context that writes a file; see [context.md](context.md))

| # | Step | Who | Writes |
|---|---|---|---|
| 0 | **Read the module's inbox** | the Haiku auditor, first | the module's own inbox log (the `module_inbox` tool): future-refactor notes left by agents. For each note: does it still apply, and does it become a proposed task? The answer goes at the top of `audit.md`, two lines per note. Tonight's two, for `ext/JSONL` and `Servex`: "one tail system (follow = live()) behind a swappable source adapter" |
| 1 | **Pick** | manager mastermind (Sonnet, low), once per run | `audit-plan.json`: the modules, and per module the **depth** (how many files, most important first) and the **token budget** (the time per module). Node supplies the candidates ranked by size, files with no note, and days since the last audit |
| 2 | **Files** | Haiku auditor, one per module (a long read, past 100k allowed: [agent-rules.md](agent-rules.md)) | `doc/file/<path>.md` for each file in importance order, only where the note is missing or older than the source. *Importance* is computed by node (how many files import it, then size), never judged |
| 3 | **Audit** | Haiku, fresh context, reads **only the notes** and the readme, not the code | `<module>/audit.md`: a table of proposed changes ranked by **ease**, **benefit** and **priority**; then the duplicates (code that does what another module does) and the misplaced files (a file whose home is elsewhere, with the destination) |
| 4 | **Propose** | node (no model) | reads the table, adds one **proposed** task per row to the module's `tasks/`. The top few by `benefit ÷ cost` get a `priority` line, so they appear in the queue; the rest stay a backlog for the owner's "Approve all" |
| 5 | **Index** | node | one line in the module readme ("last audited: date, link to audit.md"); the process's own index step does the rest |

Step 3 reading only the notes is deliberate: the auditor starts without the file-reader's blind spots and stays cheap. A second, independent audit pass (never reading the first) is the [parallel Haiku](parallel-haiku.md) idea, added later if the single pass proves noisy.

## When it runs: the idle work

TaskLoop starts the next audit step when fewer agents are working than the cap, the queue holds nothing ready, and `node Server/usage-now.mjs` is under pace. Each step carries its own `Budget:`, so the cost is bounded; a module stops at its token budget with a note of how far it got and resumes next time (the notes already written are the progress). One module at a time.

## Cost, as an estimate

A Haiku read of one module is 100 to 150k tokens (the trial: about 116k). The catalog's typical Haiku minion costs about $1.45 ([models](/framework/ai/system/models/)), so a module is **roughly $0.5 to $1.5**, and the 60-odd modules are $30 to $90 for a first pass, spread over days. Measure the pilot before trusting this number.

## Queued, not built now (the owner, 2026-10-24, item 15)

The audit needs a mastermind to run it and it is heavy, so it sits in the queue and is **not built now**. Two things were asked to be recorded.

**The open question: when a task enters the queue, is it built automatically, at what priority, and as a quick first version or a full plan?** Proposed answer, to be confirmed against how the queue actually behaves:

- **Automatically only when it is cheap or asked for.** A task enters the queue as a proposal. Node starts it by itself when its cost estimate is under about $3, or the owner has asked for it more than once (`node Server/RefineQueue.mjs --repeats`). Anything larger waits as a ranked proposal; it is built when the owner approves it or it reaches the top of the queue with budget to spare. This is the "masterminds propose; the top mastermind green-lights" rule in [the mastermind readme](/Servex/agents/roles/mastermind.md), applied to the queue.
- **Priority:** the queue's score (importance, re-asks, estimated cost). Work the owner can see this week outranks maintenance. A module-audit task is always **idle priority**: it runs only when nothing ranked is ready.
- **Quick first version, then plan if it earns it.** CLAUDE.md law 1: fastest working version first. A small or clear task is built straight away as the smallest working version. A plan is written first only for an architecture decision or a big project ([mastermind readme, "Plan or just do, by size"](/Servex/agents/roles/mastermind.md)). The audit itself is a project, so it is planned (this doc) and its pilot is the quick version.

Today the queue ranks tasks and starts the top ones ([task-queue.md](task-queue.md)); the "cheap proposals start by themselves" rule is the part not built, and the audit does not need it to run (it is started by the idle trigger, not by queue rank).

**The RAM limit:** each Haiku `claude.exe` takes **200 to 500 MB** of memory, so a wide audit is **overnight or downtime work**. One module's auditor at a time (not a fan-out), and only while `system_health` shows more than 4 GB free and fewer than the usual number of agents working. **Core modules first** (`core/Task`, `core/Item`, `core/Page`, then `ext/`), because everything else depends on them and an audit that finds a problem there pays back most.

## Build order

1. `AuditProcess` template plus a node script for the candidate ranking and the importance order (step 1's input and step 2's order).
2. **Pilot on one small module** (for example `core/Task`): run the five steps by hand through the process, read `audit.md`, judge it against what a person knows about the module. Log the cost per step.
3. If the audit finds things a reader agrees with, turn on the idle trigger for one module a day.

## Open questions, decided for now

- **How the manager picks:** a node-computed ranking, the manager only adjusts depth and budget. Alternative: the manager reads the module index and chooses; costs more and adds nothing a ranking misses.
- **Stale notes:** step 2 rewrites a note when the source is newer than the note; it does not judge whether the note is still true. The audit step flags notes that contradict the readme.
- **Where `audit.md` lives:** in the module folder, next to its readme, linked from it. The old `framework/audit/` snapshot stays as history.
