import { FigmaFile } from "./FigmaFile.js";

/* The system: knows which Figma files are tracked (index.jsonl) and loads them.
   The Figma MCP only answers inside an agent session, so tracking is done by track.mjs; the browser only reads. */
export class Figma {
	static async files(){
		const text = await (await fetch(import.meta.resolve("./index.jsonl"))).text();
		const files = text.split("\n").filter(Boolean).map(l => new FigmaFile(JSON.parse(l)));
		return Promise.all(files.map(f => f.load()));
	}
}
export default Figma;
