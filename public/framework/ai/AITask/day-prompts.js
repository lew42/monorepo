import { div, p, span, a, small, h3, button } from "../../core/View/View.js";
import { GLOSSARY } from "../../ext/Refine/engine.js";
import { mentions } from "../../ext/Mention/Mention.js";

// History and reasons: doc/day-prompts-notes.md
// Day page shows owner's own words, refined (Echo.js pipeline, law 7)

const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

function sessionDirs(dir, date){
	const [y, m, d] = date.split("-");
	return (dir?.find(x => x.name === y)?.children ?? [])
		.find(x => x.name === m)?.children?.find(x => x.name === d)?.children
		?.filter(c => c.name.startsWith("session-")).map(c => `/framework/ai/${y}/${m}/${d}/${c.name}/`) ?? [];
}

// Y -> M -> D -> session walk (duplicated from dashboard.js to avoid circular imports)
async function sessionsFor(date){
	const dir = await json("/framework/directory.json");
	const ai = dir?.files?.find(f => f.name === "ai")?.children ?? [];
	return sessionDirs(ai, date);
}

// Reason: search yesterday too (sessions can log prompts after midnight); filter by ts. See doc/day-prompts-notes.md.
function prevDay(date){
	const [y, m, d] = date.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	dt.setUTCDate(dt.getUTCDate() - 1);
	return dt.toISOString().slice(0, 10);
}

// Reads every Prompt item + its deltas; handles both old & new wire shapes (See doc/day-prompts-notes.md)
async function readPrompts(url){
	const res = await fetch(url + "page.jsonl").catch(() => null);
	if (!res?.ok) return [];
	const text = await res.text();
	const byId = new Map(), order = [];
	for (const raw of text.split(/\r?\n/)){
		if (!raw.trim()) continue;
		let line; try { line = JSON.parse(raw); } catch { continue; }
		const add = line.at === "content" ? line.add : line.content?.add;
		if (add?.type === "Prompt"){ byId.set(add.id, { ...add, url }); order.push(add.id); continue; }
		for (const id of Object.keys(line)) if (byId.has(id)) Object.assign(byId.get(id), line[id]);
	}
	return order.map(id => byId.get(id)).filter(it => it.by === "owner");
}

/** Every owner prompt said on `date` (YYYY-MM-DD) by `ts`, oldest first, with Echo's refinement data.
    Returns `refined: false` for prompts not yet refined, so the page shows them. */
export async function dayPrompts(date){
	const urls = new Set([...(await sessionsFor(prevDay(date))), ...(await sessionsFor(date))]);
	const items = (await Promise.all([...urls].map(readPrompts))).flat();
	return items
		.filter(it => typeof it.ts === "string" && it.ts.startsWith(date))
		.map(it => ({ ...it, refined: Array.isArray(it.sentences) && it.sentences.length > 0 }))
		.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
}

const time = ts => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const shortId = id => String(id ?? "").slice(0, 8);

// Renders sections/sentences/preview; mentions() turns #/@ and / into links (no new model calls)
function bullet(text){ return mentions(p.c("day-prompt-bullet").text(text).el); }
function promptBody(it){
	if (it.sections?.length) return div.c("flow", () => it.sections.forEach(s => {
		if (s.heading) h3.c("day-prompt-heading", s.heading);
		s.items.forEach(b => bullet(b.text));
	}));
	if (it.sentences?.length) return bullet(it.sentences.map(s => s.text).join(" "));
	return p.c("muted", (it.text ?? "").slice(0, 200) + ((it.text ?? "").length > 200 ? "…" : "") + " — not refined yet");
}

/** Low-confidence sentences (< 0.6): coverage.confidence (placement) and flags (wording).
    See doc/day-prompts-notes.md for what each measures. Silent if none. */
function checkThese(prompts){
	const rows = prompts.map(it => {
		const low = Object.entries(it.coverage?.confidence ?? {}).filter(([, c]) => c < 0.6);
		return { it, low, flags: it.flags ?? [] };
	}).filter(r => r.low.length || r.flags.length);
	if (!rows.length) return null;
	return div.c("day-check-these flow", () => {
		h3("Check these — low confidence");
		rows.forEach(({ it, low, flags }) => div.c("flex v", () => {
			a(`${time(it.ts)} —`).href(it.url).ac("muted");
			low.forEach(([n, c]) => p.c("muted", `S${n}: not clearly placed under one heading (confidence ${c})`));
			flags.forEach(f => p.c("muted", `S${f.sentence_n}: ${f.question} (wording confidence ${f.confidence})`));
		}));
	});
}

