# Minion brief: /api/page-ai and card prompts feed the fast/smart pair; the old per-card assistant retires

Load the `minion` skill first, then `code`. Your parent is **task-mastermind-one-dictation**; its task dir is `public/framework/ai/2026-09-30/one-dictation/` (read its `requirements.md`, and the owner's words in `../audio-consolidate/owner-words.md` from "hamburger menu" on).

## The owner's words (2026-09-30)
"I don't want two user interfaces. I don't want two systems. And I believe this sidebar is actually using the old one, the single assistant… 'Yes I can hear you, what would you like to work on for this card'… I don't think that's a fast or smart assistant, and there's this model chooser at the top."
"We're not doing per directory assistants anymore. We're doing global dictation assistance… but they're contextually aware."

## Today
`Servex/agents/Layers.js`:
- `page_ai({page, text})` (`POST /api/page-ai`) writes a prompt and wakes the PAGE's own assistant, or appends a `prompt` to a card, which the card listener (`listen()` → `hear()` → `heard()`) hands to `assistant-<card>`.
- So anything the owner types into a card (the AI 2 card composer writes `{"prompt":…}` lines into the card's page.jsonl) is answered by the old single assistant, not the session pair.

The pair lives in `Servex/agents/Sessions.js` (`create`, `recent`, `say`, `nav`; the client is `public/framework/ext/Session/Session.js`). A session's file is `<home>ai/<session>.jsonl`.

## Build (worktree `C:\Code\lew42\worktrees\one-dictation`, branch `worktree/one-dictation`)
1. **One global session per project, server side.** Add to Layers.js (not Sessions.js) a helper that finds the project's newest session that spoke within Sessions' `resume_ms`, whatever page or card it started on, and otherwise creates one (`create({path, card})`). Read Sessions' own methods to do it; don't edit Sessions.js. ⚠ The main tree has uncommitted edits to Sessions.js from another task, so an edit there would conflict at merge.
2. **`page_ai({page, text, context})` feeds that session:** `say({session, path: page, text, via: "text"})`, with the picked elements folded into the text the way `selected_block()` does today. Answer `{ok, session, file}` (keep `page` in it), so the drawer can watch the same file the ✦ sheet watches.
3. **An owner's prompt written to a card feeds the same session**, instead of waking `assistant-<card>`. Only `by: "owner"` prompts. Agents' prompts, managers, and every other route stay as they are. The path sent is the card's page, `/framework/ai2/<card id>/`, so the pair knows which card it's about.
4. **No new `assistant-<card>` or page assistant is spawned** by page_ai or by an owner's card prompt. Leave the spawning code in place (other routes may still call it), but make these two routes no longer reach it. Name any other caller you find in your log.
5. `Servex/agents/layers.test.mjs`: update the page-ai checks and add one for each of 2 and 3, with Sessions stubbed so no real agent spawns. Run the suite: it must pass.

## Don't
- Restart Servex, or call any live Servex route that spawns agents. Your parent restarts it after the merge.
- Touch anything outside the fence.

## Fence
`Servex/agents/Layers.js`, `Servex/agents/layers.test.mjs`, `Servex/doc/*.md` (only the lines about page-ai or the card assistant), and your own task dir. Commit by exact path after each piece. Another minion (minion-chat) works in this same worktree on `public/` files: never `git add -A`.

## Land
**Don't merge.** End your turn with the test output and one line per item saying what changed, in your task.jsonl.
