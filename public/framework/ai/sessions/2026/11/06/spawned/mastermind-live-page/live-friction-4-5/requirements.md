# /live/: show a card's text, and stop opening at the bottom

Budget: $5. Model: Sonnet. Load the `minion` skill first.

The friction review found these two problems; it has screenshots and line numbers: [/live/plan/friction/](/live/plan/friction/) (`public/live/plan/friction/page.jsonl`, findings 4 and 5). Both are in one file, `public/live/LivePage.js`.

## 1. A card's text never shows (finding 4)

- **What's wrong:** the item tool's help says a `part-card` takes `title` and `text` (the line under the title). On /live/ the card only shows its title, because the card body draws `description`. Look at `LivePage.Preview` (around `public/live/LivePage.js:775`): `new P.Md({ item, key: "description", … })`, and `own = item?.get?.("description")` in its `draw`.
- **The fix:** a card shows `description` when it has one, and `text` when it doesn't. Keep `description` working, because existing records and link cards use it. The `$theirs` fallback (a link card shows its target page's description) must still work.
- Check `P.Md` to see whether it can take a fallback key. If it can't, choose the key once, when the view is built, and rebind it when either field changes. Keep the change small.
- Keep `LivePage.Card` and `LivePage.Block` stable. The kit (ui-kit) owns card and row styling, so change no CSS.

## 2. /live/ opens scrolled to the bottom (finding 5)

The owner: "we don't want to scroll to the bottom of every page".

- **What's wrong:** `follow()` (`public/live/LivePage.js:311`) runs `sticky_scroll(box)` and then `.pin()` on load, so the page opens at the bottom, past the cards. `sticky_scroll` is at `public/framework/ext/Chat/Chat.js:409`. Read its returned API. Don't change Chat.js unless you have to: the chat and Dictate use it.
- **The fix:**
  - On load the page opens at the top. No `pin()` on load.
  - It follows new content only when the reader is already at the bottom and something new lands.
  - A page the reader has never scrolled to the bottom never moves by itself.
- If `sticky_scroll` starts locked (`locked = true`), find the smallest way to start unlocked. An option on `sticky_scroll` such as `{ locked: false }` that defaults to today's behaviour is fine; the chat must behave exactly as it does today.

## Work

- Make a worktree with `take_worktree` (or `node Server/worktree-up.mjs live-friction-4-5`), and work and commit there by exact path.
- `public/live` is gitignored: use `git add -f`.
- Test in a headless browser against your worktree's URL:
  - (a) Write a card `{type: "part-card", title, text}` into a test page under `/live/` in your worktree. Show that the text is drawn.
  - (b) Show that /live/ opens with `scrollTop` 0, or with the first card in view.
  - (c) Append a card while the page is scrolled to the bottom: it follows. Append one while it is scrolled to the top: it stays put.
- Write these numbers as `log` lines in `task.jsonl` in this folder (through `node .claude/hooks/append.mjs`).
- Delete the test page afterwards, each file by its exact name.
- LayoutCheck must be clean at 400 and 1200 on /live/. Take shots at 400 and 1200 into `shots/` in this folder.
- Run `node Server/smoke.mjs . /live/ /live/done/ --base <your worktree url> --no-crawl`. It must show no FAIL.
- If a doc describes this, update it in the same commit: `public/live/readme.md` or `public/live/doc/`, wherever card fields or the scroll lock are described.
- Do not merge. Stop when it is committed and tested, and report one screen: what changed (path:line), the three test numbers, and the smoke result.

## Never

- Kill or restart the dev server or Servex.
- Drive the owner's tabs.
- Use `git stash` or `git checkout -- <path>` in the main tree.
- Hand-write a `.jsonl`.
- Edit `Servex/agents/page_tools.js` or `core/List` (page-design owns them).
