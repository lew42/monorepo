import View, { div, span } from "/framework/core/View/View.js";
import Item from "/framework/core/Item/Item.js";
import FileSaver from "/framework/ext/Saver/FileSaver.js";
import LocalStorageSaver from "/framework/ext/Saver/LocalStorageSaver.js";
import Panel from "./Panel.js";
import templates from "./templates.js";
import { PanelDrag } from "./PanelDrag.js";
import { grip } from "./grip.js";
import { toolbar, handle, place } from "./toolbar.js";
import { align_grid, zoom_scrub } from "./tools.js";
import { edges } from "./split.js";
import { text_layers } from "./text.js";
import { insert_bar } from "./insert.js";
import { display_overlay } from "./display.js";
import { scatter, resolve } from "./random.js";

/* css: .panel-workspace, .panel, .panel-body, .panel-items — plus `.drag-placeholder`,
   whose module is imported above, `.section-band`, which reaches a panel through
   templates.js's lazy import, and `.panel-controls`, a payload's claim that the
   body reserve `--panel-bar-h` for its top edge. `.panel-grip` is grip.css's, the
   bar is toolbar.css's. Design record: readme.md. */
View.stylesheet(import.meta, "panel.css");

// ⚠ THE line that chooses where the workspace lives. Off localhost there is no dev
// socket, so FileSaver warns once and writes nothing — localStorage genuinely persists.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
export const saver = dev ? new FileSaver({ path: "/data/panels.json" }) : new LocalStorageSaver({ key: "panels" });

/* One managed leaf: a name from the T vocabulary, or content the call site draws — or a
   whole `Panel` tree, which is what `structure(seed)` hands back. No saver, so save()
   resolves false and nothing a visitor picks survives a reload. */
export default function panel(seed){
	const made = seed instanceof Panel ? seed
		: typeof seed === "string" ? new Panel({ data: { template: seed } })
		: new Panel({ draw: seed });

	return mount(made, div.c("panel-workspace flex"));
}

/* The persisted workspace. ⚠ The box is placed NOW and filled in a callback — a
   factory call after the await appends wherever the captor has since drifted. */
export function workspace(options = {}){
	const { saver: store = saver, templates: vocabulary, seed = scatter } = options;
	const $root = div.c("panel-workspace flex");

	// A brand new document is a roll, written straight away — so the first thing a
	// reader sees is also the thing that comes back.
	Item.open(store).catch(error => {
		// load() REJECTS on a real failure and resolves null only when the file is
		// genuinely absent — this is the one branch that must NOT seed and save.
		console.error(`workspace: ${store.path ?? store.key ?? "the saved layout"} failed to load — leaving it untouched.`, error);
		$root.empty(() => { span.c("muted", "Couldn't load the saved layout — reload to try again."); });
	}).then(loaded => {
		// ⚠ The catch above is the LOAD's alone. Everything from here is RENDER, and a
		// template that throws while drawing must reach the console as itself — reported
		// as a load failure it accuses a file that is perfectly fine.
		if (!loaded) return;

		const fresh = !(loaded instanceof Panel);
		const root = fresh ? new Panel({ saver: store }) : loaded;

		// A workspace may bring its own vocabulary — ext/editor's regions close over an
		// editor, so its T menu is those regions and the global set never sees them.
		root.templates = vocabulary;
		if (fresh) seed(root, vocab(root));

		mount(root, $root);
		if (fresh) root.save();
	});

	return $root;
}

/* The registry lives on the ROOT panel, so every leaf reads the one its own document
   was opened with — and a workspace holding regions rather than content is not offered
   `random`, which would give an editor two canvases. */
export const vocab = item => item.root().templates ?? templates;
const offer = item => vocab(item) === templates ? ["random", ...Object.keys(templates)] : Object.keys(vocab(item));

/* Focus is a SELECTION, not document state: it rides the root panel as an id, exactly
   like `templates` rides it, and never reaches `toJSON`. One panel wears it; clicking
   any panel takes it; an entry that READS it (`focus: true` — the inspector) never does,
   or an inspector clicked into would start inspecting itself. */
export const focused = item => { const root = item.root(); return root.find(root.focus); };

const inspects = item => !!vocab(item)[item.get("template")]?.focus;

function focus(item, $panel){
	const root = item.root();
	if (root.focus === item.id) return;

	root.focus = item.id;
	$panel.el.closest(".panel-workspace")?.querySelectorAll(".panel.focus").forEach(el => el.classList.remove("focus"));
	$panel.ac("focus");
	root.emit("focus", item);
	announce(item);
}

