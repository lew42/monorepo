import { FigmaFile } from "./FigmaFile.js";
import { unique_slug } from "./slug.js";
import { fetch_text_sync } from "./sync.js";

/* The system: knows which Figma files are tracked (index.jsonl) and loads them.
   The Figma MCP only answers inside an agent session, so tracking is done by track.mjs; the browser only reads. */
export class Figma {
	static #files;      // the Promise — one fetch per tab
	static #resolved;   // the same files, the moment that promise lands — what a sync route() reads first

	/* Loaded once per tab: a click that only changes ?file= or ?page= redraws from memory, no refetch. */
	static files(){
		if (!this.#files){
			this.#files = this.load();
			this.#files.then(files => { this.#resolved = files; });
		}
		return this.#files;
	}

	static async load(){
		const text = await (await fetch(import.meta.resolve("./index.jsonl"))).text();
		const files = text.split("\n").filter(Boolean).map(l => new FigmaFile(JSON.parse(l)));
		files.forEach(f => { f.slug = unique_slug(f, files); });
		return Promise.all(files.map(f => f.load()));
	}

	/** Already-loaded files, synchronously — null while `files()` is still in flight. */
	static resolved(){ return this.#resolved ?? null; }

	/* route() must answer NOW (Page.child() never awaits it — doc/property/route.md), so a cold
	   deep link straight onto `/framework/ext/Figma/<file-slug>/` gets one blocking read instead
	   of a guess — the same trade ai/AITask/dashboard.js's has_page_js() makes for the AI day
	   pages. Cached in #resolved, so every later hop (and the normal async files()) reuses it. */
	static files_sync(){
		if (this.#resolved) return this.#resolved;
		const text = fetch_text_sync(import.meta.resolve("./index.jsonl")) ?? "";
		const files = text.split("\n").filter(Boolean).map(l => new FigmaFile(JSON.parse(l)));
		files.forEach(f => { f.slug = unique_slug(f, files); f.load_sync(); });
		return this.#resolved = files;
	}
}
export default Figma;
