# Build C plan: class pages that show, not tell

Brief: [requirements.md](requirements.md). Branch `worktree/class-docs`, off build B (`657d3514f`).

## What exists

- `ext/Doc/Doc.js`: a module as tabs (Overview, API, Docs, md, Files, Tasks, Inbox). The API tab opens on `ClassCard` (a grid of member names); each member page is source code plus a `doc/method/<name>.md`, most of them prose from 2026-08 and partly stale.
- `core/Item/page.js`, `core/List/page.js`: an Overview of code blocks and paragraphs, then the checks the page runs on load.
- Build B: `view(x)` (`ux/Content/Object/DefaultView.js`) draws any object live; `core/Item/watch/` steps through a tree being built (`Box`, `ScratchStore`).
- Seat (g)'s [delta-flow.md](../../seats/delta-flow/delta-flow.md): the path of one change, hop by hop.

## The new class: `ClassDoc extends Doc` (`ext/Doc/ClassDoc.js`)

One page class for any class page. Config adds five things to a Doc's:

| key | what it draws |
|---|---|
| `holds` | the class line: `Item` extends `Events` · holds: … (the parent class is read off the prototype) |
| `example()` | a real instance, drawn with `view()` |
| `steps` | the core test drawn on screen: one card per step (its code, ✓/✗, the object's view after it, the lines it wrote) |
| `life` | the life cycle as one picture: who creates or changes it → the hops to the file → back to every tab |
| `members` | `{name: {job, example()}}`: the Methods tab, and `methods/<name>/` from `route(name)` |

- **Steps are data that is also a test:** `core/Item/Item.steps.js` exports `[{title, code, note, run(t), check(t), show(t)}]`. The page runs them in the browser; `core/Item/Item.steps.test.mjs` runs the same array in node.
- **Methods:** the Methods tab is a wall of cards (signature, one-line job). `methods/<name>/` is built by `route(name)` on that tab: signature, job, the example's code and its live result, then `methods/<name>.md` when the page lists it in `method_notes` (only `set`, `get`, `toJSON`). The old `api/<name>/` urls route to the same page, so old links keep working; the old API tab is replaced by Methods.
- **List** uses the same class with its own `List.steps.js`, `List.methods.js`, and the same life cycle with its own "who changes it" column.

## Decisions

- **Step order** is create, save (attach a store), set, add a child, change the child, replay, not the brief's create, set, add, save, replay: in the current system a change is saved as it happens, so a store attached after the changes has nothing to replay. Alternative: save as a snapshot (`JSON.stringify`, `Item.hydrate`), which is the older whole-document path.
- **Old prose stays one click down** (the Docs and md tabs); the Overview has no paragraphs. The 18 checks the old Item page ran stay, folded into one line with their tally.
- **No changes to `Item.js`, `Store.js`, `List.js`** (build A's fence). `Box` and `ScratchStore` from `core/Item/watch/` are reused.
