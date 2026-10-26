verdict: fix
1. [fix] No `requirements.md` in the task folder — the Requirements pass cannot be answered, and a fresh agent has no brief to continue from. Only task.jsonl, review/diff.patch and an empty shots/ exist.
2. [fix] `shots/` is empty (task.jsonl names `shots/127-0-0-1-63773-framework-ext-Chat-v3/sheet.png`, which is not there), so every page system is unmeasured. The owner chose a light (no-page) review, but the diff does change a page, so this is a gap.
3. [fix] `ext/drawer/readme.md` (line 32) still describes ChatView as "the **v2** chip" and `lew42.sheet.chat_view` as v2 only; the diff makes it a "v2" or "v3" choice — stale.
4. [fix] `ai/AISession/readme.md` (line 10) says the Chat tab has "two chips" (Chat, Chat v2); the diff adds a third, **Chat v3** (`?chat_view=v3`) — stale.
5. [fix] `ux/Dictate/readme.md` does not mention the new `chat-live` window event the mic's Widget.js now fires, which v3 depends on (only ext/Chat/v3/readme.md does).
6. [note] `ext/Chat/v3/failures.jsonl` is indexed in files.jsonl but not described in v3/readme.md; its recorded `el?.scrollIntoView is not a function` page error should be confirmed fixed.

## Requirements
- no requirements.md — not answerable
- class with live instances page: yes — /framework/ext/Chat/v3/ draws a fixture (or ?src=) live
## Page structure
- not measured — no shots
## Navigation
- v3 chip beside v2 chip; Chat tab chip — no shots, judged from diff only
## Layout
- not measured
## Sizing
- not measured
## Wrapping
- not measured
## Spacing and padding
- not measured
## Colour and contrast
- not measured (moving vs settled gray/solid is described in the readme only)
## Flow
- n/a no shots
## Words
- chip labels "v3", "show raw", "show earlier (N)", "Nothing said in this session yet." — yes — plain, short
- v3/readme.md — yes — states what, structure, tests, open decisions
