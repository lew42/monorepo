import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Ext renames",
	description: "ext/saver, ext/draggable, ext/ai and ext/panel — capitalized to match their classes; panel.js split into workspace.js + PanelDrag.js.",
	icon: "drive_file_rename_outline",

	content(){
		md(`**Renamed:** \`ext/saver\` → \`ext/Saver\`, \`ext/draggable\` → \`ext/Draggable\`, \`ext/ai\` → \`ext/AISession\`, \`ext/panel\` → \`ext/Panel\`. Inside \`ext/Panel\`: \`Panel.class.js\` → \`Panel.js\`, and the 311-line \`panel.js\` split into \`workspace.js\` (the doors — \`panel()\`, \`workspace()\`, the recursive view, bar controls, \`scatter()\`) and \`PanelDrag.js\` (\`PanelDrag\`, \`grip()\`, \`coalesce()\`).

The Windows case-collision trap this brief warned about fired live: renaming \`Panel.class.js\` → \`Panel.js\` silently destroyed the pre-existing \`panel.js\` (NTFS folds the two names in one directory). No content was lost — the split content had already been read before the rename ran.

**Swept:** every import, \`app.js\` export line, \`ext/page.js\`'s \`children\` string, prose link, css comment and readme across \`public/\` — plus the two live-rendered \`ai/2026-08-13/\` docs that would otherwise 404 (\`persistence/requirements.md\`, \`manifest-vs-log/analysis.md\`). Historical dispatch briefs nothing renders live (other tasks' \`requirements.md\`/\`analysis.md\`/\`templates.md\`, and plain narrative text inside \`session.json\` — not its \`links\`) were left as point-in-time record, the same treatment as this brief.

**Verified:** \`node --check\` clean on all touched/created JS. Playwright pass on \`/framework/ext/Panel/\`, \`/framework/ext/Panel/full/\`, \`/framework/ext/editor/\`, \`/framework/ai/2026-08-13/\` and \`/framework/ext/\` — zero console errors, zero page errors, real content on every page (the Panel workspace mounts 7 panels, \`/full/\` mounts 13).`);

		return md.file(import.meta, "requirements.md");
	},
});
