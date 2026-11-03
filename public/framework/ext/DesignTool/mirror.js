import { View, div, p, h4, span, code } from "/app.js";
import { locate } from "./address.js";

View.stylesheet(import.meta, "DesignTool.css");

/* The offending element itself, twice, at its own size — broken on the left,
 * fixed on the right.
 *
 * The whole-page version answers "is it different"; at 0.5× on a 1280px screen
 * the difference is a few pixels somewhere. This answers the actual question:
 * *what exactly is wrong, and what exactly fixes it.*
 *
 * ⚠ Clones render as themselves only because they are same-origin: dropped into
 * this document they pick up the same stylesheets. A cross-origin page could not
 * do this at all. */
export default function mirror(issue, { url, width = 1280, root_path = "", root } = {}){
	return div.c("dt-mirror flex v gap").append($out => {
		$out.append(() => p(`Locating ${issue.sel}…`).ac("muted"));
		find(issue, { url, width, root_path, root }).then(
			pair => $out.empty(() => pair ? show(pair, issue) : missing(issue)),
			e => $out.empty(() => p(`Could not isolate it — ${e.message}`).ac("muted")),
		);
	});
}

/* ⚠ Resolved against the SAME root the analysis walked from, or a page-relative
 * path finds a real element at the wrong address. The dev rail measures the live
 * document and hands that element over; only a caller who has nothing but a url
 * — the audit page, reporting on a frame that is long gone — reloads and guesses
 * the root back from `root_path`. */
function find(issue, { url, width, root_path, root }){
	if (root) return Promise.resolve(pair(locate(root, issue.path), issue));

	return new Promise((resolve, reject) => {
		const el = document.createElement("iframe");
		el.setAttribute("data-layout-ignore", "");
		el.style.cssText = `position:fixed;left:-10000px;top:0;border:0;width:${width}px;height:900px`;
		el.src = url;

		el.onerror = () => done(reject, new Error(`could not load ${url}`));

		el.onload = () => setTimeout(() => {
			try {
				const doc = el.contentDocument;
				done(resolve, pair(locate(root_of(doc, root_path), issue.path), issue));
			} catch (e){ done(reject, e); }
		}, 400);

		document.body.append(el);
		function done(fn, value){ el.remove(); fn(value); }
	});
}

// ⚠ `||`, not `??` — an empty `root_path` means "unknown", and `""` is not nullish.
const root_of = (doc, path) => (path && locate(doc.documentElement, path)) || doc.querySelector(".app") || doc.body;

const pair = (target, issue) => target && { html: target.outerHTML, at: issue.path || "(the analysis root)" };

function show({ html, at }, issue){
	div.c("dt-mirror-pair grid gap").append(() => {
		pane("Now", html, null);
		pane("With the fix", html, issue.fix);
	});

	div.c("dt-mirror-note flex v gap").append(() => {
		h4("The whole of the fix");
		code(`${issue.fix?.sel ?? issue.sel} { ${issue.fix?.decl ?? "—"}; }`).ac("dt-decl");
		p(issue.detail).ac("muted");
		code(at).ac("dt-path");
	});
}

/* ⚠ The fix is applied INLINE to the clone, not as a stylesheet rule. A rule
 * would need a selector that matches only this copy, and `div.page-preview` is a
 * label the probe generated — it is not guaranteed to be unique, or even valid. */
function pane(label, html, fix){
	div.c("dt-mirror-pane flex v gap").append(() => {
		span(label).ac("dt-pane-head");

		div.c("dt-mirror-stage").append($stage => {
			$stage.el.innerHTML = html;
			const clone = $stage.el.firstElementChild;
			if (clone && fix) clone.style.cssText += ";" + fix.decl;
			if (clone && !fix) clone.setAttribute("data-dt-before", "");
		});
	});
}

function missing(issue){
	p(`${issue.sel} is not at ${issue.path ?? "the recorded position"} any more — the page has `
		+ `changed since the audit ran. Re-measure live to refresh it.`).ac("muted");
}
