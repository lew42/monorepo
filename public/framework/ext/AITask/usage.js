import { div, span, p } from "../../core/View/View.js";

/* The usage windows, as pace rather than a bare percentage. Each window is a
   fixed length, so `resets_at` gives us how far in we are — a ▼ over the track.
   The bar is spend; the marker is the clock. Bar behind marker = under pace. */

const KINDS = { session: "5h session", weekly_all: "weekly — all models" };
const label_of = l => KINDS[l.kind]
	?? (l.kind === "weekly_scoped" ? "weekly — " + (l.scope?.model?.display_name ?? "scoped") : l.kind);

const LENGTH = { session: 5 * 3600e3, weekly: 7 * 86400e3 };

const left = ms => ms <= 0 ? "resetting"
	: ms < 3600e3 ? Math.round(ms / 60e3) + "m left"
	: ms < 86400e3 ? Math.floor(ms / 3600e3) + "h " + Math.round(ms % 3600e3 / 60e3) + "m left"
	: Math.floor(ms / 86400e3) + "d " + Math.floor(ms % 86400e3 / 3600e3) + "h left";

const TONES = "calm warm hot burning";

/**
 * Where the clock is, and whether spend is ahead of it. `projected` is the
 * end-of-window total at the current rate — the number the color reads.
 * ⚠ The first tenth of a window is noise: 1% spent three minutes in projects
 * to 100% and means nothing, so it stays calm until there's signal.
 */
export function pace(limit, now = Date.now()){
	const span = LENGTH[limit.group], resets = Date.parse(limit.resets_at);
	if (!span || !resets) return { tone: "calm" };

	const remaining = resets - now;
	const elapsed = Math.min(1, Math.max(0, 1 - remaining / span));
	const projected = elapsed > 0.1 ? limit.percent / elapsed : null;

	return { elapsed, remaining, projected,
		tone: projected == null || projected <= 100 ? "calm"
			: projected <= 125 ? "warm" : projected <= 175 ? "hot" : "burning" };
}

function meter(limit){
	let $fill, $mark, $note;

	const $m = div.c("ai-meter", () => {
		div.c("flex split v-baseline", () => {
			span.c("muted", label_of(limit));
			span.c("ai-pct", limit.percent + "%");
		});
		div.c("ai-gauge", () => {
			$mark = span.c("ai-mark");
			div.c("ai-track", () => { $fill = div.c("ai-fill"); });
		});
		$note = div.c("muted ai-note");
	});

	// ⚠ Properties and classes only — never rebuild DOM here; the captor is long gone.
	const paint = () => {
		const s = pace(limit);
		$fill.style("--pct", limit.percent + "%").rc(TONES).ac(s.tone);
		$mark.style("--at", (s.elapsed ?? 0) * 100 + "%").ac(s.elapsed == null && "hidden");
		$note.text([s.remaining != null && left(s.remaining),
			s.projected > 100 && "on pace for " + Math.round(s.projected) + "%"].filter(Boolean).join(" · "));
	};

	paint();
	return paint;
}

/**
 * usage_rail(u) — one meter per limit in a `usage.json` snapshot. Returns the
 * element synchronously; a 60s tick walks the clock forward in place so the
 * marker doesn't go stale between snapshot refreshes.
 */
export function usage_rail(u){
	const limits = u?.utilization?.limits;
	if (!limits?.length) return p.c("muted", "No usage.json yet — the check-claude-usage skill writes it.");

	const paints = [];
	const $u = div.c("ai-usage", () => limits.forEach(l => paints.push(meter(l))));

	const id = setInterval(() => $u.el.isConnected ? paints.forEach(fn => fn()) : clearInterval(id), 60e3);
	return $u;
}

export default usage_rail;
