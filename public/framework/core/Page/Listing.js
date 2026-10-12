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
}
