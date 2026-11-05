/**
 * work.js — page_work(): every page's own open work, shown on the page.
 *
 * THE ASK (owner, 2026-09-29, relayed in page-work-brief.md): every page should
 * be able to show its own open tasks, working agents, notes and to-dos, and —
 * one click up — the same for each ancestor page, collapsed.
 *
 * THE GAP (page-work-data.md has the full research): no card, no agent, and
 * no old-style task.jsonl carries a field that names "this is /framework/x/y/'s
 * own work" — that field does not exist yet. So this file's match is a
 * practical stand-in, not the final shape: a page names a few KEYWORDS about
 * its own topic (e.g. Dictate → "dictat", "mic", "whisper"), and every open
 * Servex card and every live agent gets substring-matched against them. Once
 * cards carry a real `tags: ["dictate"]` project tag (the field exists,
 * `Servex/cards/Cards.js`, almost nobody sets it yet), swap the match in
 * `topic()` for an exact tag compare — everything above it stays the same.
 *
 * TWO VIEWS, same data (`doc/work.md` says which one to prefer and why):
 *   page_work($mount, opts)         — View A: the full block, always open.
 *   page_work_strip($mount, opts)   — View B: a one-line strip (counts, and
 *                                      each ancestor as a count), the exact
 *                                      same block opening below on click.
 *
 * `opts`:
 *   match      string[]  — keywords for THIS page's own topic.
 *   page       the calling page instance (pass `this` from inside `content()`) —
 *              its `page.parent` chain, walked all the way to the root, IS the
 *              ancestor list; no page has to type its own parents out by hand
 *              any more (review-2.md finding 7, 2026-09-29 fix round 2. Before
 *              this, `ancestors` was a hand-typed array here — every page that
 *              opted in had to repeat its own parent chain, and it stopped
 *              wherever the person writing it stopped typing, which is exactly
 *              the bug: ux/Dictate/page.js's list stopped at "ux", so
 *              Framework's own work never showed). Each ancestor supplies its
 *              own match: a `work_match` array PROPERTY set right on that page's
 *              `Doc`/`Page` definition (any key in a `new Doc({...})` object
 *              becomes an instance property — `Page.class.js`'s `assign()`),
 *              or, with no `work_match` declared, its own last url segment
 *              (e.g. "/framework/ux/" → "ux") — the same practical stand-in
 *              `match` itself is, until cards carry a real tag.
 *   extra      {title, url, done, at, icon}[]  — work this live match can't
 *              reach (a pre-card task.jsonl, or anything off Servex entirely).
 *              Named explicitly because there is no live index of it.
 *
 * FAILS SOFT like the rest of this folder (`live.js`): Servex unreachable
 * prints one plain sentence, never a console error.
 */
import { div, small, span, a, details, summary, icon } from "/app.js";
import { agents, cards } from "./live.js";

const ACTIVE = new Set(["working", "idle"]);
const SHOWN = 6; // cap per block — "less is more": a link to the rest, not a wall

const norm = s => String(s ?? "").toLowerCase();

function hit(row, keys){
	if (!keys?.length) return false;
	// A card's `id` is a full path (`2026/09/29/parent/child`) that inherits
	// its ANCESTOR's slug, so matching the whole path finds every unrelated
	// sub-card of a matching parent (found live: a "Layout explorer" sub-card
	// matched "dictat" only because its parent card was about dictation).
	// Only the id's own last segment is this row's OWN name.
	const leaf = norm(row.id).split("/").pop();
	const hay = norm(row.title) + " " + leaf + " " + norm(row.role) + " " + norm((row.tags ?? []).join(" "));
	const has = k => hay.includes(norm(k));
	// "whisper" on its own is too loose a word — real cards named "Composer" and
	// "Chat replies" matched it and had nothing to do with Dictate (review-2.md
	// finding 9). It only counts as a hit together with "dictat" or "mic" also
	// hitting; every other keyword still matches completely on its own.
	return keys.some(k => norm(k) === "whisper" ? has("dictat") || has("mic") : has(k));
}

// Two cards can carry the same title (seen live on Dictate: five separate "proof
// card (open-mic's JFK clip test)" rows, review-2.md finding 9) — one row per
// title is enough, and the newest (by `last`, falling back to `created`) is the
// one worth showing. Order of what SURVIVES doesn't matter here; `fill_rows`
// sorts everything again by date right after this runs.
function dedupe_by_title(cardRows){
	const newest = new Map();
	for (const c of cardRows){
		const key = norm(c.title);
		const at = String(c.last ?? c.created ?? "");
		if (!newest.has(key) || at > String(newest.get(key).last ?? newest.get(key).created ?? "")) newest.set(key, c);
	}
	return [...newest.values()];
}

