# Minion A — the fast cleanup call (`POST /api/tidy` on Servex)

Load the `minion` skill first, then the `code` skill. Parent task: `public/framework/ai/2026-09-28/dictation-playground/` (read its `requirements.md`). The owner's raw words: `public/framework/ai/2026/09/28/dictation-a-playground-and-a-better-proc/owner-words.md`.

## The owner's words (the part this serves)

> "we want the fast assistant to correct any typos, obvious typos, uh, capitalization, punctuation, like a lot of times … there'll be a question mark in the middle of the question or you know a sentence concludes and then a capital on the next word."
>
> "I'm a little worried that the, uh, the assistant is going to mangle the prompt intent by doing too much correction … the first pass is just sort of a more raw, um, kind of like nearly verbatim … Now we do want to remove fillers, ahs and ums and you knows and likes … removing an unnecessary word rarely changes the meaning."

## Work in the worktree

`C:/Code/lew42/worktrees/qf-3` (branch `worktree/qf-3`). Commit there. Never touch `C:/Code/lew42/monorepo` except your own `task.jsonl` log below. Never restart Servex or any server — your proof calls the function directly.

## Deliverables

1. **`Servex/agents/tidy.js`** — exports `async function tidy({ text, before }, { run_query = query } = {})` → `{ ok: true, text, model, ms }` or `{ ok: false, why }`. One no-tools model call with the SAME minimal options `jobs.js` `decide` uses (`tools: [], mcpServers: {}, strictMcpConfig: true, skills: []` — copy its full options block; without it the prefix is ~51k tokens). Model `claude-sonnet-5` (measured faster than Haiku on small jobs). `before` is the already-cleaned text that came before this chunk, given only as context so capitalization and punctuation at the seam come out right; the reply is ONLY the cleaned chunk.
   The prompt: near-verbatim cleanup only — fix obvious typos / mis-hearings only when certain; capitalization; punctuation (a question mark only at the end of a question; a new sentence starts with a capital); remove fillers (um, uh, ah, er, "you know", "like" used as filler, stutters and repeated words such as "the, the"). Never rephrase, reorder, summarize or change intent. Return the cleaned text only — no quotes, no commentary. Empty or whitespace-only input → `{ok:true, text:""}` without a model call.
2. **The route** in `Servex/Servex.js`, next to `this.cards.routes(router, cors)`: `router.options("/api/tidy", cors, …204)` and `router.post("/api/tidy", cors, express.json({ limit: "64kb" }), …)` → `res.json(await tidy(req.body ?? {}))`, 400 with `{ok:false, why}` when `text` is not a string. Nothing else in `Servex.js` changes.
3. **`Servex/proof/tidy-proof.mjs`** — calls `tidy()` directly (real model) on three samples and prints input, output, ms:
   - `so um i was thinking we should uh we should build the the playground you know`
   - `what do you think? about the the layout`
   - one with no fillers that must come back unchanged except punctuation/capitals.
   Also one run with a fake `run_query`, so it is testable offline. Run it; paste the output into your log.
4. `node --check` both files.

Every spawn/exec sets `windowsHide: true` (the SDK spawns claude itself; add no spawns of your own).

## Log

`public/framework/ai/2026-09-28/dictation-playground/tidy/task.jsonl` in the MAIN tree (new-task shape, `group: "dictate"`, append with `node .claude/hooks/append.mjs`). Land with a `log` line giving the three samples' outputs and ms, and the commit hash. Budget: under 120 lines of code in total. Report back in one short message when done.
