# undo-proposal — the ask, verbatim

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more. 2. Clarity is the one exception. 3. Prioritize.
Final report <= 10 lines. Read CLAUDE.md. HARD RULES: never kill/restart the :80 dev server (private
`$env:PORT='8097'; node server.js` if needed, torn down after); never stash; never commit. Run
`new-task` first (slug `undo-proposal`, group `pages`). **This is a PROPOSAL task — you build
NOTHING; the deliverable is a written design the owner can accept or reject in two minutes.**

CONTEXT — the page-data system (read first): `/imagine/cms/thinking/` (the json+jsonl argument),
`/imagine/cms/json/` + `/imagine/stream/` (live deltas: `{"at","op":"set|del|append","path":[...],"value"}`
over rpc:append, `Stream.compact()` folds the log into the snapshot then truncates — landed 08-31, see
`ai/2026-08-31/improve-cms-stream/task.jsonl`). The improver's roadmap left: "undo (needs the prior
value in the line — a contract change)".

TASK — design undo for the delta stream. Weigh at least these three shapes, with MEASUREMENTS not
opinions (write a small scratchpad script over a synthetic 200-line log; report line-size growth, undo
cost, and what each does to compact()):
(a) fatten the line — every `set`/`del` carries `prev`;
(b) inverse-op journal — writer computes the inverse at write time, appends nowhere until undo is invoked;
(c) replay — undo = snapshot + replay(log minus last op), no contract change at all.
For each: bytes per line before/after on the synthetic log, undo-one-op cost (ops replayed or bytes
read), what happens after a compact() (which shapes lose undo history and is that acceptable),
multi-window behavior (two tabs streaming — whose undo is it?), and the migration story for logs
already written under the current contract. End with ONE recommendation and its smallest honest first
version.

DELIVERABLE — one proposal doc: `public/imagine/cms/doc/undo-proposal.md` (a screen: the question, the
three shapes with their numbers in one table, the recommendation, the migration line), linked with one
line from `/imagine/cms/` readme's More section (that readme is `public/imagine/cms/readme.md` — one
line only). Scratch scripts stay in the session scratchpad, never the repo.

Report: the recommendation + the two decisive numbers, the table's worst loser and why, what compact()
does to it.

## Scope fence

- WRITE: `public/imagine/cms/doc/undo-proposal.md` (new), one line in `public/imagine/cms/readme.md`
  More section, this task dir.
- BUILD NOTHING. No changes to `stream.js`, `json.js`, `Server/`.
- Scratch scripts: session scratchpad only.
