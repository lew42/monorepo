# Census — which classes are worth a debug view?

This table walks every exported class in `core/`, `ext/` and `ux/` — anything matching
`export class` or `export default class` at the top level of a `.js` file, skipping
`ai/`, `core/legacy/`, `core/new/`, `dev/` and sandbox dirs (77 classes; `ui/` and `web/`
turned up zero — they're plain page files, not classes) — and judges whether it holds
state worth looking at, whether anything already shows that state, and whether it
deserves a card. **Headline: 77 classes, 37 worth a view, 1 already has one** (`Page`,
via [`ObjectCard`](/framework/ux/Content/Object/), on its own API tab). All 37 "yes"
rows are listed first, most useful first (`Page` and `App` at the very top); the 40
"no" rows follow, in no particular order.

| class | module | object-like? | has a view today? | worth a view? |
|---|---|---|---|---|
| Page | core/Page | yes — url, title, children, parent, route, words (navigation/width/arrangement/surface/background/type_size) | **yes** — `ObjectCard` on the [Page API tab](/framework/core/Page/api/) | yes — the model case |
| App | core/App | yes — root page, router, loaders, ready | no | yes — settings/root/router |
| Router | core/Router | yes — current route, history | no | yes — current route |
| Sidebar | core/Sidebar | yes — open state, current items | no | yes — small, useful |
| Item | core/Item | yes — persisted value, saver, dirty state | no | yes — every Item instance |
| List | core/List | yes — items array, order | no | yes — see the order |
| Search | core/Search | yes — query, results, index | no | yes — query + hit count |
| Section | core/Section | yes — a Page subclass, same shape as Page | no | yes — same as Page |
| AITask | ext/AITask | yes — Page subclass; task log state | no | yes — task status at a glance |
| JSONL | ext/JSONL | yes — rows, file handle, cursor | no | yes — row count + last line |
| TaskJSONL | ext/JSONL | yes — extends JSONL with task fields | no | yes — same as JSONL |
| Collab | ext/Collab | yes — extends JSONL, live participants | no | yes — who's connected |
| Doc | ext/Doc | yes — Page subclass, doc sections | no | yes — same as Page |
| Program | ext/Research | yes — Page subclass, research state | no | yes — same as Page |
| ProgramJSONL | ext/Research | yes — extends JSONL | no | yes — same as JSONL |
| Research | ext/Research | yes — Page subclass | no | yes — same as Page |
| ResearchJSONL | ext/Research | yes — extends JSONL | no | yes — same as JSONL |
| ResearchTopic | ext/Research | yes — extends Program | no | yes — same as Program |
| PageFiles | ext/files | yes — Page subclass, file tree state | no | yes — file count + tree |
| Saver | ext/Saver | yes — abstract, but tracks a value + dirty flag | no | yes — value + saved/dirty |
| FileSaver | ext/Saver | yes — extends Saver, a file path | no | yes — same as Saver |
| LocalStorageSaver | ext/Saver | yes — extends Saver, a storage key | no | yes — same as Saver |
| MemorySaver | ext/Saver | yes — extends Saver, in-memory only | no | yes — same as Saver |
| Panel | ext/Panel | yes — extends Item; size, position, hug/fill | no | yes — the panel's numbers |
| PanelDrag | ext/Panel | yes — extends Sortable; drag state | no | yes — mid-drag debug only |
| Workspace | ext/Panel/Workspace | yes — collection of Panels + layout | no | yes — panel count + layout |
| Flow | ext/Panel | yes — recorded steps of panel gestures | no | yes — step count + current index |
| Timeline | ext/Timeline | yes — extends View; entries, cursor | no | yes — entry count |
| Auth | ux/Auth | yes — extends View; session/user state | no | yes — who's signed in |
| MagicAuth | ux/Auth | yes — extends Auth, token state | no | yes — same as Auth |
| Course | ux/Course | yes — extends View; steps, progress | no | yes — progress at a glance |
| Dictate | ux/Dictate | yes — extends View; recording/transcript state | no | yes — the state the owner asked for by name |
| Filter | ux/Filter | yes — extends View; active filters | no | yes — which filters are on |
| FilterChips | ux/Filter | yes — extends Filter | no | yes — same as Filter |
| Tags | ux/Tags | yes — extends View; tag list | no | yes — the tag list |
| Tree | ux/Tree | yes — extends View; expanded/selected nodes | no | yes — small, useful |
| Wizard | ux/Wizard | yes — extends View; step, answers | no | yes — current step + answers |
| Draggable | ext/Draggable | yes — drag position, target | no | no — only useful mid-gesture |
| Sortable | ext/Draggable | yes — extends Draggable, order | no | no — same as Draggable |
| Capture | ux/Dictate | yes — audio buffer, level | no | no — too live/binary to render as text |
| Playground | ux/Dictate/playground | yes — a lab harness, config + samples | no | no — a demo page, not a model |
| TreeDrag | ux/Tree | yes — extends Tree, drag state | no | no — mid-drag debug only |
| TreeKeys | ux/Tree | no — pure keyboard-handler mixin, no own state | n/a | no |
| Popover | ux/Popover | yes — open/anchor state | no | no — transient UI, not a model |
| Menu | ux/Menu | yes — extends View; open items | no | no — transient UI, not a model |
| Pagination | ux/Pagination | yes — extends View; page/total | no | no — two numbers, not worth a card |
| ContentModule | ux/Content | yes — base class for the Content family | no | no — abstract; subclasses matter |
| Decision | ux/Content/Decision | yes — extends ContentModule; a decision record | no | no — it already renders its own record |
| Decisions | ux/Content/Decision | yes — extends ContentModule; a list of decisions | no | no — same, already a list view |
| Concepts | ux/Content/Concepts | yes — extends ContentModule | no | no — already a content view |
| Disclosure | ux/Content/Disclosure | no — a summary/detail toggle, no model state | n/a | no |
| Object (ObjectCard) | ux/Content/Object | no — the card itself, stateless | n/a | no — it's the tool, not a subject |
| Question | ux/Content/Question | yes — extends ContentModule; a question record | no | no — already renders its own record |
| Quotation | ux/Content/Quotation | no — a quote string wrapper | n/a | no |
| Spend | ux/Content/Spend | yes — extends ContentModule; cost totals | no | no — already renders its own numbers |
| View | core/View | no — the base of everything; too generic to be "an instance" | n/a | no — the owner named this one exactly: a view class doesn't need a list of its methods |
| PageFrame | core/Page | no — a rendering helper for Page, not a model | n/a | no |
| PageLog | core/Page | no — a mixin (page.jsonl loader), not a standalone model | n/a | no |
| PageMarkdown | core/Page | no — a Page subclass that just renders markdown text | n/a | no |
| Floating | core/Page/layout/floating | no — a positioning helper | n/a | no |
| Omnibox | core/Search | no — a search-box widget, not a model | n/a | no |
| Layout | core/Layout | no — a Page subclass that's really a demo/lab page | n/a | no |
| Font | core/App | no — a static loader helper, no instance state worth seeing | n/a | no |
| Mic (ext/Ask) | ext/Ask | no — a microphone wrapper, transient audio state | n/a | no |
| Picker | ext/Ask | no — a small UI picker widget | n/a | no |
| Reply | ext/Ask | no — a one-shot response wrapper | n/a | no |
| ComposerMic | ext/Chat | no — extends Dictate for one composer box | n/a | no — covered by Dictate |
| DrawerSelect | ext/drawer | no — a small UI widget | n/a | no |
| DrawerTabs | ext/drawer | no — a small UI widget | n/a | no |
| Dropdown | ext/Dropdown | no — a small UI widget | n/a | no |
| Block | ext/editor/blocks | no — an editor node type, structural not stateful | n/a | no |
| Section (blocks) | ext/editor/blocks | no — an empty Block subclass | n/a | no |
| Grid (blocks) | ext/editor/blocks | no — an empty Block subclass | n/a | no |
| Card (blocks) | ext/editor/blocks | no — an empty Block subclass | n/a | no |
| Text (blocks) | ext/editor/blocks | no — an empty Block subclass | n/a | no |
| History | ext/editor | no — an undo stack, not a model worth a card | n/a | no |
| Ranking | ext/AITask | no — a scoring helper function-object | n/a | no |

No class in this walk already uses `ObjectCard` for its own instances — only `Page`
does, and that's the module's own API tab reusing the card to show a `Page` object,
not a `Page` instance registering itself. Every "yes" row above is a candidate that
gets nothing today.

## What Page and App views should show first

- **Page**: `title`, `url`, the six page words (`navigation`, `width`, `arrangement`,
  `surface`, `background`, `type_size`), `children` (as a count + names, not the whole
  Map), and `parent.title` so you can see where you are in the tree.
- **App**: `root.title` (which page tree is loaded), `router`'s current route
  (`location.pathname`), and `loaders.length` (fonts/assets still loading) — these are
  the three things you'd ask "what app am I even looking at?" to answer.
- Both read straight off real properties already on the class (`core/Page/Page.class.js`,
  `core/App/App.js`) — nothing here needs a new field, only a card that shows the ones
  that exist.
