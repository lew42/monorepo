# model-latency — do model and effort level actually change response time?

You are a minion. Load the `minion` skill first. You are the **manager of one experiment**: you
design it, run it, judge it, and report it. Model: Opus.

## The owner's ask, verbatim (2026-09-19)

> My fast assistant (sonnet medium) is telling me it can't spawn minions with specific effort
> level? […] Is there no flag for effort level?
>
> The idea here, is that we're trying to get low latency UI updates via the faster sonnet model.
> Be the mastermind, spawn a minion to look into whether different models and effort levels
> actually affect response times. Have an opus minion manage the experiment, create several sample
> tasks, and give the same task to a bunch of models/effort levels, measuring the speed and quality
> of response. Create simple and complex tasks. Identify what type of concurrency dynamic is at
> play (file writes can conflict?).

The point of all of it: **the owner dictates, and wants a card on the dev bar within a couple of
seconds.** Which model, which effort, and which setup gets closest — and what is it costing in
quality?

## The three laws, and the length budget

Less is more (fastest working version first). Clear beats brief, by far. Prioritize. Your report
back to me is **one screen of plain sentences**; the result page leads with one chart or table a
newcomer can read in ten seconds; every number beyond that nests one click down.

## Deliverables — each is checked against the owner's sentence above

1. **The matrix, measured.** The same task given to several models × effort levels, timed.
   Models by FULL id (aliases resolve to old models silently): `claude-haiku-4-5-20251001`,
   `claude-sonnet-5`, `claude-opus-5`, and `claude-fable-5-1` sparingly (see Budget). Efforts:
   `low medium high xhigh max` — confirm which each model accepts. At least 3 repeats per cell
   you draw a conclusion from; report the median and the spread, never one run.
2. **Several sample tasks, simple and complex.** At least five, spanning: a one-word reply · a
   fast-assistant replica (the owner's dictated paragraph in, a card title of about five words
   plus two short sentences out — this is THE task that matters) · a one-tool task (read a file,
   answer from it) · a multi-tool task (write a small file, then verify it) · a genuinely hard
   reasoning or code task where effort should change the answer.
3. **Speed, broken into its parts** — not just a total. Per run: process start → `init` event,
   time to the first streamed token, total wall time, `duration_api_ms`, `num_turns`, thinking
   and output tokens, cost. Say which part dominates for the fast-assistant task. Test the
   levers that are not the model: how many tool round-trips the job takes (each is another
   request), and the size of the prompt prefix (my smoke run loaded **90 tools and a 41k-token
   prefix** because the user-level MCP servers came along — try `--strict-mcp-config`, a small
   `--tools` list, and a short `--system-prompt`, and say what each buys).
4. **Quality, judged blind.** For every task, a rubric written BEFORE the runs. Judge outputs
   with the model/effort label hidden and the order shuffled; use at least two independent
   judges and report where they disagree. For the hard task there must be a checkable right
   answer. The result the owner needs is a sentence like "Sonnet low is as good as Sonnet high
   on the card task and N seconds faster" — or its refutation.
5. **The concurrency dynamic, named.** Two separate questions, both measured:
   a. *Throughput:* run the same cell 1, 2, 4, 8 at once. Does per-call latency hold, degrade
      smoothly, or hit a wall (rate-limit events, local CPU, process start)? The stream emits a
      `rate_limit_event` — record it.
   b. *File writes:* what actually happens when agents write the same file at once? Test, in
      the scratchpad only: N processes appending lines to one `.jsonl` at the same moment (the
      way `say.mjs` and every `task.jsonl` work) — any lost, torn or interleaved lines on this
      Windows machine, and at what line length? And two headless agents told to `Edit` the same
      file at once — does one fail with a "modified since read" error, retry, or silently
      overwrite the other? Name the rule a mastermind should follow as a result.
6. **The effort question, settled by test.** Three ways to give a spawned worker an effort
   level exist on paper: the CLI flag (`claude -p --effort`), a custom agent definition
   (`.claude/agents/<name>.md` frontmatter, or the `--agents <json>` flag) and the Workflow
   tool's `agent({effort})`. The built-in Agent tool has a `model` parameter and no effort
   parameter — that is what the fast assistant ran into. Prove which routes really change
   behaviour (thinking tokens and latency are the evidence; `-p` transcripts do not record
   effort). Test agent definitions through `--agents <json>` so nothing is written into
   `.claude/` — see the fence.
