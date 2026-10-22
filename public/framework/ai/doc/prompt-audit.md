# Prompt audit: what the owner asked in a session, and what came of it

The owner asks for many things in each long prompt, and some are never done. The prompt audit finds them in two passes. **Pass 1:** Haiku reads each owner prompt alone and sorts it into tasks, questions, statements and updates. **Pass 2:** one Sonnet reviewer per session reads those items next to what the session actually did, and says for each one whether it was needed and whether it got done. The results are kept in two files beside the session. Nothing is added to the session's tasks: a finished session stays finished, and its loose ends are listed separately.

Code: [`Server/PromptAudit.mjs`](/Server/PromptAudit.mjs) (`class PromptAudit`). Other audit systems, and why this one replaces them: [audits.md](audits.md).

## Run it

```
node Server/PromptAudit.mjs <session id or its first 8 hex> --dry     # the owner prompts it would send, and the estimate
node Server/PromptAudit.mjs <session>                                 # both passes
node Server/PromptAudit.mjs <session> --structure | --review          # one pass; --only 172,334 reruns those prompts
node Server/PromptAudit.mjs <session> --summary                       # counts, computed from the two files
node Server/PromptAudit.mjs --days 7                                  # every session with owner prompts in 7 days, and its cost
```

**For a day, a week, a month:** `--days N` lists the sessions and prints the estimate; then run each session id it lists. A session is skipped in pass 1 when its prompts are already done at the current schema version (`--force` redoes them). Node runs the queue, 3 calls at once by default; no agent ever copies a prompt.

## Cost (measured on the pilot)

| Run | Owner prompts | Estimate |
|---|---|---|
| Pilot, session `7efd07d5` (2026-10-09) | 22 (81k chars) | real: $1.34 pass 1 (1m19s) + $0.67 pass 2 (89 s) = **$2.01** |
| One busy day | ~22 | ~$2.50 |
| The last 7 days | 104 in 2 sessions | **~$7** |
| The last 30 days | 1,726 in 20 sessions | **~$110** ($76 pass 1, $35 pass 2) |

A Haiku call costs about $0.010 plus $15.5 per million characters of prompt; the biggest pilot prompt (12.6k characters) cost $0.21, far below the 100k-token limit. The review costs about $0.002 an item. `PromptAudit.estimate()` holds these numbers.

⬜ A session with hundreds of prompts (one has 791) needs its review split into chunks of about 400 items; not built yet.

## Which prompts count as the owner's

A transcript line counts only when all of these hold: it is a `user` line from a VS Code tab (`entrypoint: claude-vscode`); the CLI stamped it **typed by a human** (`turnOrigin: "human"` or `origin.kind: "human"`); and it is not a tool result, a slash command, an agent relay (`[from: …]`, `[You are …]`) or a compaction summary (`RefineQueue.owner_text`).

The human stamp is the part that makes it reliable. Without it, the older filter counted about 2,600 transcripts in 30 days, nearly all machine calls that inherit the VS Code entrypoint ("You clean up one chunk of dictated…": 1,583; minion briefs; refine calls). With it: 20 sessions. Check any session with `--dry`, which lists every prompt it keeps.

## The two files (schema v1)

Both live in the session's folder, `public/framework/ai/sessions/YYYY/MM/DD/<session>/`. Both are append-only: a rerun adds a line, and the latest line for a prompt wins.

**`prompt-audit.jsonl`**, one line per owner prompt, written by pass 1:

```
{"prompt_audit":{"v":1,
  "prompt":{"transcript":"<session uuid>","uuid":"<message uuid>","line":172,"at":"…","sentences":9,"chars":782,"link":"/ai-logs/<uuid>#172"},
  "subject":"…", "tags":["/framework/ai/sessions/","AISessionDetail.js"],
  "items":[{"id":"p172.1","kind":"task|question|statement|update","text":"…","cites":[1,2],"details":[],"file":"update only"}],
  "model","usd","tokens","ms","written_at","by"}}
```

**`prompt-review.jsonl`**, one line per owner prompt, written by pass 2, plus one `review_run` line per run (cost, turns, and the reviewer's feedback):

```
{"prompt_review":{"v":1,"prompt":{"transcript","uuid","line"},
  "verdicts":[{"id":"p172.1","state":"accepted|optional|option|back-burner|rejected","why":"…",
               "status":"done|partly|open","evidence":"commit or task path","priority":"high|low","file":"…"}]}}
```

- **Kinds** (pass 1): a *task* asks for something to happen; a *question* wants an answer; a *statement* is a fact or design decision; an *update* is a standing rule or a doc correction, with the `file` it belongs in.
- **States** (pass 2): every task is a proposal until accepted. *accepted* (needed), *optional*, *option* (one of several ways), *back-burner* (later), *rejected* (conflicts, cannot happen, too complex, or the owner changed their mind). Each has a one-sentence `why`.
- **Tags:** every page, path, module or file the prompt names. Haiku lists them, and code adds every path it finds (`PromptAudit.paths`), so a tag never depends on the model alone.
- **Growing the schema:** add the field to the brief, bump `PromptAudit.V`; old lines keep their `v`, and pass 1 redoes only prompts below the current version.

## Tuning the briefs

The owner's rule: aim for Haiku acceptable 9 times out of 10, by clearer wording, never by more rules. On the pilot, three short prompts were checked by hand against the raw words after each change:

1. Brief v3 plus a `note` kind: no ask lost, but one invented fix ("make the heading not full width" when the owner said it *was* full width), duplicate items for one want, rules kept as statements.
2. "One item per want; never invent a fix they did not suggest": invented fix gone, tags present; rules still statements.
3. `update` defined as "a standing rule for how agents should work from now on": 3 of 3 acceptable.

The reviewer works the same way, and each run's own feedback is in its `review_run` line:

| Review run | Cost, time | Verdicts | What was wrong | Its feedback |
|---|---|---|---|---|
| 1 | $0.67, 89 s, 4 turns | 89 done, 79 partly, 39 open; 116 rejected; 6 high loose ends | reasons were fragments ("mobile ws"); stated design decisions rejected as "design note" | pre-link candidate commits; list docs changed in the window |
| 2 (node adds `cands` per item and the changed docs) | $0.87, 127 s, 2 turns | 186 done, 97 partly, 92 open; 80 rejected; 26 high loose ends | reasons are full sentences and decisions are kept, but "done" doubled on one-word commit matches | give each candidate its changed files; link the later item that settled an earlier one |

**Next change (not run, to save budget):** one Sonnet call over 376 items has no room to read anything (2 to 4 turns). Split the review into chunks of about 100 items, give each candidate commit its changed files, and require a file or task path, not a commit subject alone, for "done". Until then, read a "done" whose evidence is only a commit subject as "partly".

## Not built yet

- ⬜ Running pass 1 live on every new prompt (the brief needs no code context, so it can).
- ⬜ Showing the items and their tags as cards on the session page.
- ⬜ Chunked review for very large sessions (above).
