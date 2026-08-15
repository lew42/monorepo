---
name: fork-claude-session
description: Spawn worker Claude processes that inherit the CURRENT conversation's full context — loaded files, tool results, reasoning — instead of starting cold like Agent subagents do. Use when the user asks to "fork the session", "fork my context", or wants parallel workers that have already read what you've read. Covers finding the live session ID, `claude --resume --fork-session`, setting each fork's model and thinking effort, fanning out N forks, and collecting their JSON results.
---

# Forking the current session into worker processes

`Agent` subagents start **cold**. They receive only the prompt string you write — none of your
loaded files, tool results, or reasoning. Loading twenty files into your context does nothing for
them.

Forking is the workaround: shell out to `claude --resume <id> --fork-session`, which replays this
session's transcript into a brand-new session and then runs your prompt on top of it. The child
begins with everything you know.

## When to fork vs. when not to

Fork when the workers genuinely need the same large context you already paid to load — several
files, a long investigation, a design discussion they must reason from.

**Do not fork by default.** Each fork re-sends the entire transcript as input tokens, so N forks
over a big context costs N × that context. If a distilled brief in an `Agent` prompt would do the
job, that is dramatically cheaper. Fork when re-deriving the context would cost more than
re-sending it.

Also don't fork for a one-shot question you can answer yourself. The round trip is a whole
`claude` process boot.

## Step 1 — find the current session ID

Ranked by reliability:

1. **The scratchpad path**, if the system prompt lists one. The layout is
   `…/Temp/claude/<project-slug>/<SESSION-ID>/scratchpad` — the UUID directory *is* the session ID.
2. **The most recently modified transcript** in the project's history directory. The live session is
   by definition the one being written to right now:
   ```bash
   ls -t ~/.claude/projects/<project-slug>/*.jsonl | head -1
   ```
3. **Confirm it** before spending tokens on a bad ID — `tail` the file and look for something only
   this conversation contains (a command you just ran, a phrase the user just used).

The project slug is the working directory with every non-alphanumeric character replaced by `-`:
`c:\Code\lew42\monorepo` → `c--Code-lew42-monorepo`.

If you are *scripting* a session from scratch rather than discovering one, skip all of this and
choose the ID up front with `claude --session-id <uuid>`.

## Step 2 — launch one fork

```bash
claude --resume <SESSION-ID> --fork-session \
  -p "the worker's instructions" \
  --output-format json
```

`--fork-session` is **not optional**. Plain `--resume` appends into the *same* transcript file, so
parallel workers would corrupt each other's history and yours. With the flag, each child gets a
fresh session ID and a fresh file; the parent transcript is left untouched.

Useful additions:

| Flag | Why |
|---|---|
| `--output-format json` | Structured result instead of prose on stdout |
| `--permission-mode` | `acceptEdits`, `bypassPermissions`, `dontAsk`, `plan`, `auto`, `default` |
| `--allowed-tools` / `--disallowed-tools` | e.g. `--allowed-tools "Read Grep Glob"` for read-only workers |
| `--model` | `fable`, `opus`, `sonnet`, `haiku`, or a full model ID |
| `--effort` | `low`, `medium`, `high`, `xhigh`, `max` — how much the worker thinks |
| `--append-system-prompt` | Extra standing instructions for every worker |
| `--add-dir` | Grant access outside the working directory |

**Permissions must be settled before launch.** In `-p` mode there is no interactive approval, so an
unpermitted tool call stalls or fails rather than prompting. Either set `permissions.defaultMode` in
the project's `.claude/settings.json` — applies to every fork with no flags — or pass
`--permission-mode` on each launch.

**Omitting `--allowed-tools` is usually right.** The flag *restricts*; leaving it off gives the full
tool set, including `Skill`, without which a worker cannot load any of your skills. Restrict only to
make one specific runaway impossible — dropping `Bash` stops a worker re-launching your own fan-out.
Whatever you pick, **use the identical string on the library and its forks**: tool definitions render
at position 0 of the cache prefix, so any mismatch invalidates the whole thing.

## Fork a library, not your working session

