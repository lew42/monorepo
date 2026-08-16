import { div, p, span } from "../../core/View/View.js";
import { TaskJSONL } from "../JSONL/JSONL.js";
import { usage_rail } from "./usage.js";
import { dated, group, newest } from "./board.js";
import { efforts, tally } from "./effort.js";
import { compose } from "./compose.js";
import { state } from "./stats.js";

/* The day dashboard and the ai index rail, over the same rows. A task directory
   speaks through its files: requirements.md alone is PROPOSED, a manifest with
   no landed_at is RUNNING, landed_at is LANDED. Enumeration comes from the dev
   server's directory manifest (declared children on static hosting); a NEW task
   dir arrives when that manifest rebuilds, while appends to a log already on the
   board stream in over the socket. */

const running = t => state(t.m) === "running";

/* ⚠ The SPA fallback answers every miss with index.html — content-type is the 404. */
const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

// task.jsonl is the log-native manifest; session.json the legacy snapshot.
// `files` is the directory listing when we have one — a blind fetch would 404 the console.
// `live` (a redraw callback) streams the log instead of fetching it once.
async function manifest(base, files, live){
	if (!files || files.includes("task.jsonl")){
		const t = new TaskJSONL({ url: base + "task.jsonl" });
		await (live ? t.live(live) : t.load());
		if (t.loaded) return t;
	}
	return !files || files.includes("session.json") ? json(base + "session.json") : null;
}

const ai_dir = dir => dir?.files?.find(f => f.name === "ai")?.children ?? [];
const kids_of = day => (day.children ?? []).filter(kid => kid.type === "dir");

async function load(base, name, files, child, nav, live){
	const m = await manifest(base, files, live);
	const brief = !m && files?.includes("requirements.md")
		? await fetch(base + "requirements.md").then(r => r.ok ? r.text() : "").catch(() => "")
		: "";
	return { name, m, files: files ?? [], url: base, child, nav, title: child?.title ?? name,
		brief: brief.split("\n").map(s => s.trim()).find(s => s && !s.startsWith("#"))?.replaceAll("**", "") };
}

async function tasks(page, live){
	const date = page.url.split("/").filter(Boolean).at(-1);
	const day = ai_dir(await json("/framework/directory.json")).find(d => d.name === date);
	const dirs = day && kids_of(day);
	const names = dirs?.map(kid => kid.name) ?? [...page.children.keys()];

	return Promise.all(names.map(name => load(page.url + name + "/", name,
		dirs ? dirs.find(kid => kid.name === name)?.children?.map(kid => kid.name) ?? [] : null,
		page.children.get(name), page.nav_for(name), live)));
}

/** Every task of every day — the ai index's rail reaches across dates. */
async function all_tasks(){
	const days = ai_dir(await json("/framework/directory.json"))
		.filter(d => d.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(d.name));

	return Promise.all(days.flatMap(day => kids_of(day).map(kid =>
		load(`/framework/ai/${day.name}/${kid.name}/`, kid.name,
			kid.children?.map(c => c.name) ?? [], null, null))));
}

/* Active above, dormant below. A landed task and an unstarted one are both
   dormant, but they are not the same kind of dormant — and only Active carries
   a progress bar. A dir with neither manifest nor brief matches nothing here. */
const GROUPS = [
	["Active", t => state(t.m) === "running"],
	["Landed", t => state(t.m) === "landed"],
	["Proposed", t => state(t.m) === "proposed" && (t.m || t.files.includes("requirements.md"))],
];

function groups(list){
	const found = GROUPS.map(([title, match]) => [title, list.filter(match).sort(newest)]);

	if (!found.some(([, rows]) => rows.length))
		return p.c("muted", "Nothing yet — a task appears when its directory holds a requirements.md or a task.jsonl.");

	found.forEach(([title, rows]) => rows.length && group(title, rows));
}

/* A day's own tasks. No usage meters here — the ai index is always this page's
   ancestor, so its rail is already showing them beside this. Every task.jsonl
   here streams: an append redraws the groups, so a task that lands moves out of
   Active without a reload. */
export function dashboard(page){
	return div.c("ai-dashboard flow bleed", async $d => {
		let list;
		const redraw = () => list && $d.empty(() => groups(list));
		list = await tasks(page, redraw);
		$d.append(() => groups(list));
	});
}

const strip = rows => {
	const live = rows.filter(running);
	return live.length ? group("Active", live, dated) : p.c("muted", "Nothing running right now.");
};

/**
 * What is running right now, above everything else — and `rail()` subtracts
 * these rows from the spine below, so a task is listed once. These few logs
 * re-read through `live()`, so their bars and `now` lines move in place and a
 * task that lands drops out of the strip on its next append; every other task
 * on the board stays on `all_tasks()`'s fetch.
 */
export function active_strip(list){
	return div.c("ai-active", async $a => {
		let rows;
		const redraw = () => rows && $a.empty(() => strip(rows));
		rows = await Promise.all(list.filter(running)
			.map(t => load(t.url, t.name, t.files, null, null, redraw)));
		$a.append(() => strip(rows));
	});
}

/**
 * The ai index's rail — what's running, the usage windows, then every dormant
 * task of every day down one time spine, newest first. A running task appears
 * once, at the top: the strip is the listing, not a pin over a second one.
 * ⚠ Returns the element synchronously (catalog's previews() has no time to
 * await) and fills it inside a callback, which re-establishes the captor the
 * first await dropped.
 */
export function rail(page){
	return div.c("ai-index-rail flow", async $r => {
		const [usage, list] = await Promise.all([json("/framework/ai/usage.json"), all_tasks()]);
		$r.append(() => {
			active_strip(list);
			usage_rail(usage);
			compose(efforts(list));
			dated(list.filter(t => !running(t)));
		});

		// ⚠ These cards were built after catalog's mark pass, so they missed it —
		// on a cold deep link nothing in the rail would be lit.
		page?.app?.router?.mark_links();
	});
}

/** The same spine, filtered to one effort — where a card's category tag lands. */
export function effort_board(page, slug){
	return div.c("ai-effort", async $e => {
		const list = (await all_tasks()).filter(t => t.m?.group === slug);

		$e.append(() => list.length ? dated(list)
			: p.c("muted", "No task claims this effort — a task joins one by naming it as `group` in its log."));

		page?.app?.router?.mark_links();
	});
}

// A day's own status, inert enough for a thumb — a day's page.js opts in:
// `preview(nav){ return this.preview_card(nav, () => glance(this)); }`.
export function glance(page){
	return div.c("ai-glance flex v gap", async $g => {
		const known = (await tasks(page)).filter(t => t.m || t.files.includes("requirements.md"));
		const counts = tally(known);

		$g.append(() => known.length
			? div.c("flex gap wrap v-center", () => ["live", "landed", "idea"].forEach(k => counts[k] &&
				div.c("flex gap v-center", () => { span.c("ai-dot").ac(k !== "landed" && k); span.c("muted", counts[k] + " " + k); })))
			: span.c("muted", "no tasks yet"));
	});
}

export default dashboard;
