import { div, pre, h2, p, span } from "/app.js";

// a labelled code block — the label sits on the box, so code and caption
// can never drift apart
export function code(source, label){
	return div.c("code", () => {
		if (label) div.c("code-label", label);
		pre(source.trim());
	});
}

export function section(title, ...rest){
	h2.c("section", title);
	return rest.length ? p(...rest) : null;
}

// a step in a numbered trace
export function step(n, title, source){
	return div.c("step", () => {
		div.c("step-head", () => {
			div.c("step-n", n);
			div.c("step-title", title);
		});
		if (source) pre(source.trim());
	});
}

// "do this, watch the console" — the site logs every step, so the instruction
// and the thing it produces are one click apart
export function watch(...instructions){
	return div.c("watch", () => {
		div.c("watch-head", "Try it — console open");
		instructions.forEach(text => div.c("watch-line", text));
	});
}

// who calls what. three columns, because "what it does" without "who calls it"
// is exactly the thing that's hard to reconstruct later.
export function api(rows){
	return div.c("api", () => {
		div.c("api-row api-head", () => {
			div.c("api-cell", "method");
			div.c("api-cell", "does");
			div.c("api-cell", "called by");
		});

		rows.forEach(([method, does, caller]) => div.c("api-row", () => {
			div.c("api-cell", () => span.c("api-method", method));
			div.c("api-cell", does);
			div.c("api-cell", () => span.c("api-caller", caller));
		}));
	});
}
