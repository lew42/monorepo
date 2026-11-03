Default: a no-op. The editor supplies `restore: snapshot => swap(JSON.parse(snapshot))`
— and `swap()` is deliberately one function, because `Item.hydrate` returns a
**new tree**: the saver, the autosave listeners, the canvas and the selection all
have to move onto it together, or the live editor ends up writing to a document
nobody can see. See [`swap()` in `page.js`](../file/page.js.md).

Same silent-inert trap as [`read`](./read.md) if this is never supplied.
