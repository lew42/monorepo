import { FigmaNode } from "./FigmaNode.js";
import { unique_slug } from "./slug.js";
import { fetch_text_sync } from "./sync.js";

/* One tracked Figma file: its key and name, and its pages (each with the frames we know of).
   Data lives in data/<key>/pages.jsonl, written by track.mjs; a re-track appends, the newest line per id wins. */
export class FigmaFile {
	constructor({ key, name, url }){
		Object.assign(this, { key, name, url, pages: [], built: new Map() });
	}

	async load(){
		const text = await (await fetch(import.meta.resolve(`./data/${this.key}/pages.jsonl`))).text();
		const built = await fetch(import.meta.resolve(`./data/${this.key}/built.jsonl`)).then(r => r.ok ? r.text() : "").catch(() => "");
		return this.apply(text, built);
	}

	/* The cold-deep-link fallback: one blocking read instead of two awaited fetches — the
	   trade sync.js's fetch_text_sync makes, so a route() asked before load() has landed
	   can still answer this tick. */
	load_sync(){
		return this.apply(fetch_text_sync(import.meta.resolve(`./data/${this.key}/pages.jsonl`)) ?? "",
			fetch_text_sync(import.meta.resolve(`./data/${this.key}/built.jsonl`)) ?? "");
	}

	/* Shared by load() and load_sync(): parse the two logs into pages/frames/built, then give
	   every node a readable, unique slug — the one thing route() ever matches a url segment against. */
	apply(text, builtText){
		const byId = new Map();
		for (const line of text.split("\n")){
			try {
				const { page } = JSON.parse(line);
				if (page) byId.set(page.id, page);
			} catch {} // blank line, or the SPA-fallback html page
		}
		this.pages = [...byId.values()].map(p => {
			const node = new FigmaNode(p, this);
			node.frames = (p.frames || []).map(f => new FigmaNode(f, this));
			return node;
		});
		for (const line of builtText.split("\n")) try { const b = JSON.parse(line); this.built.set(b.node, b); } catch {} // blank line or fallback html
		this.pages.forEach(p => {
			p.slug = unique_slug(p, this.pages);
			p.frames.forEach(f => { f.slug = unique_slug(f, p.frames); });
		});
		return this;
	}

	/* A page or a frame of a page, by node id. */
	find(id){ return this.pages.find(p => p.id === id) || this.pages.flatMap(p => p.frames).find(f => f.id === id); }

	page(id){ return this.pages.find(p => p.id === id); }

	/* The route()-facing lookup: a page by its readable slug, never its Figma id. */
	page_by_slug(slug){ return this.pages.find(p => p.slug === slug) ?? null; }
}
export default FigmaFile;