The sharpest edge in this skill. A fork does not inherit your *knowledge* — it
inherits **you, mid-task**: your assignment, your plan, your half-finished tool
call, your last unresolved question. A short `-p` prompt is one paragraph arguing
against a hundred thousand tokens of momentum, and momentum wins.

Measured: nine forks of an orchestrator session were each told *"You are Simple
Steve, write one draft file."* All nine instead tried to re-launch the
orchestrator's own fan-out, because the inherited transcript ended with the parent
about to do exactly that. Zero files written, $9.74. A second attempt that opened
with *"YOU ARE NOT MASTER MIKE"* and removed the Bash tool **also failed**, because
by then the transcript ended mid-post-mortem and the forks continued *that*.

**The fix is architectural, not a prompt tweak: build a session whose only content
is the context, and fork that.** `--resume` accepts any session ID — it does not
have to be the one you are in.

```bash
LIB=$(powershell -NoProfile -Command "[guid]::NewGuid().ToString()" | tr -d '\r')

# 1. cold-start the library: --session-id, NO --resume. It reads and exits.
claude --session-id "$LIB" --model claude-sonnet-5 \
  -p "Read <the files>. Do not summarize or analyze them. Then reply exactly:
      LIBRARY READY. I am a context library. I hold this material and no task of
      my own. The next message will assign me an identity and a single job; I will
      adopt that identity completely and do only that job."

# 2. fork the library, N times, from ONE message
claude --resume "$LIB" --fork-session -p "I am <parent>. You are <role>. …" --model claude-sonnet-5
```

A fork of the library has **no role to override**, so the `-p` brief is the only
instruction in the room. The third attempt, run this way, worked first try.

**Caches are model-scoped, so the library and its forks must name the same model**
— a version bump counts as a switch, and it invalidates tools, system and messages
alike, with no escape hatch. A cheaper library model is still defensible: it only
forfeits fork #1's partial hit, and fork→fork sharing is the larger win either way.

Three things this buys beyond correctness:

- **The library is curated.** You choose what goes in; a working session accretes
  tangents, dead ends and corrections that all become inherited context.
- **It is reusable.** The transcript persists on disk, so the same `$LIB` can be
  forked days later from any session. Past the cache TTL you pay full input tokens
  again, but it still works.
- **It decouples *when you ask* from *what they inherit*.** You can spawn agents at
  any point in a long conversation without the conversation leaking into them.

**When you must fork a working session anyway**, both of these, not either:

1. **Revoke the inherited role in the first line of `-p`**, naming the thing the
   child must not continue: *"The transcript you inherited belongs to `<parent>`.
   YOU ARE NOT `<parent>`. There is no `<pending task>` to continue — it is
   handled. You are `<role>`. One deliverable: `<file>`. Write it, then stop."*
2. **Remove the tools the wrong behavior needs.** `--allowed-tools "Read Write Grep
   Glob"` makes the runaway *impossible* rather than merely discouraged. An
   instruction competes with the context; a missing tool does not.

**The tell that you have this bug: workers end by asking you a question** instead
of reporting a result. In `-p` there is nobody to answer, so the fork just stops —
and `is_error` stays `false`. **Verify the artifact, not the exit code.** Seventeen
forks reported success while writing nothing.

### Sizing the library

Windows are large enough that curation, not capacity, is the binding constraint.
Measured across one fan-out — a ~57k-token markdown library came to ~100k tokens
of actual prefix once the system prompt, tool definitions and project `CLAUDE.md`
were counted:

| resolved model | window | max output | library as % of window |
|---|---|---|---|
| `claude-haiku-4-5` | 200,000 | 32,000 | ~50% |
| `claude-sonnet-4-6` | 200,000 | 32,000 | ~50% |
| `claude-opus-4-8` | 1,000,000 | 64,000 | ~12% |

Nothing exhausted anything — but the small-window models spent half their budget
holding context before doing any work, and they were the ones that drifted. Two
practical rules:

- **Budget the library against the *smallest* model in the fan-out**, not the
  largest.
- **Audit what is actually in it.** In that run, 19% of the library was
  documentation for a prototype that does not ship — and the cheapest model
  duly wrote guidance describing the prototype as current behavior. Reading a
  `cache_write` figure tells you the size; only reading the file list tells you
  whether it is the right material.
