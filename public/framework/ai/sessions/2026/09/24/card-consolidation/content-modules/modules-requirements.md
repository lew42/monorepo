# Question, Decision, Quotation — three content modules (builder brief)

You are a minion of `task-mastermind-content-modules`. Load the `minion` skill first, then `code`,
`new-page`, `new-css-class`, `css`, `layout` as it tells you. Read [requirements.md](requirements.md)
beside this file start to finish — the owner's words there are the acceptance test.
Log to THIS task's `task.jsonl` (`C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\content-modules\task.jsonl`)
with `node .claude/hooks/append.mjs` — milestones only; do not write a new assign/launch line.

Work in the worktree `C:\Code\lew42\worktrees\page-cards` (dev server `http://localhost:4817/`).
Two other teams write in this worktree at the same time. **Before any batch of writes run
`node Server/hold.mjs on "minion-content-modules — building ux/Content"` and `... off` after you
have loaded your pages.** Do not commit; the mastermind commits.

## Fence (write only here)

- `public/framework/ux/Content/**` (new)
- ONE line in `public/framework/ux/page.js`: add `Content` to its `children:` string (and the
  readme's module count/table line in `public/framework/ux/readme.md`).
- ONE line in `public/framework/styles/css-scopes.txt` under `# ux`: `ux-content-  ux/Content`.
- Never: `core/**`, `Server/**`, `Servex/**`, `public/framework/ai/**`, `public/framework/ai2/**`, `ui/**`.

## The data shapes (settled — build to these exactly; data first, then looks)

Every record is one JSON line in a log (a page's `page.jsonl`, a card's `page.jsonl`, or a task.jsonl).

```
question  {"question": {"id": "q-…", "ask": "…", "hint": "…"?}}
answer    {"answer":   {"question": "q-…", "text": "…", "at": ISO, "by": "owner"|agent id}}
decision  {"decision": {"id": "d-…", "ask": "…", "options": [{"say": "…", "caveat": "…"}], "why": "…"?}}
chose     {"chose":    {"decision": "d-…", "option": "<say>", "at": ISO, "by": "…"}}
prompt    {"prompt":   {"id": "p-…", "at": ISO, "by": "owner", "raw": "…", "text": "…", "via": "whisper"|"typed", "on": "<card id>", "url": "<page path>"}}
```

- Answers and choices: **the latest line for that id wins**; earlier ones stay in the log (history).
- A prompt line with the same id **merges field by field** (a cleaned `text` arrives later). Render the merged record.
- **Legacy task.jsonl decisions must render as the same Decision card.** Two shapes exist in the wild:
  `{"decision": {"id", "at", "chose": "…", "over": ["…"], "why": "…"}}` and
  `{"decision": {"title", "at", "chose": "…", "alternative": "…"}}`. Normalize: options = chose + over
  (or alternative), the chosen one = `chose`, `why` shown under it, `ask` = id/title humanized.
  Grep a few real ones under `C:\Code\lew42\monorepo\public\framework\ai\2026-09-*\*\task.jsonl` and use them as fixtures.

## Deliverables

1. **`ux/Content/Decision/Decision.js`** — a `View` subclass (ux house style: every method a seam,
   parts as static subclasses). Constructed `new Decision({ page, id, ask, options, why, log })`
   or from a normalized legacy record. Shows the ask and every option with its caveat. Clicking an option
   appends a `chose` line (see Write, below), and the card shows it chosen immediately (ground, border and the
   word "chosen" — never colour alone; reuse the contrast lessons in `public/framework/ui/decision/readme.md`),
   the others still visible and clickable, so it can be changed. On render it reads its log once and shows the
   latest `chose` for its id.
2. **`ux/Content/Question/Question.js`** — same pattern: shows the ask, a text field and a button;
   submitting appends an `answer` line; the latest answer shows beneath, editable again.
3. **`ux/Content/Quotation/Quotation.js`** — renders one merged `prompt` record: the words (`text`,
   with `raw` one click away when it differs), the time, `via`, and a link to `url`. Read-only.
4. **Write, one seam per module (`write(line)`)**: if the host log is a card (the page or data carries a card id)
   POST the line as JSON to Servex `/card/append?id=<card id>` (Servex is the single writer for card
   folders; the route may not exist yet), else — and as the fallback when that request fails —
   `Socket.singleton().request({ method: "append", args: [logUrl, line] })` (see `Server/plugins/SocketServer/Append.js`;
   `Socket` is `/framework/dev/Socket/Socket.js`). `logUrl` is `page.jsonl_url` when placed on a page.jsonl page,
   or an explicit `log` in the data. With `edit()` off (`/framework/ext/Ask/edit.js`) the click still shows locally but writes nothing.
5. **Placeable by one line.** core/Page (another team) is adding: `{"place": {"module": "<url>", ...data}}` → it imports
   the module; a class default export is constructed `new Default({ page, ...data })` and rendered into the page in
   line order. So each module's file `export default`s its class and takes everything from that one object.
6. **Each module is a page**: `ux/Content/<Name>/page.js` (a `Doc`, like `ux/Tags/page.js`) showing it live
   with fixtures (Decision: one fresh and one legacy task.jsonl decision), plus `readme.md` and `doc/`.
   Demos never persist: on the doc pages give the module a throwaway `log` under `ux/Content/<Name>/demo.jsonl`, never a real task log.
7. **`ux/Content/page.js`** — the tier index for now: a plain page whose `children:` is `"Question Decision Quotation"`
   and whose content is a wall of those three live. (The census catalog will be added to this page later by another
   minion — keep it small and leave a clear seam.) Plus `ux/Content/readme.md` and `ux/Content/doc/`.

## Checks before you finish

- Load every page you made at 1920 and at 390 wide with `mcp__site__shot` (or Playwright headless — never the owner's tabs): zero console errors, zero failed requests. Click an option in the Decision doc page headless and prove the line landed in demo.jsonl.
- Report: one line per deliverable, with its URL, and the screenshot paths.
