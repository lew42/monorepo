# Manifest: item tool merge 7 (docs/skills/voice text → get/set/call)

Census before: 45 files, 92 matching lines (`git grep -n -E "item\(\{[^)]*(delta|read)\s*:" ...`, baseline commit 944275f55).
Census after: 17 files, 34 matching lines. (A first pass landed at 13 files/25 lines, but review round 1 found 4 of the "changed" shapes were refused by the real tool — `place`, `help`, `pages.add`, and a nested `set` on `messages` — and reverting those to `delta` brought 9 lines back into the census. The count moving up on a fix is correct: `delta` is right for a key the tool itself handles, not a class method.)

One row per file the census found. "Changed" = lines rewritten to `get`/`set`/`call`. "Kept as delta" = lines left alone, with why.

| File | Changed | Kept as `delta` | Why kept |
|---|---|---|---|
| `.claude/skills/finish-task/SKILL.md` | 1 | 0 | — |
| `.claude/skills/minion/improvements.md` | 1 | 0 | — |
| `.claude/skills/new-task/SKILL.md` | 2 | 0 | — |
| `.claude/skills/voice-assistant/SKILL.md` | 1 | 2 | `place` and `summary` are keys the tool itself handles, not class methods — `call` is refused on both (reviewer caught `place`; `summary` was already kept) |
| `Server/AskIndex.mjs` | 0 | 1 (real call) | actual `run_item(...)` logic, not teaching text — out of scope per the brief ("only the text sent to a model or print, never their logic") |
| `Server/PromptRecords.mjs` | 0 | 3 (real calls) | same: real `run_item(...)` logic |
| `Server/UndoneToTasks.mjs` | 0 | 3 (real calls) | same: real `run_item(...)` logic |
| `Servex/ProcessRunner.js` | 1 | 1 | one line is a `{"<id>":{"wait":{...}}}` delta-shape fragment inside a message (not a full `item()` call) — kept as the shape it is |
| `Servex/Servex.js` | 1 | 0 | — |
| `Servex/agents/doc/messaging.md` | 2 | 0 | — |
| `Servex/agents/page_tools.js` | 0 | 4 | skipped per the brief (the tool itself; its description already leads with the verbs) |
| `Servex/agents/roles/mastermind.md` | 2 | 0 | — |
| `Servex/agents/session-smart.md` | 9 | 0 | — |
| `Servex/agents/single-voice-assistant.md` | 3 | 3 | `place` (×3) is a tool-handled key, not a method — `call` is refused; kept as `delta`. The `messages` write uses the dotted key `set: {"messages.<message>.title": "…"}` instead of a nested `set` (refused: "messages" is a list) |
| `Servex/doc/item-tool.md` | 2 | 2 | one two-query-at-once example kept (`get` takes only one dotted path); `summary` on a busy session also kept as `delta` — `get` caps the answer near 4 KB and truncates it |
| `Servex/doc/owner-2026-10-16-tools.md` | 0 | 2 | skipped per the brief (dated owner-words record) |
| `Servex/ext/remote/doc/cloud-voice-agent.md` | 1 | 0 | — |
| `Servex/readme.md` | 0 | 1 | already shows both forms side by side as the alias explanation — no change needed |
| `public/framework/ai/doc/past-work-haiku.md` | 1 | 0 | — |
| `public/framework/ai/doc/records.md` | 1 | 0 | — |
| `public/framework/ai/doc/role-process-skill-session.md` | 1 | 0 | — |
| `public/framework/ai/doc/task-notes-proposal.md` | 1 | 0 | — |
| `public/framework/ai/doc/tasks.md` | 1 | 0 | — |
| `public/framework/ai/skills/past-work/readme.md` | 1 | 0 | — |
| `public/framework/ai/system-map.md` | 1 | 0 | — |
| `public/framework/ai/system-proposal.md` | 1 | 0 | — |
| `public/framework/audio/Recite/readme.md` | 1 | 0 | — |
| `public/framework/core/List/page.js` | 0 | 1 | fenced off per the brief (`core/List`) |
| `public/framework/core/Page/doc/ai-api.md` | 0 | 2 | already explains the query mechanism (a delta of all-query keys writes nothing) right next to the `get` form it later names — left as the explanation it is |
| `public/framework/core/Page/doc/namespaces.md` | 1 | 0 | — |
| `public/framework/core/Session/Chat/Message.js` | 1 | 0 | comment only; file is core/Session, not fenced off |
| `public/framework/core/Session/Chat/readme.md` | 2 | 0 | — |
| `public/framework/core/Session/readme.md` | 2 | 1 | a bare `{}` read-by-id query shape (`messages: {"<id>": {}}`) — `get` can't express "read this child, bare" the same way; kept as the delta shape being explained |
| `public/framework/core/Session/tasks/data-shapes/seats/delta-flow/delta-flow.md` | 0 | 1 | `pages.add` is a tool-handled key (`apply_pages`), not a method — `call` is refused; kept as `delta` |
| `public/framework/core/Session/tasks/data-shapes/seats/delta-flow/demo-delta-flow.mjs` | 0 | 1 | a teaching example *about* the dotted-key delta mechanism itself, not a tool call — stays as delta per the brief |
| `public/framework/core/Task/Process.js` | 1 | 0 | string the node side sends an agent, not logic |
| `public/framework/core/Task/doc/completion.md` | 1 | 0 | — |
| `public/framework/core/Task/doc/owner-2026-10-16-top-down.md` | 0 | 1 | skipped per the brief (dated owner-words record) |
| `public/framework/core/Task/doc/process-names.md` | 2 | 0 | — |
| `public/framework/core/Task/doc/process.md` | 3 | 0 | — |
| `public/framework/core/Task/doc/prompt.md` | 1 | 0 | — |
| `public/framework/core/Task/readme.md` | 1 | 0 | — |
| `public/framework/ux/Dictate/doc/pipeline.md` | 4 | 0 | — |
| `public/framework/ux/Dictate/doc/voice-assistant.md` | 0 | 1 | `place` is a tool-handled key, not a method — kept as `delta` |
| `public/live/readme.md` | 4 | 2 | `help` (×2) is a tool-handled key, not a page method — `call` is refused; kept as `delta: {"help": {}}` |

