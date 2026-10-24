import { is } from "../View/View.js";

// The loading statics of Page: each takes the class (P) first; Page keeps one-line forwarders. (doc/architecture.md)
export default class PageLoad {

	// Last resort: a `.md` beside me IS a page. ⚠ The SPA fallback answers a miss with index.html at 200: content-type is the 404. (doc/watch-out.md)
	static async file(P, url){
		const res = await fetch(url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;

		const text = await res.text();
		const { default: md } = await import("../../ext/markdown/md.js");
		const href = new URL(url, location.origin).href;

		md.cache[href] ??= Promise.resolve(text);

		return {
			title: text.match(/^#\s+(.+?)\s*$/m)?.[1],
			content(){ return md.file({ url: href }, href, { h1: false }); },
		};
	}

	// A module that throws is NOT a module that isn't there. ⚠ `levels` bounds its subtree (nothing = its own `depth`). (doc/watch-out.md)
	static async load(P, url, levels){
		try {
			const page = (await import(url + "page.js")).default ?? null;
			return page instanceof P ? page.load_all_children(levels) : page;
		}
		catch (error){
			if (!P.missing(error))
				console.error(`Page.load("${url}page.js") — the file EXISTS but failed to load:`, error);
			return null;
		}
	}

	// ⚠ The SPA fallback answers a miss with index.html at 200: content-type is the 404. `opts` goes to fetch. (doc/decisions.md)
	static async read_json(P, url, opts){
		const res = await fetch(url, opts).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
		return res.json().catch(() => null);
	}

	static async from(P, source, adopt){
		const url  = is.str(source) ? source.replace(/\/?$/, "/") : null;
		const data = url ? await P.read_json(url + "page.json") : source;
		if (!data) return null;

		const page = new P({ url, ...P.props(data, data.mode ?? {}) }, adopt);

		for (const name of data.children ?? [])
			page.add(name, (url && await P.from(url + name + "/")) ?? { title: name });

		return page;
	}

	static props(P, data, mode){
		return {
			title: data.title, icon: data.icon, description: data.description,
			navigation: mode.navigation, arrangement: mode.arrangement,
			surface: mode.surface, background: mode.background,
			type_size: mode.type,
			width: mode.room ?? mode.width,
			content: mode.content,
		};
	}

	static missing(P, error){
		return /Failed to fetch dynamically imported module|error loading dynamically imported module|MIME type|Expected a JavaScript/i
			.test(error?.message ?? "");
	}

	static slug(P, title){
		return String(title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	}
}
