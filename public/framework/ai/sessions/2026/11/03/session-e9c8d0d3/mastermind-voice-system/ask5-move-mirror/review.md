verdict: fix
1. [fix] The task folder has no outcome: `session.jsonl` holds only the `assign` and a `commit` line, so it never records ask 3 (did the `heard` check at `Servex/agents/Sessions.js` ~:1605-1660 show a split, and was anything fixed), the one-line V1Bubbles/ChatV2 answer from "Not now", the test numbers or the `smoke.mjs` result. A fresh agent can't tell from this folder whether asks 3 and "Not now" were done.
2. [fix] `Servex/agents/ChatWriter.js:22-29` `move_line` moves the whole Prompt, every sentence in it, after the last message. So a new-topic placement on the last sentence of a several-sentence Prompt also carries the earlier sentences along. When the Prompt's Reply has already landed, the list goes from [P, R] to [R, P], and any view that draws in list order (V1.2 reads `session.messages` in order) shows the answer above the question. Either target the sentence (or refuse when the Prompt holds other sentences), or stop the move before that Prompt's own Replies, and add a test for each case.
3. [fix] `public/framework/ext/Chat/v3/readme.md:38-39` is out of date: it still says `ChatV3.test.mjs` has "23 checks" and doesn't list section 9's move and improve checks. The new `fixture/move-session.jsonl` is listed nowhere in that readme. Line 304's new bullet names the tests, but the Tests list itself was not updated.
4. [note] `public/framework/ext/Chat/v3/ChatV3.js:157-163` `relocate` skips a root that has no drawn node. A Prompt moved from outside the newest-40 window to the end therefore stays hidden until reload, even though it is now the newest card.
5. [note] `Servex/agents/ChatWriter.move.test.mjs:59`: the first assertion can't fail, because the key list is compared with itself reordered. Replace it with `assert.deepEqual(Object.keys(mv), ["messages"])`.
6. [note] The new test passes in the worktree: `node Servex/agents/ChatWriter.move.test.mjs` printed 5 checks passed. I did not run `ChatV3.test.mjs` (Playwright) or smoke.
7. [note] Simpler: `placement.moved_id` (`placement.js:9-10`) is a one-line wrapper around `line?.move?.id`. ChatV3 could read that inline, so placement.js needs no new export.

## Requirements
- 1 "write ONE List.move line on the messages list … No delete+add" — yes — ChatWriter.js:22-29 returns `{messages:{move:{id,after}}}`; page_tools.js:1391 writes it after `place`; the test passes
- 2 "MOVE that node's DOM (no re-render of its text, no new bubble)" — yes — ChatV3.js:42-43 sends move deltas to `moved`, and `relocate()` moves `el`; ChatV3.test section 9 checks it is the same node and the same text node (not run by me)
- 3 "a sentence of the owner's is never split across two bubbles … check how heard orders them" — no evidence — nothing in the diff or the task log says it was checked (finding 1)
- 4 "Tests first … replayed session.jsonl fixture (a)(b)(c)" — yes — fixture/move-session.jsonl is the first 60 lines of v-z0jonhy; (a) and (c) are in ChatWriter.move.test, (b) and (c) in ChatV3.test section 9
- 5 "Update the readmes of the two modules" — partly — Servex/readme.md, core/Session/Chat/readme.md and v3/readme.md:304 are updated; the v3 Tests list is stale (finding 3)
- Not now: "say whether V1Bubbles/ChatV2 still redraw on a move, in one line" — no — not reported (finding 1)
- Class page — n/a (no new class)

## Words
- Comments and readme lines are plain and name their files — yes — ChatWriter.js:18-21, v3/readme.md:304
- No dated logs added — yes
