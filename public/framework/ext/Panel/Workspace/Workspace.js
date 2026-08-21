import View, { div, span, button, icon } from "/framework/core/View/View.js";
import Item from "/framework/core/Item/Item.js";
import Panel from "../Panel.js";
import { mount as mount_root, focused } from "../workspace.js";
import { vocab } from "../vocab.js";
import { scatter } from "../random.js";
import { SHAPE } from "../glyphs.js";
import { saver as default_saver, name_of } from "./documents.js";
import { focus } from "../focus.js";
import { viewports, viewport_controls } from "./viewports.js";

View.stylesheet(import.meta, "workspace.css");

/* HOLDS a Panel root — never `extends Panel`, or it would inherit `divide/split/close/
   mirror` and `toJSON()` would write workspace chrome into the document file (the accepted
   proposal's "never a fourth Panel subclass"). `workspace(options)` in `../workspace.js` is
   this class's thin door: `new Workspace(options).$view`, same options, so no caller
   changes. design §1, §3, §4. Record: readme.md, doc/decisions.md.

   ⚠ Imports `mount` back from `../workspace.js`, which imports THIS file for the door — a
   real cycle, safe because each side only calls the other's binding inside a function body,
   never at module-evaluation time. doc/decisions.md. */
export default class Workspace {

	constructor(options = {}){
		const { saver: store = default_saver, templates, tools, seed = scatter, mode, flow, height, center = false } = options;

		this.saver = store;
		this._mode = mode;               // the REQUESTED word, until a saved one wins or `mode` is set live
		this.zoom = 1;                    // task C's dial — held here so the bar has somewhere to write it
		this.viewports = ["fill"];        // task C's set — one default entry until it exists
		this.height = height;
		this.center = center;
		this.root = null;
		this.$roots = [];

		// The box and the bar are placed NOW; both are filled in the callback below —
		// the factory-after-await trap, avoided the same way `workspace()` always did.
		this.$view = div.c("panel-workspace-wrap flex v", () => {
			this.$bar = div.c("panel-workspace-bar flex gap v-center");
			this.vp = viewports(this);   // task C: the viewport set — builds every box via mount()
		});
		// ⚠ On the WRAP, not the root box `mount()` builds: a custom property set on a
		// CHILD never reaches an ancestor's own `var(--panel-height)` rule — inheritance
		// only runs downward. `--panel-height` names the whole workspace's extent, same as
		// every caller already sets it by hand on what `workspace()` returns.
		if (this.height) this.$view.style("--panel-height", this.height);
		this.draw_bar();

		// A brand new document is a roll, written straight away — so the first thing a
		// reader sees is also the thing that comes back.
		Item.open(store).catch(error => {
			// load() REJECTS on a real failure and resolves null only when the file is
			// genuinely absent — this is the one branch that must NOT seed and save.
			console.error(`Workspace: ${store.path ?? store.key ?? "the saved layout"} failed to load — leaving it untouched.`, error);
			this.$roots.forEach($root => $root.empty(() => { span.c("muted", "Couldn't load the saved layout — reload to try again."); }));
		}).then(loaded => {
			if (!loaded) return;

			const fresh = !(loaded instanceof Panel);
			const root = fresh ? new Panel({ saver: store }) : loaded;

			// A workspace may bring its own vocabulary — ext/editor's regions close over an
			// editor, so its T menu is those regions and the global set never sees them.
			root.templates = templates;
			root.tools = tools;
			if (this._mode) root.data.mode ??= this._mode;
			if (fresh) seed(root, vocab(root));

			this.root = root;
			// flow: true only for a document, unless the caller said otherwise — the owner,
			// 2026-08-19: "maybe panel-flow should be a workspace-configured feature". A fill
			// arrangement (ext/editor, ext/files, space/compose all pass no `mode`) gets none.
			this.flow = flow ?? root.document();

			// Every box already placed (the constructor's own, plus any `mount()` a caller
			// made before this promise settled) gets wired now — one Set, one listener pass,
			// `record()` only for the first. design §3, "N viewports = N views of ONE root".
			this.$roots.forEach(($root, i) => mount_root(root, $root, { flow: i === 0 && this.flow }));
			root.on("add", () => this.draw_bar());

			this.draw_bar();
			if (fresh) root.save();
		});
	}

