# One refiner: inventory + this week's coverage (study only)

Budget: $3. Load the `minion` skill first. Read-only study: **change no code, retire nothing.** You write only inside this folder (`one-refiner-plan/`) plus your own `task.jsonl` log lines. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Commit your files by exact path when done (`git add <paths>`; `git commit -m "..."`), on the current branch in the main tree.

## Why

The owner asked (2026-11-06/07) for three things:
- **Coverage 100%:** every sentence they say lands in a task.
- **One refiner:** keep one of the 8 prompt-refinement mechanisms.
- **Lessons first:** write down what each old system does well before retiring it.

Source record: `public/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/`. Base docs (read these first, they are the current claim you are verifying): `public/framework/ai/doc/prompt-refinement-map.md` (the 8, verified 2026-10-24) and `public/framework/ai/doc/prompt-refinement-and-tasks.md`. The calibration (Sonnet beats Haiku on parts): `public/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/calibration/results.md`.

## Deliverable 1: `inventory.json`

One object per mechanism. Start from the map's 8 (prompt-relay hook; PromptTasks + PromptRecords `live`; PromptRecords `review`; RefineQueue + `public/framework/ext/Refine/RefinedCard.js`; PromptAudit; Echo `Servex/agents/Echo.js`; LiveRefine `Servex/ext/refine/LiveRefine.js`; the day batch tools). Also place these, named by the requester, either as one of the 8 or as "capture, not a refiner": `Server/ClaudeCodeTranscript.mjs`, Dictate's `sentences.add` shape (`Servex/agents/ChatWriter*.js`), and `Ask.write` (find it: `Server/Ask.mjs` or `public/framework/ext/Ask/Ask.js`). If the code shows the 8 have changed since 2026-10-24, say so.

Fields per mechanism:
- `name`, `paths` (repo paths), `kind` ("capture" | "refiner" | "audit")
- `api`: what it does, as one or two lines of JS/pseudocode (e.g. `PromptRecords.live(session, promptLine) → prompts.jsonl parts + ≤15 tasks`)
- `callers`: who calls it today, from `git grep -n` (file:line), and whether a hook/Servex/schedule runs it or only a human
- `live`: "live" | "manual" | "dead", with `last_write`: the newest date it wrote data (find the file it writes and the newest line/mtime; `git log -1 --format=%ci -- <file>` is fine). Prove a "dead" with the empty grep or the old date.
- `lesson`: the ONE thing it does better than the others (one sentence, concrete, e.g. "cites every sentence by number, so coverage is computable"), and `evidence` (file:line or a number).
- `model`, `cost_note` if known.

## Deliverable 2: `coverage.mjs` + `coverage.json`

A node script (in this folder) that computes, for the last 7 days (2026-11-01 to 2026-11-08), per channel:
- channels: **VS Code** (hook prompts, `Prompt` items in session `page.jsonl` / `prompts.jsonl` raw rows), **cloud voice** (the cloud-voice-app sessions' owner prompts), **web dictation** (Dictate / `v-*` sessions' sentences). Reuse `public/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/mentions-plan/count.mjs` for how to find each channel's prompts.
- `prompts`, `sentences` (split as PromptRecords does, reuse its splitter if importable), `refined` (sentences cited by any `parts` line in that session's `prompts.jsonl`), `placed` (sentences whose part is the `source.part` of a task in the session's `session.jsonl`), and `coverage = placed / sentences`.
Two numbers that must agree: the script's prompt total per channel must equal `count.mjs`'s total for the same window (state both). If a channel has no refinement at all, coverage is 0 and say why in one line.

## Report

Log findings as `log` lines in your `task.jsonl` (never a findings.md). Final message: one line per mechanism (`name: live|manual|dead — lesson`), the coverage line per channel, the cost. Under one screen.
