import Store from "../Item/Store.js";

/* PageIndex: what a parent knows about its children without loading them, read from the `nav` on their
 * files.jsonl lines (Server/plugins/PageFiles.js). `PageIndex.navs(Page, url)` -> Map name -> {title, icon, description}.
 * On the dev server ONE request, /api/index?dir=&depth=2 (Server/plugins/PageIndex.js), answers the folder and its
 * children's folders at once, so the children's own calls are served from the cache; anywhere else (a static host) it reads
 * the folder's own listing, one small file per folder. Page.from_index (`?index=0` turns it off) is the switch.
 * (doc/index-jsonl.md) */
export default class PageIndex {

	static cache = new Map();   // folder url -> Promise<Map>

	static enabled(P){ return P.from_index; }

	static navs(P, url){
		url = String(url).replace(/\/?$/, "/");
		if (!this.cache.has(url)) this.cache.set(url, this.dev(url).then(map => map ?? this.listed(P, url)));
		return this.cache.get(url);
	}

	// null when this is not the dev server or the aggregate is not there.
	static async dev(url){
		if (!Store.local()) return null;
		let answer;
		try {
			const res = await fetch("/api/index?depth=2&dir=" + encodeURIComponent(url));
			if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) return null;
			answer = await res.json();
		} catch { return null; }

		const own = new Map();
		for (const [name, entry] of Object.entries(answer.children ?? {})){
			if (entry.nav) own.set(name, entry.nav);
			if (entry.children) this.cache.set(url + name + "/", Promise.resolve(new Map(Object.entries(entry.children).filter(([, e]) => e.nav).map(([n, e]) => [n, e.nav]))));
		}
		return own;
	}

	static async listed(P, url){
		const listing = await P.listing(url);
		return listing?.navs ?? new Map();
	}
}
