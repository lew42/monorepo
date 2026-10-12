# md-routes — a `.md` file is a page: `./audit/` renders `./audit.md`, on click and on reload

Laws: less is more · clarity · prioritize. **Deliverable: the fallback in `core/Page/Page.class.js` + the link rewrite in `ext/markdown/md.js`, proven headless on click AND on reload; docs current; final message ≤ 15 lines.** Opus — core Router/Page code, small but everything runs through it.

The owner (2026-08-18), verbatim: *"can we get all these AITask page .md links to render as `md()`? linking to them just pulls them up as a raw .md text file in the browser. […] We could use `./path` to mean `./path.md` and automatically fetch/render the md? this could be useful everywhere... and it's nice not having to declare the children. You just link to it, and it works."* Approved: "ok, do it."

## Facts (verified by the mastermind)

- [`core/Router/Router.js:35`](/framework/core/Router/Router.js) — a link whose path ends in `.ext` is "not ours" (the browser fetches the file). Keep that: a raw `.md` URL stays the raw file, which is the escape hatch for free.
- On reload the URL *is* the file: `express.static` (and any static host) serves `audit.md` before the SPA fallback. So the page's URL must be `./audit/`, never `./audit.md`.
- [`core/Page/Page.class.js:105-113`](/framework/core/Page/Page.class.js) `child(name)`: declared child → `route(name)` → `Page.load(url + name + "/")` (imports `page.js`; a miss is `Page.missing(error)`) → `null`.
- The SPA fallback answers EVERY miss with `index.html` at **200** — content-type is the 404 (`dev/DevBar/ask.js` learned this). Gate on `content-type` not including `html`.
- [`ext/markdown/md.js:128`](/framework/ext/markdown/md.js) `md.resolve(root, base)` already rewrites relative links in a fetched `.md` against the FILE (absolute/protocol/fragment links return early at line ~132).
- `App.path_to_page_url()` (`core/App/App.js:106`, the `.page.js` sibling branch) is a **compatibility alias for the other devs' trees** (`public/alex/`, `arya/`, `castin/` import it) — leave it alone; `public/michael/sections/sub.page.js` is imported explicitly, not routed — leave it.

## Build

1. **The fallback** — a fourth resolution in `child(name)`, after `Page.load` misses: `fetch(this.url + name + ".md")`; if `res.ok` and its `content-type` does not include `html`, return `this.add(name, page)` where `page` is the smallest object `add()` accepts (look at how `children: [ word({…}) ]` objects are added — an object with `title`, `content(){ … }`), title = the file's first `# ` line (fallback: the name), `content(){ return md.file(<a meta-like {url} for that dir>, name + ".md", { h1: false }) }` — or `md(text)` from the text you already fetched (cache it on the page; one fetch, not two). Nothing else changes: `route()` and a real `page.js` still win; a name with neither still returns `null` (404 as today). One fetch on a would-be-404 only.
2. **The rewrite** — in `md.resolve`, a link whose pathname ends in `.md` becomes the directory route: `x.md` → `x/`, `../doc/decisions.md` → `../doc/decisions/`, and — because reports link absolutely — `/framework/ai/2026-08-18/css-audit/audit.md` → `/framework/ai/2026-08-18/css-audit/audit/`. Same-origin only; leave `?raw` (or any query) untouched as the explicit raw escape if you think one is needed — say so. Apply to `md()` (inline strings) too if `resolve` runs there; if only `md.file` runs it, say which and why.
3. **Prove it, headless** (global playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`; scratchpad `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/a14ec0db-4e8c-4ce1-a14c-378e52ac01a0/scratchpad/`; block the dev socket `page.routeWebSocket(/.*/, () => {})`):
   - open `http://localhost/framework/ai/2026-08-18/css-audit/`, click the link to `audit.md` (it now reads `…/audit/`) → the page renders the audit as markdown (`.md h1` text = the audit's first heading), URL is `/…/css-audit/audit/`, **no raw text**;
   - reload that URL cold → same render (SPA fallback → walk → fallback);
   - `/framework/ext/Panel/doc/decisions/` still renders via `ext/Doc`'s `notes:` (declared beats fallback — prove it did NOT go through your fetch: count fetches of `decisions.md`);
   - `/framework/ext/Panel/nope/` still 404s (no `.md`); `/framework/ai/2026-08-18/css-audit/audit.md` typed directly still serves the raw file;
   - zero console errors beyond whatever the existing `page.js` probe already logs on a miss (state what that is: a network line for the 200-html-as-module import is not an error you introduced). Two numbers that must agree: `.md` links on the AITask page before the rewrite that ended in `.md`, and links after that end in `/`.
   Pngs: `md-route-click.png`, `md-route-reload.png` in this dir.
4. **Docs**: `core/Page/readme.md` one Use line ("the file is the route: `./x/` renders `./x.md` when no `page.js` exists") + one Watch-out (content-type gate; a `.md` URL itself is always the raw file) with the detail in `core/Page/doc/` (a `doc/md-fallback.md`, ≤ 25 lines, or the existing routing doc if one fits — `doc/registry-gate.md` is about the gate); `ext/markdown/readme.md` one line for the rewrite; `ext/AITask/readme.md` one line (its `.md` deliverables are pages now). CLAUDE.md's "Nothing crawls — a page exists once its parent's `children:` names it" stays true — say in the doc that a LINK is the naming here, and nothing enumerates.

## Fences

`core/Page/Page.class.js`, `core/Page/readme.md`, `core/Page/doc/*`, `ext/markdown/md.js`, `ext/markdown/readme.md`, `ext/AITask/readme.md`, this dir. NOT `core/Router/Router.js` (its `.ext` rule stays), NOT `core/App/App.js`, NOT `ext/Panel/*` (another minion is in it), NOT any `public/<person>/` tree.

## Rules

- Load `code` once before editing. Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line; group `web-ui`); the ledger logs edits; `documentation` then `finish-task` (`"tokens": null`). A skill that misleads you gets one line in its `improvements.md` (`skill-improvement`).
- Timestamps from the clock; forward slashes; never Out-File a `.jsonl`; never a person's name — "the owner". Only `p()`/`h1`–`h6` read backticks; no DOM after an `await` outside a callback; imports flow down (Page must not import ext/markdown statically if it does not already — check; `md` is on `/app.js`, and `Page` may already reach it via the app; if a static import would create a core→ext edge, use a dynamic `import()` inside the fallback and say so). Wait in the foreground.
