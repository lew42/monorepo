import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * class ThingsIndex — builds `things.json`, the list of named things ThingsStage listens for while you talk
 * ("where is Dictate?" -> a link to /framework/ux/Dictate/). Computed from the folders, never typed by hand
 * (CLAUDE.md law 7): every folder under core, ext, ui, ux, audio, dev and the ai systems that has a `page.js` is one thing.
 *
 *   node public/framework/ext/Refine/stages/ThingsIndex.mjs        // rewrites things.json; rerun when a module is added
 *
 * Single lowercase words (table, icon, toolbar) are skipped: spoken, they are just English. Hyphenated ones (push-to-talk) stay.
 * `common: true` marks a name that is also an ordinary English word (Page, Tree, Filter): ThingsStage only
 * matches those when they are spoken with a capital letter, so "the page should" does not light up #Page.
 */
export default class ThingsIndex {

	static ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");   // public/framework
	static TIERS = { core: "data_object", ext: "extension", ui: "widgets", ux: "touch_app", audio: "graphic_eq", dev: "terminal", ai: "smart_toy" };
	static COMMON = new Set("page view list item app doc files tabs tags tree card content course auth menu filter rename layout research session task chat panel editor timeline drawer highlight markdown router sidebar wizard popover pagination understand inbox revise objects hotkeys log logs local process health errors council dashboard archive audits collab classes cards rail asks docs test tests try demo fixture start faq lab old audit search section shell ask claim socket system voice classify refine record recorder".split(" "));

	static build(){
		const things = {};
		for (const [tier, icon] of Object.entries(ThingsIndex.TIERS)){
			const dir = path.join(ThingsIndex.ROOT, tier);
			if (!fs.existsSync(dir)) continue;
			for (const e of fs.readdirSync(dir, { withFileTypes: true })){
				if (!e.isDirectory() || /^\d{4}|^\.|^v\d*$|^new$/.test(e.name) || /^[a-z]+\d*$/.test(e.name) || !fs.existsSync(path.join(dir, e.name, "page.js"))) continue;
				const key = e.name;
				if (things[key] && tier === "ai") continue;   // a core/ext/ui/ux name wins over a same-named ai folder
				things[key] = { url: `/framework/${tier}/${e.name}/`, icon, ...(ThingsIndex.COMMON.has(key.toLowerCase()) ? { common: true } : {}) };
			}
		}
		return things;
	}

	static write(){
		const things = ThingsIndex.build();
		fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "things.json"), JSON.stringify(things, null, "\t") + "\n");
		return things;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const things = ThingsIndex.write();
	console.log(Object.keys(things).length + " things written to things.json");
}
