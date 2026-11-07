// The mastermind's ranking, written as rules over method names (so it is checkable, and the comparison is computed).
import fs from "fs";
const rows = fs.readFileSync(process.argv[2], "utf8").trim().split("\n").map(l => l.split("\t"));
const R = (re, rank, why) => ({ re, rank, why });
const page = [
	R(/^(static use|ext)$/, "move-out", "Plugin: Page.use/ext become Host.use"),
	R(/^(get |set )?children$/, "move-out", "delete: deprecated, use pages"),
	R(/^(file|gone|child_file|link_child|unlink_child|take_words|overlay|static jsonl|static jsonl_file|log_forget)$/, "move-out", "store: Jsonl reader, not Page"),
	R(/^(tab|tab_state|tab_visible|tab_order|nav_ready|in_tabs_frame)$/, "move-out", "plugin: tabs"),
	R(/^(place|draw_placed|draw_module)$/, "move-out", "plugin: placed parts"),
	R(/^(log_view|log_draw|log_folder|log_redraw|draw_folder|static log_class|log_label)$/, "move-out", "plugin: log view"),
	R(/^(files_button|has_files_button|listing|static (listing|fetch_listing|page_listing|loaded_listing))$/, "move-out", "plugin: files"),
	R(/^(draw_md|child_readme|child_md|md_folder|md_dir|md_files|static md_(page|file|url)|fs_folder|tasks_folder|ai_page)$/, "move-out", "plugin: folder/markdown discovery"),
	R(/^(naming|words|word_classes|words_said)$/, "move-out", "plugin: layout words"),
	R(/^(related_aside)$/, "move-out", "plugin: related"),
	R(/column|^static even_columns$/, "move-out", "plugin: columns"),
	R(/^(previews|walls|wall_rungs|preview|preview_thumb|preview_link)$/, "move-out", "plugin: previews"),
	R(/^(prefs)$/, "move-out", "plugin: settings (core/Settings)"),
	R(/^(get unknown|report_unknown|warn_if_hidden)$/, "move-out", "dev plugin: diagnostics"),
	R(/^(constructor|assign|set|get items|get content|set content|get|lists|get pages|declare|add|move|chain|child|render|activate|deactivate|container|mounts_in|link|static of|static load|static from|replay_line|static replay_new|static new_id|rerender|render_content|content_at)$/, "core", "identity, tree, content, url, render"),
];
const item = [
	R(/^(get |set )views?$/, "move-out", "view link: View side, not data tier"),
	R(/^(static describe|static dots|static short_id)$/, "move-out", "doc/debug helper, not the node"),
	R(/^(file_url|load|static root_from|static foreign|static get source|static (get |set )clock)$/, "move-out", "store: Store/RecordWriter, store-agnostic"),
	R(/^(constructor|default_id|assign|set|unset|apply|set_one|get|get_one|put|remove|move_to|root|lists|walk|find|toJSON|static new_id|static register|static replay|replay_line|static open|static class_for|static define_fields|act|batch|save|delete|static replay_new)$/, "core", "the node: set, tree, save, replay"),
];
let n = { core: 0, secondary: 0, "move-out": 0 }, out = [];
for (const [at, sig] of rows){
	const name = sig.replace(/\(.*/, ""), rules = at.includes("Page.class") ? page : item;
	const hit = rules.find(r => r.re.test(name)) ?? { rank: "secondary", why: "real, but a helper part could hold it" };
	n[hit.rank]++; out.push([at, name, hit.rank, hit.why].join("\t"));
}
out.push(`# counts core=${n.core} secondary=${n.secondary} move-out=${n["move-out"]} total=${rows.length}`);
fs.writeFileSync(process.argv[3], out.join("\n") + "\n");
console.log(out.at(-1));
