import View, { div, span, icon } from "/framework/core/View/View.js";
import Item from "/framework/core/Item/Item.js";
import FileSaver from "/framework/ext/Saver/FileSaver.js";
import LocalStorageSaver from "/framework/ext/Saver/LocalStorageSaver.js";
import layout from "/framework/ext/layout/layout.js";
import { pick, menu, btn } from "/framework/ext/layout/controls.js";
import Panel from "./Panel.js";
import templates from "./templates.js";
import { PanelDrag, grip } from "./PanelDrag.js";

/* css: .panel-workspace, .panel, .panel-bar, .panel-body, .panel-items,
   .panel-pop, .panel-tag — plus `.layout-bar` and `.drag-placeholder`, whose modules
   are imported above, and `.section-band`, which reaches a panel through
   templates.js's lazy import. `.panel-grip` is PanelDrag.js's. Design record: readme.md. */
View.stylesheet(import.meta, "panel.css");

const TONES = ["surface", "wash", "prim", "dark"];
const ALIGN = ["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"];
const PLACE = { t: "start", c: "center", b: "end", l: "start", r: "end" };

// ⚠ THE line that chooses where the workspace lives. Off localhost there is no dev
// socket, so FileSaver warns once and writes nothing — localStorage genuinely persists.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
export const saver = dev ? new FileSaver({ path: "/data/panels.json" }) : new LocalStorageSaver({ key: "panels" });

/* One managed leaf: a name from the T vocabulary, or content the call site draws.
   No saver, so save() resolves false and nothing a visitor picks survives a reload. */
export default function panel(seed){
	const made = typeof seed === "string" ? new Panel({ data: { template: seed } }) : new Panel({ draw: seed });
	return mount(made, div.c("panel-workspace flex"));
}

/* The persisted workspace. ⚠ The box is placed NOW and filled in a callback — a
   factory call after the await appends wherever the captor has since drifted. */
export function workspace(options = {}){
	const { saver: store = saver, templates: vocabulary, seed = scatter } = options;
	const $root = div.c("panel-workspace flex");

	// A brand new document is a roll, written straight away — so the first thing a
	// reader sees is also the thing that comes back.
	Item.open(store).then(loaded => {
		const fresh = !(loaded instanceof Panel);
		const root = fresh ? new Panel({ saver: store }) : loaded;

		// A workspace may bring its own vocabulary — ext/editor's regions close over an
		// editor, so its T menu is those regions and the global set never sees them.
		root.templates = vocabulary;
		if (fresh) seed(root);

		mount(root, $root);
		if (fresh) root.save();
	});

	return $root;
}

/* The registry lives on the ROOT panel, so every leaf reads the one its own document
   was opened with — and a workspace holding regions rather than content is offered
   neither `random`, which would give an editor two canvases, nor ext/layout's bar,
   which floats over a corner its regions are already using for controls of their own. */
const vocab = item => item.root().templates ?? templates;
const content = item => vocab(item) === templates;
const offer = item => content(item) ? ["random", ...Object.keys(templates)] : Object.keys(vocab(item));

/* One listener at the root, because Item events bubble. ⚠ Only STRUCTURE redraws: a
   `change` must not, or a chip click replaces the element its own control is holding. */
function mount(root, $root){
	let drawing;

	const draw = () => {
		if (drawing) return;                    // resolve() mutates; its adds must not re-enter
		drawing = true;
		resolve(root);
		drawing = false;
		$root.empty(() => { view(root); });     // block body: a returned View is re-appended
	};

	["change", "add", "remove"].forEach(event => root.on(event, () => root.save()));
	["add", "remove"].forEach(event => root.on(event, draw));

	draw();
	return $root;
}

