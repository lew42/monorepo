# The roles, one table

Every kind of agent this system spawns, in one row each. Nobody does the job above them or the
job below — the point of keeping them separate is that a role that must answer in two seconds
never has to think, and a role that thinks never has to be fast.

Renamed 2026-09-29 (the owner, 6:40 PM voice session, "Continued" in
[`owner-words.md`](/framework/ai/2026-09-29/audio/owner-words.md)): "manager" and "master
assistant" are retired **words**. Say the row's name below instead — old words are kept once,
in the **was called** column, and used nowhere else.

| Role | What it does | Model · effort | Who starts it | Skills it loads | Was called | Built today? |
| --- | --- | --- | --- | --- | --- | --- |
| **Fast assistant** | One per voice session. Puts your words on screen as fast as possible, nothing else — no deciding, no filtering. Runs only while the mic is on. | Sonnet · low | The ✦ rail, the moment the mic turns on | None — its own fixed brief (`session-fast.md`) | — | **Yes** — role `session-fast` in [`roles.js`](/Servex/agents/roles.js), spawned by `Sessions.js` |
| **Smart assistant** | One per voice session, for its whole life. Hears everything, refines the ask (`Server/refine.mjs`, so nothing said is dropped), decides, routes a technical question to the right **directory mastermind**, and launches a **task mastermind** when something needs building. Hears every line by a direct send from `Sessions.js` (decision `d-hear`), not `follow` — `follow` is for someone else, such as a directory mastermind, echoing the same session's log. | `Usage.pick("session-smart")` — a lower or higher model depending on the week's usage | The ✦ rail, once per voice session | None yet — its own fixed brief (`session-smart.md`). See **Shared with the task mastermind**, below. | "global assistant" (the first loose idea for it); the "spawn the right mastermind" half of "master assistant" | **Yes** — role `session-smart` in `roles.js`, spawned by `Sessions.js` |
| **Directory mastermind** | Answers a technical question, or does a task, about one folder. Starts **fresh** every time, from that folder's whole readme chain, with the exact same opening prompt every time (so the model's cache is shared) — never forked. Reused for a follow-up question in the same voice session; a new topic gets a new one. A question changes nothing; a merge is the only thing that updates the readme. | Same posture as the task mastermind, `permission_mode: "plan"` (a question changes nothing) | The smart assistant, routing a technical question — or the owner, directly | `sub-mastermind` + `page` (same as the task mastermind: see below) | "manager" | **Yes** — role `directory-mastermind` in `roles.js`, spawned by `ask_directory` ([`directory.js`](/Servex/agents/directory.js), [`doc/directory.md`](/Servex/agents/doc/directory.md)) |
| **Task mastermind** | Owns exactly one task, start to finish: reads its requirements page, decides whether it needs a worktree, splits it into minion-sized pieces with non-overlapping fences, spawns and watches the minions, judges each deliverable against the owner's own sentence, merges, lands, and reports one screen upward. | Opus (Sonnet, effort medium, while the Dispatcher runs in budget mode) · high | The master-mastermind, the Servex mastermind, or a `route: "task"` card (`Dispatcher.js`) | `sub-mastermind` + `page` | "sub-mastermind" (still its alias — `role: "sub-mastermind"` works the same as `role: "task-mastermind"`) | **Yes** — role `task-mastermind` in `roles.js` |
| **Minion** | Builds one thing, proves it, lands it, and stays resumable by session id for a follow-up on the same page. Reports to its task mastermind, never the owner. | Sonnet builds · Opus judges · Haiku scans, one per page | Its task mastermind | `minion`, plus whatever the work needs (`code`, `layout`, `css`, …), loaded on demand | — | **Yes** — role `minion` in `roles.js` |
| **Servex mastermind** | The systems architect for the whole agent system: audits layout, spend, coordination and crashes across every card, and improves the *system* (skills, briefs, tools) — never routine work itself. | Fable-tier posture (the architect tier; no live Fable row yet, so it runs on Sonnet/Opus today) · high | The owner, stood up once | `servex-mastermind` | — | **Yes** — role `mastermind` in `roles.js` (today's instance: `mastermind-servex-6`) |
| **Clarity** | Woken fresh per task landing or per proposal. Checks what was written for the owner against the `content` skill, and turns a failure into a rewrite sent back to the agent that owns it. One pass, then stops. | Sonnet · medium | `Server/clarity.mjs`, automatically | `clarity` | — | **Yes** — role `clarity` in `roles.js` |
| **Log assistant** | Woken only when an append fails its naming check — two agents naming the same thing differently, a rename aimed at a name the owner has already seen, a dispute needing a consensus. Reads the contested lines, appends one verdict, and stops. Exists only between conflicts. | Sonnet · low | The log appender, on a naming clash | `log-assistant` | — | **Yes** — role `log-assistant` in `roles.js` |
| **Reviewer** | The fresh-eyes smoke test in the build order's step 3: reads nothing but the finished readme chain (`load_module`) and says whether it makes sense, writing `<taskdir>/docs-check.md`. | Sonnet | A task mastermind or minion, after the docs are updated, before `review.mjs` | None named — it reads only what `load_module` hands it | — | **Not a `roles.js` row yet** — `spawn_agent({role: "reviewer"})` runs on whatever posture the caller passes, since `roles.js` has no `reviewer` entry to fall back on |

## Shared with the task mastermind

The smart assistant and a task mastermind are both spawned mid-conversation to get something
built, so they share the **quality discipline**, never the **finishing** discipline:

- **Shared:** "files for the next agent, cards for the owner" (write what a future agent needs
  into a file it will find; tell the owner on a card, never bury it in chat) — the identical
  paragraph sits in both `every-prompt` and `sub-mastermind` today. Both also load `page`/`content`
  before writing anything the owner reads, and both route a module question to its expert
  (`ask_expert`) before reading the module by hand.
- **Not shared:** judging a finished deliverable against the owner's own sentence, and landing a
  task. The smart assistant never lands anything itself — that is exactly why it spawns a task
  mastermind instead of building directly.

## The echo pattern (item 9)

The smart assistant and a directory mastermind can both be following the same voice session's log
at once — never just one of them holding the only copy of what was said. That "both tail it, one
just decides more" arrangement is `follow(path)`, a Servex tool: see
[`../follow/requirements.md`](/framework/ai/2026-09-29/follow/requirements.md).

## Not the per-voice-session pair: the older, text-only front desk

`assistant` / `assistant-fast` (skill `every-prompt`, `Servex/agents/Assistant.js`) is a separate,
older mechanism: the always-on lobby that answers a *typed* prompt with no voice and no card (the
VS Code sidebar, a dev-bar message). It keeps its own name — it is not one of the per-voice-session
roles above, and this task did not touch it.
