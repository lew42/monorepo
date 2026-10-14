# Browse — one list-and-detail view: a resizable list on the left, the row you clicked on the right

See it: **[the page](/framework/ux/Browse/)**: the class architecture, then the demo. The Inbox on [/framework/ai/](/framework/ai/) is a `Browse`.

## Use

```js
import Browse from "/framework/ux/Browse/Browse.js";

class MyList extends Browse {
	draw_list(){ /* draw the rows: each is a link to <page url><id>/ */ }
}
// in the page's content(); the page wears `classes: "full fill"` and has a route(id)
new MyList({ page: this, key: "mine" }).mount();
```

- `browse.pin(new Browse.Pinned({ title, rows }))`: a short list above the rows, one line each, ticked → gone.
- The list's width: a third of the screen by default, dragged with its grip, remembered per `key`.

## Watch out

- The detail pane IS `page.$pages`: a row's page renders there through the Router, so its url is real and a reload lands on it.
- Rows widen into columns by a container query on the list pane, never by the screen width.

## More

- [doc/architecture.md](doc/architecture.md): every class, what extends what, what Inbox, Sessions and the catalog become.
- Who extends it: [`Inbox.Rail`](/framework/core/Page/ext/Inbox/) → [`AIRail`](/framework/ai/rail/).
