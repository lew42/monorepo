import { div, p, span } from "../../core/View/View.js";
import { TaskJSONL } from "../JSONL/JSONL.js";
import { usage_rail } from "./usage.js";
import { card } from "./card.js";
import { effort_groups, efforts, tally } from "./effort.js";
import { compose } from "./compose.js";
import { state } from "./stats.js";

/* The day dashboard and the ai index rail, over the same rows. A task directory
   speaks through its files: requirements.md alone is PROPOSED, a manifest with
   no landed_at is RUNNING, landed_at is LANDED. Enumeration comes from the dev
   server's directory manifest (declared children on static hosting); the
   live-reload socket makes an open dashboard follow every manifest write. */

const active = t => t.m?.landed_at ?? t.m?.requested_at ?? "";

/* ⚠ The SPA fallback answers every miss with index.html — content-type is the 404. */
const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

// task.jsonl is the log-native manifest; session.json the legacy snapshot.
// `files` is the directory listing when we have one — a blind fetch would 404 the console.
async function manifest(base, files){
	if (!files || files.includes("task.jsonl")){
		const t = await new TaskJSONL({ url: base + "task.jsonl" }).load();
		if (t.loaded) return t;
	}
	return !files || files.includes("session.json") ? json(base + "session.json") : null;
}

const ai_dir = dir => dir?.files?.find(f => f.name === "ai")?.children ?? [];
const kids_of = day => (day.children ?? []).filter(kid => kid.type === "dir");

async function load(base, name, files, child, nav){
	const m = await manifest(base, files);
	const brief = !m && files?.includes("requirements.md")
		? await fetch(base + "requirements.md").then(r => r.ok ? r.text() : "").catch(() => "")
		: "";
	return { name, m, files: files ?? [], url: base, child, nav, title: child?.title ?? name,
		brief: brief.split("\n").map(s => s.trim()).find(s => s && !s.startsWith("#"))?.replaceAll("**", "") };
}

async function tasks(page){
	const date = page.url.split("/").filter(Boolean).at(-1);
	const day = ai_dir(await json("/framework/directory.json")).find(d => d.name === date);
	const dirs = day && kids_of(day);
	const names = dirs?.map(kid => kid.name) ?? [...page.children.keys()];

	return Promise.all(names.map(name => load(page.url + name + "/", name,
		dirs ? dirs.find(kid => kid.name === name)?.children?.map(kid => kid.name) ?? [] : null,
		page.children.get(name), page.nav_for(name))));
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

function groups(list, show_day){
	const found = GROUPS.map(([title, match]) =>
		[title, list.filter(match).sort((x, y) => active(y).localeCompare(active(x)))]);

	if (!found.some(([, rows]) => rows.length))
		return p.c("muted", "Nothing yet — a task appears when its directory holds a requirements.md or a task.jsonl.");

	found.forEach(([title, rows]) => rows.length && div.c("ai-group", () => {
		div.c("ai-group-title muted", () => { span(title); span.c("ai-count", " " + rows.length); });
		div.c("ai-cards", () => rows.forEach(t => card(t, show_day)));
	}));
}

/* A day's own tasks. No usage meters here — the ai index is always this page's
   ancestor, so its rail is already showing them beside this. */
export function dashboard(page){
	return div.c("ai-dashboard flow bleed", async $d => {
		const list = await tasks(page);
		$d.append(() => groups(list));
	});
}

/**
 * The ai index's rail — the usage windows, then every task across every day,
 * grouped by the effort it belongs to. State is the day dashboard's axis; up
 * here a day is the wrong unit, because an effort outlives one. ⚠ Returns the
 * element synchronously (catalog's previews() has no time to await) and fills
 * it inside a callback, which re-establishes the captor the first await dropped.
 */
export function rail(page){
	return div.c("ai-index-rail flow", async $r => {
		const [usage, list] = await Promise.all([json("/framework/ai/usage.json"), all_tasks()]);
		$r.append(() => {
			usage_rail(usage);
			const found = efforts(list);
			compose(found);
			effort_groups(found);
		});

		// ⚠ These cards were built after catalog's mark pass, so they missed it —
		// on a cold deep link nothing in the rail would be lit.
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