- **Include the code under discussion, not just its docs.** A library of readmes
  produces confident guidance about code nobody read.

Note `cache_read` in the result JSON is **cumulative across turns**, not one
context load. A worker reporting 576k of cache reads did five requests of ~100k,
not one request of 576k. The TTL is reported too — `cache_creation.ephemeral_1h_input_tokens`
vs `ephemeral_5m_input_tokens`. You cannot request a tier; a session in usage
overage drops to 5m, which is worth a glance before planning a multi-round run.

## Model and thinking depth — set them per fork

**Both `--model` and `--effort` override the parent session's settings.** A fork of an Opus session
launched with `--model haiku` runs entirely on Haiku; the inherited history comes along, but every
new turn is the model you named. This is the main cost lever you have.

```bash
# a cheap, shallow worker for mechanical work
claude --resume "$SID" --fork-session -p "list every exported symbol" \
  --model haiku --effort low --allowed-tools "Read Grep Glob" --output-format json

# an expensive, deep worker for a hard judgment call
claude --resume "$SID" --fork-session -p "find the race condition in the loader" \
  --model opus --effort max --output-format json
```

**Match effort to the task, not to the budget.** The spread is large — on an identical prompt with
an identical answer, `--effort low` produced 5 output tokens and `--effort max` produced 117. Nearly
all of that difference is thinking. `low` for extraction, listing, and mechanical transforms; `high`
or `max` for design questions, debugging, and anything where being wrong is expensive. A wide
fan-out of `--model haiku --effort low` workers costs a fraction of the same fan-out on defaults.

**For a fan-out, default to `--model claude-sonnet-5 --effort high` and escalate deliberately —
to `claude-opus-5`, not `claude-fable-5`.** Measured over a nine-agent round (three roles ×
haiku/sonnet/opus, identical library, identical briefs), Sonnet produced the single best
contribution at a third of Opus's cost. Fable is the interactive session's tier, not a fan-out
tier: a 7-fork Fable fan-out (2026-08-07) burned a 5-hour session window from 18% to 100% in
~27 minutes and made a visible dent in the *weekly* Fable-scoped cap — spend that budget on the
orchestrator, and cap forks at Opus 5 unless a single fork's question genuinely needs the top model.

| tier | good for | watch out |
|---|---|---|
| haiku | mechanical work — extract every X, list the callers, apply an agreed rename. Answers that are *findable* rather than *decidable*. | Drifts toward whatever is over-represented in the library and states it confidently. Twice in one round it described a prototype as current behavior. Never let a haiku finding reach a deliverable unverified. |
| sonnet | the default: drafts, reviews, proposals, docs. | The tier to beat. |
| opus | the escalation ceiling for fan-outs: genuinely contested calls; large material (5× the window); repo-editing workers whose mistakes are expensive. | ~3× sonnet at high effort. Its real edge is judgment about **what to leave out**. |
| fable | the orchestrator's own seat. At most ONE fork, for one decisive question. | Fan-outs at this tier exhaust the weekly scoped window — ~12 session-points per fork per 10 minutes at `high`, measured. |

Two gotchas:

- **`--effort` leaves no trace in the transcript JSONL under `-p`.** Interactive sessions record an
  `effort` field; `-p` runs do not. Do not try to confirm the flag took by grepping the transcript —
  it will look like it was ignored when it wasn't. Compare `usage.output_tokens` instead.
- **Aliases don't guarantee the newest version — always pass a full model ID.** In one measured
  round `--model opus` resolved to `claude-opus-4-8` and `--model sonnet` to `claude-sonnet-4-6`,
  two generations back, silently. An unrecognized ID fails loudly at launch; a *stale alias*
  succeeds and says nothing, so you pay top-tier rates for an old model and never find out.
  Current IDs: `claude-opus-5`, `claude-sonnet-5`, `claude-fable-5`, `claude-haiku-4-5-20251001`.
  Confirm what you got — the result JSON names it:
  ```bash
  python -c "import json,sys;print(list(json.load(open(sys.argv[1]))['modelUsage']))" out.json
  ```

