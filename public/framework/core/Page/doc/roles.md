# Roles — how two deeply nested pages talk

The ask (2026-08-27): *"each child page should have a reference to its parent. Maybe a
TopicPage could be referenced at `child.topic`, so all children can find their nearest
`.topic`. Similar for a Document. Then deeply nested pages could interact relatively
simply with a page system."*

**A page says what it is; everything below it can find it.** One word, one method, no
registry. Live: [Refs](/framework/core/Page/overview/columns/refs/) — a picker column
and a reader column four levels apart, neither importing the other.

**In a real screen:** [Inbox](/framework/core/Page/overview/columns/uses/inbox/) — the
unread count in the rail's head and the dots on its rows are state on the topic two pages
above the reader that writes it · [Workbench](/framework/core/Page/overview/columns/uses/workbench/)
· [Docs](/framework/core/Page/overview/columns/uses/docs/) ·
[Split](/framework/core/Page/overview/columns/uses/split/). All four:
[`columns.md`](/framework/core/Page/doc/columns/).

```js
// the host claims a role
export default new Page({ meta: import.meta, is: "topic", selection: null, … });

// anywhere in its subtree, at any depth, through any number of columns or regions
this.topic()                  // → that page
this.document()               // → the nearest `is: "document"`
this.nearest("workspace")     // → any other role, no new method needed
```

`findLast`, so the **closest** claim wins: a document inside a topic is still your
document, a topic inside a topic shadows the outer one. Same override direction as
CSS. The walk includes `this`, so a topic is its own topic and a helper written for a
child is safe to call anywhere.

## Why `is:` and not `topic: true`

A flag named after the accessor **shadows the method on the very page that claims it** —
the topic page's own `this.topic()` would be the boolean `true`. `is:` is a word a page
says about itself, the same shape as `width:` and `card:`, and it reads right in the
blessed page literal. It collides with nothing: the `is` that `Page.class.js` imports
is a module binding, not a property.

| | |
|---|---|
| a `TopicPage` **subclass** | ✗ a role is a word about a page, not an identity — and it forces a file per role |
| `topic: true` | ✗ shadows `topic()` on the topic page itself |
| a **registry** on `app` | ✗ a second tree beside the one that already exists, kept in step by hand |
| **`is:` + `nearest(role)`** | ✓ one declarative word, one line over `chain()`, no state anywhere |

## Core stops at the ref

What a topic then *does* — hold a selection, notify watchers, cache a fetch — is that
page's own code, not API here. The whole messaging layer in the Refs demo is two
methods on the host page:

```js
watch(fn){ (this.watchers ??= []).push(fn); fn(this.selection); },
select(mail){ this.selection = mail; this.changes++; this.watchers?.forEach(fn => fn(mail)); },
```

A tree that wants a different conversation writes a different three lines. A
subscription API on `Page` would make ~160 pages pay for a pattern four of them want.

## Measured (2026-08-27, headless, cold load straight at the deepest url)

Five columns, no click-through. `hops: 4` from Notes to the topic, constant; three
clicks in the picker produced `updates: 3` in a column four levels away; zero console
errors. The reader and the notes column both redrew from the same ref.

⚠ **A watcher registered in `content()` is registered once**, because `render()` caches
`this.view`. A page that rebuilds its view has to think about that; nothing in core
will.

## More

- [`method/nearest.md`](/framework/core/Page/doc/method/nearest.md) · the walk itself
- [`panels.md`](/framework/core/Page/doc/panels/) · the same answer for two panels
  instead of two columns
- [`columns.md`](/framework/core/Page/doc/columns/) · the arrangement the demo runs in
