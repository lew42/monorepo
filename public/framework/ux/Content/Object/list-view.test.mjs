// node list-view.test.mjs [base-url] — headless: proves List.View (DefaultView.js, wired by List.render()) updates on a List's
// add/remove/move/order keyed by member id, without redrawing the members that did not change (chat-model plan.md step 4), and
// that a Ref member (core/Item/Ref.js, added to a chat list in step 2/3) draws through RefView, not a nested DefaultView.
import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://chat-model.localhost";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

const browser = await Browser.browser();
const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));

try {
	await page.goto(`${base}/framework/ext/Chat/list/`, { waitUntil: "networkidle" });
	const result = await page.evaluate(async () => {
		const Item = (await import("/framework/core/Item/Item.js")).default;
		await import("/framework/core/List/List.js");
		const { view } = await import("/framework/ux/Content/Object/DefaultView.js");

		const root = Item.hydrate({ id: "root", kids: [{ id: "a" }, { id: "b" }, { id: "c" }] });
		const host = document.createElement("div"); document.body.append(host);
		const v = view(root.kids, { open: 1, capture: false });
		host.append(v.el);

		const order_by_kids = () => [...v.$body.el.children].map(el => [...v.kids.entries()].find(([, kv]) => kv.el === el)?.[0]?.id);
		const views_of = ids => ids.map(id => v.kids.get(root.kids.find(id)));

		const before = order_by_kids();
		const [va, vb, vc] = views_of(["a", "b", "c"]);
		const b_member = root.kids.find("b");

		root.kids.add({ id: "d" });                 // add: a new keyed view, kept ones untouched
		const after_add = order_by_kids();
		const [va2, vb2, vc2] = views_of(["a", "b", "c"]);
		const kept_on_add = va === va2 && vb === vb2 && vc === vc2;

		root.kids.remove("b");                       // remove: the view for "b" is dropped, "a" and "c" kept
		const after_remove = order_by_kids();
		const [va3, vc3] = views_of(["a", "c"]);
		const kept_on_remove = va === va3 && vc === vc3;
		const b_gone = !v.kids.has(b_member) && !vb.el.isConnected;

		root.kids.move("d", { after: "a" });         // move: "d" relocates, nothing else redraws
		const after_move = order_by_kids();
		const [va4, vc4] = views_of(["a", "c"]);
		const kept_on_move = va === va4 && vc === vc4;

		root.kids.order(["c", "a", "d"]);            // order: a full reorder, same keyed views
		const after_order = order_by_kids();

		// A Ref member (list.ref on an item another of this root's lists already owns) draws as RefView, never a nested DefaultView.
		const chatlist = Item.hydrate({ id: "chat", things: [{ id: "x" }], messages: [] });
		chatlist.messages.ref(chatlist.things.find("x"));
		const vref = view(chatlist.messages, { open: 1, capture: false });
		const host2 = document.createElement("div"); document.body.append(host2);
		host2.append(vref.el);
		const ref_member = [...chatlist.messages][0];
		const ref_view = vref.kids.get(ref_member);

		return {
			before, after_add, after_remove, after_move, after_order,
			kept_on_add, kept_on_remove, kept_on_move, b_gone,
			is_ref: ref_member?.constructor?.name === "Ref",
			ref_view_is_refview: ref_view?.constructor?.name === "RefView",
			ref_row_classes: ref_view?.el?.className ?? null,
		};
	});
	console.log(JSON.stringify(result));

	check("initial DOM order matches the list", JSON.stringify(result.before) === JSON.stringify(["a", "b", "c"]), result.before);
	check("add: new member appended, order right", JSON.stringify(result.after_add) === JSON.stringify(["a", "b", "c", "d"]), result.after_add);
	check("add: unrelated members' views are not rebuilt", result.kept_on_add);
	check("remove: gone member drops, order right", JSON.stringify(result.after_remove) === JSON.stringify(["a", "c", "d"]), result.after_remove);
	check("remove: its view leaves the kids map", result.b_gone);
	check("remove: unrelated members' views are not rebuilt", result.kept_on_remove);
	check("move: relocates in the DOM, order right", JSON.stringify(result.after_move) === JSON.stringify(["a", "d", "c"]), result.after_move);
	check("move: unrelated members' views are not rebuilt", result.kept_on_move);
	check("order: a full reorder lands in the DOM", JSON.stringify(result.after_order) === JSON.stringify(["c", "a", "d"]), result.after_order);
	check("a Ref list member is a real Ref", result.is_ref);
	check("a Ref member draws through RefView, not a nested DefaultView", result.ref_view_is_refview, result.ref_view_is_refview);
	check("RefView's row carries its own class, never ux-content-defaultview-item-node", result.ref_row_classes?.includes("ref-view") && !result.ref_row_classes?.includes("item-node"), result.ref_row_classes);
	check("no page errors", errors.length === 0, errors);
} finally {
	await Browser.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
