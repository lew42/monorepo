# Dictation: Chat v2 in the desktop drawer's AI tab

Budget: $2.50. Load the `minion` skill first. Card: `public/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/` (the owner's words). Parent brief: [../requirements.md](../requirements.md), Part 10 (Chat v2 on Option C). Log in `session.jsonl` beside this file (`log` lines, never a findings.md).

## The gap

Chat v2 (`ext/Chat/v2/`) shows in three places today: its own page, the session page's Chat tab, and the phone ✦ sheet's **v2** chip (`ext/drawer/Sheet.js` ~409–440: `v2_chip()`, `chat_view()`, `sync_v2()`, localStorage `lew42.sheet.chat_view`). The wide desktop drawer (1920 px) fills its AI tab with the same `chat()` from `ext/drawer/tabs/ai.js` (~248–280), but has no v2 chip, so on a desktop Chat v2 is out of reach while dictating.

## Deliverables

1. **The same v2 chip in the desktop drawer's AI tab**, drawing that tab's voice session file in place of the bubbles, following a New session or a resume, composer and mic footer kept, sharing the SAME localStorage choice (`lew42.sheet.chat_view`) so one switch rules both surfaces.
2. **One component, not two** (CLAUDE.md law 6): move the chip + sync logic out of `Sheet.js` into one small class both surfaces use (suggested: `ext/drawer/ChatView.js`, `class ChatView`, with `chip()`, `set(on)`, `sync()`; name and home are yours if a better one already exists, say so in one log line). `Sheet.js` must keep working exactly as before: its v2 chip, its CSS classes (`drawer-rail-sheet-v2*`) and `chat-v2/sheet/probe.mjs` still pass.
3. **Proof, headless:** shoot the desktop drawer's AI tab with v2 on at 1920 and 3440, and the ✦ sheet with v2 on at 400 (regression), into `drawer-v2/proof/` (pngs are gitignored by policy; commit the script). Read the shots yourself; log one line per shot saying what it shows.
4. **Docs:** update the "Where it shows" line of `ext/Chat/v2/readme.md` and the drawer's readme or `doc/sheet.md`, whichever names the v2 chip.

## Rules

- Work in your worktree (you were started in it); commit by exact path after each working step. Never push, never stash (diff instead), never kill or restart the dev server or Servex, never drive the owner's tabs (headless only, against your worktree's URL).
- `node --check` every file you touch; run `ext/Chat/v2/ChatV2.test.mjs` and `chat-v2/sheet/probe.mjs` and paste the pass counts.
- Done = committed on your branch, tests passing, a closing log line with the commit hashes. Then say "done" to your parent.
