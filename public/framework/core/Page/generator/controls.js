import { div, span, select, option, button } from "/app.js";
import { BLOCKS, WIDTHS } from "./gen.js";
import { parse } from "./spec.js";

// THE CONTROLS — edit the SPEC through host.swap(); see doc/generator-controls-notes.md
function unknown_words(nodes, out){
	for (const node of nodes){
		const [word] = node.line.trim().split(/\s+/);
		if (!BLOCKS.includes(word)) out.add(word);
		unknown_words(node.kids, out);
	}
	return out;
}

// unknown(): reads parse tree for unrecognised first words; see doc/generator-controls-notes.md
export function unknown(text){ return [...unknown_words(parse(text), new Set())]; }

// ⚠ `.el.value` written AFTER options exist; set before then silently chooses wrong
export function menu(cls, words, on, choose){
	const $menu = select.c("page-gen-menu auto " + cls, () => words.forEach(word => option(word)))
		.on("change", function(){ choose(this.el.value); });

	$menu.el.value = on;
	return $menu;
}

// One of a set, as chips
export function chips(tag, words, on, choose){
	return div.c("page-gen-set", () => {
		span.c("page-gen-tag", tag);

		const $chips = words.map(word => button.c("page-gen-pick", word).click(function(){
			$chips.forEach($chip => $chip.rc("on"));
			this.ac("on");
			choose(word);
		}));

		$chips[words.indexOf(on)]?.ac("on");
	});
}


/* ════ THE COLUMN HEAD ═══════════════════════════════════════════════════════════ */

// kind: THE KIND SWITCH — switch any page to any other page
export function kind(page, host){
	const words = page.children.size ? BLOCKS.filter(word => word !== "prose") : BLOCKS;

	return menu("page-gen-kind", words, page.block, word => host.swap(page.at, { block: word }));
}

// width: NOT offered to in-place child (panel + track in row); see doc/generator-controls-notes.md
export function width(page, host){
	return menu("page-gen-width", ["default", ...WIDTHS], page.width || "default",
		word => host.swap(page.at, { width: word === "default" ? "" : word }));
}


/* ════ GRID AND FLEX — for the two words whose children are a wall of links ═══════ */

// snug=word's own gap; flush=cut word (--gap: 0); see doc/generator-controls-notes.md
const GAPS = { snug: "", flush: "0px", airy: "0.9em" };

export function tune(page, host){
	const opt = page.opt ?? {};
	const set = key => value => host.swap(page.at, { opt: { [key]: value } });

	return div.c("page-gen-tune", () => {
		chips("flow", ["grid", "flex"], opt.flow === "flex" ? "flex" : "grid",
			word => set("flow")(word === "grid" ? "" : word));

		// auto=track FLOOR (header's cell control, or --column's 14em); number=exact track count
		chips("cols", ["auto", "1", "2", "3"], opt.cols || "auto",
			word => set("cols")(word === "auto" ? "" : word));

		chips("gap", Object.keys(GAPS),
			Object.keys(GAPS).find(word => GAPS[word] === (opt.gap ?? "")) ?? "snug",
			word => set("gap")(GAPS[word]));
	});
}

// The nav's arrangement in framework words (.grid.auto, .flex.auto, .gap)
export function shape($nav, opt = {}){
	$nav.ac(opt.flow === "flex" ? "flex auto gap" : "grid auto gap");

	if (opt.gap) $nav.style("--gap", length(opt.gap));
	if (opt.cols) $nav.style("--column", track(opt.cols));

	return $nav;
}

// ⚠ Bare number needs unit — gap=0 alone in calc() is invalid; see doc/generator-controls-notes.md
const length = value => /^-?[\d.]+$/.test(value) ? value + "px" : value;

// cols=3 is three tracks exactly; cols=9em is a floor (--column everywhere else)
const track = cols => !/^\d+$/.test(cols) ? cols
	: +cols < 2 ? "100%"
	: `calc((100% - ${+cols - 1} * var(--gap, 0px)) / ${cols})`;


/* ════ THE GENERATOR'S OWN HEADER — global, for the whole generated tree ══════════ */

// ⚠ fill uncaps 40em ceiling (different from core's fill width word); see doc/generator-controls-notes.md
export const SIZES = {
	small:   { "--page-column-min": "14em", "--page-column-max": "22em", "--gen-list": "16em" },
	default: { "--page-column-min": "", "--page-column-max": "", "--gen-list": "" },
	large:   { "--page-column-min": "26em", "--page-column-max": "64em", "--gen-list": "26em" },
	hug:     {},
	fill:    { "--page-column-min": "16em", "--page-column-max": "none", "--gen-list": "" },
};

// LOOKS: the COSTUME — three looks deep for columns tree restyling (finder is shipped default)
export const LOOKS = ["finder", "cards", "ink"];

// THE DENSITY: one-token indirection (--gen-gap); per-column gap chip still wins
export function globals(host){
	return div.c("page-gen-globals", () => {
		chips("size", Object.keys(SIZES), host.sized, word => host.size(word));
		chips("gap", Object.keys(GAPS), host.gapped, word => host.gap(GAPS[word], word));
		chips("look", LOOKS, host.looked, word => host.look(word));
	});
}

export { GAPS, track };
