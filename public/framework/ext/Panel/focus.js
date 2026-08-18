import { vocab } from "./vocab.js";

/* Focus is a SELECTION, not document state: it rides the root panel as an id, exactly like
   `templates` rides it, and never reaches `toJSON`. One panel wears it; clicking any panel
   takes it; an entry that READS it (`focus: true` — the inspector) never does, or an
   inspector clicked into would start inspecting itself. Record: doc/focus.md. */

export const focused = item => { const root = item.root(); return root.find(root.focus); };

export const inspects = item => !!vocab(item)[item.get("template")]?.focus;

/* Two document events, and an import in NEITHER direction. `panel-focus` says the selection
   moved — the dev rail listens and points ext/DesignTool at the panel; `panel-unfocus` is
   anyone asking for it back, which is what Escape asks by hand. An `Item` event only reaches
   things holding the root, and nothing outside a workspace ever does. */
const announce = item => document.dispatchEvent(new CustomEvent("panel-focus", { detail: item ?? null }));

export function focus(item, $panel){
	const root = item.root();
	if (root.focus === item.id) return;

	root.focus = item.id;
	$panel.el.closest(".panel-workspace")?.querySelectorAll(".panel.focus").forEach(el => el.classList.remove("focus"));
	$panel.ac("focus");
	root.emit("focus", item);
	announce(item);
}

/* Every way a workspace LOSES its selection, wired once per mount. */
export function selection(root, $root){
	/* Focus clears when its panel leaves the tree, and nothing takes its place. ⚠ In a
	   microtask, because `move()` is a remove followed by an insert — a drag of the focused
	   panel would otherwise unfocus it mid-flight. */
	root.on("remove", () => queueMicrotask(() => {
		if (!root.focus || root.find(root.focus)) return;
		delete root.focus;
		root.emit("focus", null);
		announce(null);
	}));

	/* Deselecting: Escape, or anyone dispatching `panel-unfocus`. A click cannot be the
	   toggle — the focus test in `view()` answers to a click anywhere in a panel's body, so
	   using what is inside a panel would be how you let go of it. */
	const drop = () => {
		if (!root.focus) return;
		delete root.focus;
		$root.el.querySelectorAll(".panel.focus").forEach(el => el.classList.remove("focus"));
		root.emit("focus", null);
		announce(null);
	};

	/* ⚠ On the document, and unbinding itself once its workspace is gone: the root outlives
	   every DOM it draws, so nothing else is ever going to remove them. */
	const listen = (event, fn) => document.addEventListener(event, function hear(e){
		if (!$root.el.isConnected) return document.removeEventListener(event, hear);
		fn(e);
	});

	listen("keydown", e => { if (e.key === "Escape") drop(); });
	listen("panel-unfocus", drop);
}
