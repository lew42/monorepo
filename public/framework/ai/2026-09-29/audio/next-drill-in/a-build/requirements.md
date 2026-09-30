# Build: drill into a chat card, full screen, routed

Load the `minion` skill first, then `code` and `css`. Your parent is `task-mastermind-drill-in`; the whole task is at `public/framework/ai/2026-09-29/audio/next-drill-in/` (read its `requirements.md`: the owner's words verbatim are the acceptance test).

## The owner's words (2026-09-29)

> "it might be nice to be able to click on one of them and kind of dig into it, in which case I might imagine that the uh, the the sheet could then go full screen and kind of become like, you know, a shell in and of itself with paging within it. And so then when you click on a specific card, You know, then you're, well, first it kind of selects that card, but also maybe expands it if there's things within it."

> "if anything that's clickable, like we probably need to, to route to that page so that then we can refresh without losing our, our spot ... these content cards should basically be pages of themselves ... Maybe a card is kind of a tiny page and doesn't need um, a directory of its own."

## Where

- Worktree: `C:\Code\lew42\worktrees\drill-in` (branch `worktree/drill-in`, server `http://localhost:53050/`). Write and commit ONLY there.
- **Fence: `public/framework/ext/Chat/**` only.** Not `ext/drawer/**` (rail.js is two other tasks'), not framework.css, not styles/.
- Read first: `ext/Chat/readme.md`, `ext/Chat/doc/decisions.md`, `ChatPanel.js`, and `Chat.js` (select_bubble / make_selectable / add_rename_button, `bubbles` map, `fill()`, `place_card()`).

## Deliverables

1. **Open action.** In `Chat.js`, a selected bubble that HAS contents grows a small "Open ⤢" button beside Rename (same pattern as `add_rename_button`). "Has contents" = more than one piece, or a refined line with sections, or a `place` card, or a reply with a heading and a body. Clicking it calls a new `on_open(info)` option of `chat()` with `{ at, pieces, refined, title }` (at = the bubble's first piece id). No `on_open` given → no button (v1 behaviour).
2. **The shell: new `ext/Chat/Drill.js`, class `ChatDrill`** (a View). `ChatPanel` gets `drill` (default `true`; `drill: false` = exactly today's behaviour, v1 kept reachable) and `session` (default: the `watch` url, else `"local"`). ChatPanel wires `on_open` → opens a ChatDrill:
   - A header: ← Back, the card's title, and a breadcrumb of the levels above (each crumb clickable).
   - A body: the card's contents as a page — each piece / section as its own card (markdown via `md.js`, a `place` card drawn with the same code `place_card()` uses: export it rather than copy it). A card in this page that itself has contents (a refined section → its raw `from` pieces; a piece with a place card; a merged run) is clickable and opens ONE LEVEL DEEPER in the same shell (paging). Leaves are not clickable.
   - **Mount:** if the panel is inside `.drawer` (desktop drawer AI tab) and not inside `.drawer-rail-sheet`, mount over the whole `.drawer` (`position: absolute; inset: 0` — `.drawer` is `position: fixed`, so it is the containing block): full drawer height. Otherwise append to `document.body`, `position: fixed; inset: 0`, z-index above the sheet (the sheet is 41; use 50): full screen. Put this one rule in one method (`mount_point()`) with a comment naming the alternative (the page's main area) and why not.
   - Solid background from theme tokens, readable at 400 and at 1920 (on 1920+ the body content caps at a readable measure, centred — use existing layout words, see `css` skill).
3. **Routed.** Each level's address is the URL hash: `#chat=<session>~<at>[/<at>…]` (encodeURIComponent each part). Opening a level = `history.pushState` with the new hash; ← Back = `history.back()`; a `popstate`/`hashchange` re-renders the level the hash names, or closes the shell when the hash no longer has `chat=`. **On load**, a ChatPanel whose session matches the hash re-opens the shell at that level once its entries contain that `at` (check after each `sync()`, once). The core Router listens to popstate and reloads the same pathname — check that a hash-only back does not wipe the page (it should be a no-op re-activate; verify in the browser, say so in your log). Esc closes one level (same as Back). Do not fight `minion-sheet-as-page`, which is adding `?sheet=` to the same URL in rail.js: only ever read/write the `#chat=` hash part and keep `location.search` untouched.
4. **Demo.** Add a "Drill in" demo to `ext/Chat/panel/page.js`: a ChatPanel seeded (via `say()`) with a merged owner run, a refined bubble whose sections cite raw pieces, and a placed Decision card, so all three levels can be tried. Link it with one line in `ext/Chat/readme.md`.
5. **Doc.** `ext/Chat/doc/drill.md`: what it is (one screen), the address shape, and in ONE line each: how a card maps to the page system (a tiny page addressed by session + `at`, rendered by ChatDrill, no directory) and what makes a card graduate to a real directory (it gets its own children or files that outlive the chat: then it gets a `page.js` under its session's card dir). Plus the mount decision and its alternative. Add a "Drill in" section of ≤ 6 lines to `readme.md` pointing there, and a dated entry in `doc/decisions.md`.
6. **Proof.** Headless Playwright (a probe in your own scratchpad, `windowsHide: true` on any spawn, never the owner's tabs), against `http://localhost:53050/framework/ext/Chat/panel/`, **stub every POST** (`page.route('**/*', r => r.request().method()==='POST' ? r.fulfill({status:200, body:'{}'}) : r.continue())`): select a card → Open → level 1 → click a card → level 2 → reload (lands at level 2) → Back → Back (shell closed). Screenshot each step at 400 and at 1920, into `public/framework/ai/2026-09-29/audio/next-drill-in/a-build/shots/`. Zero console errors. Also one shot at 1920 of the drawer AI tab (open the drawer on any page) with the shell open, if you can reach it headless; if not, say why.

## Rules

- Classes carry the `chatbox-` prefix (`chatbox-drill-*`). Every CSS rule inside a layer (`Chat.css` already is). No backtick inside `css(\`…\`)`.
- No DOM after an `await`. Resolve URLs against `import.meta`.
- Commit in the worktree by exact paths. Don't merge — your parent does.
- Log in your own `task.jsonl` (already opened for you). Land with `finish-task`; the outcome is the checklist of the 6 deliverables, each with its proof (a shot filename).
- Budget: about $4. If you are stuck on the drawer mount, ship the sheet path and say so.
