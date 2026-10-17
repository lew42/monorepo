import { div, span } from "../../core/View/View.js";
import { pace } from "../AITask/usage.js";

/* Usage against pace, three ways. `ai/AITask/usage.js` (usage_rail) keeps the meter that shows spend with a clock marker;
 * these variants show spend RELATIVE to the clock, so early in a window (when 3% of the bar is all there is) the answer is still readable.
 * 100% of pace = exactly on the clock. Doc: readme.md. */
export default class UsagePace {

	/* The same names usage_rail uses, so one limit has one name on the page. */
	static KINDS = { session: "5h session", weekly_all: "weekly — all models" };
	static label(l){ return UsagePace.KINDS[l.kind] ?? (l.kind === "weekly_scoped" ? "weekly — " + (l.scope?.model?.display_name ?? "scoped") : l.kind); }

	/* One limit -> the numbers every variant draws. `ratio` is null in the first tenth of a window (noise, same rule as usage_rail). */
	static of(limit, now = Date.now()){
		const s = pace(limit, now), at = (s.elapsed ?? 0) * 100;
		return { label: UsagePace.label(limit), used: limit.percent, at, gap: limit.percent - at,
			ratio: s.elapsed > 0.1 ? limit.percent / at : null, tone: s.tone, remaining: s.remaining };
	}

	static words(n){ return n.ratio == null ? "too early to tell" : Math.round(n.ratio * 100) + "% of pace"; }

	/* A: the bar IS used ÷ pace. The middle line is "on pace"; the track is 0–200%. */
	static ratio(n){
		return div.c("up-meter", () => {
			span.c("up-head", () => { span(n.label); span.c("up-num", UsagePace.words(n)); });
			div.c("up-track up-ratio", () => div.c("up-fill " + n.tone).style("--w", Math.min(100, (n.ratio ?? 0) * 50) + "%"));
		}).attr("title", `${n.used}% used, ${Math.round(n.at)}% of the window gone`);
	}

	/* B: the bar is the GAP in points from the clock. Left of the centre = under pace, right = over. The scale zooms to the gap (at least ±10 points). */
	static gap(n){
		const range = Math.max(10, Math.abs(n.gap)), w = Math.abs(n.gap) / range * 50;
		return div.c("up-meter", () => {
			span.c("up-head", () => { span(n.label); span.c("up-num", (n.gap > 0 ? "+" : "") + Math.round(n.gap) + " points"); });
			div.c("up-track up-gap", () => div.c("up-fill " + n.tone + (n.gap < 0 ? " under" : " over")).style("--w", w + "%"));
		}).attr("title", `${n.used}% used, ${Math.round(n.at)}% of the window gone`);
	}

	/* C: one big word, no bar. */
	static chip(n){
		return div.c("up-meter up-chip", () => {
			span.c("up-head", () => span(n.label));
			span.c("up-big " + n.tone, UsagePace.words(n));
		}).attr("title", `${n.used}% used, ${Math.round(n.at)}% of the window gone`);
	}
}
