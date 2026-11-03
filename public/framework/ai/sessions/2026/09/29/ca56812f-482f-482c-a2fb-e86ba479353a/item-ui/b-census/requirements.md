# Minion B — census: which classes are objects worth a view?

Load the `minion` skill first. The owner's words: `public/framework/ai/sessions/2026/09/29/ca56812f-482f-482c-a2fb-e86ba479353a/item-ui/owner-words.md` (the part from "Study all of the modules across the whole framework"). Task brief: `../requirements.md`, deliverable 5. Read-only work, except the one file you write.

The owner: "Study all of the modules across the whole framework and figure out, if it's an object oriented thing, do we have a debug view … every instance basically can be a card … some classes like a view class don't need a list of all its methods … for pages, for the app itself, we might want a little structured UI for it."

## Do
1. Walk `C:\Code\lew42\worktrees\item-ui\public\framework\` — `core/`, `ext/`, `ux/`, `ui/`, `web/` — skip `ai/`, `core/legacy/`, `core/new/`, and dated or sandbox dirs. For every exported class (grep `export default class` / `export class`), fill one row.
2. Write `C:\Code\lew42\worktrees\item-ui\public\framework\ux\Content\Object\doc\census.md`: first two sentences saying what the table is and the headline count; then one table:

| class | module | object-like? (holds state worth seeing) | has a view of its instance today? (name it) | worth a view? (yes/no + four words) |

Sort: "worth a view: yes" first, most useful first (Page and App near the top). `ux/Content/Object` (ObjectCard) is the object card built 09-28; say which classes already use it.
3. Under the table, at most five lines: which properties the Page and App views should show first (read `core/Page/Page.js` and `core/App` / `app.js` for the real names, e.g. `children`, `nav`, `files`, the current route, settings).

Commit the one file in the worktree (`git -C C:/Code/lew42/worktrees/item-ui add <path>; commit`). Reply to your parent with the headline count and the file path. Budget: about $1. No servers, no windows.

