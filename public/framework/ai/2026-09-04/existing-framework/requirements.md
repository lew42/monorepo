# existing-framework — scout brief

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; everything there is mandatory. `new-task` (this dir, group `platform`) before the first edit; `code`, `layout`, `new-page` before writing the page; `finish-task` to land.

**The question:** For every concern in the platform brief, what does this framework already have — reuse as-is, extend, or missing? And: `Topic extends Page`, an `is: "topic"` role, or plain config — which is the cleanest topic abstraction, on the evidence?

## Deliverable

`public/imagine/platform/existing/page.js` — ONE screen: a table with one row per concern (concern · what exists, linked · verdict: reuse / extend / missing · one-line note), then the topic-abstraction recommendation in ≤ 8 lines with the two counts below. Yours alone: that dir and this task dir. The mastermind adds `existing` to the hub's `children:` — do not edit `public/imagine/platform/page.js` or `/imagine/page.js`. Container: a column in `/imagine/`'s columns host (`width: "large"`); the table needs `.ac("wide")` on its `md()` call. Every finding also a `log` line in your `task.jsonl`.

## Read — a closed list, all with paths

- Topic model: `public/framework/core/Page/readme.md`, `Page.class.js`, `doc/roles.md`, `doc/declaring.md`, `doc/columns.md`, `doc/method/store.md`, `doc/property/children.md`; `grep -rn "declare" public/framework/core/Page/Page.class.js` (the page.json seam); `public/framework/core/readme.md`; `public/framework/core/Router/`, `core/Sidebar/`.
- Subtopics / spaces: `columns()` (above), `public/framework/ext/Panel/readme.md`, `public/imagine/page.js` (a columns world), `public/framework/core/Page/overview/columns/`.
- Omnibox / search: `public/framework/ext/Dropdown/`, `public/framework/ui/readme.md` (nineteen components — any filter, palette, search?), `public/framework/ux/` if it exists (Filter, Tags), `public/nav.js`, `public/directory.json` (what an index already looks like), `grep -rln "keydown" public/framework` for existing keyboard handling.
- Community / chat / writes from the browser: `public/imagine/stream/readme.md` + `stream.js`, `public/imagine/cms/readme.md` + `doc/`, `Server/plugins/SocketServer/Append.js`, `public/framework/ext/Ask/readme.md`.
- Users / auth: `public/notes/auth/readme.md`, `Server/plugins/Auth.js`.
- Storage: `public/framework/ext/Saver/readme.md`, `ext/JSONL/readme.md`, `core/Item/`, `core/List/`, `public/blog/posts.js`, `public/blog/readme.md`.
- Real-time: `public/framework/dev/Socket/doc/wire.md`, `Server/readme.md`.
- Video: `public/imagine/youtube/readme.md`, `public/imagine/feeds/`.
- AI: `public/framework/ext/Ask/`, `public/framework/ext/Research/readme.md`, `Server/plugins/MCP.js` (what tools the site exposes), `Server/plugins/Research.js`.
- Levels / badges / progression UI: `public/imagine/game/`, `public/imagine/team/` — anything that tracks a user's progress?
- Publishing / deploy: `wrangler.jsonc`, `readme.md` (Cloudflare Previews), `public/blog/meta.mjs`, `public/fly/readme.md`.

## Two counts that must agree with a grep

- Page subclasses under `public/`: `rg -n "extends Page\b" public --glob '*.js' | wc -l` — and list them by name in one log line.
- Pages that declare a role: `rg -n "^\s*is:\s*\"" public --glob '*.js' | wc -l` — list the roles used.

## Fences

Read everything; write only `public/imagine/platform/existing/` and this task dir. No CSS file. No new class names. Verify the page renders on a private server (rules file) at 1280 and 3440 headless, or say you could not.
