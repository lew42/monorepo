verdict: fix
1. [fix] The task folder still records the opposite decision. `session.jsonl` line 9 says `{place}` edits are not mirrored, line 15 declines review finding 5, and line 29 lands the task. Nothing in the folder says this follow-up (worktree `chat-place`, commit 3690f8a65) reverses that decision, or why. A fresh agent reading this folder would think `{place}` is not mirrored. Add a new decision line that replaces line 9, and a step or landing line for the follow-up.
2. [note] `Servex/readme.md:45`, the `ChatWriter.js` entry, still says only that it "mirrors each `{chat}` line". It should also name `ChatWriter.place`, which the item tool now calls for `{place}` lines, so the Servex index matches the code.
3. [note] `Servex/agents/page_tools.js:1327` wraps the mirror in `try { … } catch {}`. If `ChatWriter.place` throws, the `{place}` line is still written but the chat list silently misses the cleaned text, and nothing is logged. Logging one line on failure would make that drift visible. Ignoring the error matches the code around it, so this is not a blocker.
4. [note] When no sentence's `at` matches `place.re`, `ChatWriter.place` (`Servex/agents/ChatWriter.js:91`) does nothing, which is correct. But the test only covers matches. Adding one `re` that matches nothing would prove that case writes no line.

Widths given: none new. The only view change is one word (`ext/Chat/list/ChatList.js:57`, `m.said` → `m.cleaned`), so the page's layout is unchanged since the earlier shots in `shots/`. I ran the tests in the `chat-place` worktree: `Servex/agents/chat-messages.test.mjs` passed 13 checks and `core/Session/Chat/Chat.test.mjs` passed 7.

## Requirements
- 2b "`{place}` edits may update a message's text in place, never its position" — yes — `ChatWriter.place` writes `{messages:{<prompt id>:{clean:{<sentence id>:text}}}}`. The new test checks that message ids and order don't change, that the raw `said` is kept, that two improves merge on one Prompt, and that an edit of "nothing" adds no line.
- 2 "V1's `{chat}`/`{place}` lines stay exactly as they are" — yes — the `{place}` line is still written first and as sent; the test counts 3 `{place}` lines for 3 calls.
- 3 "A replay test … same list, same order, no twins" — yes — the new check replays the file before and after the edits.
- 4 "renders the list live" — yes — ChatList draws `cleaned`, and `merge_clean` emits `delta` the same way an in-place title refine already does.
- 5 "Document it" — yes — core/Session/Chat/readme.md (the shape, an example line, how to check it), Servex/doc/item-tool.md and ux/Dictate/doc/voice-assistant.md are all updated. The Servex readme row is stale (finding 2).
- Earlier review's fixes 1–4 (navigation `children`, the Servex readme row, scripts.md, item-tool.md) — yes — all present on michael/dev.
- Fresh agent can continue from the task folder alone — no — finding 1.
- Simpler way? — no — the mirror is one static method plus one call at the item tool's single write path. Storing `clean` per sentence keeps the raw words, which is simpler than overwriting `text`.

## Words
- Comments and docs are plain and say what happens ("in place", "never its position") — yes
- New words defined — yes — `clean` and `cleaned` are defined in Prompt.js and in the Chat readme's shape block.
