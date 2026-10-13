# Refine queue — the owner's past prompts, refined one at a time by Haiku, shown on each session's Coverage tab

The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt into a **refined card**: the prompt reorganised (structured), its essence in a few sentences (refined), and every **ask** as a row that cites the raw sentences it came from. The session page's **Coverage** tab shows the cards, each ask's status, and the raw words one click down. The owner's words that started it: [session-730e8a7b requirements-6.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-6.md) (asks 1, 2 and 4).

## Run it

Run from the repo root (the main tree: it has `Servex/node_modules`; from a worktree the queue borrows the main tree's, and cards land on the main site). About 540 owner prompts a week; `--dry` prints the queue and its estimate.

```
node Server/RefineQueue.mjs --days 7 --dry          # the queue (newest first) and its estimated cost; spends nothing
node Server/RefineQueue.mjs --days 7 --budget 10    # refine the week's prompts not yet refined; stop starting new ones at $10
node Server/RefineQueue.mjs <session-uuid>:<line>   # one prompt (line = 1-based line of the session's SDK transcript, as in a card's link /ai-logs/<id>#<line>)
node Server/RefineQueue.mjs --report                # prompts, $ per prompt, max tokens per call: computed from queue/runs.jsonl
node Server/RefineQueue.mjs --repeats [--all]       # asks said in 3+ sessions (today's, or --all): promotion candidates
```
Flags: `--parallel N` (default 2 calls at once), `--brief v1|v2` (default v2), `--limit N`, `--force` (redo refined ones), `--task <dir>` (a task.jsonl's owner `chat` lines instead of transcripts).

## The classes

| Class | File | Job |
|---|---|---|
| `RefineQueue` | `Server/RefineQueue.mjs` | finds the owner prompts, plans the queue, runs N Haiku calls at once (node starts the next, never an agent's context), writes each card, logs cost |
| `RefinedCard` | `ext/Refine/RefinedCard.js` | the brief (`BRIEF.v1`, `BRIEF.v2`), the sentence split every cite counts by, parsing Haiku's JSON, the card item, coverage scoring. DOM-free: node and browser share it |
| `RefineCall` | `Servex/ext/refine/RefineCall.js` | the one lean model call (no tools, no MCP, no skills) the queue reuses |
| `AISessionCoverage` | `ai/AISession/AISessionCoverage.js` | the session page's Coverage tab |

## Where things live

- **Which prompts:** the user turns of VS Code tabs' SDK transcripts (`entrypoint: claude-vscode`, `~/.claude/projects/<repo>/<id>.jsonl`), minus agent relays (`[from: …]`, `[You are …]`), compaction summaries and slash-command echoes. Prompts under 30 characters are skipped. The Echo `Prompt` items in session pages were not used: none since 10-09, and 10-08's are agents' prompts labelled owner.
- **The card:** a `{"content":{"add":{"type":"refined",…}}}` line in the session's own `page.jsonl` (its dated folder, `public/framework/ai/sessions/YYYY/MM/DD/<folder>/`; the page is `/framework/ai/sessions/<session uuid>/?tab=coverage`), written by the page tool's own `page_add` handler (so the page redraws live). That file is gitignored, like the transcript it refines; the raw text is never copied in: the card holds a link (`/ai-logs/<id>#<line>`), the transcript line's `uuid` and a sentence count.
- **What is committed:** `queue/runs.jsonl` (one line per call: chars, asks, $ and tokens, no owner text) and `queue/asks.jsonl` (one line per ask, the ask in one line; `--repeats` reads it).
- **Statuses** on the tab come from [`ai/doc/asks-outcomes.jsonl`](/framework/ai/doc/asks-outcomes.md) (the prompt-outcomes tally): matched by prompt (`source` naming the transcript and line), else by the tally's feature name against the ask's key. The fields read: `source` (a transcript uuid and `:line`), `ask`/`raw` (matched to the ask's text), `feature` (matched to the ask's `key`), and the verdict in `status`/`verdict`: done, partly, not done, open (contradicted reads as open). Unmatched asks are "unreviewed".

**Two scores are called coverage.** The tab's score is asks with a verdict ÷ asks found: 0% means nothing has been reviewed yet, not that refining failed. The review score below is how faithfully a card keeps what the owner asked.

## Review: why brief v2

An Opus read of 10 products against their raw prompts: v1 mean coverage 0.90, v2 0.96 ([session-730e8a7b haiku-review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/haiku-review.md)). Haiku seldom **dropped** detail; it **distorted** it: narration read as an ask, a self-correction ignored, a restated idea read as the owner's. v2 lists every specific first and adds one rule for each of those.

## Cost: run the call outside the repo

A "lean" SDK call made with the repo as its working folder still carries ~8k tokens: the project's auto-memory, loaded whatever `settingSources` says. Measured: $0.066 a call from the repo, $0.002 from `os.tmpdir()`; a week of prompts then costs a few dollars, not ~$90. `RefineCall.run(prompt, { cwd })` takes the folder; the queue passes the temp folder. Other `RefineCall` users (Echo) still run from the repo: worth the same one-word change, owned by their module.

## Promotion: an ask said in three sessions is a directive

As past prompts are refined, an ask that shows up in **three or more sessions** is promoted: into the module's `doc/architecture.md` (its `module` field names it), or, if it is site-wide, proposed for the root readme as a decision line. `--repeats` groups asks by their key words and module and lists the groups said in 3+ sessions; it only prints: whoever runs it writes the directive into the module's `doc/architecture.md` (or proposes the root-readme line) and commits. The `documentation` skill carries the rule.

## Watch out

- The cites are sentence numbers of `RefinedCard.sentences()` over the raw text; change that split and old cards cite the wrong sentences.
- The Coverage tab finds the raw words in the transcript lines the Conversation tab already pulled (by `uuid`), so it never downloads a transcript twice; a session without a live transcript shows the link only.
- A worktree has no `Servex/node_modules`: the queue then loads `RefineCall` and the page tool from the main tree, so cards land on the main site's session pages.
