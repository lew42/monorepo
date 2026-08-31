import { div, span, select, option, button } from "/app.js";
import { BLOCKS, WIDTHS } from "./gen.js";
import { parse } from "./spec.js";

/**
 * THE CONTROLS — and every one of them edits the SPEC, through `host.swap()`.
 *
 * Nothing here writes a class onto a live column. A switch rewrites one line of the
 * spec text, the generator regrows the tree from it, and the url carries that text —
 * so a switched state is a link you can send, a reload lands on it, and the next
 * switch starts from what you can see in the box. One state, one place.
 *
 * The three groups, and where each one's behaviour actually lives:
 *
 *   kind / width   the two words `gen.js` already has — a menu per column head
 *   flow / cols / gap   `.grid.auto` / `.flex.auto` / `.gap` and the tokens they read,
 *                       straight out of framework.css. No generator CSS behind them.
 *   size / cell    the generator's own header: core's `--page-column-*` and the
 *                  framework's `--column`, declared on the columns HOST so every
 *                  column that names no width of its own takes them.
 *
 * ⚠ A control never rerolls. `MODEL` and the seed are untouched by everything here;
 *   the seed drew the first draft and the text is the state from then on.
 */

/* ════ THE SPEC BOX'S OWN FEEDBACK — reads the parse tree, changes nothing in it ═══
 *
 * `read()` (spec.js) already turns an unrecognised first word into `prose` — the leaf
 * — so a typo drew a page instead of throwing. That is the right call for the DRAW
 * path (a typo should never blank the tree) and the wrong one for the READER: nothing
 * ever said which word it did not know.
 *
 * ⚠ This walks `parse()`'s tree a SECOND time, for the same reason `rolls.js` re-parses
 *   rather than editing `read()`: the control layer may look, but the draw path — spec.js,
 *   gen.js, rules.js — stays exactly what it was. One more `parse()` on a spec that is at
 *   most a few dozen lines is nothing to guard against.
 */
function unknown_words(nodes, out){
	for (const node of nodes){
		const [word] = node.line.trim().split(/\s+/);
		if (!BLOCKS.includes(word)) out.add(word);
		unknown_words(node.kids, out);
	}
	return out;
}

// Every first word in `text` that is not one of the five block words — in the order
// first seen, deduplicated, so "widget" typed three times reads once.
export function unknown(text){ return [...unknown_words(parse(text), new Set())]; }

/* One of a set, as a menu — ext/layout's `menu()` shape, said here rather than
   imported: `core/` must not depend on `ext/`, and a select is five lines.
   ⚠ `.el.value` is written AFTER the options exist. An `option` marked selected while
     the list is still building is silently the wrong one (ext/layout learnt this one). */
export function menu(cls, words, on, choose){
	const $menu = select.c("page-gen-menu auto " + cls, () => words.forEach(word => option(word)))
		.on("change", function(){ choose(this.el.value); });

	$menu.el.value = on;
	return $menu;
}

/* One of a set, as chips — for a set short enough that seeing every option at once
   beats hiding three of them behind a click. */
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

/* THE KIND SWITCH — switch any page to any other page, which is the ask. Four words
   where there are children and five where there are not: `prose` is the LEAF, and a
   page with children that claimed it would present none of them. */
export function kind(page, host){
	const words = page.children.size ? BLOCKS.filter(word => word !== "prose") : BLOCKS;

	return menu("page-gen-kind", words, page.block, word => host.swap(page.at, { block: word }));
}

/* The width word, on the same terms — and NOT offered to an in-place child: it lives
   in a panel, and a width word is a track in the row. `gen.js` refuses to draw one
   there and `tree.js` drops one from a typed spec; a menu here would be a third place
   that has to agree with the other two. */
export function width(page, host){
	return menu("page-gen-width", ["default", ...WIDTHS], page.width || "default",
		word => host.swap(page.at, { width: word === "default" ? "" : word }));
}


/* ════ GRID AND FLEX — for the two words whose children are a wall of links ═══════ */

/* `snug` is the word's own gap; `flush` is the cut word, as the number it always was
   (readme.md — `--gap: 0`, four lines of `new Page()`). */
const GAPS = { snug: "", flush: "0px", airy: "0.9em" };

export function tune(page, host){
	const opt = page.opt ?? {};
	const set = key => value => host.swap(page.at, { opt: { [key]: value } });

	return div.c("page-gen-tune", () => {
		chips("flow", ["grid", "flex"], opt.flow === "flex" ? "flex" : "grid",
			word => set("flow")(word === "grid" ? "" : word));

		// `auto` is a track FLOOR — the header's `cell` control, or `--column`'s own
		// 14em. A number is that many tracks exactly, whatever the column is worth.
		chips("cols", ["auto", "1", "2", "3"], opt.cols || "auto",
			word => set("cols")(word === "auto" ? "" : word));

		chips("gap", Object.keys(GAPS),
			Object.keys(GAPS).find(word => GAPS[word] === (opt.gap ?? "")) ?? "snug",
			word => set("gap")(GAPS[word]));
	});
}

