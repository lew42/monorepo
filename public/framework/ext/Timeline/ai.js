import { View } from "../../core/View/View.js";
import { Timeline } from "./Timeline.js";
import { TaskJSONL } from "../JSONL/JSONL.js";

/* ⚠ The SPA fallback answers a miss with index.html — content-type is the 404. */
const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

// task.jsonl first (dots come free from its logs/actions), else legacy session.json (bars only).
async function manifest(base, files){
	if (files.includes("task.jsonl")){
		const t = await new TaskJSONL({ url: base + "task.jsonl" }).load();
		if (t.loaded) return [t, true];
	}
	return files.includes("session.json") ? [await json(base + "session.json"), false] : [null, false];
}

function task_item(name, url, m, log){
	if (!m?.requested_at) return null;

	return {
		from: m.requested_at, to: m.landed_at, url, label: name, kind: "task",
		children: log ? [
			...m.logs.map(l => ({ at: l.at, kind: "log", label: l.msg })),
			...m.actions.map(a => ({ at: a.at, kind: "action", label: a.did })),
		] : [],
	};
}

async function day_items(day){
	const base = `/framework/ai/${day.name}/`;
	const dirs = day.children?.filter(k => k.type === "dir") ?? [];

	const tasks = await Promise.all(dirs.map(async dir => {
		const [m, log] = await manifest(base + dir.name + "/", dir.children?.map(k => k.name) ?? []);
		return task_item(dir.name, base + dir.name + "/", m, log);
	}));

	return [{ at: day.name + "T00:00:00", kind: "day", label: day.name }, ...tasks.filter(Boolean)];
}

// A flat band at the CURRENT 5h percent — a stepped fill from usage.jsonl's
// history is phase 2 (ext/Timeline/readme.md).
async function window_band(){
	const win = (await json("/framework/ai/usage.json"))?.utilization?.five_hour;
	if (!win?.resets_at) return [];

	const resets = Date.parse(win.resets_at);
	return [{ from: new Date(resets - 5 * 3600000).toISOString(), to: win.resets_at, kind: "window", label: Math.round(win.utilization) + "%" }];
}

async function items(){
	const dir = await json("/framework/directory.json");
	const days = dir?.files?.find(f => f.name === "ai")?.children
		?.filter(d => d.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(d.name)) ?? [];

	const per_day = await Promise.all(days.map(day_items));
	return [...await window_band(), ...per_day.flat()];
}

/**
 * ai_timeline(page) — a vertical, newest-at-top Timeline over every day's
 * logs: day dirs from directory.json, each task's task.jsonl (else legacy
 * session.json) as a bar, its logs/actions as child dots, the live 5h window
 * as a band. `previews()` needs a real element NOW, not a promise, so this
 * returns the Timeline synchronously (empty) and fills it once the fetches
 * land — `tl.empty(() => tl.render())` re-establishes the captor, so the
 * refill is exactly as safe as the first synchronous render.
 *
 * ⚠ Memoized ON THE PAGE: `previews()` isn't called only by the page's own
 * catalog rail — `framework/page.js`'s `walls()` calls `previews()` on every
 * child that has children, `ai` included, to draw its topic-wall section.
 * Without memoizing, that's a second `new Timeline` + a second fetch of the
 * same data, landing as a dead duplicate `.timeline` wherever the arrangement
 * contract hides it. Returning the cached instance isn't enough on its own —
 * auto-append-via-captor (`View.prerender()`) only fires at CONSTRUCTION, so
 * a cache hit is explicitly re-appended to the CURRENT captor, which is
 * whatever `div.c(…, () => …)` callback is asking right now. `View.append()`
 * on an already-mounted view MOVES the element rather than cloning it, so
 * the Timeline ends up wherever it was asked for LAST — the page's own rail,
 * since Router activates ancestors (walls() included) before the page itself.
 */
export function ai_timeline(page){
	if (page._timeline){
		View.captor?.append(page._timeline);
		return page._timeline;
	}

	const tl = new Timeline({ orientation: "v", reverse: true, zoom: 2, items: [] });
	items().then(list => tl.assign({ items: list }).empty(() => tl.render()));
	return page._timeline = tl;
}

export default ai_timeline;