/* Two document events, and an import in NEITHER direction. `panel-focus` says the
   selection moved — the dev rail listens and points ext/LayoutTool at the panel;
   `panel-unfocus` is anyone asking for it back, which is what Escape asks by hand.
   An `Item` event only reaches things holding the root, and nothing outside a
   workspace ever does. Record: doc/focus.md. */
const announce = item => document.dispatchEvent(new CustomEvent("panel-focus", { detail: item ?? null }));

/* One redraw per structural verb. ⚠ Module scope rather than mount's closure because
   `roll` needs it too, and one synchronous mutation window can never overlap another
   workspace's — nothing awaits between raising the flag and lowering it. */
let drawing;

/* One listener at the root, because Item events bubble. ⚠ Only STRUCTURE redraws: a
   `change` must not, or a chip click replaces the element its own control is holding. */
function mount(root, $root){
	const draw = () => {
		if (drawing) return;                    // resolve() mutates; its adds must not re-enter
		drawing = true;
		resolve(root, vocab(root));
		drawing = false;
		$root.empty(() => { view(root); });     // block body: a returned View is re-appended
	};

	["change", "add", "remove"].forEach(event => root.on(event, () => root.save()));
	["add", "remove"].forEach(event => root.on(event, draw));

	/* Live duplicates. ⚠ `change` carries key/value/old and NOT the item that raised it
	   (`Item.emit`), so there is nothing here to match a master against — and with tens of
	   panels, repainting every mirror on any change is far cheaper than growing the event
	   signature that four other listeners already read. No echo: `repaint()` redraws DOM
	   and never calls `set()`, so this cannot re-enter. */
	root.on("change", () => root.walk(panel => panel.data.mirror && repaint(panel)));

	/* Focus clears when its panel leaves the tree, and nothing takes its place. ⚠ In a
	   microtask, because `move()` is a remove followed by an insert — a drag of the
	   focused panel would otherwise unfocus it mid-flight. */
	root.on("remove", () => queueMicrotask(() => {
		if (!root.focus || root.find(root.focus)) return;
		delete root.focus;
		root.emit("focus", null);
		announce(null);
	}));

	/* Deselecting: Escape, or anyone dispatching `panel-unfocus`. A click cannot be
	   the toggle — the focus test above answers to a click anywhere in a panel's body,
	   so using what is inside a panel would be how you let go of it. */
	const drop = () => {
		if (!root.focus) return;
		delete root.focus;
		$root.el.querySelectorAll(".panel.focus").forEach(el => el.classList.remove("focus"));
		root.emit("focus", null);
		announce(null);
	};

	/* ⚠ On the document, and unbinding itself once its workspace is gone: the root
	   outlives every DOM it draws, so nothing else is ever going to remove them. */
	const listen = (event, fn) => document.addEventListener(event, function hear(e){
		if (!$root.el.isConnected) return document.removeEventListener(event, hear);
		fn(e);
	});

	listen("keydown", e => { if (e.key === "Escape") drop(); });
	listen("panel-unfocus", drop);

	draw();
	return $root;
}

