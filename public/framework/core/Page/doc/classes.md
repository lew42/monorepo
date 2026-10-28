# The core/Page classes

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

## The class architecture: Item, List, Page

The full skeleton, every member with a one-line comment and what each Page owns: [class-block.md](class-block.md).

An `Item` is a thing with an id, data and events. A `List` is an Item that holds other Items in order. A `Page` is an Item with a url, and it owns two Lists: its child pages and its content.

```js
class Item extends Events(Object)        // core/Item/Item.js:21: a thing
  id, data, parent                       // identity; data is a plain bag
  set(delta) get(key) apply(delta)       // every change is a delta, so a log line can replay it
  lists()  walk(fn)  find(id)  root()    // the tree: any List the item OWNS is a child list
  view  save()  delete()  toJSON()       // draw it, persist it

class List extends Item                  // core/List/List.js:53: an ordered set of Items
  owner, name                            // the Item that owns it, and the field it sits in
  items                                  // the array of members
  add() insert() move() remove() find(id)   // by id, never by position

class Page extends Item                  // Page.class.js:32: an Item with a url
  name, url                              // "hello", "/framework/hello/" (:249-252); chain() walks to the root
  pages    = new List({ name: "pages" })     // :112  THE child pages (each one a Page)
  children = new PageChildren(this)          // :114  a Map view over pages: children.get("hello")
  content  = new Page.Content()              // :83   the body, a List of parts
  declare() add() child(name) load_all_children()   // children: declare names, load one, load all
  static load() jsonl() listing()        // loading: page.js, page.jsonl, the folder listing
  render() activate() nav() columns() previews()    // drawing and links (most forward to parts below)
  set() tab() place()                    // a page.jsonl line, applied (forwards to Page.Jsonl)
```

**Is `pages` an alias of `items`?** No. An Item has no `items` field of its own; `items` is the array inside a List. A Page owns a List named `pages`, so its child pages are `page.pages.items`. Its content is another List, `page.content.items`. `page.children` is the old name: a Map over the same `pages` list, kept for the many callers that do `children.get(name)` ([content.md](content.md) has the plan to retire it).

**How jsonl children map onto this:** each `{"file":"kid/page.jsonl"}` line puts a `kid` stub in `children` (`Jsonl.js:80-90`); when the url reaches it, `child("kid")` loads the file and `add()` puts the real Page into `pages`. A `{"tab":{"name":"notes",…}}` line adds a child Page with no folder of its own (`Jsonl.js:100-124`). Content parts are different: a `{"content":{"add":{…}}}` line adds an Item to `content`. The full answer, including what could change, is [answers.md, section 0b](/framework/ai/sessions/2026/10/15/voice-20261015/page-system/answers.md).

## The parts of Page (the 23 files)

`Page` is the class; the other files in `core/Page/` are its parts, attached to it as static members or used by it.

```js
class Page extends Item                       // Page.class.js:32
  Page.Reader   = PageLogReader extends Item.Store   // Reader.js:4
  Page.Jsonl    = PageJsonl                  // loader behind page.jsonl
  Page.Listing  = PageListing                // what listing() answers
  Page.Content  = PageContent extends List   // items: PageCode, PageAddress, PageParagraph (each extends PageContentItem extends Item)
  Page.Frame    = PageFrame extends View     // the chrome around the page
  Page.Previews / Columns / Links / Related / Prefs / Inbox   // plain helper classes
  page.children = new PageChildren()         // extends Map
class PageMarkdown extends Page              // Markdown.js:14, the `md/` child
```

| file | class (extends) | its one job | used by (code files, main caller) |
|---|---|---|---|
| `Page.class.js` | `Page` (Item) | The page itself; wires in every part below | 118, nearly every `page.js` |
| `Jsonl.js` | `PageJsonl` | What a `page.jsonl` does to a page: loader, file steps, tab state, placed files | 2, Page.class.js |
| `Reader.js` | `PageLogReader` (Item.Store) | One store per `page.jsonl` URL; `page.store` is this once loaded | 2, Page.class.js |
| `Listing.js` | `PageListing` | The answer of `listing()`: files, dirs, child pages, is-it-a-page | 3, Page.class.js, Jsonl.js |
| `Load.js` | `PageLoad` | The loading statics (`file`, `load`, `read_json`, `from`, `props`, `missing`, `slug`); `Page` forwards to it | Page.class.js |
| `Children.js` | `PageChildren` (Map) | A Map-shaped view over `page.pages`; stubs read as `null` | 2, Page.class.js |
| `PageContent.js` | `PageContent` (List) | A page's `content`, one list for its life | 1, Page.class.js |
| `PageContentItem.js` | `PageContentItem` (Item) | Base of the three content kinds; never written to `page.jsonl` | 4, the three kinds |
| `PageCode.js` | `PageCode` (PageContentItem) | A function as content | 1, PageContent.js |
| `PageAddress.js` | `PageAddress` (PageContentItem) | A `/…` address as content | 1, PageContent.js |
| `PageParagraph.js` | `PageParagraph` (PageContentItem) | A plain string as content | 1, PageContent.js |
| `Frame.js` | `PageFrame` (View) | Draws the arrangement around a page (bars, rails) | 6, Page.class.js |
| `Previews.js` | `PagePreviews` | The cards a page draws for its children | 1, Page.class.js |
| `Columns.js` | `PageColumns` | How a page draws as a Finder column | 1, Page.class.js |
| `Links.js` | `PageLinks` | Where a clicked link opens; `.md` helpers | 1, Page.class.js |
| `Related.js` | `PageRelated` | The pinned "Related" aside | 1, Page.class.js |
| `PageInbox.js` | `PageInbox`, `NotesLog` (JSONL) | The inbox tab: notes agents left on a page | 2, Page.class.js, ext/Doc |
| `Prefs.js` | `PagePrefs` | Saved preferences, memory fallback when localStorage fails | 4, Page.class.js, DataGrid |
| `PageWeight.js` | `PageWeight` | One weight for a url, a page or an item | 2, Previews.js |
| `Markdown.js` | `PageMarkdown` (Page) | Gives every page an `md/` child of its markdown files | 13, Page.class.js area |
| `Log.js` | none, re-exports `Page` as `PageLog` | Compat: `PageLog` folded into `Page` on 2026-10-03 | 33 importers |
| `words.js` | none, constants | The six page words as lists a reader can see | 17 |
| `object.js` | none, `page_object(page)` function | Draws a live Page as a DefaultView tree | 4 |
| `page.js` | none, `new Doc({...})` | The module's own page | the router |

`parts/` and `Template/` are sub-modules with their own readmes. `parts/` holds `PageCard`, `PageLink` (each `extends Item`) and `PartsPage extends Page` (`Parts.js:12`); `Part.js` just re-exports `Item`. `Template/Template.js:6` is `class Template extends Page`.

Findings: `Log.js`, `words.js` and `object.js` hold no class. `Log.js` is a leftover shim with 33 importers; `object.js` is a lone function. Both go against "Write classes, not function bags".

## Where a page comes from

- [loading.md](loading.md): how a page is found and built.
- [jsonl.md](jsonl.md): what `page.jsonl` lines do.
- [streaming.md](streaming.md): how live lines reach an open page.
