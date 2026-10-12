import { div, span, small, a, p, button } from "/app.js";
import { plain } from "../rail/inbox.js";
import { Faces } from "./Faces.js";
import { money } from "/framework/ext/AITask/cost.js";
import { Tasks } from "./Tasks.js";

/**
 * THE OUTLINE — an opened card, boiled down (the owner, 2026-09-25: "a simple
 * outline: current status, what was asked, what was delivered, digestible").
 *
 *   Name   ● running now · $42.21
 *   one line: what it is
 *   Status: where it stands
 *   Delivered      ✓ short title   time asked   → proof
 *   Still to do    ☐ short title   time asked
 *
 * Asked and delivered are ONE checklist. Its lines come from the card's own log,
 * `{"item": {"id", "title", "asked_at", "done", "proof"}}` (a later line with the
 * same id updates the earlier one), written by the card's assistant with
 * `add_item`. A card with none gets a checklist worked out from its tasks,
 * requests or prompts (`derived()`), so an older card is never blank.
 */

const DONE = new Set(["done", "closed", "resolved", "answered", "landed", "complete", "completed"]);
const RECENT = 30 * 60 * 1000;

export class Outline {

	/** A short plain title: the first sentence, cut at a natural break, never mid-word. */
	static short(text, max = 70){
		const s = String(text ?? "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[`*#>]/g, "").replace(/\s+/g, " ").trim();
		const first = s.split(/(?<=[.!?])\s/)[0].replace(/[.:]$/, "");
		if (first.length <= max) return first;
		const cut = first.slice(0, max);
		const at = Math.max(cut.lastIndexOf(": "), cut.lastIndexOf(" — "), cut.lastIndexOf(", "));
		return (at > 15 ? cut.slice(0, at) : cut.slice(0, cut.lastIndexOf(" "))).replace(/[,:;\s—-]+$/, "");
	}

	/** The checklist lines: the card's own `item` lines, else derived. */
	static items_of(card, g){
		const own = [...(card.outline_items?.values() ?? [])];
		return (own.length ? own : Outline.derived(card, g)).sort((x, y) => Date.parse(x.asked_at ?? 0) - Date.parse(y.asked_at ?? 0));
	}

	/* ⚠ A task asked in fewer than 25 letters ("yes, add it as a note") is a reply
	   that was filed as a task, not something asked: it is left out. */
	static derived(card, g){
		const ai2 = card.shell?.ai2, groups = ai2?.groups, out = [];
		const bases = g ? groups.members(g.id).filter(m => m.kind === "task").map(m => m.base) : [Tasks.task_of(card)].filter(Boolean);
		for (const base of bases){
			const t = groups?.task_member(base);
			if (!t || plain(t.request ?? "").length < 25) continue;
			const at = t.last_at ?? t.requested_at;
			// A task`s own plain `title` wins over its request cut short (the owner, 2026-09-25:
			// "When I respond on that page" means nothing; "Live card: replying hid the usage bars" does).
			out.push({ id: base, title: t.title ?? Outline.short(t.request), asked_at: t.requested_at ?? at, done: !!t.landed_at, proof: base,
				now: t.landed_at ? "" : plain(t.now ?? ""), live: !t.landed_at && Date.now() - Date.parse(at ?? 0) < RECENT });
		}
		for (const slug of card.subs()){
			const id = card.id + "/" + slug, s = ai2?.cards?.card(id);
			if (Outline.short(s?.title ?? slug).length > 4) out.push({ id, title: Outline.short(s?.title ?? slug), asked_at: s?.created, done: DONE.has(s?.status), proof: card.url + slug + "/" });
		}
		if (!out.length) (card.prompts ?? []).forEach(pr => {
			const title = Outline.short(pr.raw ?? pr.text);
			if (title.length > 3) out.push({ id: pr.id, title, asked_at: pr.at, done: false });
		});
		return out;
	}

	/** One plain line: what the card is. */
	static about_line(card, g){
		const words = g?.about ?? card.description ?? card.text ?? card.refined?.text ?? card.prompts?.[0]?.raw ?? card.prompts?.[0]?.text ?? "";
		return Outline.short(words, 140);
	}

	/** Where it stands, in one line. */
	static status_line(items, card){
		if (!items.length) return card.facts().status === "done" ? "Done." : null;   // no "Nothing asked yet.": a card whose asks live in its text would read as empty (ai2-lead audit)
		const done = items.filter(i => i.done).length, run = items.find(i => !i.done && i.now);
		if (done === items.length) return "All " + items.length + " done.";
		return done + " of " + items.length + " things you asked are done." + (run ? " Now: " + Outline.short(run.now, 90) + "." : "");
	}

	/* "NOTHING RUNNING · COST NOT TRACKED" EVERY TIME WAS THE NOISE (the owner,
	   2026-10-03: show status in the head only when something IS running). The idle
	   and done words, and the always-there cost line, moved to the properties
	   sidebar (`card.js` `properties_sidebar()`) — this draws nothing when nothing
	   is live, so a quiet card has a quiet head. */
	/** `● running now · $42.21` while something is: the one state worth a header line. */
	static state_span(items, usd, open){
		if (!items.some(i => i.live)) return;
		span.c("ai2-state live", () => {
			span.c("ai2-state-dot").text("●");
			span("running now");
			span.c("muted").text(" · " + (usd != null ? money(usd) + (open ? "+" : "") + " spent" : "cost not tracked"));
		});
	}

	/** One line of the checklist. */
	static line(it){
		div.c("ai2-ol-row" + (it.done ? " done" : " open") + (it.live ? " live" : ""), () => {
			span.c("ai2-ol-mark").text(it.done ? "✓" : "☐");
			span.c("ai2-ol-title").text(it.title);
			small.c("ai2-ol-time muted").text(Faces.when(it.asked_at));
			if (it.proof) a.c("ai2-ol-proof page-link").href(it.proof).text("→ open");
		});
	}

	/* THE OUTLINE IS A SMALL GRID, THEN ONE LIST (the owner, 2026-09-25):
	     To do 5   Delivered 8   All 13        ← "bam, I can understand that without reading the list"
	     ☐ …  (to do first: "the five to do are probably more important than the eight done")
	     ✓ …
	   The three numbers ARE the filter: press one and the list shows only those. No status
	   sentence above it — "8 of 13 done" only repeated the grid. The filter is a class on
	   the box, so pressing it redraws nothing. */
	static newest = (x, y) => Date.parse(y.asked_at ?? 0) - Date.parse(x.asked_at ?? 0);
	static outline(card, items){
		if (!items.length) return;
		const open = items.filter(i => !i.done).sort((x, y) => (y.live ? 1 : 0) - (x.live ? 1 : 0) || Outline.newest(x, y));
		const done = items.filter(i => i.done).sort(Outline.newest);
		card.ol_show ??= open.length ? "open" : "all";
		div.c("ai2-ol show-" + card.ol_show, $box => {
			div.c("ai2-ol-grid", () => {
				[["open", "To do", open.length], ["done", "Delivered", done.length], ["all", "All", items.length]].forEach(([k, name, n]) => {
					button.c("ai2-ol-count" + (card.ol_show === k ? " on" : "")).attr("type", "button").attr("data-show", k)
						.attr("title", "show " + (k === "all" ? "everything" : name.toLowerCase()) + " in the list below")
						.append(() => { span.c("ai2-ol-n").text(String(n)); span.c("ai2-ol-name").text(name); })
						.click(() => {
							card.ol_show = k;
							$box.el.className = "ai2-ol show-" + k;
							$box.el.querySelectorAll(".ai2-ol-count").forEach(b => b.classList.toggle("on", b.dataset.show === k));
						});
				});
			});
			div.c("ai2-ol-list", () => { open.forEach(Outline.line); done.forEach(Outline.line); });
		});
	}
}

export default Outline;
