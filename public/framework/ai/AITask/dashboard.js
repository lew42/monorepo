import { a, div, p, span } from "../../core/View/View.js";
import { TaskJSONL } from "../../ext/JSONL/JSONL.js";
import { usage_rail } from "./usage.js";
import { dated, group, list, newest } from "./board.js";
import { efforts, tally } from "./effort.js";
import { compose } from "./compose.js";
import { fold } from "./message.js";
import AIDay from "../AIDay/AIDay.js";
import { state } from "./stats.js";
import { when } from "./card.js";
import { highlights, more } from "./highlights.js";
import { needs_all, needs_strip } from "./needs.js";
import { day_costs, total_line } from "./cost.js";

// history and reasons: doc/dashboard-notes.md
function mark_read(id){
	try {
		const key = "ai2-read-ids";
		const set = new Set(JSON.parse(localStorage.getItem(key) ?? "[]"));
		set.add(id);
		localStorage.setItem(key, JSON.stringify([...set]));
	} catch {}
}

const running = t => state(t.m) === "running";

/* ⚠ The SPA fallback answers every miss with index.html — content-type is the 404. */
const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

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

const day_cache = new Map();

// ⚠ Silent off localhost (no socket); ⚠ el.isConnected: navigated-away boards must not redraw
function on_directory(page, $v, reread){
	page?.app?.socket?.on("data", path => {
		if (!path.endsWith("/directory.json") || !$v.el.isConnected) return;
		day_cache.clear();
		reread();
	});
}

export function warm(date){
	if (!day_cache.has(date)){
		const entry = { value: undefined };
		json("/framework/directory.json").then(dir => {
			const day = ai_dir(dir).find(d => d.name === date);
			entry.value = Object.fromEntries(kids_of(day ?? { children: [] })
				.map(kid => [kid.name, kid.children?.map(k => k.name) ?? []]));
		});
		day_cache.set(date, entry);
	}
	return day_cache.get(date);
}

// Sync fetch for route() which must return immediately, not a Promise
function fetch_sync(url){
	const xhr = new XMLHttpRequest();
	xhr.open("GET", url, false);
	try { xhr.send(); } catch { return null; }
	return xhr.status >= 200 && xhr.status < 300 && !(xhr.getResponseHeader("content-type") ?? "").includes("html")
		? JSON.parse(xhr.responseText) : null;
}

/** Does `name`'s task dir carry its own `page.js`? Answers from the async
    cache once warm() has landed; falls back to one synchronous fetch the
    first time it's asked cold, so a fresh deep link is never a guess. */
export function has_page_js(date, name){
	const entry = warm(date);
	if (entry.value === undefined){
		const dir = fetch_sync("/framework/directory.json");
		const day = dir && ai_dir(dir).find(d => d.name === date);
		entry.value = Object.fromEntries(kids_of(day ?? { children: [] })
			.map(kid => [kid.name, kid.children?.map(k => k.name) ?? []]));
	}
	return entry.value?.[name]?.includes("page.js");
}

/* day.jsonl is plain JSONL, not a directory manifest — its own small reader,
   same SPA-fallback guard as json() above. */
async function day_log(date){
	const res = await fetch(`/framework/ai/sessions/${date.replaceAll("-", "/")}/day.jsonl`).catch(() => null);   // the day log lives in the sessions store (ai/doc/task-folders.md)
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return [];
	const text = await res.text();
	return text.split("\n").filter(Boolean).flatMap(line => {
		try { const l = JSON.parse(line).log; return l ? [l] : []; } catch { return []; }
	});
}

export function timeline(date){
	return div.c("ai-timeline wide", async $t => {
		const lines = (await day_log(date)).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
		$t.append(() => lines.length && fold(`timeline — ${lines.length} log lines today`, () =>
			lines.forEach(l => {
				const text = `${when(l.at)} — ${l.task ? l.task + ": " : ""}${l.msg}`;
				(l.task ? a.c("ai-day-line").href(`/framework/ai/${date}/${l.task}/`)
					: div.c("ai-day-line muted")).text(text).attr("title", text);
			})));
	});
}

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

const GROUPS = [
	["Active", t => state(t.m) === "running"],
	["Landed", t => state(t.m) === "landed"],
	["Proposed", t => state(t.m) === "proposed" && (t.m || t.files.includes("requirements.md"))],
];

function groups(rows_of){
	const found = GROUPS.map(([title, match]) => [title, rows_of.filter(match).sort(newest)]);

	if (!found.some(([, rows]) => rows.length))
		return p.c("muted", "Nothing yet — a task appears when its directory holds a requirements.md or a task.jsonl.");

	day_costs(rows_of.filter(t => t.m));

	found.forEach(([title, rows]) => {
		if (!rows.length) return;
		if (title === "Proposed") return fold(`${title} — ${rows.length} not started`, () => list(rows));
		group(title, rows).ac(title === "Landed" && "ai-compact");
	});
}

