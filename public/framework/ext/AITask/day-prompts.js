import { div, p, span, a, small, h3, button } from "../../core/View/View.js";
import { GLOSSARY } from "../Refine/engine.js";
import { mentions } from "../Mention/Mention.js";

/* day-prompts.js — the owner's own words for one day, refined (deliverable 2/3,
   public/framework/ai/sessions/2026/10/04/day-cards/day-cards/requirements.md).
 *
 * WHERE THE WORDS LIVE: every owner prompt is one `Prompt` item on its own session
 * page — `/framework/ai/<Y>/<M>/<D>/session-<id>/page.jsonl` ("a session is a page",
 * Echo.js's own doc comment). Echo.js already refines a LIVE prompt the moment it
 * lands (clean() -> structure() -> a `sentences`/`sections`/`flags` delta written
 * onto that same item, through `page_set`). This file reads that same shape back —
 * it never recomputes a cost or a sentence itself (law 7) — and is silent about
 * `sections`/`sentences` a prompt doesn't have yet: `node Server/day-prompts-
 * refine.mjs <date>` is the retroactive half, run once for old days, same pipeline,
 * same wire line.
 *
 * TWO VIEWS, EACH ITS OWN URL (the owner's own follow-up, 2026-10-04): BY TIME
 * (default, `prompts_section`) lists every prompt in the order it was said, each
 * prompt's own sections nested under it. BY SYSTEM (`system_view`, `/<date>/by-
 * system/`) regroups the SAME sections under the module they are mostly about —
 * a cheap, code-only bucket (GLOSSARY keyword count, law 7: computed, never a
 * second model call) — biggest group first. Not a model re-classification: that
 * would be a second paid pass over the same words `structure()` already read once;
 * this is good enough to answer "what did I say about the page system today",
 * the owner's own example, and never silently drops a point (anything matching no
 * module lands in "General", not nowhere). */

const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

function sessionDirs(dir, date){
	const [y, m, d] = date.split("-");
	return (dir?.find(x => x.name === y)?.children ?? [])
		.find(x => x.name === m)?.children?.find(x => x.name === d)?.children
		?.filter(c => c.name.startsWith("session-")).map(c => `/framework/ai/${y}/${m}/${d}/${c.name}/`) ?? [];
}

// The Y -> M -> D -> session walk, off the one directory manifest every other AI
// board already fetches (dashboard.js's own `ai_dir`, duplicated small rather than
// imported — that function reads `directory.json`'s OWN ai/ subtree shape, this
// one only needs three levels deeper).
async function sessionsFor(date){
	const dir = await json("/framework/directory.json");
	const ai = dir?.files?.find(f => f.name === "ai")?.children ?? [];
	return sessionDirs(ai, date);
}

// One calendar day back, pure date-component arithmetic (dashboard.js's own
// `addDays`, duplicated rather than imported — importing FROM a page's own
// module here would run the other way round the direction dashboard.js already
// imports THIS file). A SESSION's folder is named for the day it started, but a
// long-lived session can log a prompt a day or more later into that same file
// (found in review, 2026-10-04: 66 of one day's prompts were filed under the
// PRIOR day's folder) — searching yesterday's folder too, then filtering every
// item by its own `ts`, is what actually finds them all; searching by folder
// name alone silently drops any prompt that crossed midnight.
function prevDay(date){
	const [y, m, d] = date.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	dt.setUTCDate(dt.getUTCDate() - 1);
	return dt.toISOString().slice(0, 10);
}

/* Replay ONE session's page.jsonl into EVERY Prompt item it holds (review,
   2026-10-04: a session can log dozens — the first version kept only the LAST
   one, silently dropping the rest) plus every later delta on top of each —
   the exact merge rule Echo.js's own `read_item` doc comment describes (both
   wire shapes: the old `{"at":"content", add:{...}}` and the current
   `{"content":{"add":{...}}}`, plus a bare `{[id]: {...}}` page_set line). */
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

/** Every owner prompt SAID on `date` (YYYY-MM-DD) — by its own `ts`, never by
    which folder its session happened to be filed under — oldest first, each
    with whatever Echo (live or retroactive) has already added — `sentences`,
    `sections`, `flags`, `cost`. A prompt with none of that yet still comes back
    (`refined: false`), so the page can say so instead of silently dropping it. */
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

/* A prompt's own reading: its sections (heading + bullets) when `structure()`
   succeeded, else its plain numbered sentences, else — not refined yet — the
   first 200 characters of what was actually said, so the day is never missing
   a prompt just because nothing has refined it yet. `mentions()` (ext/Mention)
   turns any #Page, @agent or /path already in the owner's own words into a real
   link in place — the owner's own ask (2026-10-04): "show the concrete IDs and
   links first", the cheapest version of that is never hiding the ones already
   said, rather than inventing new ones with a model call this retroactive pass
   doesn't make. */
