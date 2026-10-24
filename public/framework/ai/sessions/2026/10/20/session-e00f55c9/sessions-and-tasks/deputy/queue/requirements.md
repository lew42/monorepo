# Task queue: a live page the owner can open

The owner opens one page and sees each queued task: what it is, why, its estimated cost and its priority.

- **Budget:** $8, Sonnet, medium effort.
- **Parent:** `mastermind-deputy` reviews and merges. You don't merge or restart Servex.
- **This brief is the first slice only:** find what exists, sketch the class, shoot the look.
- **Stop when the look is shot.** No more UI until the owner approves it.

## The owner's words

`../../../prompts.jsonl`, the `"stage":"raw"` line at 2026-10-24T00:33:33Z, from "we need to create a task queue" to the end: "a task queue that prioritizes things based on cost, estimated cost, based on priority or importance ... if I keep asking for something that was supposed to be done and hasn't been finished ... it should be object oriented. You should be able to link me to it. I can see how it works in real time ... how the agents are spawned and how the tasks are queued ... I don't want you to tell me, I want you to show me." The task on the session record: `create-a-task-queue-that-prioritizes-wor`.

## 1. Find what exists (one queue, not a second one)

Run the `past-work` skill first. These pieces already order or hold work; read each one's readme or doc and code, and nothing more:
- **TaskLoop**, `Servex/TaskLoop.js` ([doc](/Servex/doc/task-loop.md)): the tick, `queue` lines, `launch()` of an approved task that carries an `agent` config.
- **Dispatcher**, `Servex/agents/Dispatcher.js`: how a routed ask becomes an agent.
- **Task.rank**, `public/framework/core/Task/Task.js`: recency × weight, where the weight is `priority.score`. The triage just gave about 22 tasks `priority {score, big}`, where `big` is the number of the big thing in priority.md.
- **priority.md**, `public/framework/ai/priority.md`: the three big things.
- **The asks ledger**, `public/framework/ai/asks.jsonl`, and the inbox (`waiting_on: "owner"`). Also `node Server/RefineQueue.mjs --repeats`, which lists asks the owner made more than once.

Write `what-exists.md` here, one screen long. For each piece, say what it orders, where its data lives and who reads it. Then name **the one** that becomes the queue, and what each of the others becomes (a view of it, an input to it, or left alone).

## 2. The class sketch (`plan.md` here)

Use the `make` and `code` skills. Settle the queue class's name and home first. Then list the properties of each queued item. Each one comes from a record, never from an agent's memory (law 7):
- **what:** the task's title and its context (its parent session or module, shown as a breadcrumb).
- **why:** the ask it came from, linked.
- **estimated cost:** computed from real cost lines (the cost of similar past tasks, or the template's model). Say how.
- **priority:** a score built from three things. Importance is the big thing it serves. Cost is the estimate above. Re-asks is how many times the owner asked again for it while it stayed unfinished. Write the formula in a few lines and name the numbers that tune it.
- **state:** queued, running or waiting, plus who is running it.

The sketch says how it shows **live**: per [rules.md, "Show the class, and its live instances"](/framework/doc/rules.md), a page lists the real instances and their properties as the program runs. It reads from a JSONL record or Servex's API with a `live()` tail, never by polling.

## 3. The look (stop here)

Work in your own worktree (`take_worktree`).

1. **Build the smallest slice:** one page listing the top 20 of the real queue with the properties above, read from real records.
2. **Read only.** Don't change TaskLoop or the Dispatcher.
3. **Shoot it headless** at 400 and 1200 px (`mcp__site__shot`, or `node Server/layout-check.mjs` against your worktree's server). Commit.
4. **Log, then stop:** `{"log":{"at":"NOW","msg":"show: <shot paths> — the queue's look, for the owner's approval"}}`, link the shots from `plan.md`, and stop. Don't run review.mjs yet: that comes after the owner approves the look.

Log to `session.jsonl` here at least every 10 minutes.