/**
 * The nav's arrangement, in framework words and nothing else.
 *
 *   `.grid.auto`  repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))
 *   `.flex.auto`  flex: 1 1 calc(var(--column) * …)  + wrap
 *   `.gap`        gap: var(--gap, 1em)
 *
 * Both walls read the SAME two tokens, which is why one chip swaps between them and
 * nothing else has to change. The values are inline because they are only known at
 * roll time — the one thing an inline style is for.
 */
export function shape($nav, opt = {}){
	$nav.ac(opt.flow === "flex" ? "flex auto gap" : "grid auto gap");

	if (opt.gap) $nav.style("--gap", length(opt.gap));
	if (opt.cols) $nav.style("--column", track(opt.cols));

	return $nav;
}

/* ⚠ A bare number needs its unit, and this one cost a measurement. `gap=0` is a plain
   NUMBER in calc, so `100% - 1 * 0` is a percentage minus a number — invalid at
   computed-value time, which throws away the whole `--column`, which throws away
   `.flex.auto`'s `flex` shorthand. Three cards silently shrank to 62px, no error. */
const length = value => /^-?[\d.]+$/.test(value) ? value + "px" : value;

/* `cols=3` is three tracks exactly: the width left after the gaps, divided three ways
   — so `auto-fit` fits three and cannot fit a fourth. `cols=9em` is a floor, which is
   what `--column` means everywhere else on the site. Same token, both readings. */
const track = cols => !/^\d+$/.test(cols) ? cols
	: +cols < 2 ? "100%"
	: `calc((100% - ${+cols - 1} * var(--gap, 0px)) / ${cols})`;


/* ════ THE GENERATOR'S OWN HEADER — global, for the whole generated tree ══════════ */

/* Core's width words are per page; this is the DEFAULT every column that names none of
   them takes. Tokens on the host, so there is no specificity to win — exactly what
   `.page-column-small` does, one level up. `--gen-list` is the inbox's own width, which
   would otherwise be the one column that ignored the control.
   ⚠ `fill` uncaps: core's 40em ceiling is what leaves a 3440 screen mostly empty when
     two columns are open, and `max-width: none` spends the whole row on them. It predates
     and is NOT the same mechanism as core's own `fill` width word (doc/decisions.md,
     wave 5) — this one is a host-level default, that one a per-column class.
   ⚠ `hug` has no tokens yet (2026-08-29): core's `.page-column-hug` isn't written, and
     guessing its `--page-column-min/max` numbers would be a value to un-teach later. An
     empty entry is an honest no-op — it reads as `default` until the CSS lands. */
export const SIZES = {
	small:   { "--page-column-min": "14em", "--page-column-max": "22em", "--gen-list": "16em" },
	default: { "--page-column-min": "", "--page-column-max": "", "--gen-list": "" },
	large:   { "--page-column-min": "26em", "--page-column-max": "64em", "--gen-list": "26em" },
	hug:     {},
	fill:    { "--page-column-min": "16em", "--page-column-max": "none", "--gen-list": "" },
};

/* THE THIRD GLOBAL — the COSTUME. `/imagine/vary/colstyles/` asked whether a columns tree
   can be re-dressed without rearranging it and answered yes, three looks deep; this is that
   answer reached for from the one page that can put any tree under it.
   `finder` is the shipped default and has NO rule — the same call colstyles made: a look
   that is the default is the absence of one, and the word exists so the control can say so.
   ⚠ Not in the address, for the reason `size` and `gap` are not: `#7` has to keep meaning
     one TREE, and what it is wearing is not the tree. It rides in `store()` instead, which
     is the other half of that split (page.js). */
export const LOOKS = ["finder", "cards", "ink"];

/* The second global: the DENSITY of every wall and inbox in the tree, through the same
   one-token indirection as `--gen-list` — each word declares `--gap: var(--gen-gap, …)`,
   so the header can reach past a component default that inheritance alone would lose to.
   A per-column `gap` chip is written inline and still wins.
   ⚠ Two globals that were tried and are NOT here. A CELL SIZE measured as a no-op:
     `.grid.auto` is `auto-fit`, which collapses the empty tracks and stretches what is
     left, so three cards fill their column at 8em and at 20em alike. A COUNT was worse —
     the track is `(100% - gaps) / n`, and computed on the HOST that `var(--gap)` is the
     host's, not the nav's: `cols 2` measured as one column, `cols 3` as two. A count has
     to be computed where the gap is, which is what the per-column chips do. */
export function globals(host){
	return div.c("page-gen-globals", () => {
		chips("size", Object.keys(SIZES), host.sized, word => host.size(word));
		chips("gap", Object.keys(GAPS), host.gapped, word => host.gap(GAPS[word], word));
		chips("look", LOOKS, host.looked, word => host.look(word));
	});
}

export { GAPS, track };
