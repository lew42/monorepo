# Notification center — three class shapes for Notice, NoticeList, NoticeTray

All three keep the house style from [`view-readme.md`](./view-readme.md): every class extends
`View`, a factory call builds DOM, methods chain and return `this`, and nothing is reactive —
a change shows up because some method explicitly asked the DOM to redraw, never because a value
changed somewhere else.

## Option A — NoticeTray reaches straight into NoticeList

```js
class Notice extends View {                         // one row
	render(){ this.c("flex gap pad-sm", () => {
		span(this.data.text);
		button.c("x-close", "×").click(() => this.remove());
	}); }
}
class NoticeList extends View {                       // the ordered rows
	assign(){ this.items = []; }
	render(){ div.c("flex v"); }                        // empty shell; add() fills it
	add(data){ this.items.push(data); this.append(new Notice({ data })); return this; }
	remove(notice){ this.items = this.items.filter(n => n !== notice); notice.destroy(); return this; }
}
class NoticeTray extends View {                        // bell + dropdown
	assign(){ this.open = false; }
	render(){ this.c("tray", () => {
		this.badge = button.c("bell").click(() => this.toggle());
		this.list = new NoticeList();
	}); }
	add(data){ this.list.add(data); this.badge.text(String(this.list.items.length)); return this; }
	toggle(){ this.open = !this.open; this.classed("show", this.open); return this; }
}
```

**Pros:** three classes, three visual regions, nothing else to learn — the fastest working
version. **Cons:** NoticeTray has to know NoticeList's internals (`items.length`) to keep the
badge number right, so a second place that calls `list.add()` or `list.remove()` directly (a
future "mark all read" button, say) will leave the badge stale — the badge update is NOT
automatic, it is one line you must remember to call next to every mutation.

## Option B — NoticeList fires a DOM event, NoticeTray just listens

Same three classes, but `NoticeList.add()`/`remove()` end with
`this.el.dispatchEvent(new CustomEvent("change", { detail: this.items }))`, and NoticeTray does
`this.list.on("change", e => this.badge.text(String(e.detail.length)))` once, in `render()`.

**Pros:** NoticeTray no longer reaches into NoticeList's internals — anything that mutates the
list (a future second tray, a test, a keyboard shortcut) keeps the badge correct for free, because
the event fires from the one place the mutation happens. **Cons:** it is the one place in this
plan that behaves like an event bus rather than a plain method call; the house style's `.on()` is
already used for real DOM events (clicks), so this reads as consistent, but it is one more concept
("listen for change") a newcomer has to learn beyond "call a method."

## Option C — Notice dismisses itself; NoticeTray stays in sync by asking, not storing

```js
class Notice extends View {
	render(){ this.c("flex gap pad-sm", () => {
		span(this.data.text);
		button.c("x-close", "×").click(() => { this.destroy(); this.onDismiss?.(this); });
	}); }
}
class NoticeList extends View {
	render(){ div.c("flex v"); }
	add(data){ const n = new Notice({ data }); this.append(n); return n; }   // returns the child
	get count(){ return this.el.children.length; }                          // truth lives in the DOM, not a copy
}
class NoticeTray extends View {
	render(){ this.c("tray", () => {
		this.badge = button.c("bell").click(() => this.classed("show", "toggle"));
		this.list = new NoticeList();
	}); }
	notify(data){
		const n = this.list.add(data);
		n.onDismiss = () => this.sync();
		this.sync();
		return this;
	}
	sync(){ this.badge.text(String(this.list.count)); return this; }   // call after ANY mutation
}
```

**Pros:** no stored count to drift from reality (`count` reads the real DOM every time), no event
bus, and the only new idea is "a notice can tell its tray it's gone" — one plain callback,
nothing framework-shaped. **Cons:** exactly like option A, any code that mutates `list` without
going through `tray.notify()` must remember to call `tray.sync()` itself — the same stale-badge
risk as A, just named explicitly instead of hidden.

## Decision

Picked **option B**, recorded with `decide.mjs`: [`decide-drafts.json`](./decide-drafts.json) while
drafting, then appended as a `decision` line in this task's log. Reasoning in full is in that
record's `why`; in short — this is a small, three-class system, but "forgot to update the badge"
is exactly the bug a notification center earns a bad reputation for, and B is the only option
where that bug is structurally impossible rather than merely "don't forget." The `.on()` event
already exists in the house style for clicks, so reusing it for a custom `change` event costs the
reader nothing new to learn beyond the name.
