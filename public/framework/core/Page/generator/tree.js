// history and reasons: doc/generator-tree-notes.md

import { Page, div, span, a, icon, code, md } from "/app.js";
import { WIDTHS, INPLACE } from "./gen.js";
import { parse, read, serialize } from "./spec.js";
import { kind, width, tune, shape } from "./controls.js";
import { fill, peek, title_for, empty } from "./fill.js";
import { module, content_line, width_line } from "./export.js";

export const inplace = page => INPLACE.includes(page?.block);

export function tree(text, hash, host){ return nodes(parse(text), hash, host); }

function nodes(list, hash, host, up, seed = 1, path = []){
	const seen = {}, taken = new Set();

	return list.map((node, at) => {
		const line = read(node.line);
		const block = line.block;
		const n = seen[block] = (seen[block] ?? 0) + 1;

		const inline = INPLACE.includes(up);
		const width = inline ? "" : (WIDTHS.includes(line.width) ? line.width : "");

		const key = (Math.imul(seed, 31) + at * 131 + node.kids.length) >>> 0;

		return {
			name: n > 1 ? `${block}-${n}` : block,
			title: title_for(key, taken),
			block, width, key, inline,

			at: [...path, at],
			opt: line.opt,

			children: nodes(node.kids, hash, host, block, key, [...path, at]),

			// ⚠ The host's crumb strip draws `link()`. Without the seed a crumb click
			//   lands on a url that reloads into a DIFFERENT tree.
			link(text){ return a.c("page-link", text ?? this.title).href(this.url + hash); },

			column(host){ return column(this, host, hash); },
			container,

			route(name){ return name === "code" ? code_child(node, hash, host) : null; },
		};
	});
}

// ⚠ A plain function, not an arrow: `this` is whichever Page it is attached to.
function container(){
	if (inplace(this.parent) && this.parent.$panel) return this.parent.$panel;

	for (let page = this.parent; page; page = page.parent)
		if (page.$pages && !inplace(page.parent)) return page.$pages;

	return Page.prototype.container.call(this);
}

function code_child(node, hash, host){
	return {
		title: "Code",
		label: "Code",
		icon: "code",
		width: "large",

		link(text){ return a.c("page-link", text ?? this.title).href(this.url + hash); },
		container,

		column(){
			const page = this.parent;
			const calls = host.calls.get(JSON.stringify(page.at)) ?? [];

			return div.c("page-gen page-gen-code page-column-body page-column-large", () => {
				div.c("page-column-head", () => {
					span.c("page-column-title", "Code");
					a.c("page-column-close", () => icon("close")).href(page.url + hash);
				});

				div.c("page-column-prose flow", () => {
					md("**The spec** — this page's own line in the tree:");
					code(serialize([node]));

					md("**The `page.js` `export.js` would write** for it, right now:");
					code.js(module(page));

					md(calls.length
						? "**As its controls are clicked**, the matching line is appended here:"
						: "Switch this page's kind, width, or (on a wall/list) its arrangement, then reopen this tab — each click appends the line it corresponds to.");
					if (calls.length) code.js(calls.join("\n"));
				});
			});
		},
	};
}

export function items(page, hash){
	return page.children.forEach((child, name) => {
		const nav = page.nav_for(name);

		a.c("page-gen-item").href(nav.url + hash).append(() => {
			span.c("page-gen-label", nav.label);
			if (page.block === "list" || page.block === "wall") peek(child?.key ?? 1);
			else if (child?.children.size) icon("chevron_right");
		});
	});
}

export function column(page, host, hash){
	const inline = page.inline;
	const wall = page.block === "wall" || page.block === "list";

	return div.c("page-gen page-gen-" + page.block, () => {

		div.c("page-column-head", () => {
			span.c("page-column-title", page.title);
			div.c("page-gen-picks", () => {
				kind(page, host);
				if (!inline) width(page, host);
			});

			a.c("page-gen-code-link").href(page.url + "code/" + hash).attr("title", "code for this page")
				.append(() => icon("code"));

			// ⚠ Not on an in-place child: it has no column of its own to close, and the
			//   `×` would close the tab set it is inside.
			if (page !== host && !inline) a.c("page-column-close", () => icon("close")).href(page.parent.url + hash);
		});

		if (wall) tune(page, host);

		if (inplace(page)) panel(page, hash);
		else {
			if (page.children.size || page.block !== "prose") nav(page, hash, wall);

			// ⚠ An inbox draws NO content of its own: its rows already are the page, and a
			//   run of grey bars under the last message read as a broken column.
			if (page.block !== "list" || !page.children.size) fill(page.key, page.block === "prose");
		}
	})
		/* ⚠ `page-column-body` is what core SIZES — a 40em cap, its own scrollbar, a rule
		     down its right edge, a snap point in the row. An in-place child is none of
		     those: it is content inside somebody else's column, so it wears its own class
		     and takes the panel's width. Its width word was dropped upstream for the same
		     reason, so nothing here can contradict it. */
		.ac(inline ? "page-gen-inline" : "page-column-body")
		.ac(!inline && page.width && "page-column-" + page.width);
}

function nav(page, hash, wall){
	const $nav = div.c("page-gen-nav", () => page.children.size ? items(page, hash) : empty(page.block));

	return wall ? shape($nav, page.opt) : $nav;
}

function panel(page, hash){
	div.c("page-gen-nav", () => page.children.size ? items(page, hash) : empty(page.block));

	page.$panel = div.c("page-gen-panel", () => fill(page.key, false));
}

export default tree;
