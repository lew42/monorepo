# The core/Page classes

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
