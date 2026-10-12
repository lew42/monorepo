import fs from "node:fs";
import path from "node:path";

/**
 * class TagRouter — sends a refined prompt's tags to the pages they name (the owner, 2026-10-12: "when a
 * refined prompt card is tagged with a module, the item should reach that module's own page automatically").
 *
 *   const r = new TagRouter({ inbox: servex.inbox });         // the one Inbox (`Servex/agents/inbox.js`), no second inbox
 *   r.route({ session, prompt, notes });                      // notes: [{ i, tags: ["ext/Refine"] }] as Annotator writes them
 *   // -> { sent: [{ tag, path, id, sentences: [2, 5] }], unrouted: ["Nope/Thing"], already: ["core/Page"] }
 *
 * The tag -> page map is read from the real tree on every call (`page_for`), never recalled: a tag names a page
 * only when `public/framework/<tag>/` (or `public/<tag>/`) holds a `page.js` or `page.jsonl`. A tag with no page
 * gets no note and comes back in `unrouted`. The note is written by `Inbox.note` onto the page's own `page.jsonl`
 * as a `{"note": ...}` line, which the page's rail (`core/Page/ext/Inbox`) shows. It carries a link to the source
 * prompt (session + sentence numbers) and never a copy of the text. One note per tag per prompt: a re-run of the
 * same prompt finds its own note and adds nothing.
 */
export default class TagRouter {

	constructor({ inbox, repo = inbox?.repo } = {}){
		if (!inbox) throw new Error("TagRouter needs the Servex inbox");
		this.inbox = inbox;
		this.repo = repo;
	}

	/** The site path of the page a tag names (`/framework/ext/Refine/`), or null. */
	page_for(tag){
		const rel = String(tag ?? "").trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
		if (!rel || rel.split("/").some(p => !p || p === "." || p === "..")) return null;
		for (const base of ["framework", ""]){
			const disk = path.join(this.repo, "public", base, rel);
			if (fs.existsSync(path.join(disk, "page.js")) || fs.existsSync(path.join(disk, "page.jsonl")))
				return "/" + [base, rel].filter(Boolean).join("/") + "/";
		}
		return null;
	}

	/** tag -> the 0-based sentence indexes that carry it. */
	groups(notes){
		const by = new Map();
		for (const n of notes ?? []) for (const t of n?.tags ?? []){
			const tag = String(t).trim();
			if (tag) by.set(tag, [...(by.get(tag) ?? []), n.i]);
		}
		return by;
	}

	/** The note text: a link to the source prompt, sentence numbers (1-based, as the page shows them), the tag. */
	text({ session, prompt, tag, indexes }){
		const s = [...new Set(indexes)].sort((a, b) => a - b).map(i => "S" + (i + 1)).join(", ");
		return `A refined prompt tagged ${tag}: /framework/ai/sessions/${session}/ (prompt ${prompt}, sentences ${s}).`;
	}

	has_note(page, prompt){
		try {
			const file = path.join(this.repo, "public", ...page.split("/").filter(Boolean), "page.jsonl");
			return fs.readFileSync(file, "utf8").split("\n").some(l => l.includes('"note"') && l.includes(`(prompt ${prompt},`));
		} catch { return false; }
	}

	route({ session, prompt, notes } = {}){
		const out = { sent: [], unrouted: [], already: [] };
		if (!session || !prompt) return out;
		for (const [tag, indexes] of this.groups(notes)){
			const page = this.page_for(tag);
			if (!page){ out.unrouted.push(tag); continue; }
			if (this.has_note(page, prompt)){ out.already.push(tag); continue; }
			const r = this.inbox.note({ path: page, text: this.text({ session, prompt, tag, indexes }), from: "refine" });
			out.sent.push({ tag, path: page, id: r.id, sentences: [...new Set(indexes)].sort((a, b) => a - b).map(i => i + 1) });
		}
		return out;
	}
}
