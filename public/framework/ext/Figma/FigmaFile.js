import { FigmaNode } from "./FigmaNode.js";

/* One tracked Figma file: its key and name, and its pages (each with the frames we know of).
   Data lives in data/<key>/pages.jsonl, written by track.mjs; a re-track appends, the newest line per id wins. */
export class FigmaFile {
	constructor({ key, name, url }){
		Object.assign(this, { key, name, url, pages: [], built: new Map() });
	}

	async load(){
		const text = await (await fetch(import.meta.resolve(`./data/${this.key}/pages.jsonl`))).text();
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
		const built = await fetch(import.meta.resolve(`./data/${this.key}/built.jsonl`)).then(r => r.ok ? r.text() : "").catch(() => "");
		for (const line of built.split("\n")) try { const b = JSON.parse(line); this.built.set(b.node, b); } catch {} // blank line or fallback html
		return this;
	}

	/* A page or a frame of a page, by node id. */
	find(id){ return this.pages.find(p => p.id === id) || this.pages.flatMap(p => p.frames).find(f => f.id === id); }

	page(id){ return this.pages.find(p => p.id === id); }
}
export default FigmaFile;
