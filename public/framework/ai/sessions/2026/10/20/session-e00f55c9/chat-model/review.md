verdict: fix
1. [fix] The "V1 way" in `V1Bubbles.js:152` (`bubbles()`) does not match what V1 actually draws. `ext/Chat/Chat.js:58-70` `place()` moves every new bubble before any bubble with a later `at` (`said_at`), so V1 shows bubbles in time order, while the mirror keeps file order. That makes `doc/pseudo-properties.md:248` wrong too: it says V1 draws "in file order" and blames the 1114/591 differing bubbles on the reply hold. Mirror `place()` in the reader, re-run the compare, and only then write down the cause.
2. [fix] `doc/pseudo-properties.md:247` contradicts `s8/compare.txt`. It says "every session but `v-timqv56` needed it", but compare.txt:2532 shows `v-timqv56` was also built by `plan()`. The one session that did not need `plan()` is `v-u48msei`. Rewrite the sentence from the real numbers: 4 of 5 were planned, and `v-u48msei` is only partly mirrored.
3. [fix] The step-2 gate ("0 sessions still needing `ChatToMessages.plan()`", `doc/pseudo-properties.md:247`) can't be measured by the tool. `ChatV1Compare.mjs:55` treats any file with a single `messages`/`sentences` line as fully mirrored, so `v-u48msei` (278 V1 bubbles against 63 from the adapter) would already pass the gate. The tool should count `{chat}` lines that have no mirror (as `Prompt.raw.test.mjs` already does: 33 of 152), or the gate should be reworded.
4. [fix] The readme's "Check it" section (`core/Session/Chat/readme.md:69-74`) doesn't list `node public/framework/core/Session/Chat/V1Bubbles.test.mjs` (4 checks, which pass) or `node Server/ChatV1Compare.mjs`. Each file there is indexed under "Check it", so the new test and tool should be too (Law 10). The only mention is the ✅ line at readme:92.
5. [note] `ChatV1Compare.mjs:58-61` writes the lines to an OS temp file and then reads them straight back before calling `ChatToMessages.plan()`. `plan(lines)` gives the same result with no file, so the round trip only adds disk writes. The brief also named the session scratchpad, not `os.tmpdir()`.
6. [note] The fixture check in `V1Bubbles.test.mjs:222-224` (owner pieces = sentences) is true by construction, because `events()` pushes each sentence exactly once. It can't catch a merge bug. A V1-against-adapter comparison on the mirrored tail of the fixture would test something real.
7. [note] The `fix` handling in `V1Bubbles.js:142` only partly matches V1. V1 (`Chat.js:787-791`) replaces the original piece's text with the fix text, but the mirror drops the fix line and keeps the old text. Fixed lines will therefore show up as text differences that V1 never draws. The header comment (`V1Bubbles.js:109-113`) covers `fix` only for bubble counts, not text.
8. [note] `Server/doc/scripts.md` (the census of `Server/` scripts) has no row for `Server/ChatV1Compare.mjs`, although `ChatToMessages.mjs` has one at line 52.

## Requirements
- 8 "a dry-run migration that writes `session.messages` for old sessions from their `{chat}`/`{place}` lines" — yes — `Server/ChatToMessages.mjs` (already there, dry run by default); `plan()` is reused, never `--apply`'d
- 8 "a side-by-side check that V1 renders the same from either source" — partly — `ChatV1Compare.mjs` + `V1Bubbles.js` exist and ran on 5 sessions (`s8/compare.txt`), but the V1 side leaves out `place()`'s time ordering (finding 1), so the differences it reports are not yet trustworthy
- 8 "Don't run the migration, and don't switch V1" — yes — no `--apply`, and `ext/Chat/Chat.js` is untouched in the diff
- Docs (Law 9) — partly — readme ✅ line and pseudo-properties section added; "Check it" not updated (finding 4)
- New class with live instances? — n/a (`V1Bubbles` is static, holds no state)
- Fresh agent could continue? — yes — `s8/requirements.md`, `s8/compare.txt` and the doc section say what is done and what each step gates

## Words
- content: plain sentences — mostly yes; `doc/pseudo-properties.md:247` is a run-on with a parenthetical that contradicts the data (finding 2)
- owner's name absent — yes