// Dominant topic per prompt (reused GLOSSARY, not a second idea: law 6); context marker only
function topicOf(it){
	const text = (it.sections?.length ? it.sections.flatMap(s => s.items.map(i => i.text)) : (it.sentences ?? []).map(s => s.text)).join(" ");
	return text ? bucketOf(text) : null;
}

/** BY TIME: one row per prompt at its ts, topic markers between switches, fold/unfold per prompt.
    See doc/day-prompts-notes.md for toggle and marker behavior. */
function byTime(prompts){
	if (!prompts.length) return p.c("muted", "No prompts logged for this day yet.");
	const seen = new Set();
	let last = null;
	return div.c("day-prompts flow", $t => {
		prompts.forEach(it => {
			const topic = topicOf(it);
			if (topic && topic !== last){
				p.c("muted day-topic-marker", seen.has(topic) ? `← back to ${topic}` : `→ ${topic}`);
				seen.add(topic);
				last = topic;
			}
			div.c("day-prompt flex v gap-25", () => {
				div.c("flex gap v-center", () => {
					a.c("muted").href(it.url).text(time(it.ts));
					small.c("muted", "#" + shortId(it.id));
				});
				promptBody(it);
			});
		});
		// Show/hide bullets after first (no refetch, instant toggle)
		$t.toggle_condensed = on => $t.el.querySelectorAll(".day-prompt").forEach(row =>
			row.querySelectorAll(".day-prompt-bullet").forEach((b, i) => { b.style.display = on && i > 0 ? "none" : ""; }));
	});
}

// BY SYSTEM: bucket by GLOSSARY name (reused from engine.js, law 6); biggest first, "General" last
function bucketOf(text){
	const low = String(text).toLowerCase();
	for (const name of GLOSSARY) if (low.includes(name.toLowerCase())) return name;
	return "General";
}
function bySystem(prompts){
	if (!prompts.length) return p.c("muted", "No prompts logged for this day yet.");
	const buckets = new Map();
	for (const it of prompts){
		const points = it.sections?.length ? it.sections.flatMap(s => s.items) :
			(it.sentences ?? []).map(s => ({ text: s.text }));
		for (const pt of points){
			const key = bucketOf(pt.text);
			if (!buckets.has(key)) buckets.set(key, []);
			buckets.get(key).push({ ...pt, at: it.ts, url: it.url });
		}
	}
	const sorted = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length);
	if (!sorted.length) return p.c("muted", "Nothing refined yet to group by system.");
	return div.c("day-by-system flow", () => sorted.forEach(([name, points]) => div.c("flow", () => {
		h3(`${name} — ${points.length}`);
		points.forEach(pt => div.c("flex gap v-center", () => {
			small.c("muted").text(time(pt.at));
			p(pt.text);
		}));
	})));
}

/** Section showing prompts; `view` is "time" (default) or "system", each its own url. */
export function prompts_section(date, view = "time"){
	// Fetch before draw to avoid DOM-after-await bug; see doc/day-prompts-notes.md
	return div.c("day-prompts-section flow", async $s => {
		div.c("flex gap wrap v-center", () => {
			h3("Your prompts, refined");
			span.c("muted", "— ");
			a("by time").ac(view === "system" && "muted").href(`/framework/ai/${date}/`);
			span("·");
			a("by system").ac(view === "time" && "muted").href(`/framework/ai/${date}/by-system/`);
			// Condense button for time view only (stripped button, no extra CSS class)
			if (view === "time"){
				span("·");
				let condensed = false;
				const $btn = button.c("muted").attr("type", "button").text("condense")
					.style({ border: "none", background: "none", padding: "0", font: "inherit", color: "inherit", textDecoration: "underline", cursor: "pointer" })
					.click(() => { condensed = !condensed; $btn.text(condensed ? "show detail" : "condense"); $list?.toggle_condensed?.(condensed); });
			}
		});
		let $list;
		const prompts = await dayPrompts(date);
		$s.append(() => {
			const unrefined = prompts.filter(it => !it.refined).length;
			if (unrefined) p.c("muted", `${unrefined} of ${prompts.length} not refined yet — node Server/day-prompts-refine.mjs ${date}`);
			$list = (view === "system" ? bySystem : byTime)(prompts);
			checkThese(prompts);
		});
	});
}

export default prompts_section;
