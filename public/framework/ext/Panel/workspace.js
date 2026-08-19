import View, { div, span } from "/framework/core/View/View.js";
import Item from "/framework/core/Item/Item.js";
import FileSaver from "/framework/ext/Saver/FileSaver.js";
import LocalStorageSaver from "/framework/ext/Saver/LocalStorageSaver.js";
import Panel from "./Panel.js";
import { PanelDrag } from "./PanelDrag.js";
import { grip } from "./grip.js";
import { toolbar, handle } from "./toolbar.js";
import { zoom_scrub } from "./tools.js";
import { edges } from "./split.js";
import { insert_bar } from "./insert.js";
import { sizing } from "./size.js";
import { scatter, resolve } from "./random.js";
import { vocab, tools, offer, standard } from "./vocab.js";
import { focus, focused, inspects, selection } from "./focus.js";
import { overlays, drain } from "./overlays.js";
import { views, paint, repaint, show, repaint_mirrors } from "./paint.js";
import { record } from "./flow.js";

/* The two doors, the redraw, and the recursive `view()`. Its four neighbours — `vocab.js`,
   `focus.js`, `overlays.js`, `paint.js` — are read by this file and never read it back;
   readme.md says what each one is for.

   css: .panel-workspace, .panel, .panel-body, .panel-items — plus `.drag-placeholder`, whose
   module is imported above, `.section-band`, which reaches a panel through templates.js's
   lazy import, and `.panel-controls`, a payload's claim that the body reserve `--panel-bar-h`
   for its top edge. `.panel-grip` is grip.css's, the bar is toolbar.css's. */
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
	const { saver: store = saver, templates: vocabulary, tools: overrides, seed = scatter, mode } = options;
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
		root.tools = overrides;
		// The ROOT's word, when a caller has one: `workspace({ mode: "document" })` opens a
		// document that has never said otherwise as a scrolling stack of sections (the
		// owner, 2026-08-19: "we want the main panel to default to this"). A word already
		// saved wins; a caller that passes none — ext/editor's five regions — keeps `fill`.
		if (mode) root.data.mode ??= mode;
		if (fresh) seed(root, vocab(root));

		mount(root, $root);
		if (fresh) root.save();
	});

	return $root;
}

/* One redraw per structural verb. ⚠ Module scope rather than mount's closure because `roll`
   needs it too, and one synchronous mutation window can never overlap another workspace's —
   nothing awaits between raising the flag and lowering it. */
let drawing;

/* One listener at the root, because Item events bubble. ⚠ Only STRUCTURE redraws: a
   `change` must not, or a chip click replaces the element its own control is holding. */
function mount(root, $root){
	const draw = () => {
		if (drawing) return;                    // resolve() mutates; its adds must not re-enter
		drawing = true;
		resolve(root, vocab(root));
		drawing = false;
		drain(root);                            // the PREVIOUS generation's observers, before it's gone
		$root.empty(() => { view(root); });     // block body: a returned View is re-appended
	};

	["change", "add", "remove"].forEach(event => root.on(event, () => root.save()));
	["add", "remove"].forEach(event => root.on(event, draw));

	root.on("change", () => repaint_mirrors(root));
	selection(root, $root);

	draw();

	// ⚠ AFTER the first draw, so the baseline frame is what a reader actually sees:
	// `resolve()` rolls every leaf still saying "random", and those adds are the seed
	// arriving, not a step somebody took. flow.js, doc/flow.md.
	record(root, $root);

	return $root;
}

function view(item){
	let $bar, $handle, $body, $items;
	const dir = item.get("dir") === "col" ? "col" : "row";
	const t = tools(item);

	const $panel = div.c("panel flex v", () => {
		$bar = div.c("panel-bar", () => { if (item.parent) $handle = handle(); });

		if (item.leaf()){
			// ⚠ Here, where the body is created — `paint()` empties it but never replaces it.
			$body = div.c("panel-body");
			overlays(item, $body);
		} else {
			// ⚠ A block body: `each()` returns the List, and append_fn appends a returned
			// value — a bare `[object Object]` text node in every split.
			$items = div.c("panel-items flex").ac(dir === "col" && "v")
				.append(() => { item.items.each((kid, i) => { if (i) grip(); view(kid); }); });

			// The `+` that rides the split's gaps — a sibling of the children, absolutely
			// positioned, so offering it never nudges the layout it offers to change.
			if (t.insert) $items.append(() => insert_bar(item, $items));
		}
	}).style("--panel-grow", item.get("grow"))
		.ac(item.id === item.root().focus && "focus")
		/* A panel's own bar or body, and nothing else: innermost wins without anyone
		   stopping an event, and ⚠ a GRIP is excluded — pointer capture retargets the
		   click at the end of a resize, and a drag between two panels was focusing the
		   split that holds them. */
		.click(e => {
			if (e.target.closest(".panel-bar, .panel-body")?.parentElement !== $panel.el) return;
			if (!inspects(item)) focus(item, $panel);
		});

	/* Sizing is real LAYOUT, not a tool — never gated by `tools(item)`, because a workspace
	   with every overlay off still has to know how wide its panels are. ⚠ It owns `.hug` too,
	   so that class has exactly one writer. */
	sizing(item, $panel);

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
			sow: standard(item) && (() => import("./generate.js").then(m => repaint(m.sow(item)))),
			// Handed in as a FACTORY, like `sow` — tools.js reads toolbar.js, so the bar
			// can only ever be given its tools, never import them.
			tool: $body && t.zoom ? () => zoom_scrub(item, $body) : undefined,
			// The bar picks the word; what it MEANS is a class paint.js owns.
			display: $body && (() => show(item, $body)),
			// ⚠ A copy keeps its OWN grow — `mirror()` shares content and look, never a
			// share of a row, or two duplicates would fight over one number.
			copy: $body && (() => item.divide(item.parent?.get("dir") ?? "row",
				new Panel({ data: { grow: item.get("grow") } }).mirror(item))),
		});
	});

	// ⚠ Out here, not in the builder above: `edges()` takes `$panel`, which the builder's
	// own callback runs too early to see — the const is assigned only once `div.c()` returns.
	if ($body && t.edges) $panel.append(() => edges(item, $panel));

	if ($body) paint(item, $body);

	views.set(item, { $panel, $body, $items });
	new PanelDrag({ view: $panel, handle: $handle ?? false, $items, $body, item });
	return $panel;
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

export { panel, Panel, scatter, vocab, tools, focused, repaint, show };
