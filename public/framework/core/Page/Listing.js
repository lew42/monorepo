import { names } from "../Router/listing.js";

// What listing() answers: files, dirs, pages (Map kid → js/jsonl), page (is this log a page?), log (the source file). (doc/decisions.md)
export default class PageListing {

	static CHILD = /^([^/]+)\/page\.(jsonl|js)$/;
	static key_of = name => name.split("/")[0];

	files = [];
	dirs = [];
	pages = new Map();

	// `page`: is this folder a jsonl page? Unknown (undefined) means "read line 1".
	// `log`: the file the list came from ("files.jsonl" or "page.jsonl") — a real file there too.
	static from(entries, page, log = "page.jsonl"){
		const { CHILD, key_of } = this, latest = new Map();
		for (const { file, gone } of entries){
			if (typeof file !== "string") continue;
			gone ? latest.delete(key_of(file)) : latest.set(key_of(file), file);
		}

		const listing = new this();
		listing.log = log;
		listing.page = page ?? (!!entries[0] && typeof entries[0].file !== "string");   // line 1 builds a page; a listing-only log starts with a file line
		latest.forEach((name, key) => {
			const kind = name.match(CHILD)?.[2];
			if (kind) listing.pages.set(key, kind);
			else if (name.includes("/")) listing.dirs.push(key);
			else listing.files.push(name);
		});
		return listing;
	}

	// Is `name` a folder here, page or not?
	folder(name){ return this.dirs.includes(name) || this.pages.has(name); }

	// A folder's own file list: a loaded page's lines, else files.jsonl, else page.jsonl, else null. Memoised per folder. (doc/decisions.md)
	static listing(P, url, fresh){
		url = String(url).replace(/\/?$/, "/");
		if (P.UNLOGGED.test(url)) return Promise.resolve(null);

		const own = P.page_listing(url);
		if (own) return Promise.resolve(own);

		const memo = P.listings ??= new Map();
		if (fresh || !memo.has(url)) memo.set(url, P.fetch_listing(url)
			.then(listing => { (P.loaded_listings ??= new Map()).set(url, listing); return listing; }));
		return memo.get(url);
	}

	// The two files, in the order the parent's listing suggests; the first one there wins.
	static async fetch_listing(P, url){
		const [, parent, name] = url.match(/^(.*\/)([^/]+)\/$/) ?? [];
		const jsonl_first = parent && P.loaded_listing(parent)?.pages.get(name) === "jsonl";
		let order = jsonl_first ? ["page.jsonl", "files.jsonl"] : ["files.jsonl", "page.jsonl"];

		// On the dev server the folder's names say which log exists, so a folder with neither asks for nothing (no 404s). Static site: null, probe as before.
		const listed = names(url);
		if (Array.isArray(listed)) order = order.filter(file => listed.includes(file));

		for (const file of order){
			const reader = await new P.Reader({ url: url + file }).load();
			if (reader.loaded) return P.Listing.from(reader.entries, file === "page.jsonl" ? undefined : false, file);
		}
		return null;
	}

	// The folder's list kept open: `{ listing, reader, close() }`, where `listing` is rebuilt (and `changed(listing)` called) whenever a line
	// lands in the log. On the dev server the reader tails through the socket; anywhere else it loads once and never changes. Its own
	// reader, never attached to a page, so the lines stay in `reader.entries`. Read only: nothing here writes. (doc/files.md)
	static async live(P, url, changed){
		url = String(url).replace(/\/?$/, "/");
		const known = await P.listing(url);
		const log = known?.log ?? "files.jsonl";   // an empty folder has no log yet: its first file creates files.jsonl (PageFiles.settle)
		const reader = new P.Reader({ url: url + log });
		const live = { reader, listing: null, close: () => reader.close() };

		const fold = () => live.listing = P.Listing.from(reader.entries, log === "page.jsonl" ? undefined : false, log);
		reader.changed = () => changed(fold());
		reader.reset = () => { reader.entries.length = 0; reader.count = 0; delete reader.loaded; return reader; };   // a rewritten file replays from line 1

		await reader.open();
		fold();
		return live;
	}

	// A jsonl page already loaded at `url` (jsonl() registers it): its lines, as a listing.
	static page_listing(P, url){
		const page = P.log_pages?.get(url);
		if (!page) return null;
		return P.Listing.from([...page.listed?.values() ?? []].map(file => ({ file })), true, "page.jsonl");
	}

	// The listing, only if it is already here — a loaded jsonl page, or a `listing()`
	// call that has come back; never fetches.
	// undefined = not asked yet, null = asked, no file list.
	static loaded_listing(P, url){
		url = String(url).replace(/\/?$/, "/");
		return P.page_listing(url) ?? P.loaded_listings?.get(url);
	}
}
