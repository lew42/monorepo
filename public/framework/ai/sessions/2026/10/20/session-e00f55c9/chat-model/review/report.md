verdict: fix
1. [fix] Child sessions of a NESTED session get no Ref (Requirements 3; plan.md decision 3, "Refs for every session record"). `SessionRecord.is_chat_ref_target` also requires `is_session_dir`, a folder directly under a day, so `chat-model/session.jsonl` itself fails it. Its own spawn line (session.jsonl line 66, `minion-minion-chat-model-s3`, `"type":"Session"`) would get no Ref. But a `tasks.add` on the same file does get one, because page_tools checks `kind === "Session"`. Use one test for both writers (basename `session.jsonl` is enough to exclude a task's `task.jsonl`), and add a check with a session nested below a day-level session.
2. [fix] `core/Session/Chat/readme.md` line 56 says a spawned child session "gets the same Ref wherever `SessionRecord.add_ref` writes onto the session's own `session.jsonl`". It does not say that nested sessions are excluded, so the readme overstates what the code does (Law 9). Fix it together with finding 1.
3. [fix] The merge brings stale index lines: `public/framework/ai/sessions/files.jsonl` gains 11 `"gone":true` lines (`transcripts/`, `week.json`, `index.jsonl`, `sessions.json`, `spend-tree.json`, …). These files are gitignored and still exist in the main tree (checked with `ls`). The worktree's indexer wrote "gone" only because the worktree lacks them. After the merge, the index says that live files were deleted. Drop these lines from the merge, or have the indexer skip gitignored paths when it runs in a worktree.
4. [note] The folder-making branch (`tasks.add` that makes its own task folder, then `record_new_folder`, then a Ref with `url: h.path`) has no test. The new checks cover the inline subtask (`path: tasks.<id>`) and `add_ref` only.
5. [note] `ChatWriter.ref_line` always stamps `by: "servex"`, even when the writer is the `SessionRecord --links` sweep or `ChildLinks`. Passing the real writer would keep the record honest.
6. [note] The shot page (`chat-model/builder/`) is not something this diff renders: the diff only appends a `{"file"}` line to it. At 1920 its task block has zero height (layout.json `ai-task` h 0), so only the title and "Files · 1" show and the page is 88% empty. At 400 the same block shows its tabs and report. This bug was already there before this diff and should be filed separately. The console also logs one 404 at each width.

Widths given: 400 and 1920. Test run: `node Servex/agents/chat-messages.test.mjs` in the worktree gives 17 checks passed. `core/Test/results.jsonl` shows the core Item/List/Session suites all ok at 05:33.

## Requirements
- 3 "when a task or child session is created in a session, Servex appends a Ref in order" — no, only in part. Root tasks get a Ref on any session (page_tools.js:1305, :1317). Child sessions get one only when the session sits directly under a day (SessionRecord.mjs `is_chat_ref_target`), so nested sessions such as chat-model are missed (finding 1).
- 3 "Add a replay test" — yes. chat-messages.test.mjs adds 4 checks that replay `session.messages`, check that the Ref is last and hydrates as `Ref`, and check that a retried `add_ref` writes no twin.
- 2 / F7 "adding an item that already has a parent makes a Ref, never a move or a copy" — yes. The Refs point (`path` / `url`) and never copy the task.
- Fence "don't touch V1's renderers" / "never edit ext/Chat/v3, ux/Dictate" — yes. The only files under those folders that changed are fixture `files.jsonl` index lines.
- Fence "worktree only; review before merge" — yes. The work is on branch worktree/chat-model (f50d57429), and this review runs before the merge.
- Docs "update core/Session/Chat/readme.md as you go" — yes, with one stale line (finding 2). The ⬜ item moved to ✅, and the check count changed from 13 to 17.
- Index everything (Law 10) — no. The merge brings wrong "gone" lines (finding 3).
- Could a fresh agent continue from this folder alone? — yes. builder.md names steps 1–8, plan.md holds the decisions, and session.jsonl has `s3` started with its agent and session id.
- New class with live instances? — n/a

## Page structure
- page 1 — yes — shots/…builder/400.png: the title "builder" names the task. It is terse, but this page was not changed by the diff.
- page 2 — n/a
- page 3 — yes — 400.png: the task report (state) comes before Inbox and Files.
- page 4 — n/a
- page 5 — not checked. This diff did not create the page.
- page 6 — yes — the Requirements/Report/Session tabs are routed task tabs.
- page 7 — yes — layout `ai2`.
- page 8 — yes
- page 9 — no — 1920.png: the main column shows only the title and a lone "Files · 1" chip (finding 6, pre-existing).
- page 10 — n/a
- page 11 — n/a
- page 12 — n/a

## Navigation
- navigation 1 — tabs, a sidebar (pages filter), a bottom rail at 400, a right drawer (AI) at 1920
- navigation 2 — yes — layout.json tab_rows 1 at 400. At 1920 the tabs are absent (tab_rows 0; finding 6).
- navigation 3 — yes
- navigation 4 — yes
- navigation 5 — n/a (no 3440 shot)
- navigation 6 — yes
- navigation 7 — yes — 400.png: "Files · 80" sits well above the bottom rail.
- navigation 10 — n/a

## Layout
- layout 1 — n/a (no 3440 shot)
- layout 2 — yes — `ai2`
- layout 3 — no — 1920.png: the main column is 88% empty (layout.json `empty` 0.882), because the task block has zero height (finding 6).
- layout 4 — yes
- layout 5 — yes
- layout 6 — n/a
- layout 7 — yes — layout.json: the bands' shares at 400 are 0.04, 0.30, 0.025 and 0.025, and no band has `big_empty`.
- layout 8 — n/a
- layout 9 — n/a
- layout 10 — yes
- layout 11 — n/a
- layout 12 — n/a

## Sizing
- sizing 13 — yes
- sizing 14 — n/a
- sizing 15 — n/a
- sizing 16 — yes
- sizing 17 — n/a
- sizing 18 — yes — layout.json overflow_x false at both widths
- sizing 19 — not measured

## Wrapping
- wrapping 20 — yes — layout.json wraps at 400 are only the bottom-rail buttons (icon over label, 3.2 lines, by design); at 1920 only icon buttons wrap.
- wrapping 21 — n/a (no 1200 shot)
- wrapping 22 — yes
- wrapping 23 — yes — 400.png
- wrapping 24 — n/a

## Spacing and padding
- spacing 33 — yes — layout.json left_stack h1 14px at 400
- spacing 34 — yes
- spacing 35 — yes
- spacing 36 — yes
- spacing 37 — not measured
- spacing 38 — yes
- spacing 39 — yes
- spacing 40 — n/a

## Colour and contrast
- colour 1 — yes — dark ink on a light ground in both shots
- colour 2 — yes — the orange-underlined chips use dark text
- colour 3 — n/a (the diff adds no CSS)
- colour 4 — yes
- colour 5 — not shown (light mode only)
- colour 6 — yes
- colour 7 — yes — the chip underline is the same on every chip
- colour 8 — n/a

## Flow
- flow 25 — yes — 400.png
- flow 26 — no — at 1920 the task report is not rendered at all (finding 6)
- flow 27 — yes
- flow 28 — yes
- flow 29 — n/a
- flow 30 — yes — layout.json widest_text 340 / 266
- flow 31 — n/a
- flow 32 — yes

## Words
- content 1 — yes — the readme names the exact lines and files
- content 2 — n/a
- content 3 — no — readme.md line 56 is one paragraph of about 150 words. Split it into two bullets: one for tasks and one for child sessions.
- content 4 — yes
- content 5 — yes
- content 6 — n/a
- content 7 — yes — "Ref" throughout
- content 8 — no — readme line 56 names `Servex/agents/page_tools.js` and `Server/SessionRecord.mjs` as code spans and does not link them (small)
- content 9 — n/a
- content 10 — yes
- content 11 — yes
