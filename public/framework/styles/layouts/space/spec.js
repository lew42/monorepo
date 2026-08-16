import { div, span } from "/app.js";
import { site } from "../web.js";

/**
 * A layout, as text. Indentation is nesting; a line is
 *
 *     <class tokens> > <part> [count]
 *
 * and either half may be empty. `render(text)` returns the live view — the same
 * `site` object every layout in this directory draws, arranged by the string.
 *
 *     full fill flex v
 *       > topbar
 *       flex gap wrap flex-1 scroll
 *         basis pad --basis:15em > menu
 *         pad flow flex-1 > sections 5
 *         basis pad --basis:13em stick > toc
 *       > footer
 *
 * A token holding a `:` is a declaration rather than a class (`_` reads as a
 * space), so per-layout state stays inline exactly as the hand-written pages
 * keep it. Design record: readme.md.
 */

/* ⚠ `notes` is the one RAGGED part, and the only reason it is in the list: every
   other part here is uniform by design, and a `masonry` wall of uniform children is
   a grid with extra steps. Without it the format could not reach that shape at all. */
export const PARTS = "topbar toolbar brand hero menu toc sections cards rows tiles notes footer".split(" ");

/* Three declaration sets that fail silently, as one word each. Expanded here rather
   than added to framework.css: a spec word is this format's vocabulary, not the
   site's — promoting any of them is a proposal, and readme.md holds it open.

   `scroll` and `stick` are the layouts readme's own two traps. `fluid` is the third
   and it has no utility at all: `.flex-1` is `flex: 1 1 0%`, so a fluid track in a
   WRAPPING row shrinks to nothing instead of pushing its neighbours onto the next
   line — measured at 390, where the article rendered one letter wide. Every
   hand-written layout in this rail writes `flex: 1 1 24em` inline for that reason. */
const WORDS = {
	scroll: { minHeight: "0", overflowY: "auto" },
	stick: { position: "sticky", top: "0", alignSelf: "flex-start" },
	fluid: { flex: "1 1 24em", minWidth: "0" },

	/* A TRANSLUCENT ground, and the translucency is the whole point: two boxes deep
	   composites visibly darker than one, so a random NESTING can be read at a glance.
	   Nothing else can show depth — an opaque ground makes ten levels look like one.

	   `--tone` is a TOKEN REFERENCE and it INHERITS, which is what makes it a scheme
	   rather than a rainbow: a section declares one, and its whole subtree deepens
	   that one colour. It was a random `oklch` hue until 2026-08-16, which meant every
	   roll invented colours the site does not own; the vocabulary is `model.js`'s
	   TONES — `--ink`, `--subtle`, `--prim` — so a retheme moves every generated
	   layout with it.

	   ⚠ It cannot be `wash`/`tint`/`surface`. That three-step ladder is OPAQUE by
	     decision (`styles/layers/theme/lew42/lew42.css`), so nesting it cannot
	     composite and ten levels look like one. A mix at 9% needs no mode branch
	     either — `--ink` is `light-dark()`, so the stack lightens in dark mode and
	     darkens in light, which is the ladder's own rule. */
	tone: { background: "color-mix(in oklab, var(--tone, var(--ink)) 9%, transparent)" },
};

export function render(text){
	const [root] = parse(text);

	return root ? box(root, "page ") : div.c("page default");
}

export function parse(text){
	const top = { kids: [], depth: -1 };
	const stack = [top];

	for (const raw of text.split("\n")){
		if (!raw.trim() || raw.trimStart().startsWith("#")) continue;

		const node = { line: raw.trim(), kids: [], depth: raw.search(/\S/) };

		while (stack.at(-1).depth >= node.depth) stack.pop();
		stack.at(-1).kids.push(node);
		stack.push(node);
	}

	return top.kids;
}

function box(node, prefix = ""){
	const [head, tail] = node.line.split(">");
	const { classes, style } = tokens(head);

	// a line that is only a part carries no box of its own
	if (!prefix && !classes.length && !node.kids.length && !Object.keys(style).length) return part(tail);

	return div.c(prefix + classes.join(" "), () => {
		if (tail) part(tail);
		node.kids.forEach(kid => box(kid));
	}).style(style).ac(prefix && "default");
}

function tokens(head = ""){
	const classes = [], style = {};

	head.trim().split(/\s+/).filter(Boolean).forEach(token => {
		if (WORDS[token]) return Object.assign(style, WORDS[token]);

		const colon = token.indexOf(":");

		if (colon > 0) style[token.slice(0, colon)] = token.slice(colon + 1).replace(/_/g, " ");
		else classes.push(token);
	});

	return { classes, style };
}

function part(tail){
	const [name, count] = tail.trim().split(/\s+/);

	return PARTS.includes(name) ? site[name](count && +count) : span.c("muted", "?" + name);
}

export default render;
