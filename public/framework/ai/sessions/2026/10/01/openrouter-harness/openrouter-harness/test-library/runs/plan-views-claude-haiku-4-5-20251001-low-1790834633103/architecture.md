# Notification center — three class shapes for Notice, NoticeList, NoticeTray

All three keep the house style from [`view-readme.md`](./view-readme.md): every class extends
`View`, a factory call builds DOM, methods chain and return `this`, and nothing is reactive —
a change shows up because some method explicitly asked the DOM to redraw, never because a value
changed somewhere else.

## Option A — NoticeTray holds a list and manages count directly

```js
class Notice extends View {                         // one message row
	render(){ this.c("flex gap pad-sm", () => {
		span(this.data.text);
		button.c("x-close", "×").click(() => this.remove());
	}); }
}
class NoticeList extends View {                       // the ordered collection of notices
	assign(){ this.items = []; }
	render(){ div.c("flex v"); }                        // empty shell; add() fills it
	add(data){ this.items.push(data); this.append(new Notice({ data })); return this; }
	remove(notice){ this.items = this.items.filter(n => n !== notice); notice.destroy(); return this; }
}
class NoticeTray extends View {                        // bell icon and dropdown
	assign(){ this.open = false; }
	render(){ this.c("tray", () => {
		this.badge = button.c("bell").click(() => this.toggle());
		this.list = new NoticeList();
	}); }
	add(data){ this.list.add(data); this.updateBadge(); return this; }
	toggle(){ this.open = !this.open; this.classed("show", this.open); return this; }
	updateBadge(){ this.badge.text(String(this.list.items.length)); return this; }
}
```

**Pros:** straightforward hierarchy, three classes with clear responsibilities, fastest to write,
no new concepts beyond method chaining. **Cons:** NoticeTray must call `updateBadge()` every time
the list changes; if someone calls `list.add()` or `list.remove()` directly (a future feature,
a test, keyboard shortcut), the badge stays stale. The update site is not automatic — it is one
line you must remember to call next to every mutation.

## Option B — NoticeList fires a change event, NoticeTray listens

Same three classes, but `NoticeList.add()`/`remove()` end with
`this.el.dispatchEvent(new CustomEvent("change", { detail: this.items }))`, and NoticeTray
does `this.list.on("change", e => this.badge.text(String(e.detail.length)))` once, in
`render()`.

**Pros:** NoticeTray no longer reaches into NoticeList's internals — anything that mutates the
list keeps the badge correct for free, because the event fires from the one place the mutation
happens. The change is centralized where it matters. **Cons:** reuses `.on()` from the house style
(which is already used for clicks), so a newcomer has to learn that custom events work the same
way as DOM events; one more concept to absorb beyond basic method calls.

## Option C — Notice dismisses itself, NoticeTray reads count from the DOM

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
	get count(){ return this.el.children.length; }                          // truth lives in the DOM
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

**Pros:** no stored count to drift from reality; `count` reads the actual DOM every time, so it is
always correct. No event bus, no new patterns. The only new idea is a simple callback on dismiss.
**Cons:** exactly like option A, any code that mutates `list` without going through `tray.notify()`
must remember to call `tray.sync()` itself. Same stale-badge risk as A.

## Decision

Picked **option B**. Reasoning: this is a small three-class system, but "forgot to update the
badge" is exactly the bug a notification center earns a bad reputation for in real apps. Option B
is the only choice where that bug is structurally impossible — the event fires from the one place
data changes, so the badge updates for free no matter who called the mutation. The `.on()` event
already exists in the house style for DOM clicks, so reusing it for a custom `change` event costs
the reader nothing new beyond learning the name. Options A and C both require discipline — a line
you must remember to call — and discipline is what breaks in production.

