# Coordination — how six agents stay out of each other's way

**One rule holds the whole protocol up: the logs carry everything, and a direct message is only
"blocked" or "done".**

Here is why that is the rule and not a preference. A message costs a turn of the receiver's
context, arrives once, and can never be read by anyone else afterwards — so a system built on
messages is a system where the state lives in agents' heads and dies with them. A log event costs
nothing, is durable, is readable by the dashboard, by the next agent and by the owner at any time.
So state goes in the log, and a message is a doorbell: it says "there is something new for you",
never "here is what happened".

## The envelope

Every injected message is wrapped so the agent can see who asked and where to answer. The
`agent-host` task is building it as a plain readable header the agent just reads:

```
[from: mastermind-tiers-design · reply to: mastermind-tiers-design · re: ev_8813]
Land what is proven and put the rest in the next brief.
```

Three fields. `from` — the id of the sender. `reply_to` — the id to answer, which is usually but
not always the sender (the master-mastermind can ask a minion a question on the fast assistant's
behalf and have the answer go back to the fast assistant). `re` — optionally the id of the log
event this is about, so the answer can reference it and the fold can thread them.

An agent that receives an envelope answers by appending an `agent_msg` event to its own log with
`reply_to` set, and by sending one doorbell. It does not summarise what it did in the message;
that is already in its log.

## Routing a prompt when several masterminds are running

**Today** there is exactly one, and `say.mjs state` prints its name off a `mastermind_session`
field the mastermind writes into its own run ledger. That works for one and silently breaks for
two — two masterminds have already run at once, each blind to the other.

**What replaces it: the registry.** Every live agent is a row — `{id, role, topics, page, state,
visibility}` — written when Servex spawns it and updated on every state change. `list_agents` is
the source of truth; `say.mjs state` prints it so the fast assistant still reads one screen.

The fast assistant's routing is then three lines, in order:

1. **Post the card first, always.** Before any routing decision, the owner's words are on the
   board under a topic id. A routing mistake must never be able to lose the words.
2. **Match** the prompt against every live agent's `topics`, and against `page` when the owner
   names a page ("that sidebar", "the board"). Exactly one match — send there.
3. **Anything else routes UP, never sideways.** No match, or several matches, goes to the
   `mastermind`. Disambiguating is cheap for the executive tier and expensive for a Sonnet at low
   effort, so the cheap tier never guesses.

## A follow-up reaching the minion already on that page

This is the same lookup. The registry's `page` field says who holds a page; the rule that makes it
trustworthy is already in force — **one page, one minion, in sequence**. The owner says "make that
narrower"; the fast assistant posts the card, finds the holder, and sends the envelope to that
session. If nobody holds it, it goes up to the master-mastermind, which spawns someone.

⚠ Write every follow-up so a **cold** agent can execute it — file and line, never "as you did
before". A landed agent's transcript can vanish, and a resumed session that has lost it will
cheerfully do the wrong thing.

## What a mastermind does every cycle

The mastermind skill runs a six-step cycle today. Under Servex, three of those steps are not a
mastermind's job at all:

| step | today | verdict |
| --- | --- | --- |
| 1 Usage | run a script, refresh a snapshot file | **move to Servex.** Every headless run already reports a rate-limit event; Servex reads it off the stream and keeps one live number. The mastermind reads a number; it never runs a script. |
| 2 Harvest | poll for finished agents, judge, log outcomes | **keep the judging, delete the polling.** A completion is an event that wakes the parent. |
| 3 Prioritize | rank the queue | **keep — master-mastermind only.** A task mastermind has one task and nothing to prioritize. |
| 4 Spawn | write a brief, mint an id, run the CLI by hand | **split.** Writing the brief stays with the mastermind. Minting the id, writing the launch line, loading the role skill and starting the process move to Servex's `spawn_agent`. |
| 5 Log | `now` lines, `agent` lines, `steps`/`step` | **cut it as a step.** Logging is continuous, not a phase: the hook writes file touches, the agent writes its own decisions, and `steps` is one field the spawn call sets. |
| 6 Wakeup | schedule the next cycle | **keep for the master-mastermind** as a heartbeat — it is the one agent that must survive an idle hour. **Cut for a task mastermind**, which lives in memory and wakes on an event. |

What is left is four steps, and they fit on one line: **read the number · harvest what arrived ·
decide what is next · dispatch it.**

## What "done" means, and who says so

**The acceptance test is the owner's sentence** — the verbatim words in the raw prompt the task
descends from, which is why the brief carries them at the top instead of a summary. Each numbered
deliverable is checked against that sentence by name. A smaller, easier version built instead is a
**miss**, not a partial win.

Three people check, in this order, and only the first two can block:

1. **The task mastermind**, at harvest, deliverable by deliverable against the sentence.
2. **The master-mastermind**, which spot-checks exactly **one** deliverable by *opening* it — the
   page, not the log. This step exists because on 2026-09-19 three tasks in a row verified a
   sidebar with numbers (0px drift, 80/80 crawl checks, 0 console errors, all true) and none of
   those numbers can see a 46px row.
3. **The owner**, with ✓ or ✗ on the card. Their word is final and it never blocks — work does not
   wait for it.

And three checks catch what a sentence cannot: the page loads with **zero failed requests**; there
is **one picture of the whole thing** at 1920; and every page created is **linked from somewhere a
reader already is**, because nothing in this site crawls the filesystem.
