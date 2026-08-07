/* How /deep/ shows its code.
 *
 * Every code block in this section is a real function object or a real file.
 * There is not one hand-typed source string anywhere below /deep/, and that is
 * deliberate: these pages document failures, and a snippet that had drifted
 * would be documenting a bug that no longer exists — the worst possible lie for
 * a defect register.
 *
 *   snippet(label, fn)   the IDE checks it, nothing runs it        (code.fn)
 *   probe(label, fn)     the same source, plus a Run button that calls THAT
 *                        function object with a logger it writes into
 *   whole(import.meta)   this page's own file, fetched             (code.file)
 *
 * probe() is the one that matters here. demo(fn) runs its function at render
 * time, which for a page whose demo IS a failure means the failure happens
 * while the page is still being built — and half of these reproductions
 * navigate, throw, or mount things in the wrong container. Run-on-click keeps
 * the blast radius inside a button press, and the reader chooses to fire it.
 */
import { View, div, pre, button, code, details, summary } from "/app.js";

// adds code.fn / code.file / code.js to core's `code` factory. Importing an ext
// patches View globally for the rest of the session — see the register.
import "/framework/ext/highlight/highlight.js";

View.stylesheet(import.meta, "deep.css");

// the site's own .code box (styles.css), fed a function instead of a string
export function snippet(label, fn){
	return div.c("code", () => {
		if (label) div.c("code-label", label);
		code.fn(fn);
	});
}

// one function object: rendered as source, and called by the button
export function probe(label, fn){
	let $out;

	const log = (...args) => $out.el.append(args.join(" ") + "\n");

	const run = async () => {
		$out.el.textContent = "";
		try { await fn(log); }
		catch (error){ log(`THREW  ${error.constructor.name}: ${error.message}`); }
	};

	return div.c("code probe", () => {
		div.c("code-label", label);
		code.fn(fn);
		div.c("probe-bar", () => button.c("probe-run", "Run").click(run));
		$out = pre.c("probe-out");
	});
}

/* The file that produced the page you are reading — fetched, so it cannot
 * drift. Fetched when the <details> is OPENED, not when the page renders: a
 * page module is already on the wire once as a module, and measuring cold-load
 * cost is half of what this section does. An eager version doubled every
 * ancestor's page.js in the resource timeline.
 *
 * Note the shape: the <details> is captured synchronously, and the source is
 * appended into it by name later. Building it in the toggle handler with the
 * ambient captor would put the code block wherever the captor had since become.
 */
export function whole(meta){
	return details.c("whole", ($whole) => {
		summary("the whole file — fetched, so it cannot drift");

		$whole.on("toggle", () => {
			if (!$whole.el.open || $whole.fetched) return;
			$whole.fetched = true;
			$whole.append(code.file(meta, "page.js"));
		});
	});
}

// a build fingerprint. Same text after a navigation = the view was NOT rebuilt.
export function stamp(){
	return pre.c("stamp", `built once, at ${performance.now().toFixed(1)}ms`);
}
