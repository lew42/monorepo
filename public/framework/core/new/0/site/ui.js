import { div, pre, h2, button } from "/app.js";

// a labelled code block — the label sits on the box, so code and caption
// can never drift apart
export function code(source, label){
	return div.c("code", () => {
		if (label) div.c("code-label", label);
		pre(source.trim());
	});
}

export function section(title){ return h2.c("section", title); }

// [text, page] pairs — the point of these is that they call page.activate()
// directly, with no Router and no reload
export function buttons(...pairs){
	return div.c("buttons", () => pairs.forEach(([text, page]) =>
		button(text).click(() => page.activate())));
}