## Checks run

- `node Server/doc-check.mjs public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/item-docs-switch` — clean, 0 modules dirty.
- `node Servex/agents/item-verbs.test.mjs` — 12 checks passed.
- `node Servex/agents/item_tool.test.mjs` — 148 checks passed.
- `node --check` on every `.js`/`.mjs` touched (`Servex/ProcessRunner.js`, `Servex/Servex.js`, `public/framework/core/Session/Chat/Message.js`, `public/framework/core/Task/Process.js`) — all OK.
- Census before/after above.

## Review round 1 (reviewer-item-docs-switch): fix

Findings 1–4 and 5: four rewritten shapes (`call: "place"`, `call: "help"`, `call: "pages.add"`, and `set: {messages: {...}}`) are refused by the real tool because the key names something the tool itself handles, not a class method — the brief's "when unsure, keep delta" rule covered them, but I missed it for these four. `get: "summary"` on a busy session also silently truncates (the `get`/`read` path caps near 4 KB; the delta-query path doesn't). All reverted to `delta` (or, for the one `messages` write, the dotted-key `set` form) above; see `scratch-review.md` for the one-shot scratch-session/scratch-page runs that reproduced each refusal and confirmed each fix.

Finding 6 (stale text): `Servex/doc/item-tool.md`'s "there is no `get` key" sentence (pre-dated merge 1) is deleted; `core/Session/readme.md`'s `get: "completion"` example now says the real answer shape, `{ok, read, value}`.

Finding 8 (this file): `Servex/ProcessRunner.js` was 1 line changed, 1 kept — not 2 changed, 1 kept. Fixed above.