function bullet(text){ return mentions(p.c("day-prompt-bullet").text(text).el); }
function promptBody(it){
	if (it.sections?.length) return div.c("flow", () => it.sections.forEach(s => {
		if (s.heading) h3.c("day-prompt-heading", s.heading);
		s.items.forEach(b => bullet(b.text));
	}));
	if (it.sentences?.length) return bullet(it.sentences.map(s => s.text).join(" "));
	return p.c("muted", (it.text ?? "").slice(0, 200) + ((it.text ?? "").length > 200 ? "…" : "") + " — not refined yet");
}

/** Every sentence under 0.6 confidence, across the whole day, grouped under the
    prompt it came from — the owner's own ask (deliverable 3): "a weighting or a
    confidence interval... lower confidence would trigger part of the review."
    Two DIFFERENT checks, both shown, each named for what it actually measures:
    `coverage.confidence` (structure.js) is how sure the PLACEMENT is — a
    sentence `structure()` dropped (0.2) or filed under two headings at once
    (0.4); `flags` (engine.js's `clean()`) is how sure the WORDING is — a
    mishearing clean() could not confidently resolve. Silent when there are
    none of either. */
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

// A prompt's own dominant topic — the SAME GLOSSARY bucket `bySystem()` groups by
// (reused, not a second idea of "topic": law 6), just read per-prompt instead of
// across the whole day. Used only for the context marker below, never to reorder.
function topicOf(it){
	const text = (it.sections?.length ? it.sections.flatMap(s => s.items.map(i => i.text)) : (it.sentences ?? []).map(s => s.text)).join(" ");
	return text ? bucketOf(text) : null;
}

/** BY TIME — the default reading (the owner, 2026-10-04: "never put events out of
    order" — one row per prompt, at the ONE timestamp it was actually sent, never
    reordered or merged across a topic switch). When the dominant topic changes
    from the prompt before it, a quiet one-line marker sits between them instead —
    "→ Dictate" the first time, "← back to Page system" if that topic was already
    open earlier in the day. A condensed/detailed toggle (own ask) collapses each
    prompt to its first line; nothing is ever hidden, only folded. */
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
		// Condensed: only the FIRST bullet of each prompt stays visible — nothing is deleted or
		// re-fetched, so flipping back to Detailed is instant. No new CSS class needed: this is
		// the whole behavior, done once, in plain JS.
		$t.toggle_condensed = on => $t.el.querySelectorAll(".day-prompt").forEach(row =>
			row.querySelectorAll(".day-prompt-bullet").forEach((b, i) => { b.style.display = on && i > 0 ? "none" : ""; }));
	});
}

// BY SYSTEM — bucket every section/sentence by the first GLOSSARY name (module
// or class) its own words mention; biggest bucket first, "General" last. Plain
// word matching, same `GLOSSARY` engine.js already keeps for the mishearing
// check — reused, not a second list (law 6).
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

/** The day page's own "your prompts, refined" section — `view` is "time" (default)
    or "system"; the toggle link between the two lives here too, each its own url
    (`<date>/` and `<date>/by-system/`), never a query-string state (route
    everything, CLAUDE.md). */
export function prompts_section(date, view = "time"){
	// THE FETCH RUNS FIRST, OUTSIDE ANY DRAW — "no DOM after an await" (CLAUDE.md): every
	// `p.c()`/`div.c()` below the `await dayPrompts()` line used to run straight off the
	// outer async captor, which does NOT survive the await (a bug, caught in review — the
	// "No prompts logged" line was landing in whatever captor happened to be active by the
	// time the fetch resolved, not inside this section at all). The fix is dashboard.js's
	// own idiom: `div.c(..., async $d => { const data = await …; $d.append(() => draw(data)); })`
	// — fetch inside the async captor callback, but every actual draw call happens inside a
	// NESTED `.append()`, which re-opens `$d` as the captor synchronously before drawing.
	return div.c("day-prompts-section flow", async $s => {
		div.c("flex gap wrap v-center", () => {
			h3("Your prompts, refined");
			span.c("muted", "— ");
			a("by time").ac(view === "system" && "muted").href(`/framework/ai/${date}/`);
			span("·");
			a("by system").ac(view === "time" && "muted").href(`/framework/ai/${date}/by-system/`);
			// Condensed/detailed — "enough for depth" on the timeline (the owner's own words,
			// 2026-10-04); by-system has no per-prompt rows to fold, so this is time-view only.
			// A plain `<button>`, stripped to read as a muted link inline (no new CSS class for
			// one toggle — review, 2026-10-04, found the browser's default button chrome left it
			// a boxy grey rectangle beside two plain links).
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
