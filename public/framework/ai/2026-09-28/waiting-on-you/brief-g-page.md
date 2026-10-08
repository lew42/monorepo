# Brief G: finish the Needs you tab and the Needs review filter

Load the `minion` skill, then the `page` skill. Then read these, beside this file: `contract-v2.md` (your spec), `brief-d-needs-you.md`, `brief-e-review-filter.md` and `owner-words-0929.md`. D and E are your deliverables, and the owner's own words there are the acceptance test.

**Work in:** `C:\Code\lew42\worktrees\needs-you` (site http://localhost:53478/). The uncommitted work there is a first builder's: `ai2/needs.js`, and the Needs you tab in `ai2/page.js` and `ai2.css`. That builder stopped in a crash, so finish its work; do not start over. Commit only your own files.
**Fence:** everything in `public/framework/ai2/` EXCEPT `needs-rule.js` and `fold.js` (minion F owns the rule; to change it, message your parent), plus `ai2/doc/needs-you.md` and `ai2/readme.md`.

Minion F moves `card_needs()` from `needs.js` into `needs-rule.js` as its first commit. Until then, build everything else in `needs.js`, and leave that function's body alone.

## Deliverables
1. **Brief D, what is left of it:** the Needs you tab. Check that it is first and the default, and that reload and back land in place. Each item is one big plain line, with its control right there: a Decision's options as buttons, or a reply box. Empty means one line, "Nothing needs you". Also D's Overview fixes: remove the stray "Folder" labels, and show a short title instead of raw dictation.
2. **Brief E, all of it:** a toolbar on the inbox rail with `+ New card` and a "Needs review" checkbox, whose state is in the url (`?review=1`). It filters with the SAME rule. Add a "Reviewed ✓" control on a flagged card (contract-v2 §5). Remove the rail's text area and Send button, and remove the folder icon and "Folder" label above the AI 2 title. Leave the ☰ drawer alone.
3. **Answering on the tab** posts through the existing `/card/append` path: a `chose` line for a Decision, an `answer` line for a Question, and `{"answer": {"ask": id, "text"}}` for a legacy ask. The row leaves at once.
4. **Proof, headless (the `ui-test` skill, never the owner's tabs), on the worktree server:** save these shots into this task dir: `needs-1920.png`, `needs-1280.png`, `rail-review-1920.png` (filter on), `card-reviewed-1920.png` and `overview-1920.png`. Answer one item against `?servex=http://127.0.0.1:1`, to show the refusal is handled. Never write test lines into real cards. Open every shot and judge it: can the owner tell in five seconds what needs him?
5. `node Server/smoke.mjs C:\Code\lew42\worktrees\needs-you` must come out clean. Write `ai2/doc/needs-you.md` (one screen, shot first: what it lists, how to ask with `card_ask`, how answering wakes the asker, the filter). Add one line to `ai2/readme.md`. Commit.

⚠ No DOM after an `await`. Every CSS rule inside a layer, with the `ai2-` prefix. Every process you start is hidden (`windowsHide: true`). Never touch port 8090 or 80, or the main tree.

Log to `task.jsonl` beside this file with `{"log": {"at": "NOW", "msg": "minion-G: …"}}` via `node .claude/hooks/append.mjs`. End your turn with the commit hashes, the shot paths, and anything left unfinished.
