# Probe tasks — tiny jobs that show whether the system works on any model

A **probe** is a small, open-ended job given to a fresh agent in some directory — "make a new page here: a short blog post about owls". The prompt is rough on purpose. What matters is the output, scored by the same six checks every time, so a run on a cheap OpenRouter model and a run on Claude can sit side by side in one table.

The owner's words: `../openrouter-harness/owner-words.md` (last section). The brief: `../openrouter-harness/requirements.md` §2b.

## The six checks, and how each is measured by a script

| # | Check | How the script decides (no judgment, one command each) |
|---|---|---|
| 1 | **Parses** | `node --check` on every `.js`/`.mjs` the run wrote (from `git status` in the run's worktree). A `.css` or `` css(`…`) `` block: braces balance and no stray backtick. |
| 2 | **Loads clean** | `Server/smoke.mjs` on the run's worktree with the page the run made: zero console errors, zero page errors, no "Page Load Error" screen. |
| 3 | **Followed the prompt** | The thing asked for exists where it was asked for (a `page.js` in the named directory), and the prompt's topic words appear in its text. |
| 4 | **Used the right skills** | The Skill hook writes `{"log":{"msg":"skill: <name>"}}` into the agent's task.jsonl (`.claude/hooks/ledger.mjs`). Each probe names the skills it expects; all of them must appear. |
| 5 | **Opened, logged, landed a task** | A new `task.jsonl` under `public/framework/ai/<date>/` with an `assign` on line 1, at least one `log` line, and `landed_at` on the last `assign` (the `new-task` → `finish-task` lifecycle). |
| 6 | **Linked from its parent** | The parent directory's `page.js` names the new page in `children:` (nothing crawls — a page exists once its parent names it). `n/a` for a probe that makes no page. |

A run scores six 0/1 cells (or `n/a`). A cell is never "partly".

## The probe set — start with the first two

Each probe is a prompt template, a directory, and the skills it expects. The set is machine-readable in `probes.json`.

| id | Prompt (rough on purpose) | Expects skills | Checks |
|---|---|---|---|
| `page-blog` | "Make a new page here: a short blog post about {topic}." | new-task, code, new-page, finish-task | 1–6 |
| `log-line` | "Write one log line to your task saying, in one sentence, what this directory is for." | new-task, finish-task | 5 only (the line must have come through `append.mjs`: the guard refuses a shell append) |
| `demo-add` | "Add one more example to the demo on this page." | new-task, code, finish-task | 1, 2, 3, 4, 5 |
| `css-tweak` | "Make the main heading on this page a little smaller." | new-task, css, finish-task | 1, 2, 3, 4, 5 (and the rule sits inside a layer) |
| `doc-fix` | "One sentence in this directory's readme is out of date about {thing}. Fix it." | new-task, documentation, finish-task | 3, 4, 5 |

Run `page-blog` and `log-line` first, on one cheap model and on `claude-haiku-4-5-20251001` (the control). Add the other three once those two pass somewhere. Every run happens in a scratch directory under `public/framework/sandbox/probe/<run>/` in a worktree, never in the main tree, and the worktree is thrown away after scoring.

## Diagnosis — whose fault is a failure?

The script fills a matrix: rows are model × probe, columns are the six checks. Each failing cell is then labelled:

- **(a) the system** — the same cell fails on EVERY model, the Claude control included. The instructions are unclear; the fix goes into a skill, a readme or CLAUDE.md, and the probe is run again.
- **(b) the model** — the control passes the cell and this model does not. A matrix entry: stop giving that kind of task to that model.
- **(c) config or parity** — the run never got to the work: a tool schema was refused, no hook fired (no `skill:` lines at all, no task.jsonl), the turn errored before the first edit. Fix the harness or note the gap.

The script prints the label; the architect reads the (a) cells and changes the system. That loop — probe, label, fix the system, probe again — is the token-efficiency work the owner asked for.

## One line per run

`Servex/ext/openrouter/evals/results.jsonl`, one line per run:

```
{"probe":{"at":"…","run":"page-blog-owls-3","probe":"page-blog","model":"openai/gpt-6-luna","effort":"low","dir":"public/framework/sandbox/probe/…","pass":[1,1,1,0,1,1],"label":{"4":"b"},"cost_usd":0.03,"turns":4,"note":"skipped new-page skill"}}
```

The model × task matrix (brief item 4) is read straight from these lines.
