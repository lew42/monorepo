# Check 5 asks against the repo: ai/models

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/31-ai-models/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ai/models`, folder `public/framework/ai/models` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ai/readme.md`, `public/framework/ai/models/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ai/models/readme.md`)

# Models: which agent runs on what

The table is drawn from `now.json`, which `node Server/ModelsNow.mjs --write` computes (roles.js, the live registry, the OpenRouter spend log, `usage.json`). The switch between Claude and OpenRouter is explained in [Servex/ext/openrouter/readme.md](/Servex/ext/openrouter/readme.md). Benchmarks (which model is best value) are at [ai/doc/models.md](../doc/models.md).

- **Review, 2026-10-13** ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)): the page drew its tables after an `await`, so they landed outside the page; now the box is captured first. The AI tab bar still lights INBOX on this page (it is not a tab).


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/31-ai-models/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 5 asks

1. `d04b55d1cc` (3 days old): When Claude tokens are available, especially near expiry, run the fast and smart assistants on Haiku and Sonnet.
2. `b76eabc306` (3 days old): Show which model each agent runs and report current model choices.
3. `dec63df3bc` (3 days old): Use OpenRouter only when the Claude token wall is hit, not when Claude is enough.
4. `cc8bce2fc0` (3 days old): Verify that the systems are tuned and working as asked, and answer the questions about minion count, model, effort and output.
5. `0fc015365b` (3 days old): Revisit the AI model testing system and what it shows models are good at.
