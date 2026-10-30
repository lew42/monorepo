# How research agents work in this repo

Read this before writing anything.

## The repo

- Working copy: `/home/claude/research` (pushed to github.com/mikelew42/research).
- Topic folder: `persistence-sync/`.
- Only the coordinator commits and pushes. Agents write files; they never run `git commit`, `git push`, `git reset`, `git checkout` or `git stash` in this repo.

## Who writes what

Every agent owns only the files it was assigned, plus its own op log. Never edit or delete another agent's file. If you need something changed in someone else's file, say so in your final report.

| Path | Owner |
|---|---|
| `persistence-sync/notes/*.md` | wave-1 research threads (finished; read-only now) |
| `persistence-sync/taxonomy.md` | taxonomy agent |
| `persistence-sync/lew42/*` | lew42 study agent |
| `persistence-sync/lessons/<topic>.md` | the lessons agent assigned that topic |
| `persistence-sync/data/ops/<agent-name>.jsonl` | that agent only |
| `persistence-sync/scripts/*`, `data/tools.jsonl`, `app/*` | app-builder agent |
| `persistence-sync/tools/README.md`, `tools/_TEMPLATE.md` | taxonomy agent |
| `persistence-sync/tools/<id>.md` | the profile agent assigned that tool |
| `design/*` | design agent (finished); `design/takeaways.json` and the `example` field in `design/decisions.json`: design-examples agent |
| `persistence-sync/lew42/branch-assessment.md` | branch-assessment agent |
| `agent-ops/*` | agent-ops agent |
| `persistence-sync/report.md`, `README.md`, this file | coordinator |

## Tool records: append-only ops

The tool dataset is built from op logs, the same design as the lew42 framework's JSONL deltas. Each agent appends lines to its own `data/ops/<agent-name>.jsonl`. Never rewrite a line; to change something, append a new op.

One JSON object per line:

```
{"op":"set","id":"yjs","key":"category","value":"crdt-library","by":"<agent-name>","at":"2026-10-29T23:40:00Z","src":"https://..."}
{"op":"add","id":"yjs","key":"pairs_with","value":{"id":"hocuspocus","why":"standard server, persistence hooks"},"by":"...","at":"...","src":"..."}
{"op":"del","id":"yjs","key":"pairs_with","value":{"id":"hocuspocus"},"by":"...","at":"..."}
```

- `set` replaces a scalar or object field. `add` / `del` add to or remove from a list field (matched by `value.id` when present, else by value).
- `at` is the real current UTC time when you append (`date -u +%Y-%m-%dT%H:%M:%SZ`). Never a made-up or rounded time: later `at` wins, so a future timestamp silently overrides everyone else.
- `category` / `subcategory` must be ids that exist in `taxonomy.md`.
- `id` is a lowercase kebab-case tool id (`yjs`, `automerge-repo`, `cloudflare-durable-objects`, `lew42-framework`). Check existing ids in other ops files and `notes/adoption_metrics.csv` before inventing one.
- `src` is a URL or a repo-relative notes path that supports the claim. Use it for every factual op.
- `scripts/build.mjs` folds all ops files (sorted by `at`) into `data/tools.jsonl`. Last write wins per field.

The field list and the allowed category, strategy and feature tags are defined in `taxonomy.md`. Use only those tags; if one is missing, propose it in your final report instead of inventing it.

## Code references

When citing code, link to an exact commit and line range, e.g. `https://github.com/OWNER/REPO/blob/<sha>/path/file.js#L10-L42`. Get the sha with `git -C <clone> rev-parse HEAD`.

- Shared clones live in `/tmp/claude-0/-home-claude/e3fd9043-ad4b-5d36-9e28-17f46c3e0b52/scratchpad/repos/<owner>_<repo>`. Reuse one if it exists. To add one: `git clone --depth 1 https://github.com/OWNER/REPO <that dir>` (one clone at a time; never delete a clone).
- The lew42 framework under study: `/home/claude/lew42/data-shapes-2` (branch `integration/data-shapes-2`, commit `9ba46ee87219cb9ac5b99b887f0869a5aa4c6895`, repo `lew42/monorepo`). Read-only: never edit, commit or check out anything there.

Prefer short excerpts (under ~25 lines) or pseudocode over long pastes.

## Every recommendation comes with a failing test (owner's rule)

A change to the lew42 framework is only worth making if a test shows it fails today and would pass after the fix. For every recommendation, write a **test spec**:

- **Name** and the one behaviour it checks.
- **Setup** using real components: a real temp directory, a real file, a real in-process websocket server, a real socket closed mid-send. Mock only what can't run here, and say what is mocked and why.
- **Steps** and **expected result**, plus what happens **today** (the failure), with a permalink to the code that causes it.
- **Honesty check:** could this state really happen in use? If you had to invent a state that can't occur, say so and drop or rework the test. Never weaken a test to make it easier to pass; note edge cases it should also cover.
- **Harness:** the framework's own tests are plain Node scripts using `core/Test/Test.js` (e.g. `public/framework/core/Item/delta-flow.test.mjs`, run with `node <file>`). Write specs to fit that.

Order of work when a fix is built later: commit the failing test first, then the fix in a separate commit, so the history shows the before and after.

## Work until the task is done

Don't stop after a first pass. Keep working through your whole brief until every deliverable is finished, saving to your files as you go. If you're blocked, write down why in your file and in your final report, then finish everything else. Don't spawn other agents.

## Ship quick fixes first (owner's rule)

When you have a mix of quick and slow changes, do the quick ones first and publish them right away, even if they were asked for later. Then work through the slow ones, publishing after each finished chunk, not all at the end.

## Web access

Use WebSearch freely. Use WebFetch only on URLs that appeared in a search result or on a page you already fetched; fetching a URL you typed yourself asks the owner for permission every time.

## Save often

The workspace can restart without warning. Write your file early and update it as you go, so a restart loses minutes, not hours.
