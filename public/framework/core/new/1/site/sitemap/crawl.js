import { View } from "/app.js";

/* The walker, the renderer and the link classifier — everything the four
 * sitemap pages share, and nothing that decides how any of it looks.
 *
 * The one rule this module obeys above all others: it never re-implements the
 * router. `resolve()` calls the live `Router.load_segments`, so a checker
 * verdict and a real navigation cannot disagree about what a url means.
 */

// Not a copy of load_segments — load_segments itself, on the live router.
export const resolve = (app, pathname) => app.router.load_segments(pathname);

/* Build a page's DOM without letting it land anywhere.
 *
 * Element factories auto-append to View.captor, so calling render() from inside
 * another page's content() would graft twenty seats' pages into this one. Push
 * a detached sink, build, pop — the same push/pop append_fn does, done by hand
 * because we are crossing an await between pages.
 *
 * render() is memoised, so a page that is already mounted returns its existing
 * view and is not moved. A page built here keeps `view`, and the Router's
 * activate() appends it correctly later — it compares parentNode, which is this
 * sink, and re-parents.
 */
export function render_detached(page){
	const previous = View.captor;

	View.set_captor(new View({ capture: false }));
	try { return page.render(); }
	finally { View.set_captor(previous); }
}

/* Breadth-first over `children`, importing as it goes.
 *
 * This is where laziness ends and the honesty starts. Following a declared name
 * imports it, which is precisely the cost the lazy tier exists to avoid — so
 * this runs on a click, never on render, and reports what it spent.
 *
 * Three outcomes per name, and the third is the finding:
 *   a page        followed
 *   null          DECLARED BUT MISSING — a name in children with no page.js
 *   route()       unbounded — a function's domain cannot be enumerated
 */
export async function crawl(app, on_page){
	const seen = new Set();
	const pages = [];
	const queue = [app.root];

	while (queue.length){
		const page = queue.shift();

		if (!page.url || seen.has(page.url)) continue;
		seen.add(page.url);

		const row = {
			url: page.url,
			title: page.title,
			seat: seat_of(page.url),
			depth: page.url.split("/").filter(Boolean).length,
			declared: [...page.children.keys()],
			claims: !!page.route,
			missing: [],
			page,
		};

		for (const name of page.children.keys()){
			const child = await page.child(name).catch(() => null);
			if (child) queue.push(child);
			else row.missing.push(name);
		}

		pages.push(row);
		on_page?.(row, pages.length);
	}

	return pages;
}

// Render every crawled page and report what threw. The librarian seat's point:
// rendering the whole site at once is a free smoke test.
export function render_all(pages){
	return pages.map(row => {
		try { row.view = render_detached(row.page); }
		catch (error){ row.render_error = error.message; }
		return row;
	});
}

/* Every anchor a page rendered, classified against the schema.
 *
 * `off-site` and `file` are reported rather than judged: both are legitimate,
 * and both are urls the Router deliberately declines (link_clicked returns null
 * for a foreign origin and for a dotted final segment).
 */
export async function check_links(app, pages){
	const links = [];

	for (const row of pages){
		if (!row.view) continue;

		for (const el of row.view.el.querySelectorAll("a[href]")){
			const href = el.getAttribute("href");
			const link = { from: row.url, seat: row.seat, href, text: el.textContent.trim().slice(0, 40) };

			if (el.origin !== location.origin) link.verdict = "off-site";
			else if (/\.\w+$/.test(el.pathname)) link.verdict = "file";
			else {
				link.canonical = canonical(el.pathname);
				link.verdict = await resolve(app, el.pathname) ? (link.canonical ? "ok" : "non-canonical") : "broken";
			}

			links.push(link);
		}
	}

	return links;
}

/* Rule 1, as a predicate. A page url ends in "/" and has no empty segments —
 * those are the two ways this tier's one url shape can be written wrong, and
 * both still resolve, which is exactly why they need checking rather than
 * failing. */
export const canonical = pathname => pathname.endsWith("/") && !pathname.includes("//");

// which seat owns a url — the first segment, which is also the section
export const seat_of = url => url.split("/").filter(Boolean)[0] ?? "(root)";

// group + rank: most broken first, then most non-canonical
export function by_seat(links){
	const seats = new Map();

	for (const link of links){
		const row = seats.get(link.seat) ?? { seat: link.seat, total: 0, ok: 0, broken: [], non_canonical: [], off_site: 0, file: 0 };

		row.total++;
		if (link.verdict === "ok") row.ok++;
		if (link.verdict === "broken") row.broken.push(link);
		if (link.verdict === "non-canonical") row.non_canonical.push(link);
		if (link.verdict === "off-site") row.off_site++;
		if (link.verdict === "file") row.file++;

		seats.set(link.seat, row);
	}

	return [...seats.values()].sort((a, b) =>
		b.broken.length - a.broken.length || b.non_canonical.length - a.non_canonical.length || a.seat.localeCompare(b.seat));
}

/* One crawl per session, shared by all four pages.
 *
 * A promise, not a result: the second page to ask joins the first page's crawl
 * instead of starting a second one. Cleared by nothing — importing every page
 * twice would cost the same and tell us the same thing.
 */
let running = null;

export function survey(app, on_page){
	return running ??= (async () => {
		const pages = render_all(await crawl(app, on_page));
		return { pages, links: await check_links(app, pages) };
	})();
}

export const surveyed = () => running;