function view(item){
	let $bar, $grip, $body, $items;
	const dir = item.get("dir") === "col" ? "col" : "row";

	const $panel = div.c("panel flex v", () => {
		$bar = div.c("panel-bar flex v-center wrap gap", () => {
			if (item.parent) $grip = span(() => { icon("drag_indicator"); });
		}).style("--gap", "0.25em");

		if (item.leaf()){
			$body = div.c("panel-body");
			if (content(item)) layout.bar($body);   // Mike's UX test: ext/layout, per panel body
		} else {
			// ⚠ A block body: `each()` returns the List, and append_fn appends a returned
			// value — a bare `[object Object]` text node in every split.
			$items = div.c("panel-items flex").ac(dir === "col" && "v")
				.append(() => { item.items.each((kid, i) => { if (i) grip(); view(kid); }); });
		}
	}).style("--panel-grow", item.get("grow")).ac(item.get("mode") === "hug" && "hug");

	$bar.append(() => { controls(item, $panel, $body); });
	if ($body) paint(item, $body);

	new PanelDrag({ view: $panel, handle: $grip ?? false, $items, $body, item });
	return $panel;
}

function controls(item, $panel, $body){
	btn(() => icon("vertical_split"), () => item.divide("row")).attr("title", "Split into columns");
	btn(() => icon("horizontal_split"), () => item.divide("col")).attr("title", "Split into rows");

	if ($body){
		popover("grid_view", "Alignment", () =>
			pick(ALIGN, code => { item.set("align", code); place($body, code); }, item.get("align")));

		span.c("panel-tag", "T");
		menu(offer(item), name => roll(item, $body, name), item.get("template"));
		menu(TONES, tone => { item.set("tone", tone); paint(item, $body); }, item.get("tone"));

		btn(() => icon("aspect_ratio"), () => {
			const mode = item.get("mode") === "hug" ? "fill" : "hug";
			$panel[mode === "hug" ? "ac" : "rc"]("hug");
			item.set("mode", mode);
		}).attr("title", "Fill or hug");
	}

	div.c("flex-1");
	if (item.parent?.items.length > 1) btn(() => icon("close"), () => item.close()).attr("title", "Close");
}

// Absolutely positioned, so its slot in the bar costs nothing and DOM order is free.
function popover(name, title, fill){
	const $pop = div.c("panel-pop");

	btn(() => icon(name), () => $pop.tc("on")).attr("title", title);
	return $pop.append(fill);
}

const place = ($body, code = "cc") =>
	$body.style({ "--panel-y": PLACE[code[0]] ?? "center", "--panel-x": PLACE[code[1]] ?? "center" });

/* One panel's own DOM, never the tree — repaint, then `set()`, which only saves. */
function paint(item, $body){
	place($body, item.get("align"));

	// panel(fn)'s own content, until somebody picks from T — an explicit choice wins.
	const template = vocab(item)[item.get("template")] ?? { draw(){} };
	const draw = item.data.template ? template.draw : item.draw ?? template.draw;

	$body.empty(() => draw($body, item));
}

const roll = (item, $body, name) => {
	if (name !== "random"){
		item.set("template", name);
		return paint(item, $body);
	}

	scatter(item);                       // a split re-draws itself through `add`
	if (item.leaf()) paint(item, $body);
};

const any = list => list[Math.floor(Math.random() * list.length)];

/* "random" is not a template — it is a roll, and it COMMITS what it rolled, so a
   reload comes back to the same arrangement. Bounded: two levels, three ways. */
export function scatter(item, depth = 0){
	[...item.items].forEach(kid => item.remove(kid));

	if (depth < 2 && Math.random() < 0.6 - depth * 0.25){
		item.set("dir", any(["row", "col"]));
		for (let n = 2 + Math.floor(Math.random() * 2); n--; ) item.add(new Panel());
		item.items.each(kid => scatter(kid, depth + 1));
		return item;
	}

	item.set("template", any(Object.keys(vocab(item))));
	item.set("tone", any(TONES));
	return item;
}

// Every leaf still saying "random" is rolled BEFORE anything is drawn.
const resolve = root => root.walk(item => {
	if (!item.draw && item.leaf() && item.get("template") === "random") scatter(item);
});

export { panel, Panel };