function view(item){
	let $bar, $handle, $body, $items;
	const dir = item.get("dir") === "col" ? "col" : "row";

	const $panel = div.c("panel flex v", () => {
		$bar = div.c("panel-bar", () => { if (item.parent) $handle = handle(); });

		if (item.leaf()){
			$body = div.c("panel-body");

			// Over the body and under the bar — a sibling, so the body's own scrolling
			// and containment are untouched by it.
			align_grid(item, $body);

			// ⚠ HERE, where the body element is created, and never in `paint()`. Its two
			// listeners are delegated onto `$body` itself, which `paint()` empties but does
			// not replace — called from there, every repaint would add another pair.
			text_layers($body);

			// What the display class is DOING — the flex axis and each child's grow, or the
			// grid's real track widths. The class itself is `show()`'s, below.
			display_overlay(item, $body);
		} else {
			// ⚠ A block body: `each()` returns the List, and append_fn appends a returned
			// value — a bare `[object Object]` text node in every split.
			$items = div.c("panel-items flex").ac(dir === "col" && "v")
				.append(() => { item.items.each((kid, i) => { if (i) grip(); view(kid); }); });

			// The `+` that rides the split's gaps — a sibling of the children, absolutely
			// positioned, so offering it never nudges the layout it offers to change.
			$items.append(() => insert_bar(item, $items));
		}
	}).style("--panel-grow", item.get("grow"))
		.ac(item.get("mode") === "hug" && "hug")
		.ac(item.id === item.root().focus && "focus")
		/* A panel's own bar or body, and nothing else: innermost wins without anyone
		   stopping an event, and ⚠ a GRIP is excluded — pointer capture retargets the
		   click at the end of a resize, and a drag between two panels was focusing the
		   split that holds them. */
		.click(e => {
			if (e.target.closest(".panel-bar, .panel-body")?.parentElement !== $panel.el) return;
			if (!inspects(item)) focus(item, $panel);
		});

	$bar.append(() => {
		toolbar(item, $panel, $body, {
			names: offer(item),
			// `random` is offer()'s verb rather than a template, so its picture is ours too.
			entries: { random: { icon: "casino" }, ...vocab(item) },
			roll: name => roll(item, $body, name),
			repaint: () => paint(item, $body),
			// Lazy, like `space` itself — the layout space stays off every page that
			// only wanted a panel. The mutation lands after the microtask, which is
			// fine: `sow` moves items, and `draw()` rebuilds the DOM from the tree.
			// ⚠ Except a one-leaf seed, which moves nothing — hence the repaint.
			sow: vocab(item) === templates && (() => import("./generate.js").then(m => repaint(m.sow(item)))),
			// Handed in as a FACTORY, like `sow` — tools.js reads toolbar.js, so the bar
			// can only ever be given its tools, never import them.
			tool: $body && (() => zoom_scrub(item, $body)),
			// The bar picks the word; what it MEANS is a class this file owns.
			display: $body && (() => show(item, $body)),
			// ⚠ A copy keeps its OWN grow — `mirror()` shares content and look, never a
			// share of a row, or two duplicates would fight over one number.
			copy: $body && (() => item.divide(item.parent?.get("dir") ?? "row",
				new Panel({ data: { grow: item.get("grow") } }).mirror(item))),
		});
	});

	// ⚠ Out here, not in the builder above: `edges()` takes `$panel`, which the builder's
	// own callback runs too early to see — the const is assigned only once `div.c()` returns.
	if ($body) $panel.append(() => edges(item, $panel));

	if ($body) paint(item, $body);

	views.set(item, { $panel, $body, $items });
	new PanelDrag({ view: $panel, handle: $handle ?? false, $items, $body, item });
	return $panel;
}

/* The current DOM of a panel, rewritten on every draw — so a control that lives in
   ANOTHER panel can reach the one it is editing. Weak, because a closed panel's entry
   should go when the panel does. */
const views = new WeakMap();

/* One panel's chrome resynced from its own data: what the bar writes by hand as it
   clicks, for the `properties` inspector, which is holding no part of its target. */
export function repaint(item){
	const seen = views.get(item);
	if (!seen) return item;

	seen.$panel[item.get("mode") === "hug" ? "ac" : "rc"]("hug");
	seen.$items?.[item.get("dir") === "col" ? "ac" : "rc"]("v");
	if (seen.$body) paint(item, seen.$body);
	return item;
}

/* Which way a leaf's body lays its own content out. One class, swapped — display.css says
   what each one means, so nothing here decides a layout. */
export function show(item, $body){
	const mode = item.get("display");
	return $body.rc("panel-d-block panel-d-flex panel-d-grid").ac("panel-d-" + mode);
}

/* One panel's own DOM, never the tree — repaint, then `set()`, which only saves. */
function paint(item, $body){
	place($body, item.get("align"));
	show(item, $body);

	const known = vocab(item)[item.get("template")];
	// ⚠ A chosen name this vocabulary lacks draws NOTHING (two writers: the T menu, generate.js).
	if (!known && item.data.template) console.warn(`panel: no template named "${item.data.template}" — its body stays blank.`);

	// panel(fn)'s own content, until somebody picks from T — an explicit choice wins.
	const template = known ?? { draw(){} };
	const draw = item.data.template ? template.draw : item.draw ?? template.draw;

	$body.empty(() => draw($body, item));
}

/* The T menu picked a name. `random` is a verb, not a template — random.js knows what it
   means, this file knows which vocabulary it draws from. */
const roll = (item, $body, name) => {
	if (name !== "random"){
		item.set("template", name);
		return paint(item, $body);
	}

	// ⚠ One redraw for the whole roll: `scatter()` adds up to twelve panels, and every
	// `add` would otherwise rebuild the workspace and refetch every lazy template with it.
	drawing = true;
	scatter(item, vocab(item));
	drawing = false;

	if (item.leaf()) return paint(item, $body);
	item.emit("add");                     // the one announcement the suppressed adds owe
};

export { panel, Panel, scatter };
