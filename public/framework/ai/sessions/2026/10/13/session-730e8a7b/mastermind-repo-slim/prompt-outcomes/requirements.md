# Asks tally: what was asked, what landed

Budget: $25. Load the `sub-mastermind` skill first; you are an Opus task mastermind who orchestrates Haiku minions and never reads a transcript yourself. The owner's raw words: `../requirements-2.md`, ask 2 ("tally up the number of requests for specific features… looking at the full session prompt log… Haiku might be good enough… don't do repeat work if certain tasks have already been audited… confidence that we've handled all of my prompts accurately… I asked for a whole bunch of things that just were never done"). Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; Haiku under 100k tokens a job (aim 30–60k), chunked by a script; never destructive.

## What exists

- **Prior audit (extend, don't restart):** `public/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/` (`audit.mjs`, `audit.json`, `report.md`).
- **Routed asks:** `public/framework/ai/asks.jsonl`, the ledger of asks and their owners.
- **Follow-up list:** `public/framework/ai/doc/follow-up.md`, computed today.
- **Brief maker:** `Server/refine.mjs` turns a dictation into a checked brief with `coverage.md`.
- **Query tools:** `Server/FollowUp.mjs` and `Server/PastWork.mjs`; "server query functions over session data" landed 10-12 in `ai/sessions/2026/10/12/session-87bec773/server-query/`.
- The owner's prompts live in the session store (`public/framework/ai/sessions/**/task.jsonl` `chat` lines with `from: "owner"`, `requirements.md` files, and the transcripts dir which is gitignored and must never leave this machine). The prior audit's script knows where it read from.

## Deliverable: `public/framework/ai/doc/asks-outcomes.md` (one screen) + `asks-outcomes.jsonl` (the data) + the script

1. **Gather**, by script (`Server/AskTally.mjs`, extending the prior audit's reader): every owner prompt since 2026-09-15, chunked into Haiku jobs of ~40k tokens. Each Haiku minion returns JSON only: for each distinct ask in its chunk `{ask (one line, owner's words shortened), feature (a short tag: "class cards", "mobile dictate sheet", "inbox ranking"...), date, source (file:line), kind: build|fix|rule|question}`. Write one line per ask into `asks-outcomes.jsonl`.
2. **Merge and tally** by script: cluster by feature tag (exact tag after a normalising pass; a second Haiku pass merges synonyms, with the merge list kept in the jsonl), count asks per feature, first and last date.
3. **Outcome per feature** (Haiku, batches): search the task logs' landing lines, `follow-up-full.md`, `PastWork.mjs`, and `git log --grep` for each feature; answer `done (link)`, `partly (link, what is missing)`, `not done`, or `contradicted (the two asks)`. Prove it: a link to a landing line or a page that exists, or "no landing line names it". You spot-check 10 verdicts yourself against the evidence and log how many were right.
4. **The page**: top = the features asked for most often that are `not done` or `partly`, with counts and links (this is the list the owner wants); then contradictions; then the full tally table (feature, count, status, link) sorted by count; then how it was computed and the spot-check score. Link it from `public/framework/ai/readme.md`. Mark features already covered by the 10-08 audit so nothing was re-done blind; reuse its verdicts where they still hold.
5. Report on your card: the top 10 not-done features with counts, the spot-check score, the link.

Fence: `Server/AskTally.mjs`, `public/framework/ai/doc/asks-outcomes.*`, `public/framework/ai/readme.md` (one link line), this task dir. Opus for judgment only; Haiku does every read. Log every fan-out's expected cost before launch and the model/cost/accuracy after. Never put an owner transcript line into a committed file beyond the one-line shortened ask.
