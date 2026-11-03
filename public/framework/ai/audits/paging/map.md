# Page audit — map (all paths verified by ls, 2026-09-25)

Paths are under `public/` (`fw/` = `public/framework/`). Correction to the inventory: `ext/Sidebar/` does not exist; the sidebar is `fw/core/Sidebar/`. The shell is `layouts/shell/Shell.js` (under `public/layouts/`); `fw/styles/layouts/shell/` holds only `page.js`.

| name | path | role | connects to | overlaps with |
|---|---|---|---|---|
| **Centre** | | | | |
| Page class | fw/core/Page/Page.class.js (1194 lines) | Tree node with url, content, children; render, columns, previews, Page.Store | Router, View, Frame, Log, Markdown, Sidebar | OVERLAP: core/Sidebar (own resize rail), layouts/shell/Shell.js (own resize rail); both should reuse column_grab / ext/grip |
| Page.css | fw/core/Page/Page.css | Every `.page-*` rule, columns, preview cards | Page.class.js, framework.css | none |
| Frame | fw/core/Page/Frame.js | Box drawn when a page says one of the six words | Page.class.js, words.js | OVERLAP: imagine/paging/stage.js (the lab renderer it graduated from; still draws its own box) |
| words | fw/core/Page/words.js | The six page words as readable lists | Frame, docs, paging | none |
| Log (page.jsonl) | fw/core/Page/Log.js | Page as a log file: line 1 builds, later lines call methods | Page.class.js | OVERLAP: imagine/cms/json/, imagine/stream/ (page as json/jsonl) |
| Markdown (`md/`) | fw/core/Page/Markdown.js | Every page gets an `md/` child listing its .md files as pages | Page.class.js | none |
| Page generator | fw/core/Page/generator/ | Seeded fake page tree, exportable as modules | Page | OVERLAP: fw/styles/layouts/space/gen.js, imagine/generated/ |
| Page overview wall | fw/core/Page/overview/ | 29 demo pages, one per building block (tabs, rail, shell, crumbs, columns...) | Page | OVERLAP: fw/core/Page/old/overview/ (previous 15-tree wall) |
| Page old | fw/core/Page/old/ | Archived first Page docs | none live | OVERLAP: fw/core/Page/overview/ |
| Page docs | fw/core/Page/doc/ | One md per topic (columns, navigation, words, open...) | Page module page | none |
| View | fw/core/View/View.js | DOM builder every page uses (div, p, a...) | Page, all ui | none |
| App | fw/core/App/App.js | Boots the site, loads framework.css, mounts the page | Router, Page | none |
| Item / List | fw/core/Item/Item.js, fw/core/List/List.js | Persistable item and list base classes | Panel, Draggable | none |
| **Layout** | | | | |
| core/Layout | fw/core/Layout/ (Layout.js, rules.js, layouts.js, fixtures.js) | 30 named CSS arrangements, each drawn at 7 widths with fixtures | Section, DesignTool | OVERLAP: layouts/Layout.js (second Layout class), fw/styles/layouts/ |
| /layouts/ encyclopedia | layouts/ (Layout.js, layouts.json, browse/, tag/, practice/, labs/) | Named layouts (N-name ids), browser, tag pages | core/Layout | OVERLAP: fw/core/Layout, fw/styles/layouts |
| styles/layouts | fw/styles/layouts/ (layouts.css, web.js, word.js, cols/, sidebar/, split/, chat/, stack/) | 33 whole-page layouts as class strings | Page words, Section | OVERLAP: fw/core/Layout, layouts/ |
| ext/layout | fw/ext/layout/ (layout.js, controls.js, panel.js) | Toolbar + drawer to edit flex/grid/gap on any box | drawer, Panel | OVERLAP: fw/ext/Panel/properties.js (also edits container words) |
| Shell | layouts/shell/Shell.js | Resizable fixed sidebar beside a tree of homepage designs | layouts/ | OVERLAP: fw/core/Sidebar/Sidebar.js; layouts/labs/shells/Shell.js (same class name) |
| **Navigation** | | | | |
| Sidebar | fw/core/Sidebar/Sidebar.js (335 lines) | The one nav rail: brand, filterable child tree, footer, resizable | Page, Router | OVERLAP: layouts/shell/Shell.js; fw/ui/tree |
| Crumbs | fw/ui/crumbs/crumbs.js | Breadcrumb trail | Page | OVERLAP: fw/core/Page/overview/crumbs, web/nav/crumbs |
| Tabs | fw/ext/tabs/tabs.js | Bar of links + panel the routed child mounts into (`this.tabs()`) | Page, Router | OVERLAP: imagine/paging tabs mechanism |
| Nav patterns | web/nav/ (bar, rail, sidebar, drawer, drill, tabs, crumbs, links) | Nine live navigation patterns | Page | OVERLAP: fw/core/Page/overview/rail and crumbs, imagine/design/navigation |
| Pagination | fw/ui/pagination/, fw/ux/Pagination/ | Page-number control | none | OVERLAP: each other |
| TOC | fw/ext/toc/toc.js | Contents list for a page | Page | none |
| Old top nav | nav.js (public/) | 11-line bar of site links | none | OVERLAP: core/Sidebar (the real nav) |
| **Routing** | | | | |
| Router | fw/core/Router/Router.js (156 lines) | Url change becomes `.active-page` / `.active-ancestor` classes and link marks | Page children, App | OVERLAP: fw/core/new/1/Router.js (claimed copy) |
| Omnibox | fw/core/Search/Omnibox.js, fw/ext/Omnibox/Omnibox.js | Search box that jumps to pages | Router, Page tree | OVERLAP: each other (two Omnibox.js) |
| **Columns** | | | | |
| Page columns | fw/core/Page/Page.class.js (`columns()` l.723, `column_grab()` l.840) | Miller-style resizable columns | Page.css, ext/grip | OVERLAP: fw/ext/Panel/grip.js, ext/Draggable (own pointer capture) |
| cols words | fw/styles/layouts/cols/ | Six named column ratios | Page | OVERLAP: core/Layout (main-aside etc.) |
| grip | fw/ext/grip/grip.js | The shared resize handle | Sidebar, Page | OVERLAP: fw/ext/Panel/grip.js, seam.js |
| Draggable / Sortable | fw/ext/Draggable/ | The one drag primitive: move, reorder, reparent | Panel, Make | OVERLAP: fw/ux/Tree |
| **Content** | | | | |
| Section (core) | fw/core/Section/Section.js (331 lines) | A page inside a page; can take an approved layout | Layout, Page | OVERLAP: fw/core/Layout/rules.js (`fits` is a copy of rule 1) |
| Section bands | fw/styles/sections/ (hero, pricing, faq, navbar, footer...) | 15 landing-page bands, each `tone => view` | Page | OVERLAP: layouts/labs/sections, imagine/sections (same word, different idea) |
| Card | fw/ui/card/page.js; fw/ux/Content/catalog | Card pattern; 75-kind card catalog | Page previews | OVERLAP: imagine/gallery/cards; Page.preview_card (Page.class.js l.894) |
| Panel | fw/ext/Panel/Panel.js (+ ~40 files) | Divide a box into resizable, fillable panels; workspace, templates | Item, Draggable, editor | OVERLAP: fw/ext/layout, imagine/paging/make/, fw/ui/panel (name only) |
| catalog | fw/ext/catalog/catalog.js, browse.js | Wall of previews of a module's items | Page | OVERLAP: layouts/browse, websites |
| files | fw/ext/files/files.js | File tree with highlighted source on click | Page | none |
| drawer | fw/ext/drawer/drawer.js | Push drawer | ext/layout, Panel | none |
| demo | fw/ext/demo/ (demo.js, stage.js, shell.js) | The unified demo blocks | module pages | none |
| **Toolbars / menus** | | | | |
| Panel toolbar | fw/ext/Panel/toolbar.js, properties.js | Old floating bar; the properties rail replaced it | Panel | OVERLAP: fw/ui/toolbar |
| ui toolbar | fw/ui/toolbar/page.js | Copy-paste row of controls | none | OVERLAP: fw/ext/Panel/toolbar.js |
| ui menu | fw/ui/menu/menu.js | CSS-only `<details>` dropdown | ux/Menu | OVERLAP: fw/ux/Menu/Menu.js, fw/ext/Dropdown |
| ux Menu / Popover | fw/ux/Menu/Menu.js, fw/ux/Popover/ | Menu with close-on-pick; popup menu with arrow keys | ui/menu | OVERLAP: ui/menu, ext/Dropdown |
| Dropdown | fw/ext/Dropdown/dropdown.js | A third dropdown | none | OVERLAP: ui/menu, ux/Menu |
| **Chat** | | | | |
| Chat | fw/ext/Chat/ (Chat.js, Composer.js, Mic.js, roles.js, md.js) | Chat view, composer, voice input | Ask, ext/JSONL | OVERLAP: ai talk page (spoken input, unverified) |
| chat layout | fw/styles/layouts/chat/page.js | Chat as a whole-page layout | Chat | none |
| **Sidebars** | | | | |
| Sidebar rails | fw/core/Sidebar/, layouts/shell/Shell.js, layouts/labs/shells/, fw/styles/layouts/sidebar/ | Rails beside a swapping main | Page | OVERLAP: each other (see Sidebar and Shell rows) |

## The Page class parts (fw/core/Page/)

1. Page.class.js — the class: declare/add children, render, columns, previews, preview_card, Page.Store.
2. Page.css — every `.page-*` rule, in layers.
3. Frame.js — the box a page draws when it says one of the six words.
4. words.js — the six words as readable lists.
5. Log.js — `page.jsonl` pages: line 1 builds, later lines call methods.
6. Markdown.js — the automatic `md/` child listing a folder's .md files.
7. page.js — the module's own Doc page (children `generator old`, Overview wall).
8. generator/ — seeded fake page trees (gen, spec, rules, controls, export).
9. overview/ and old/ — the 29-card current demo wall, and the archived first docs.
10. doc/, jsonl/, tools/links.mjs — topic docs, jsonl examples, link checker script.
