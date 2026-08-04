import { View, div, pre } from "/app.js";

View.stylesheet(import.meta, "nav.css");

/* The page shows its own bytes.
 *
 *     source(import.meta)                     this file
 *     source("/framework/.../Page.class.js")  any file
 *
 * A code block typed into a page is a COPY of the code that ran, and a copy is
 * a thing that can drift. This fetches the real file, so what you read is what
 * executed — and it caps how long a page may be, because a page nobody wants to
 * read the source of is a page doing too much.
 *
 * Placed synchronously, filled asynchronously — the box exists and is captured
 * NOW, and `$pre` is named so the fill never touches the ambient captor.
 */
export function source(meta){
	const url = typeof meta === "string" ? meta : meta.url;

	return div.c("code nav-source", () => {
		div.c("code-label", new URL(url, location.href).pathname);
		const $pre = pre();
		fetch(url).then(r => r.text()).then(text => $pre.text(text.trimEnd()));
	});
}