	/* Grows `$roots[]` — several boxes, one root. Call it again for a second viewport of
	   this SAME document (task C mounts N); the box is placed now and wired the instant the
	   root is ready, whether that is already or not yet. */
	mount(){
		const box = div.c("panel-workspace flex");

		if (this.center) box.ac("panel-workspace-center");

		const first = !this.$roots.length;
		this.$roots.push(box);

		if (this.root) mount_root(this.root, box, { flow: first && this.flow });

		return box;
	}

	// The root's own word — one screen, or a scrolling document. Reads/writes
	// `root.data.mode`; before the root loads it answers the constructor's own request.
	get mode(){ return this.root ? this.root.get("mode") : this._mode; }
	set mode(value){
		this._mode = value;
		if (this.root) this.root.set("mode", value);
	}

	// A name for the bar, derived from the Saver rather than a second thing to keep in
	// sync — documents.js's own paths already say which document this is.
	doc_name(){ return name_of(this.saver) || "workspace"; }

	/* The bar's `+`: ADD, from scratch — beside the focused panel, or (nothing focused) a
	   fresh top-level panel on the root. design §5: "add is already built" is split.js's OLD
	   gesture, `new Panel()` with no restyle. ⚠ `divide()` on the ROOT always calls `split()`
	   (`this.parent` is forever null, so its sibling branch can never fire) — fine for a
	   LEAF root (the usual `split()` conversion, old content preserved as a sibling) but
	   WRONG once the root already holds children: it would re-wrap every existing section
	   into one nested child instead of adding a flat new one. `new Panel().move(root)` is
	   `workspace.js`'s own `sown()` for this exact shape (design §5, "one roll = one
	   section") — the same fix serves `fill` mode too, so there is no mode branch here.
	   ⚠ The template picker does not auto-open — its trigger lives on `toolbar.js`'s own
	   `$panel`, which `focus.js`/`workspace.js` reach and this task's fences do not: the new
	   panel takes the default template, and the rail lights it the moment it is clicked. */
	add(){
		const root = this.root;
		if (!root) return;

		const target = focused(root) ?? root;
		if (target === root) return void (root.leaf() ? root.divide(root.get("dir"), new Panel(), false) : new Panel().move(root));

		target.divide(target.parent?.get("dir") ?? "row", new Panel(), false);
	}

	/* The one row: `+` (add) · mode · document name · a slot task C fills (viewports · fit ·
	   100% · zoom). `+` is FIRST — the one verb that needs no panel already focused, so it
	   is the bar's own way in. ⚠ The root's OWN `mode` word — the rail's picker, `root: true`
	   in glyphs.js's WORDS — is left alone on purpose: this bar is a SECOND writer of the
	   same key, not a replacement yet (design §8 deletes the rail's copy later, once this
	   bar is the only one and task C has landed). */
	draw_bar(){
		this.$bar.empty(() => {
			button.c("panel-workspace-mode").attr("title", "Add a panel").click(() => this.add()).append(() => icon("add"));

			["fill", "document"].forEach(name => button.c("panel-workspace-mode")
				.ac(this.mode === name && "on")
				.attr("title", name)
				.click(() => { this.mode = name; })
				.append(() => icon(SHAPE[name])));

			// The name is the DOCUMENT's own selection (the owner, 2026-08-19): click it and
			// the rail shows the root — its words, and the document block with Delete.
			button.c("panel-workspace-name").attr("type", "button").attr("title", "Select the document")
				.click(() => this.root && focus(this.root))
				.append(this.doc_name());
			div.c("panel-workspace-slot flex-1", () => viewport_controls(this));
		});
	}
}
