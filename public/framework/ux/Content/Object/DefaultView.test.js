import Test from "../../../core/Test/Test.js";
import { view } from "./DefaultView.js";
import Item from "../../../core/Item/Item.js";
import List from "../../../core/List/List.js";

// The smallest Item with a List of its own, here so the test depends on no demo.
class Box extends Item {
	static fields = ["title", "count"];
	constructor(...args){ super(...args); this.items = new List({ owner: this, name: "items", of: Box }); }
}
Item.register(Box, "DefaultViewTestBox");

/* (Every view here passes `capture: false`: built outside a render, a View would land in whatever is capturing.)
 * The default view's one core test, in a BROWSER (X.test.js; core/Test/readme.md): it needs a DOM. One tree,
 * changed every way a List and an Item change, each check reading the real elements. Run it by opening
 * /framework/core/Item/watch/ (the result shows under the steps), or `await (await import(this)).default()`. */
export default async function run(){
	const t = new Test("DefaultView");
	const host = document.createElement("div");
	host.style.cssText = "position:absolute;left:-9999px;top:0;width:40em";
	document.body.append(host);
	try {
		const root = new Box({ id: "r", title: "R" });
		const v1 = view(root, { open: 9, capture: false }); host.append(v1.el);
		t.ok(!view(root, { capture: false }).el.open, "closed by default");
		t.ok(v1.rows.get("items")?.classList.contains("ux-content-defaultview-row"), "an empty list is a plain row");

		const a = root.items.add({ id: "a", title: "A", count: 1 });
		t.eq(v1.$counts.el.textContent, "1 item", "the row's count follows the list");
		t.ok(!v1.rows.get("items").classList.contains("ux-content-defaultview-row"), "a list with a member opens");

		const v2 = view(a, { open: 1, capture: false }); host.append(v2.el);
		t.eq(a.views.length, 2, "one object, two views");
		const av = a.views[0], title = av.rows.get("title"), count = av.rows.get("count");
		a.set({ count: 5 });
		t.ok(av.rows.get("count") !== count && av.rows.get("count").textContent.includes("5"), "a set rewrites its row");
		t.ok(av.rows.get("title") === title, "and leaves the others alone");
		t.ok(v2.rows.get("count").textContent.includes("5"), "the second view changes too");

		root.items.add({ id: "b", title: "B" });
		const list = root.items.views[0];
		const ids = () => [...list.$body.el.children].map(e => e.querySelector(".ux-content-defaultview-id")?.textContent).join();
		t.eq(ids(), "a,b", "members in order");
		const a_el = list.kids.get(a).el;
		root.items.move("b", { after: null });
		t.eq(ids(), "b,a", "a move reorders");
		t.ok(list.kids.get(a).el === a_el, "without redrawing the others");
		root.items.remove("b");
		t.eq(ids(), "a", "a remove drops its row");
		root.items.remove("a");
		t.ok(v1.rows.get("items")?.classList.contains("ux-content-defaultview-row"), "an emptied list is plain again");

		v2.el.remove(); a.set({ count: 6 });
		t.ok(!a.views.includes(v2), "a view off the page leaves views");
		t.eq(view(5, { capture: false }).el.textContent, "5", "a primitive is its value");
		t.ok(view(Box, { open: 1, capture: false }).el.textContent.includes("class"), "a class says so");
	} finally { host.remove(); }
	return t.done();
}