7. **One recommendation**: the model + effort + launch setup for the fast assistant, the
   alternative that was viable, and the case in which the alternative wins. Plus one line each
   for the master assistant and for minions if the data says anything about them.

## The instrument — tested by me, 2026-09-19 17:28

Run from a scratch cwd OUTSIDE the repo, or the repo's hooks fire (the Stop hook nags for
`finish-task` and adds turns; a prompt hook may echo your test prompts onto the owner's live
dev bar). This recipe ran clean — Haiku low, "reply ok": init +1.4 s, first token +3.6 s, done
+4.8 s, 157 output tokens, one turn:

```bash
cd "<scratchpad>/model-latency/cwd"
claude -p "<task>" --model claude-haiku-4-5-20251001 --effort low \
  --output-format stream-json --verbose --include-partial-messages --setting-sources user
```

Each stdout line is a JSON event: `system/init` (model, tools), `stream_event` (the first
`content_block_delta` is your first-token time), `system/thinking_tokens`, `rate_limit_event`,
and a final `result` with `duration_ms`, `duration_api_ms`, `num_turns`, `usage`,
`total_cost_usd`, `modelUsage` (the model you really got). Stamp wall-clock times yourself in a
Node harness (`child_process.spawn`, timestamp each line as it arrives) and write one JSONL row
per run. `--bare` is not usable here (it skips the subscription login). The first call of a
model pays a cache write (41k tokens here); treat it as a warm-up row, mark it, and compare
warm rows with warm rows. Check `~/.claude/settings.json` for user-level hooks before trusting
a timing. The `fork-claude-session` skill has the rest of what this repo has learned about the CLI.

## Budget — this matters today

At 17:28 the 5-hour window was at **69% used with 76% of it elapsed**, and other minions are
spending from it too. It resets at **18:40 local**. So: before 18:40 run only the cheap cells
(Haiku and Sonnet, the simple tasks, the file-write tests, which cost nothing). Opus cells, any
Fable cell, `xhigh`/`max`, the hard task and the 8-at-once burst wait until after the reset. Fable:
at most a handful of runs in total, on the fast-assistant task only. Check usage with the
`check-claude-usage` skill before each wave and about every 15 minutes — never tighter — and stop a wave
that would cross the pace line (used% above elapsed%). Log the expected call count and cost of
each wave in your `task.jsonl` before it launches.

## The fence — other minions are in flight; the tree is shared

You may write ONLY:
- `public/framework/ai/2026-09-19/model-latency/**` (this dir: `task.jsonl`, `page.js`, a small
  `results.json` the page reads)
- one appended line per event in `public/framework/ai/2026-09-19/day.jsonl` (what `new-task` and
  `finish-task` write)
- the session scratchpad, under `model-latency/` — every script, raw row, transcript and test file:
  `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/1736b987-7cf0-4a02-9c6f-94a36cebb660/scratchpad/model-latency/`

Nothing else. Not `.claude/` (no agent definitions, no skills, no settings), not `Server/`, not
`say.mjs`, not the live board (`ai/v/3/board.jsonl`) — the experiment's headless agents must never
post to it either, so give them a scratch cwd and scratch files. Skip the `ai/usage.json` refresh;
I keep it. A skill that misled you still gets its one line via `skill-improvement` — that one
write is allowed.

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. You need
no server. If you spawn helpers with the Agent tool (blind judges, say), run them in the
FOREGROUND, several per message — a background helper's completion would notify me, not you.
Every `claude -p` you launch must be reaped: no orphaned processes when you land (list
`claude.exe`/`node.exe` you started by PID and confirm they are gone).

## The result page

`public/framework/ai/2026-09-19/model-latency/page.js` — load `new-page` and `layout` first.
Level 1, one screen: the answer in a sentence, then one picture — seconds to a finished card, by
model and effort, for the fast-assistant task. Below or one click down: the parts-of-latency
breakdown, the quality table, the concurrency findings, the effort-routes table, the method
and its caveats. Leave the dir undeclared in the day page's `children:` (the `new-task` rule); link
the page from your `task.jsonl` `links` so the AI board shows it.

## Landing

`finish-task`. Your final message to me: one screen — the answer, the recommendation, the
concurrency rule, what surprised you, what you could not measure and why — each with a link.
Resolve, don't park: a cell you could not run needs a reason a reader accepts.