/** One topic's open cards + live agents. `null` pieces mean Servex didn't answer. */
async function topic(keys){
	const [cardRows, agentRows] = await Promise.all([cards("open"), agents()]);
	const matched = cardRows === null ? null : cardRows.filter(c => hit(c, keys));
	return {
		cards: matched === null ? null : dedupe_by_title(matched),
		agents: agentRows === null ? null : agentRows.filter(r => ACTIVE.has(r.state) && hit(r, keys)),
	};
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function counts(data, extra = []){
	const cardN = data.cards?.length ?? 0;
	const agentN = data.agents?.length ?? 0;
	return { cardN, agentN, extraN: extra.length, total: cardN + agentN + extra.length };
}

function label(c){
	const parts = [];
	if (c.agentN) parts.push(plural(c.agentN, "agent") + " working");
	if (c.cardN) parts.push(plural(c.cardN, "open item"));
	if (c.extraN) parts.push(plural(c.extraN, "more"));
	return parts.join(", ") || "nothing open";
}

function row_line(iconName, text, href){
	div.c("flex gap-25 v-center page-work-row", () => {
		icon(iconName).style({ fontSize: "1rem", color: "var(--subtle)" });
		if (href) a.c("page-link", text).href(href);
		else span(text);
	});
}

/** The rows for one topic: newest first, open before done, capped at SHOWN. */
function fill_rows(data, extra = []){
	if (data.cards === null && data.agents === null && !extra.length){
		small.c("muted", "Servex is not answering on this machine — nothing to show.");
		return;
	}
	const rows = [
		...(data.agents ?? []).map(a => ({ at: a.started_at ?? "", done: false,
			draw: () => row_line("smart_toy", `${a.id} · ${a.role} · ${a.state}`, null) })),
		...(data.cards ?? []).map(c => ({ at: c.last ?? c.created ?? "", done: c.status === "done",
			draw: () => row_line(c.type === "note" ? "sticky_note_2" : "task_alt", c.title, "/framework/ai/" + c.id + "/") })),
		...extra.map(e => ({ at: e.at ?? "", done: !!e.done,
			draw: () => row_line(e.icon ?? "history", e.title, e.url) })),
	].sort((x, y) => (x.done !== y.done ? (x.done ? 1 : -1) : String(y.at).localeCompare(String(x.at))));

	if (!rows.length){
		small.c("muted", "Nothing open right now.");
		return;
	}
	rows.slice(0, SHOWN).forEach(r => r.draw());
	if (rows.length > SHOWN) small.c("muted", `+ ${rows.length - SHOWN} more not shown`);
}

/** The full block: this page's own rows, then one collapsed row per ancestor. */
function render_full(own, extra, ancResults){
	div.c("flex v gap-25 page-work", () => {
		fill_rows(own, extra);
		ancResults.forEach(anc => {
			const c = counts(anc.data, anc.extra ?? []);
			if (!c.total) return; // an ancestor with nothing open says nothing — no empty clutter
			details.c("ai-row page-work-parent", () => {
				summary(`Parent: ${anc.title} — ${label(c)}`);
				div.c("ai-row-body", () => fill_rows(anc.data, anc.extra ?? []));
			});
		});
	});
}

/** View B's one-line strip: counts here, then each ancestor as "Name N" in a breadcrumb. */
function strip_label(own, extra, ancResults){
	const mine = label(counts(own, extra));
	const parents = ancResults.filter(anc => counts(anc.data, anc.extra ?? []).total)
		.map(anc => `${anc.title} ${counts(anc.data, anc.extra ?? []).total}`).join(" · ");
	return `This page: ${mine}` + (parents ? ` — parents: ${parents}` : "");
}

// A page's own last url segment, the DEFAULT match for an ancestor that never
// declared its own `work_match` — e.g. "/framework/ux/" → ["ux"]. The site root
// has no segment at all, so it gets `[]`, and `hit()` already treats an empty
// keyword list as "no match" — a harmless, silent last entry, not a special case.
function default_match(page){
	const seg = (page?.url ?? "").split("/").filter(Boolean).pop();
	return seg ? [seg.toLowerCase()] : [];
}

// Every ancestor from the nearest parent up to the root — `page.parent`, walked
// (review-2.md finding 7). Replaces the old hand-typed `ancestors:` array: a
// page's place in the TREE is now the one source, so nobody re-types their own
// parent chain, and nobody can stop it short by forgetting a grandparent.
function ancestors_of(page){
	const list = [];
	for (let p = page?.parent; p; p = p.parent)
		list.push({ title: p.title ?? p.name ?? p.url, url: p.url, match: p.work_match ?? default_match(p) });
	return list;
}

async function gather(opts){
	const { match = [], page = null, extra = [] } = opts;
	const ancestors = ancestors_of(page);
	const [own, ancResults] = await Promise.all([
		topic(match),
		Promise.all(ancestors.map(anc => topic(anc.match).then(data => ({ ...anc, data })))),
	]);
	return { own, extra, ancResults };
}

/**
 * View A — the full block, open by default. `$mount` must already be a
 * captured, empty container (capture it synchronously; this fills it later,
 * in a callback, per the framework's own no-DOM-after-await rule).
 */
export async function page_work($mount, opts = {}){
	const { own, extra, ancResults } = await gather(opts);
	$mount.append(() => render_full(own, extra, ancResults));
}

/** View B — a thin counts strip; the exact same block opens below on click. */
export async function page_work_strip($mount, opts = {}){
	const { own, extra, ancResults } = await gather(opts);
	$mount.append(() => {
		details.c("page-work-strip", () => {
			summary(strip_label(own, extra, ancResults));
			div.c("page-work-strip-body pad", () => render_full(own, extra, ancResults));
		});
	});
}
