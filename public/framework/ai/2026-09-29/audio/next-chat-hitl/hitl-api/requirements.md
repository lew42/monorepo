# Minion: the smart assistant's two small model calls, POST /api/hitl

Load the `minion` skill first, then `code`. Your parent is task-mastermind-chat-hitl.

## The owner's words (full text: ../owner-words.md and ../../owner-words.md, "Continued (about 8:40 PM)")

> "on like a per sentence basis, trying to figure out the objective of each statement should be one of the objectives of the smart assistant ... put like a green check mark after it ... if there's a statement ... that isn't particularly clear or might have some ambiguity ... maybe it's like a yellow question mark ... the smart assistant could add clarification UI into the chat where it's like, needs clarity. Do you mean this or that?"
>
> "I could click on a title and say, hey, can we rename this? And then it suggests ... a drop down and then it has a whole bunch of alternatives"

## Deliverables

1. `Servex/agents/hitl.js`: exports the named ops and `hitl(body, {run_query})`, built exactly like `Servex/agents/tidy.js` (read it; the same minimal no-tools SDK options, the same swappable `run_query`). Do NOT edit tidy.js.
   - `{op:"marks", sentences:[string], context?:string}` → `{ok:true, marks:[{i, mark:"ok"|"unclear", purpose, question?:{ask, options:[string,string]}}], model, ms}`. One entry per sentence, in order. `purpose` is one short line saying what the sentence is for. `question` appears only when `mark` is `"unclear"`: a "Did you mean A or B?" with two concrete readings. Be lenient: comments and observations are "ok"; only a real ambiguity is "unclear".
   - `{op:"rename", title, context?:string}` → `{ok:true, names:[5 strings], model, ms}`. Five short, distinct, self-evident alternatives, not including the current title.
   - Ask the model for JSON and parse defensively (strip code fences); a parse failure answers `{ok:false, why}`.
   - Model: `claude-sonnet-5` for both (measured faster than Haiku on small jobs).
2. A route in `Servex/Servex.js`, right after the `/api/tidy` route, in the same `cors` + `express.json` shape: `OPTIONS` and `POST /api/hitl`. Named ops ONLY: an unknown `op`, or any `system` or `model` field in the body, is a 400. No other edit to Servex.js.
3. A proof, `Servex/agents/hitl.proof.mjs` (if a `*.proof.mjs` sits beside tidy.js, follow its shape): fake `run_query` cases (good JSON, fenced JSON, garbage, unknown op), plus ONE real call of each op run directly in node (no server). Paste its output into your task.jsonl.
4. Two lines naming `/api/hitl` and its two ops wherever `/api/tidy` is documented (Servex readme or doc).

## Fence

Work ONLY in the worktree `C:/Code/lew42/worktrees/chat-hitl` (branch `worktree/chat-hitl`). Your files: `Servex/agents/hitl.js`, `Servex/agents/hitl.proof.mjs`, the one route block in `Servex/Servex.js`, the doc lines. Commit by exact path only: the worktree has unrelated dirty files.jsonl files from its server boot, so never `git add .`. Never restart Servex or any server; the route goes live at a batched restart later. Every spawn sets `windowsHide: true`.

Length budget: hitl.js about 120 lines. Land by committing, then appending a landing line to your task.jsonl; your parent is woken automatically.
