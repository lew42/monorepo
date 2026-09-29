### Kinds of content that exist

Importers = files outside the module that import it (grep, 2026-09-25; `/app.js` names counted by named import).

| kind | module · URL | use it when | example | importers |
|---|---|---|---|---|
| Question | [ux/Content/Question](/framework/ux/Content/Question/) | you ask the reader something with answers | `Content/Question/page.js` | 0 |
| Decision | [ux/Content/Decision](/framework/ux/Content/Decision/) | a choice waits, options + pick | ext/AITask/decisions.js | 1 |
| Quotation | [ux/Content/Quotation](/framework/ux/Content/) | quoting the owner or a source | its own page only | 0 |
| Spend | [ux/Content/Spend](/framework/ux/Content/) | a cost or budget line | its own page only | 0 |
| Kind catalog (75 kinds) | [ux/Content/catalog](/framework/ux/Content/) | choosing which kind to write | ux/Content/page.js | 0 |
| Disclosure / stacks | not built: task `disclosure-and-stacks-content-ui` has only a page.jsonl, no module file exists yet | folded detail, stacked cards | none | none |
| Files tree + source | [ext/files](/framework/ext/files/) (`files`) | showing a folder and its code | core/Page/Log.js | 4 |
| Markdown | [ext/markdown](/framework/ext/markdown/) (`md`, `md.file`) | any prose or table | this page | 346 |
| Live demo + code tab | [ext/demo](/framework/ext/demo/) (`demo`) | showing a thing working | ext/demo/page.js | 165 |
| Code block, highlighted | [ext/highlight](/framework/ext/highlight/) | source shown in a page | core/new/1/agents/content | 11 |
| Table | [ui/table](/framework/ui/table/) (`ui.table`) | rows and columns of data | ui/table/page.js | 0 direct; `ui` 35 |
| Stats tiles | [ui/stats](/framework/ui/stats/) | a few numbers at a glance | styles/layouts/screens/specs.js | 1 |
| Timeline | [ui/timeline](/framework/ui/timeline/) | dated events | styles/sections/changelog.js | 1 |
| Accordion | [ui/accordion](/framework/ui/accordion/) | one-click-down detail | ux/Content/plan/page.js | 1 |
| Tabs | [ext/tabs](/framework/ext/tabs/) | sibling views of one thing | ai2/card.js | 4 (+ every Doc) |
| Table of contents | [ext/toc](/framework/ext/toc/) (`toc`) | long page, jump links | audit/overview/priorities | 16 |
| Tree | [ux/Tree](/framework/ux/Tree/) | nested items, drag, keys | ai/2026-09-22/record | 6 |
| List filter / chips | [ux/Filter](/framework/ux/Filter/) | one list, open/done | core/Sidebar | 1 |
| Tags | [ux/Tags](/framework/ux/Tags/) | labels on items | none | 0 |
| Live JSONL feed | [ext/JSONL](/framework/ext/JSONL/) | a log that streams in | ai/2026-09-19/assistant-stream | 13 |
| Screenshots / images | plain `img()`; ext/DesignTool/vision for shots | showing a layout | this page (cols-*.png) | n/a |
| Flow chart / diagram | **none exists**. ext/Panel/flow.js records panel steps, it does not draw charts | a process | none | none |

### Built, but used nowhere or in one place

| module | path | importers | where it should be used |
|---|---|---|---|
| Question, Quotation, Spend | ux/Content/ | 0 | AI cards and reports: open questions, owner quotes, cost lines |
| Content catalog | ux/Content/catalog | 0 | the picker in `new-page`/page skill and Make |
| ux/Tags | ux/Tags | 0 | replace ui/tags (also 0) on cards and the layouts browser |
| ux/Pagination | ux/Pagination | 0 | long lists: board, /layouts/, /websites/ |
| ux/Auth, ux/Course | ux/ | 0 | Auth: platform program login; Course: /web/ guide steps |
| ux/Filter | ux/Filter | 1 | every list with open/done: board, tasks, asks |
| ux/Menu, ux/Wizard | ux/ | 1 each | toolbars and menus (replace ui/menu, ext/Dropdown overlap); Wizard: new-page/Make flow |
| ext/Timeline | ext/Timeline | 0 | AITask board.js hand-builds its own timeline |
| ext/depth | ext/depth | 0 | wide pages: show nesting depth in Page columns |
| ext/editor | ext/editor | 1 | Make (page CMS) text editing |
| ext/files | ext/files | 1 named + 4 via app | every page that names a file: reports, doc pages |
| ext/catalog | ext/catalog | 1 | any index wall (readmes said: preview walls) |
| ui/table, card, alert, progress, tooltip, kbd, field, dialog, toolbar, controls, background, tags | ui/ | 0 direct | side-effect loaded by ui/ui.js; markup use is uncounted. tooltip and menu should move to ux/Popover |
| Disclosure | not yet built | none | folded detail on every long page |
