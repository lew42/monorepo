import { div, a, pre, el, span } from "/app.js";
import { find } from "./nav.js";

/*
 * Docs components. The only interesting one is demo():
 * it runs the function you give it AND prints that same function's source, so a
 * documented example can never drift from what the page actually renders.
 */

export function demo(fn) {
	return div.c("demo", () => {
		div.c("demo-preview", fn);
		pre.c("demo-code", source(fn));
	});
}

// same block, but the code is not executed (for things that would be noisy to run)
export function snippet(text) {
	return pre.c("demo-code snippet", text.trim());
}

export function note(...content) {
	return div.c("note", ...content);
}

// a reference list: { ".ac(cls)": "adds a class", ... }
export function api(rows) {
	return div.c("api", () => {
		for (const signature in rows) {
			div.c("api-row", () => {
				el.c("code", "api-sig", signature);
				span.c("api-doc").backticks(rows[signature]);
			});
		}
	});
}

// link cards built from nav.js, so titles and blurbs live in exactly one place
export function cards(...paths) {
	return div.c("cards", () => {
		for (const path of paths) {
			const page = find(path);
			a.c("card", () => {
				div.c("card-title", page.title);
				div.c("card-blurb", page.blurb);
			}).href(path);
		}
	});
}

export function source(fn) {
	const text = fn.toString();
	const open = text.indexOf("{");
	const close = text.lastIndexOf("}");
	return dedent(text.slice(open + 1, close));
}

function dedent(text) {
	const lines = text.replace(/\t/g, "    ").split("\n");

	while (lines.length && !lines[0].trim()) lines.shift();
	while (lines.length && !lines.at(-1).trim()) lines.pop();

	const body = lines.filter(line => line.trim());
	const indent = body.length ? Math.min(...body.map(line => line.match(/^ */)[0].length)) : 0;

	return lines.map(line => line.slice(indent)).join("\n");
}
