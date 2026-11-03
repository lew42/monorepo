import View, { div, p, pre, code, span, a, button, icon, is } from "../../core/View/View.js";
import { source, dedent } from "../../util/source/source.js";
import { markup } from "../../util/markup/markup.js";
import { stage } from "./stage.js";

import "../../core/Page/Page.class.js";

View.stylesheet(import.meta, "demo.css");

// history and reasons: doc/demo-notes.md

/**
 * demo — show the code, run it, and let the reader push it around. One box.
 */
export default function demo(...args){
	const i = args.findIndex(is.fn);

	if (i === -1)
		return div.c("demo demo-error", "demo() needs a function");

	const fn    = args[i];
	const opts  = args.find(is.pojo) ?? {};
	const label = args.slice(0, i).filter(is.str).join(" ");
	const note  = args.slice(i + 1).filter(is.str).join(" ");

	return div.c("demo wide", $demo => {
		let $html;

		const $bar = div.c("demo-bar");

		div.c("demo-panes", () => {
			pre.c("demo-code", () => source_code(source(fn)));
			$html = pre.c("demo-html");
		});

		const { $render } = stage(fn, "checkered");

		if (note) caption(note);

		let $toggle;

		const html = on => {
			$demo[on ? "ac" : "rc"]("show-html");
			$toggle[on ? "ac" : "rc"]("on");
			if (on) $html.empty(() => source_code(markup($render.el), "html"));
		};

		$bar.append(() => {
			if (label) span.c("demo-label", label);

			div.c("demo-spacer");

			$toggle = btn("<>", "The HTML this built", () => html(!$demo.hc("show-html")));

			if (opts.full)
				a.c("demo-btn", () => icon("open_in_full"))
					.attr("title", "Open full size").href(opts.full.url + "full/");
		});

		if (opts.html) queueMicrotask(() => html(true));
	});
}

/**
 * demo.stage(fn) — the stage on its own with resizable box and width readout.
 */
demo.stage = (fn, steer) => {
	const { $stage, $render } = stage(fn);

	steer?.($render);

	return $stage.ac("wide");
};

/**
 * source_block(label, body, file) — the code surface on the site.
 */
export function source_block(label, body, file){
	return div.c("demo-source", $source => {
		div.c("demo-source-head", () => {
			span(label);
			// ⚠ file may be this.file off a Page; a string is a path, else it's a method or nothing
			if (is.str(file)) file_link(file);
			copy_btn($source);
		});

		// ⚠ Nothing RETURNED from callback; append() would append box to itself
		div.c("demo-source-body", $body => { body($body); });
	});
}

/**
 * demo.source(fn) — the code, open, under a render.
 */
demo.source = (src, label = "Source", file) =>
	source_block(label, () => source_code(is.fn(src) ? source(src) : src), file);

demo.source.file = (meta, url, label = url) =>
	source_block(label, $body => { $body.append(source_file(meta, url)); });

// ⚠ Reads rendered <pre> at click time, not the function; can't drift from what's visible
const copy_btn = $source => btn(() => icon("content_copy"), "Copy the source", function(){
	navigator.clipboard.writeText($source.el.querySelector("pre")?.textContent ?? "");

	this.empty(() => icon("check")).ac("on");
	setTimeout(() => this.empty(() => icon("content_copy")).rc("on"), 1400);
}).ac("demo-copy");

// ⚠ target is load-bearing: Router ignores links with target, this is a real file not a route
const file_link = url => a.c("demo-file", url.split("/").at(-1))
	.href(url).attr("target", "_blank").attr("title", "The whole file");

function btn(content, title, fn){
	return button.c("demo-btn", content).attr("title", title).click(fn);
}

// Soft dependency: if ext/markdown loaded, it patched View.prototype.md; otherwise use backticks
function caption(text){
	return div.c("demo-note", () => {
		const view = p.c("demo-note-text");
		// ⚠ TWO elements not one; inside .demo caption is last STRIP (tinted, full-width) but text stays on measure
		view.md ? view.md(text) : view.backtick_append(text);
	});
}

// Soft dependency: if ext/highlight loaded the source is highlighted, else plain code block
function source_code(src, lang = "js"){
	return code[lang] ? code[lang](src) : code(src);
}

// ⚠ capture: false and nothing built after await; failures land in box as text not rejections
function source_file(meta, url){
	if (code.file)
		return code.file(meta, url);

	const $pre = new View({ tag: "pre", capture: false });

	return fetch(new URL(url, meta.url))
		.then(resp => resp.ok ? resp.text() : `Error loading ${url}: ${resp.status}`, error => error.message)
		.then(text => $pre.text(text.replace(/\s+$/, "")));
}

export { source, dedent };

export { btn, caption, source_code, source_file };

export { demo };
