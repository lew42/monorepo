# Item, List, Page: the class block

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

This is one code block of the three classes, read from the source on 2026-10-15 (`core/Item/Item.js`, `core/List/List.js`, `core/Page/Page.class.js`). It shows the members with no bodies. The 23 files are listed in [classes.md](classes.md).

```js
class Item extends Events(Object) {          // Item.js:21: a thing with data and events
  id                                         // set once in the constructor (new_id(), a uuid)
  data                                       // a plain bag of field values; get_one(key), put(key, value)
  parent                                     // the Item above it (inside a List, that List's owner)
  static fields                              // names that become accessors over data (title, icon, …)
  set(key, value) / set(delta)               // :80, every change is a delta; emits "change" and "delta"
  apply(delta)                               // :99, replays a delta (an array, or {at: "path", …})
  get(key)                                   // :152, own property, then data, then a child found in a List
  locate("a/b/c")                            // :171, walks lists by id
  lists()                                    // :202, every List this item OWNS; there is no fixed `items` field
  walk(fn) find(id) contains(item) root()    // the tree, through those lists
  remove() save() delete()                   // leave the parent's list; persist via a saver or the parent
  view                                       // :227, its default View
  toJSON() wire()                            // serialise; the type name
  static hydrate(json) register(Class) open(src)   // build from JSON; name a class; load a file
}

class List extends Item {                    // List.js:53: YES, a List is an Item
  items                                      // :57, the array of members (THIS is where "items" lives)
  owner, name                                // the Item that holds this list, and the field it sits in
  parent                                     // :73, = owner
  of                                         // the class make() hydrates plain objects into
  length, at(i), forEach(), map(), [Symbol.iterator]
  find(id) index_of(x) key(x)                // members are found by id, never by position
  add(x, {after}) insert(x) replace(old, x)  // add announces; insert is quiet (loading is not a change)
  move(id, {after, before, from}) order(ids) // reorder by id
  remove(id) release(id) take(x)             // remove announces; release is quiet
  adopted(x) released(x)                     // hooks for subclasses
}

class Page extends Item {                    // Page.class.js:32: an Item with a url
  name                                       // :252, the folder name ("hello")
  url                                        // :249, the path ("/framework/hello/"), from meta, parent + name, or title
  id                                         // :257, = name
  parent, app                                // the parent Page, set by the parent's add()
  pages                                      // :112, a List named "pages": THE child pages
  children                                   // :114, PageChildren: a Map view over pages (get(name), stubs read null)
  content                                    // :83, a PageContent (a List of parts): the body
  store                                      // the PageLogReader of its page.jsonl, set by Reader.attach() (Reader.js:32)
  settings                                   // :58, a small bag a log line can set
  static fields = ["title","icon","description"]    // :64
  static WORDS                               // :143, the six page words (navigation, width, …)
  naming() words() declare()                 // constructor steps: url/name/id, page words, children
  add(name, child) child(name) load_all_children()  // the tree
  static load() jsonl() from() listing()     // loading page.js, page.jsonl, page.json, the folder list
  render() activate() deactivate() nav()     // drawing
  static use(Ext)                            // :37, an extension set up on every page
}
```

## What each Page owns

A page holds only four instances of its own. The other parts are classes attached to `Page`, and a fresh one is made for each call.

```js
page.pages      // List: the child pages               (kept, made on first read)
page.children   // PageChildren: a Map view of pages   (kept)
page.content    // PageContent (extends List): the body (kept)
page.store      // PageLogReader: its page.jsonl        (kept, only when it has one)

// Made per call, then dropped: page.tab(x) is new Page.Jsonl({ page }).tab(x)
Page.Jsonl      // PageJsonl: page.jsonl lines, tabs, file links   (Page.class.js:136-196)
Page.Frame      // PageFrame extends View: the bars around a page  (:571)
Page.Links      // PageLinks: where a click opens, .md helpers     (:422-425)
Page.Columns    // PageColumns: drawing as a Finder column         (:652-662)
Page.Previews   // PagePreviews: the cards for its children        (:673-680)
Page.Related    // PageRelated: the pinned Related aside           (:638)
Page.Prefs      // PagePrefs: saved preferences                    (:699)
Page.Listing / Page.Reader / Page.Inbox   // used by the static loaders, not held per page
```

**How a child gets into `pages`:** `parent.add(name, child)` (`Page.class.js:319`) makes or takes the child Page and sets its `name`, `parent` and `url`. If a stub with that name exists, it is replaced in `pages`. Otherwise `children.put()` inserts it into the `pages` List (`Children.js:33`).
