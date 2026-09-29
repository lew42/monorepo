# Minion B: the "Waiting on you" strip in AI 2

Load the `minion` skill, then the `page` skill. Then read `contract.md` beside this file. It is your spec. Minion A builds the Servex half at the same time.

The owner's words, 2026-09-28: "for things that you're waiting on me for, this is what the dashboard is for. We need to create a way where I don't, even if I miss something, I don't actually miss it forever… I'll find it in the dashboard." Read `requirements.md` in full, especially "What the owner sees" and deliverables 4 and 7. The card's conversation is at `public/framework/ai/2026/09/28/waiting-on-you-never-buried/`.

**Work in:** `C:\Code\lew42\worktrees\waiting-on-you`, and commit there.
**Fence:** a new `public/framework/ai2/waiting.js`; at most about 10 lines in `ai2/page.js` (import, mount, and a `waiting` route word); `ai2/inbox.js` only if you need a shared helper; the strip's CSS in `ai2/ai2.css` (run the `new-css-class` skill: use the `ai2-` prefix, inside a layer); `ai2/doc/waiting.md`, plus a link to it in `ai2/readme.md`. Another agent, ai2-lead-2, owns the rest of `page.js`, so keep your lines together and change nothing around them. **Mount point (from ai2-lead-2):** below the rail header and the compose box, directly above the card list. Not inside the header, where a new `workspace` word now sits (it is uncommitted in the main tree). AI 2 links carry `?view=workspace` through `ai2/workspace.js`, but that file is not in your worktree. So do NOT import it: use plain hrefs (`/framework/ai2/<card id>/`, `/framework/ai2/waiting/`), and I will wire them through `workspace.url()` at merge time.

## Deliverables
1. **The strip** at the top of `/framework/ai2/`, headed "Waiting on you (N)". Each row has an icon (reuse `TYPE_ICON` in inbox.js), the title (about five words), the question in one sentence, how long it has waited ("3 h", "2 d"; mark it when it is older than a day), and an answer box. The box takes typing, and dictation through the existing `ux/Dictate` that compose.js uses. When the ask has options, show them as buttons. Answering POSTs to `/card/append` (see the contract) and removes the row at once. Clicking a row opens its card. Show at most 5 rows, then "N more", which links to the route. When nothing is waiting, the strip shrinks to one quiet line, or nothing at all.
2. **Its route:** `/framework/ai2/waiting/` shows every open ask. A reload or the back button lands there.
3. It reads `/framework/ai/cards.jsonl` (the rows with `waiting`), and refreshes when the index changes. Look at how the rail stays live in inbox.js/page.js, and do the same.
4. At 1280 wide, the strip must not push the inbox below the fold.
5. `ai2/doc/waiting.md` fits on one screen. The strip's screenshot goes first, then how to ask (`card_ask`), how answering wakes the asker, and the route.
6. **Proof:** make test data first. Put 3 asks on 3 test cards in the WORKTREE's `public/framework/ai/` (one of them over a day old, one with options). Use a private Servex if minion A has landed (ask your parent), or append the lines by hand if not (the test data only). Shoot `/framework/ai2/` at 1280 and 1920, and `/framework/ai2/waiting/` after a reload, all on the worktree server http://localhost:59512/, headless (the `ui-test` skill, never the owner's tabs). Open each shot and judge it: can you tell what is waiting and how to answer? Then delete the test cards. Save the shots in this task dir as `strip-1280.png`, `strip-1920.png` and `route.png`.

⚠ No DOM after an `await`. Every CSS rule goes inside a layer. Any process you start is hidden (`windowsHide: true`). Never touch port 8090 or 80.

Log to `task.jsonl` beside this file with `{"log": {"at": "NOW", "msg": "minion-B: …"}}` via `node .claude/hooks/append.mjs`. When you're done, commit, and end your turn with the hash and the three shot paths.
