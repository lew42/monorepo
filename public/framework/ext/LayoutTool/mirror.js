import { View, div, p, h4, span, code } from "/app.js";

View.stylesheet(import.meta, "LayoutTool.css");

/* The offending element itself, twice, at its own size — broken on the left,
 * fixed on the right.
 *
 * The whole-page version answers "is it different"; at 0.5× on a 1280px screen
 * the difference is a few pixels somewhere. This answers the actual question:
 * *what exactly is wrong, and what exactly fixes it.*
 *
 * ⚠ Clones come from a same-origin iframe into THIS document, where they pick up
 * the same stylesheets — which is the only reason a detached node still renders
 * as itself. A cross-origin page could not do this at all. */
export default function mirror(url, issue, width = 1280, root_path = ""){
	return div.c("lt-mirror flex v gap").append($out => {
		$out.append(() => p(`Locating ${issue.sel}…`).ac("muted"));
		find(url, issue, width, root_path).then(
			pair => $out.empty(() => pair ? show(pair, issue) : missing(issue)),
			e => $out.empty(() => p(`Could not isolate it — ${e.message}`).ac("muted")),
		);
	});
}

/* Loads the page in a hidden frame at the audit's width and resolves the issue's
 * recorded PATH against it.
 *
 * ⚠ Not the walk index. A page whose content arrives asynchronously walks in a
 * different order on the next visit, and every issue then points at the wrong
 * element — which is how this came back with "p is no longer at that position"
 * on a classdoc page. `:nth-child()` is exact. */
function find(url, issue, width, root_path){
	return new Promise((resolve, reject) => {
		const el = document.createElement("iframe");
		el.setAttribute("data-layout-ignore", "");
		el.style.cssText = `position:fixed;left:-10000px;top:0;border:0;width:${width}px;height:900px`;
		el.src = url;

		el.onerror = () => done(reject, new Error(`could not load ${url}`));

		el.onload = () => setTimeout(() => {
			try {
				const doc = el.contentDocument;

				/* ⚠ The SAME root the analysis used. A node path is relative to
				 * it, so resolving a page-relative path against `.app` finds a
				 * real element at the wrong address — this cloned the sidebar and
				 * captioned it "cramped card". */
				const root = (root_path && doc.documentElement.querySelector(root_path))
					?? doc.querySelector(".app") ?? doc.body;

				// An empty path IS the root — the analysis root is its own address.
				const target = issue.path ? root.querySelector(issue.path) : root;

				done(resolve, target && { html: target.outerHTML, at: issue.path || "(the analysis root)" });
			} catch (e){ done(reject, e); }
		}, 400);

		document.body.append(el);
		function done(fn, value){ el.remove(); fn(value); }
	});
}

function show({ html, at }, issue){
	div.c("lt-mirror-pair grid gap").append(() => {
		pane("Now", html, null);
		pane("With the fix", html, issue.fix);
	});

	div.c("lt-mirror-note flex v gap").append(() => {
		h4("The whole of the fix");
		code(`${issue.fix?.sel ?? issue.sel} { ${issue.fix?.decl ?? "—"}; }`).ac("lt-decl");
		p(issue.detail).ac("muted");
		code(at).ac("lt-path");
	});
}

/* ⚠ The fix is applied INLINE to the clone, not as a stylesheet rule. A rule
 * would need a selector that matches only this copy, and `div.page-preview` is a
 * label the probe generated — it is not guaranteed to be unique, or even valid. */
function pane(label, html, fix){
	div.c("lt-mirror-pane flex v gap").append(() => {
		span(label).ac("lt-pane-head");

		div.c("lt-mirror-stage").append($stage => {
			$stage.el.innerHTML = html;
			const clone = $stage.el.firstElementChild;
			if (clone && fix) clone.style.cssText += ";" + fix.decl;
			if (clone && !fix) clone.setAttribute("data-lt-before", "");
		});
	});
}

function missing(issue){
	p(`${issue.sel} is not at ${issue.path ?? "the recorded position"} any more — the page has `
		+ `changed since the audit ran. Re-measure live to refresh it.`).ac("muted");
}