// Pure UTC date arithmetic; see doc/dashboard-notes.md for timezone traps
function addDays(dateStr, delta){
	const [y, m, d] = dateStr.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	dt.setUTCDate(dt.getUTCDate() + delta);
	return dt.toISOString().slice(0, 10);
}

// Local calendar day, not UTC; see doc/dashboard-notes.md
function todayStr(){
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Never a link into the future — tomorrow has no page yet
export function day_nav(date){
	return div.c("flex gap v-center ai-day-nav", () => {
		a("‹ " + addDays(date, -1)).href(`/framework/ai/${addDays(date, -1)}/`);
		span.c("muted", date);
		if (addDays(date, 1) <= todayStr()) a(addDays(date, 1) + " ›").href(`/framework/ai/${addDays(date, 1)}/`);
	});
}

// Month view: the month's days as links to their day pages (a day page reads the store; nothing is summed here).
export function monthPage(page, month){
	const [y, m] = month.split("-").map(Number);
	const title = new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
	const days = Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`).filter(d => d <= todayStr());
	div.c("flex v gap", () => {
		p.c("doc-title h2", title);
		div.c("flex gap wrap", () => days.forEach(d => a.c("ai-link", d.slice(8)).href(`/framework/ai/${d}/`).attr("title", d)));
	});
}

/** A day page body: the one check-mark list (AIDay), read from the store. The old per-day page.js files still call this. */
export function dashboard(page){ return new AIDay({ day: page?.name ?? page?.title }); }

const strip = rows => {
	const live = rows.filter(running);
	return live.length ? group("Active", live, dated) : p.c("muted", "Nothing running right now.");
};

// What is running right now, above everything else
export function active_strip(list){
	return div.c("ai-active", async $a => {
		let rows;
		const redraw = () => rows && $a.empty(() => strip(rows));
		rows = await Promise.all(list.filter(running)
			.map(t => load(t.url, t.name, t.files, null, null, redraw)));
		$a.append(() => strip(rows));
	});
}

// ⚠ Returns synchronously (catalog needs no await); fills inside a callback
// The ai index: running now, usage, then HIGHLIGHTS — newest first
// see doc/dashboard-notes.md for archive rationale
function merge_usage(claude, openrouter){
	const limits = [...(claude?.utilization?.limits ?? []), ...(openrouter?.utilization?.limits ?? [])];
	return limits.length ? { utilization: { limits } } : null;
}

export function rail(page){
	return div.c("ai-index-rail flow", async $r => {
		let [usage, or_usage, list] = await Promise.all(
			[json("/framework/ai/usage.json"), json("/framework/ai/openrouter-usage.json"), all_tasks()]);

		const draw = () => $r.empty(() => {
			// ⚠ Blocker items first: they stop whole threads until the owner acts
			needs_strip(needs_all(list));
			active_strip(list);
			// Dollar figures from raw limit, ride as label override
			const or_week = or_usage?.utilization?.limits?.find(l => l.kind === "openrouter_weekly");
			const money = v => typeof v === "number" ? "$" + v.toFixed(2) : "?";
			usage_rail(merge_usage(usage, or_usage), or_week ? {
				openrouter_weekly: `OpenRouter — this week, ${money(or_week.usage_weekly)} of ${money(or_week.cap)} (${money(or_week.monthly)}/month)`
			} : undefined);
			highlights(list);
			div.c("ai-out", () => {
				span.c("muted", "Every task of every day, newest first — ");
				a.c("ai-link", "the whole log").href("/framework/ai/log/");
			});

			// ⚠ Mark links inside draw() because cold deep links missed the mark pass
			page?.app?.router?.mark_links();
		});

		draw();

		on_directory(page, $r, async () => { list = await all_tasks(); draw(); });
	});
}

const PAGE = 40;   // roughly two screens at 1920

// `shown` lives in closure; re-sorts through dated()
function paged(rows){
	const sorted = [...rows].sort(newest);
	let shown = PAGE;

	return div.c("ai-paged", $p => {
		const draw = () => $p.empty(() => {
			dated(sorted.slice(0, shown));
			if (sorted.length > shown) more(PAGE, sorted.length - shown, () => { shown += PAGE; draw(); });
			else div.c("muted", `All ${sorted.length} tasks.`);
		});

		draw();
	});
}

// Everything in-flight first, then newest first, PAGE at a time
export function log_board(page){
	// ⚠ `wide` not `bleed` — bleed spends the page's two gutter tracks
	return div.c("ai-all flow wide", async $l => {
		const list = await all_tasks();
		$l.append(() => {
			active_strip(list);
			compose(efforts(list));
			paged(list.filter(t => !running(t)));
		});

		page?.app?.router?.mark_links();
	});
}

// The same spine, filtered to one effort
export function effort_board(page, slug){
	return div.c("ai-effort", async $e => {
		const list = (await all_tasks()).filter(t => t.m?.group === slug);

		$e.append(() => {
			if (!list.length) return void p.c("muted", "No task claims this effort — a task joins one by naming it as `group` in its log.");
			total_line(list, "on this effort, every day");
			dated(list);
		});

		page?.app?.router?.mark_links();
	});
}

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
