import { div, pre, h2 } from "/app.js";

// a labelled code block — the label sits on the box, so code and caption
// can never drift apart
export function code(source, label){
	return div.c("code", () => {
		if (label) div.c("code-label", label);
		pre(source.trim());
	});
}

export function section(title){ return h2.c("section", title); }
