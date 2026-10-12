# A: the `System` class

Read first: [../common.md](../common.md), [../requirements.md](../requirements.md) (asks 1 and "How a page becomes a System"), [../owner-words.md](../owner-words.md) (sections 1 and 2), [../plan.md](../plan.md).

**The owner:** "class system, capital S, is ... like a page but it's more than a page, it's like a whole system of rules ... create a system class that can be upgraded and then any system gets all those upgrades for free ... framework design, framework code, framework UI, maybe framework UX ... we can use the same top tabs that we're using." And: "the framework AI page should probably be a system."

## Deliverables

1. **`core/System/System.js`: `export class System extends Doc`** (`ext/Doc/Doc.js`), plus `export default System`. Decision already made: extend Doc, so a System gets Doc's routed top tabs (Overview · <declared parts> · Docs · Files, plus API when it declares methods). Don't build a second tab system. If extending Doc truly can't work, say why in a `decision` line before you choose something else.
   - What a System adds to a Doc, to start with (keep it small; methods come later):
     - `concepts`: its parts as `{name, slug, icon, gist?}`. The Overview tab shows them as the `Concepts` tiles (`ux/Content/Concepts/`) at the top, then the intro text.
     - The readme chain: the Overview ends with the module's `readme.md` (`md.details`), and the Docs tab works as Doc's already does.
     - An **Inbox tab slot**: when the page has the `{"ext": "Inbox"}` extension (`core/Page/ext/Inbox/`), the tab strip gets an Inbox tab. Task-mastermind-inbox-ext draws the rail inside it (`InboxRail`, not built yet). Until then, the tab shows the page's own `page.inbox` messages as a plain list, or a link to /framework/ai2/. Read `core/Page/ext/readme.md`.
   - It must work both ways: `export default new System({...})` in a page.js, and line 1 of a page.jsonl `{"class": "/framework/core/System/System.js", ...}` (`core/Page/Log.js` `log_class()`). Prove both: one real page each way. The second can be a tiny demo page under `core/System/`.
2. **Convert the systems:** `design/page.js`, `code/page.js`, `ux/page.js` and `ui/page.js` become `new System(...)`. Keep what each page shows today (UI's browse wall stays its Overview); only the frame changes. Then **/framework/ai/**: its hand-built `TABS`/`tab_page()` (`ai/overview.js`, `ai/page.js`) become the System's tabs. Keep `?v1` working, and keep every url that answers today answering (`/framework/ai/system/`, `/framework/ai/skills/`, the date and task routes). If AI is risky, do it last, as its own commit.
3. **`core/System/` is a module:** `readme.md` (index shape), `page.js` (show, don't tell: the five systems as live preview cards, then the minimal code), `doc/` (one doc: what a System is and how to add one). Add `System` to `core/page.js` `children:` so it is linked. Export `System` from `/app.js` only if `Doc` is already exported there; otherwise import by path.
4. **The architect reviews the shape:** when the class works, write `system/shape.md` (one screen: the class, what it adds, the five instances) and tell your parent. The parent sends it to mastermind-servex-9.

## Fence
`core/System/` (new), `core/page.js` (the children line only), `design/page.js`, `code/page.js`, `ux/page.js`, `ui/page.js`, `ai/page.js`, `ai/overview.js`, and `/app.js` (one export line, if needed). Don't touch `ext/Doc/` itself. If Doc needs a hook, add it as an override in System and log a `need` line.

## Proof
Shots of /framework/design/, /framework/code/, /framework/ui/, /framework/ux/ and /framework/ai/ at the four widths, before and after. Zero console errors on each page and on `/framework/ai/system/`, `/framework/ai/skills/` and one task page, `/framework/ai/2026-09-30/design-code/`.

Model: Opus. Budget: as long as it takes, in small commits.

