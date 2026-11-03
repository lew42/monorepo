# Build brief — AI 2 as familiar groups; a card shows the real task page

Minion: `minion-ai2-groups` (the ONLY minion — budget mode). Parent: `task-mastermind-ai2-dashboard`.
Load `minion`, then `code`, `layout` and `css` before writing. Read [`requirements.md`](./requirements.md)
first: the owner's words there are the acceptance test. Never write the owner's name.

Worktree: `C:\Code\lew42\worktrees\ai2-groups`, branch `worktree/ai2-groups` (your mastermind
creates it; its server port is in your first message). Commit there only. Headless Playwright only
(`await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs")`).
Scratch scripts in the session scratchpad, named `g-*.mjs`. In Git Bash prefix `node Server/…
/framework/…` commands with `MSYS_NO_PATHCONV=1`.

## Decided (don't reopen; say so if one turns out impossible)

1. **The seven groups** live in ONE data file, `public/framework/ai2/groups.json` — an array of
   `{ "id", "name", "icon", "about" }` (`about` = one sentence of what belongs; the fast
   assistant reads this file to file prompts). Ids and names:
   `system-design` System design · `servex` Servex · `ai-dashboard` AI dashboard ·
   `pages-markdown` Pages & markdown · `cards-content` Cards & content ·
   `layout-columns` Layout & columns · `audits` Audits. Icons: pick familiar ones from the icon
   set AI 2 already uses (grep `icon` in ai2/*.js and the icon module it imports).
2. **Each group is also a card** (so the fast assistant can append a prompt to it and a group gets
   its own card assistant): create each with Servex's card API, `type: "group"` — read
   `Servex/cards/readme.md` and `Cards.js` (`POST /card/create` or the create path it documents).
   Record the card id in groups.json as `card`.
3. **Membership is a line on the MEMBER, latest wins**: `{"group": "<group id>"}`. On a task:
   appended to its `task.jsonl` (⚠ distinct from `assign.group`, which is the old "effort" —
   say so in `ext/JSONL/doc/task-jsonl.md` in two lines). On a card: appended to its log through
   `POST /card/append`.
4. **A group rises by its members, computed in the VIEW**: a group's time = the newest line of
   the group card or any member; its preview's "latest update" = that newest member's own words
   (a task's `now` or landing headline; a card's last message). No copies appended to the group's
   log. (Alternative named in the decision log: a Servex `Cards.on()` listener appending update
   lines — not now; tasks aren't cards, and it would need a Servex restart.)
5. **Previews are never truncated.** Remove the clipping (the readme's "rows must not change
   height" rule is retired by the owner's newer ask; the "enter only when the list is quiet" pill
   stays). No slug or id ever appears in a preview — a task shows its title / request headline.
6. **The rail = the seven groups first**, ordered by latest activity, each: icon + name, the
   latest update in plain words (whole), when. Below them, a quiet "Not filed yet (N)" fold with
   everything not in a group, as today's rows. The Live card stays where it is.
7. **A card's detail renders the real task page.** Reuse `ext/AITask`'s own view code (the class
   `/framework/ai/<date>/<slug>/` draws: outcome, links, steps, log, decisions, shots) — find the
   smallest seam that renders it into a given box (a function or a static method; add one to
   `ext/AITask` if needed, never copy its code). A card that points at a task (its link or its
   `task` field) shows that task's page; a **group card shows its members' task pages as
   sections, newest first** (cards that are not tasks: their own content, as today).

## Tag today's tasks (append one `{"group": …}` line to each `task.jsonl` in the MAIN tree — the
only main-tree writes you make, and only after the view works in the worktree)

- system-design: assistant-layers, helper-fixes, recipe-lab, servex-mastermind-opus
- servex: concurrency, servex-crash, servex-mastermind, servex-monitor, servex-startup-note
- ai-dashboard: agent-chat, ai2-dashboard, ai2-groups, live-card, live-card-wide, task-cost
- pages-markdown: md-open, md-pages, page-jsonl
- cards-content: card-consolidation, card-folders, content-modules
- layout-columns: core-columns, layout-names
- audits: inventory, loose-ends, task-audit
Any 2026-09-24 task dir not listed: pick the best group and say which in your reply.

## Fence

`public/framework/ai2/**` (card.js, page.js, inbox.js, ai2.css, groups.json, readme, doc/),
`public/framework/ext/AITask/**` (only the render seam + its doc), `ext/JSONL/doc/task-jsonl.md`
(two lines). NOT `Servex/` (use its HTTP API only), not `live.js` / `.ai2-card-live*`, not
`framework.css` / `styles/`.

## Done means

- `/framework/ai2/` at 1280 and 1920: the seven groups at the top with icons, whole previews, no
  ids; clicking System design shows its tasks' pages as sections; clicking a task card shows its
  task page. Shots in `scratchpad/g-shots/`, opened and looked at.
- Zero console errors / failed requests (except `/framework/ai/usage.json`, which a worktree lacks).
- `MSYS_NO_PATHCONV=1 node Server/padding-check.mjs /framework/ai2/ --base <your server>` — report it.
- Commits on `worktree/ai2-groups`; `git diff michael/dev...HEAD --stat` = only fenced files.
- Reply: one paragraph — what shows where, the group card ids, the seam you used in ext/AITask,
  the shots, the hashes. Your mastermind runs the guard and merges.