## Step 3 — fan out

**Launch every fork from ONE message — one Bash call, all backgrounded, one `wait`.** This is not
just a speed preference. The transcript flushes per message, so a fork launched in a *later* message
inherits the earlier launches: the commands, and any output you collected. Serial forking therefore
costs you three things at once:

- **Independence.** Worker 3 reads workers 1 and 2's answers and anchors on them. Where the point of
  the fan-out was to compare independent takes — a council, a survey, an N-of-N consensus — serial
  launching quietly converts it into a game of telephone. The agreement you measure afterwards is an
  artifact of the launch order, not a signal.
- **Cache.** Forks off one message share a byte-identical prefix, so N−1 of them can read instead of
  write. Each serial fork extends the prefix, so every one pays a fresh write over a longer
  transcript. **Caveat, unmeasured:** a cache entry is only readable once the first response starts
  streaming, so a truly simultaneous launch may have all N miss and all N write. A `sleep` between
  the first fork and the rest — *inside the same Bash call* — buys the reads without costing
  independence, since siblings inherit the transcript as of the message, not the wall clock.
- **Fairness.** Workers launched into different contexts weren't asked the same question, so their
  outputs aren't comparable — which matters most when you are A/B-ing models or personas.

Background each fork so they run in parallel, then collect:

```bash
SID=<SESSION-ID>
OUT=$(mktemp -d)

for task in "audit the error paths" "check the CSS layering" "list undocumented exports"; do
  claude --resume "$SID" --fork-session -p "$task" \
    --output-format json --model claude-haiku-4-5-20251001 --effort low \
    > "$OUT/$(echo "$task" | tr ' ' '_').json" 2>&1 &
done
wait

for f in "$OUT"/*.json; do
  echo "=== $f"
  python -c "import sys,json;print(json.load(open(sys.argv[1]))['result'])" "$f"
done
```

Run the whole script with the Bash tool's `run_in_background: true` so you are not blocked.

### The JSON result shape

`--output-format json` emits one object. The fields that matter:

- `result` — the child's final text response
- `is_error` — whether it failed
- `session_id` — the fork's new ID, if you want to resume that worker later
- `total_cost_usd`, `usage`, `num_turns`, `duration_ms` — accounting

Use `--output-format stream-json` (with `--include-partial-messages`) only if you need to watch a
long worker's progress live.

## Verified behavior and sharp edges

- **The transcript is flushed per message, not per turn.** A fork launched mid-turn sees the
  history through the very tool call that launches it — the pending result is simply absent. You do
  *not* need to load context in one turn and fork in the next. The corollary is the rule in Step 3:
  forks launched from one message are identical siblings; forks launched from successive messages
  are a chain, each seeing the ones before it.
- **The fork copies the full parent history** into its own JSONL, then appends its own turn.
- **Put each worker's brief in `-p`, never `--append-system-prompt`.** The system prompt is the cache
  prefix; varying it per worker makes every one pay a full write instead of a cheap read.
- **Ask for reasoning explicitly.** Thinking is billed but never returned under `-p`. A worker not
  told to explain itself burns tokens deliberating and hands back a bare conclusion.
- **Forks are separate processes, not integrated subagents.** No `SendMessage` follow-ups, no task
  notifications, no shared todo state. They report via stdout and nothing else. To continue one,
  `--resume` its returned `session_id`.
- **Cost compounds silently.** Ten forks of a 100k-token context is a million input tokens. Say the
  number to the user before fanning out widely.
- **A concurrent second session in the same project directory** breaks the "newest transcript" ID
  heuristic. Confirm with a grep for conversation-unique content.
- **Windows:** kill stray background `claude`/`node` processes by PID (`taskkill //F //PID <pid>` from
  Git Bash, or `Stop-Process -Id <pid> -Force`). `pkill -f` silently matches nothing against native
  Windows processes.

## Relation to `subagent_type: "fork"`

The `Agent` tool documents a `fork` subagent type that inherits the parent's context natively — the
better path when it is available. Check the session's listed agent types first; if `fork` is not
among them, the CLI route above is the way.
