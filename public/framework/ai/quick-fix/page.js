import { Page, div, p, span, small, a, img } from "/app.js";
import { icon } from "/framework/core/View/View.js";

/**
 * THE QUICK-FIX LOG'S OWN PAGE — every "make this bold" since Servex started, newest first.
 *
 * One line in `page.jsonl` is written the moment the owner asks (`quick_fix`, a Servex MCP
 * tool), and a second line is written once the standing fixer actually lands it
 * (`quick_fix_landed`) — both node, never the fixer's own guess at how long it took
 * (CLAUDE.md law 7). This page only ever READS the file and folds the two lines back into one
 * row by their shared `asked_at`. Full story: `readme.md` here, and `Servex/doc/fixer.md`.
 */

const FILE_URL = "/framework/ai/quick-fix/page.jsonl";

const read_text = url => fetch(url, { cache: "no-store" }).then(r => (r.ok ? r.text() : "")).catch(() => "");
const parse_lines = text => String(text ?? "").split(/\r?\n/).filter(l => l.trim())
	.map(l => { try { return JSON.parse(l); } catch { return null; } });

/** Every `{"quickfix": {...}}` line, folded by `asked_at`: the `asked` line's fields, then
 *  whatever the matching `landed` line added on top (it always arrives second). A request
 *  with no landed line yet is still "working" — shown as such, never left out. */
function fold(lines){
	const rows = new Map();
	for (const l of lines){
		const q = l?.quickfix;
		if (!q?.asked_at) continue;
		rows.set(q.asked_at, { ...rows.get(q.asked_at), ...q });
	}
	return [...rows.values()].sort((a, b) => Date.parse(b.asked_at) - Date.parse(a.asked_at));
}

function age_words(at){
	const ms = Date.now() - Date.parse(at);
	if (!Number.isFinite(ms)) return "";
	if (ms < 60000) return Math.round(ms / 1000) + "s ago";
	if (ms < 3600000) return Math.round(ms / 60000) + "m ago";
	return Math.round(ms / 3600000) + "h ago";
}

function row(q){
	const landed = !!q.landed_at;
	div.c("card pad flex gap-50", () => {
		div.c("flex-1", () => {
			div.c("flex v-center gap-25", () => {
				icon(landed ? "check_circle" : "hourglass_top");
				a.c("page-link").href(q.page).text(q.page);
				small.c("muted").text(age_words(q.asked_at));
			});
			p().text(q.text);
			if (q.selection?.label) small.c("muted").text("selected: " + q.selection.label + (q.selection.selector ? " (" + q.selection.selector + ")" : ""));
			if (landed){
				const secs = (q.ms / 1000).toFixed(1);
				small().text(`Landed in ${secs}s — ${q.files ?? "?"} file(s), ${q.lines ?? "?"} line(s) — ` + (q.sha ? q.sha.slice(0, 8) : ""));
			} else {
				small.c("muted").text("the fixer is on it…");
			}
		});
		if (q.shot) img().attr("src", "/framework/ai/quick-fix/shots/" + q.shot.replace(/^.*shots[\\/]/, "")).style({ width: "12em", borderRadius: "var(--radius, 0.5em)" });
	});
}

export default new Page({
	meta: import.meta,
	title: "Quick fix",
	icon: "bolt",
	description: "Every small fix asked for by voice, and how many seconds it took to land.",
	leaf: true,

	async content(){
		p("A small, concrete change to a page — \"make this bold\", \"this gap is too big\" — goes "
			+ "straight to the standing fixer and lands here in seconds.");
		const $list = div.c("wide wall");
		$list.style("--column", "28em");

		const rows = fold(parse_lines(await read_text(FILE_URL)));
		$list.empty(() => {
			if (!rows.length){ small.c("muted").text("No quick fixes yet — say something small about any page."); return; }
			rows.forEach(row);
		});
	},
});
