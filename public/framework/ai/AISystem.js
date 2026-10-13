import System from "../ext/System/System.js";
import { cards } from "../ux/Content/structure/Structure.js";

// The AI system as a System: its components are read from the "Every system" list in ai/readme.md,
// so the cards cannot drift from the index. Decisions: ./doc/architecture.md
export default class AISystem extends System {
	name = "AI system";
	icon = "smart_toy";
	root = "public/framework/ai";
	readme = "public/framework/ai/readme.md";
	rules = [{ id: "indexed", text: "Every component is one line in the readme index, with a link.", enforced_by: "script" }];

	static ICONS = { Accounting: "savings", Servex: "hub", "Dev server": "dns", "MCP tools": "build", Models: "query_stats", Sessions: "forum", Transcription: "mic", "Prompt refinement": "edit_note", "Page system": "web", "Past work": "history", "Skills and CLAUDE.md": "school", "Class cards, live": "category", "Step runner": "format_list_numbered", "Repo size": "folder_zip", "Follow-up": "checklist" };

	// "- **Name** (note): [text](href) · ..." becomes { name, gist, href } for the first link
	static parse(md){
		const body = md.split(/^## /m).find(s => s.startsWith("Every system")) ?? "";
		return body.split("\n").flatMap(l => {
			const m = l.match(/^- \*\*(.+?)\*\*\s*(?:\((.+?)\))?[:\s]*(.*)$/);
			const link = m?.[3].match(/\]\(([^)]+)\)/);
			if (!m || !link) return [];
			const href = link[1].startsWith("http") || link[1].startsWith("/") ? link[1] : new URL(link[1], location.origin + "/framework/ai/").pathname;
			return [{ name: m[1].replace(/ \(.*/, ""), icon: AISystem.ICONS[m[1]] ?? "widgets", gist: m[2] ?? "", href }];
		});
	}

	async components(){ return AISystem.parse(await (await fetch(new URL("./readme.md", import.meta.url))).text()); }

	// Draws into the box captured now; fills after the await (no DOM after an await).
	show(box){
		this.components().then(list => box.append(() => cards(list.map(c => ({ ...c, gist: c.gist || "Open its readme." })))));
	}
}
