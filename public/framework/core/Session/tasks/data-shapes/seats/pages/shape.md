# Pages as built (seat d), one page

**In one line:** a `Page` is an `Item` with a url, plus about 2,250 lines of routing, layout and drawing. Records (Task, Session) are Items too, but they are **not** Pages: each one already *has* a thin Page that routes to it. Evidence and numbers: [notes.md](notes.md).

## The classes today

```
Item                                   core/Item/Item.js (397 lines, 22 own methods)
  data, id, parent, saver/store        set(delta) → apply → set_one → get(key)
  lists()                              every List it owns (found by scanning own props)

Page extends Item                      core/Page/Page.class.js:33 (701 lines + 15 helper files ≈ 2,250)
  url, name                            from import.meta, else parent.url + name
  content: PageContent (a List)        parts: heading, text, card…
  pages: List (of: null)               the real child store (Page.class.js:128)
  children: PageChildren               a Map-shaped shim over `pages` (Children.js), still the main API
  route(name)?                         a dynamic child: 70 page.js files define one
  child(name)                          the Router's one hop (memory → page.jsonl → md/fs → route → readme → page.js)
  + 100 more names: tabs, columns, previews, links, words, inbox, md, render…

Task extends Item                      core/Task/Task.js (621 lines)
  tasks: List, content: List, state…   children = child SESSIONS (computed)
Session extends Task                   core/Session/Session.js (181 lines)

TaskPage extends Page { task }         core/Task/TaskPage.js:7   (loads task.jsonl / session.jsonl, draws task.render())
AISessionDetail extends Page           ai/AISession/AISessionDetail.js:41 (one session's page at its dated folder)
```

## How a child page is stored: four ways at once

| Way | Where it lives | Used by (census, live pages) |
|---|---|---|
| `children:` in `page.js` | code; staged, then `declare()` makes stubs in `pages` | 259 string, 124 array, 41 object, 6 function |
| `{"file":"x/page.jsonl"}` lines (`gone: true` removes) | the parent's `page.jsonl` | 5 parents, 16 live children (24 lines, 8 gone) |
| the folder itself | `files.jsonl` (the dev server writes it) + `/api/folder-names` | `child()` fallback; `children: "… auto"` exists but 0 pages use it |
| `route(name)` | code: a page invents the child | 70 `page.js` files |

## Page CRUD (create, rename, remove): works, rarely used

`Servex/agents/Subpages.js` (124 lines) is behind `page_set {pages:{add|rename|remove}}` and `create_page`.

- ✅ Tests pass: `page_tools.test.mjs` 33 checks, `Page.test.mjs` 21.
- ✅ A scratch-tree run: add, rename, remove (to `_removed/`) and a nested add all worked.
- ✅ Headless: a created child, and its own child, open and render.
- ⬜ The parent does not list a created child: a `page.js` parent shows only its declared children.
- ⬜ No move to another parent.
- ⬜ A rename leaves the old url as a 404, with no redirect.
- ⬜ A page inside a task folder never routes.

## What I recommend (shape only)

```
Record extends Item            Session, Task, Topic, User…: data + lists, no routing
  url                          computed (its folder), never a route
RecordPage extends Page        thin: route + layout; `record` holds the Item it draws (today's TaskPage pattern)
Page.pages: List<Page | Ref>   the ONE child store; stored as a normal list delta
                               {"pages":{"add":{"ref":"x/"}}}: the same reference shape as a Task's {"task":"<folder>"}
                               declared order wins; the folder listing only adds what is not yet declared ("auto")
```

A view draws an **inline child** in place and a **referenced child** (its own file) as a link card that names where it lives.
