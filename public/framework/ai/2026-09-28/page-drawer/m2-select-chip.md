# Minion 2: select any element, its properties, a chip in the chat

Load the `minion` skill first, then `code`, `page` and `css`. The owner's raw words: `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-4.md`, the second half ("for any content card whether it's a paragraph or a question or any list item… it should be selectable…"). Read it; it is the acceptance test.

**Work only in the worktree** `C:\Code\lew42\worktrees\page-drawer` (branch `worktree/page-drawer`, server http://localhost:62178/). Minion 1 already built the ☰ menu and the drawer's tabs there (read `ext/drawer/doc/tabs.md` and `m1/proof.md`). Commit there; do not merge. Log in `public/framework/ai/2026-09-28/page-drawer/m2/task.jsonl` in the worktree.

## Deliverables

1. **Any content element is selectable:** a paragraph, a heading, a question, a list item, a card. Hover brightens its background subtly (a `lighten` token, not a new colour); a click keeps it selected (one at a time; Escape or a click on empty space clears it). Only while the drawer is open, so plain reading and links are untouched when it is shut. Links, buttons and inputs keep their own clicks. Never inside the drawer or the dev bar.
2. **Selecting it opens its PROPERTIES in the drawer:** minimal — what it is (tag, class, its text's first line), where it is (the page, the nearest module readme, the file that drew it if `ext/Ask` can find it). Reuse `ext/Ask`'s `pick()` code (it already gathers the markup and the nearest readme), don't rewrite it.
3. **A chat bubble adds the element to the page chat's context,** shown as a chip in the AI tab's input ("this paragraph", ✕ to remove), the way IDEs show the open file. The send (minion 1's exported `send({page, text, context})`) carries it as `context: [{kind, label, text, selector}]` — the shape in `public/framework/ai/2026-09-25/recursive-pairs/interface.md`. The page's own manager answers; there is no agent per element.
4. **Suggestions are, for now, that chat:** no suggest-edit UI.
5. **Docs:** `ext/drawer/doc/select.md`, a screenshot first; one line in `ext/drawer/readme.md`.

## Proof (pngs in `public/framework/ai/2026-09-28/page-drawer/shots/`)

- hover and selected, on a paragraph and on a card, at 1920;
- the properties shown in the drawer;
- the chip in the input, and the sent message's body carrying `context` (log the request body);
- the drawer shut: clicking a paragraph does nothing and links still work.
Headless Playwright against http://localhost:62178/ only. `node Server/smoke.mjs C:\Code\lew42\worktrees\page-drawer` clean.

## Never

Edit outside `ext/drawer/**`, `ext/Ask/` (an export seam only, logged), and the ☰ line in `public/app.js`. Start or restart a server. Show a window (`windowsHide: true`). New classes use the `drawer-` prefix via `new-css-class`. Write `m2/proof.md` (one line per deliverable with its png) and stop.
