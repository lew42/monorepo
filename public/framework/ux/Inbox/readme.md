# Inbox — a rail of page previews beside the page you picked, and nothing jumps

See it: **[the demo](/framework/ux/Inbox/)** — click a row and its page opens on the right
while the rail stays exactly where it is. The AI page's Inbox and Log tabs and AI 2 are the
same rail with AI data ([/framework/ai/](/framework/ai/), [/framework/ai2/](/framework/ai2/)).

## Use

```js
import InboxRail from "/framework/core/Page/ext/Inbox/Rail.js";

class MyRail extends InboxRail {
	source(){ return my_rows(); }   // [{ id, title, icon, at, score, sub, needs }]
}

// inside the page's content(); the page wears `classes: "full fill"`
this.rail = new MyRail({ page: this }).mount();
```

- A row links to `<page url>/<id>/`. Give the page a `route(id)` that returns that row's
  page; it opens in the detail column (`page.$pages`), a sub-page in the third column
  (`page.$sub`).
- Every part is a method: override one and keep the rest. `head_extra()`, `actions()`,
  `toggles()`, `face()`, `when()`, `archive()`, `is_read()`… The list is at the top of
  [`Rail.js`](/framework/core/Page/ext/Inbox/Rail.js).
- **The score floor**: rows under `?min=` (default 90) stay out. `0` shows everything —
  the AI page's Log is the same rail at 0. A tab says its own floor with `rail.tab_floor(n)`.
- A page that takes the whole shell (a System tab, an Overview) wears `inbox-takeover`;
  a plain page beside the rail wears `inbox-page` so it scrolls by itself.
- **`.flush-stack`** — rows touching, no padding, no gap, one box, only its outer corners
  rounded (`--flush-radius`). The rail's list wears it; any list can.

## Watch out

- A row is an `<a>`, never a button: the Router navigates it and marks it `.active`, so
  Back and a reload work. Never draw the selection by hand.
- The order never moves while you look: a row that changed is counted on the "N updated ↑"
  pill. Don't re-sort on a timer.
- A field on a subclass must not share a method's name — `this.stream = …` once replaced
  the base's `stream()` method and the rail drew nothing.
- A row is drawn by the rail's own face (`row_head()`), not yet by `page.preview(nav)`: a
  row needs a dot, a score and an ×, which `preview()` has no hook for yet.

## More

- [`Inbox.css`](./Inbox.css) — the whole look, including the phone rule (one screen at a time)
- [`ai2/rail.js`](/framework/ai2/rail.js) — `AIRail`, the subclass with the usage meters
- [`core/Page/ext/Inbox/`](/framework/core/Page/ext/Inbox/) — the Inbox extension the class lives in
- History of every rule: [`ai2/doc/decisions.md`](/framework/ai2/doc/decisions.md)
