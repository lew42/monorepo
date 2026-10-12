# Step 5 — the object card (Sonnet)

Load the `minion` skill first, then `code`, `page` and `new-css-class`. The owner's words, verbatim: `../owner-words.md` (read the paragraph on "content cards that show the structure of… our object oriented system"). The brief: `../requirements.md` ask 6. The structure it will join: `../proposal.md`.

## The owner's sentence

"a little card that shows… the instance name, the properties and methods… it's like, oh, this is a page and it has a property of this that equals this… instead of explaining with words."

## Deliverables

1. **`ux/Content/Object/`**: a new Content module, a sibling of `Question` and `Decision`. Copy their shape: `Object.js`, `page.js`, `readme.md` and `doc/`, and add `Object` to `ux/Content/page.js` `children:`.
   - One call renders a card from a live object: `object(instance)` or `object(Class)`, matching how Question is called.
   - The card shows:
     - the header: the class name, plus the instance's name or path when it has one;
     - **Properties**: `name = value`, with short values inline and long ones cut to one line;
     - **Methods**: the names only, each a link to its doc page when one exists (core/Page has `doc/method/<name>.md` → `/framework/core/Page/doc/method/<name>/`).
   - Options: which properties to show (default: own enumerable ones, skipping functions and DOM), and inline vs full width.
   - CSS prefix is `ux-content-` (css-scopes.txt), inside a layer as `framework.css` orders them.
2. **The module's `page.js`** shows, doesn't tell: three live cards. One is a real `Page` instance (the page itself, `this`), one is the `Page` class, and one is a plain object.
3. **Used once on the paging docs:** the `/framework/core/Page/` API tab opens with an object card for `Page`. If the API tab is a doc `.md`, put the card on the Overview wall instead, as one more card. Don't restructure any tab (that is step 6).

## Where

- The pool worktree `C:/Code/lew42/worktrees/qf-1`, which has its own server at `http://127.0.0.1:58131/`. Write and commit there only, never in the main tree. The task mastermind merges it.
- Fence: `public/framework/ux/Content/Object/`, one line in `ux/Content/page.js`, and the one insertion in `public/framework/core/Page/` (page.js or the API tab's file).

## Proof

- Screenshot `http://127.0.0.1:58131/framework/ux/Content/Object/` and the core/Page tab you touched at 1920, in headless Playwright (the `ui-test` skill). Save both to `public/framework/ai/2026-09-28/organization/object/` in the MAIN tree, and look at them.
- Zero console errors: run `node Server/smoke.mjs C:/Code/lew42/worktrees/qf-1` from the main repo.

## Never

- Every process sets `windowsHide: true`.
- Never restart a server, and never touch the owner's tabs.
- Never merge. The mastermind does that.

## Reply

Reply with one line: the commit hash, the two screenshot paths, and whether the smoke test passed.
