import { Page, div, p, md, ui } from "/app.js";
import { usage_of, tail_activity, timeline_of, clock, count } from "/framework/ext/AITask/stats.js";

/* Same fetch + SPA-html-sniff pattern as replay.js's load() — not imported,
 * since load() there is a private, unexported helper. */
async function load(id){
	const res = await fetch("/ai-logs/" + id).catch(() => null);
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return null;
	const text = await res.text();
	return text.split("\n").filter(Boolean).flatMap(line => {
		try { return [JSON.parse(line)] } catch { return [] }
	});
}

async function transcript_id(){
	const res = await fetch(new URL("../sessions/session.json", import.meta.url)).catch(() => null);
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return null;
	return (await res.json()).session_id;
}

function report(lines, id){
	const asst = lines.filter(l => l.type === "assistant").length;
	const u = usage_of(lines), tl = timeline_of(lines);

	p.c("muted", `session ${id.slice(0, 8)}… · ${count(lines.length)} raw JSONL lines`);

	ui.table(["derivation", "result"], [
		["tail_activity(lines)", tail_activity(lines)],
		["usage_of(lines) — calls", `${u.calls} deduped (${asst} raw assistant lines — one response spans several)`],
		["usage_of(lines) — total", count(u.total) + " tokens"],
		["  input / cache write / cache read / output", `${count(u.input)} / ${count(u.cache_write)} / ${count(u.cache_read)} / ${count(u.output)}`],
		["timeline_of(lines)", `${tl.length} real prompt boundaries (harness + skill-load noise filtered)`],
	]);

	ui.timeline(tl.map(t => [clock(t.at), t.text]));
}

export default new Page({
	meta: import.meta,
	title: "Manifest vs log",
	description: "usage_of / tail_activity / timeline_of, run live against the real transcript that built ext/AITask.",
	icon: "query_stats",

	content(){
		div.c("flow", () => {
			p("Three pure functions from `ext/AITask/stats.js` — `usage_of()`, `tail_activity()`, `timeline_of()` — run below against the actual transcript that built `ext/AITask`. Nothing on this page is self-reported.");

			div.c("ai-derive-demo", async $demo => {
				const id = await transcript_id();
				const lines = id && await load(id);
				$demo.append(() => lines?.length
					? report(lines, id)
					: p.c("muted", "Transcript unavailable — this demo needs the dev server (`/ai-logs/<id>`)."));
			});

			md.details(import.meta, "analysis.md", "Full analysis — schema-v2 proposal, log-rendering priorities");
		});
	},
});
