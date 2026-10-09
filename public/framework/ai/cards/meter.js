import { div, span } from "/framework/core/View/View.js";
import { money } from "/framework/ext/AITask/cost.js";
import { progress } from "/framework/ext/AITask/stats.js";

/**
 * THE FACE OF A CARD — a SHORT bar that says what it counts, and what was spent:
 *
 *     ▮▮▮▯  8 of 13 done · $57 spent
 *
 * The owner, 2026-09-24, asked for "just progress bars… total cost on every card".
 * The owner, 2026-09-25, on what that became: "a progress bar showing complete at $57:
 * we didn't set a budget, so what does it mean? A 2,000-pixel line across my screen as a
 * progress bar makes no sense." So the bar is a few characters wide and always carries its
 * count in words, and the money says "spent", because there is no budget for it to fill.
 * A card with nothing counted and nothing spent draws nothing at all: no empty bar, no
 * "no cost yet" (ai2-lead audit, ai/2026-09-25/ai2-lead/audit.md).
 *
 * `progress_of()` answers `{ pct, live, done, total }`; `meter()` draws it.
 */

/** A task's progress from its step outline; a landed one is complete. */
export function progress_of(task, status){
	if (task){
		const pr = progress(task);
		if (task.landed_at) return { pct: 100, live: false, done: pr?.total ?? 1, total: pr?.total ?? 1 };
		return pr ? { pct: Math.round(100 * pr.done / pr.total), live: true, done: pr.done, total: pr.total } : { pct: 0, live: true };
	}
	// A card with no task counts nothing.
	return { pct: status === "done" || status === "archived" ? 100 : 0, live: false };
}

/** The dollar figure: `$4.74 spent`, `$4.74+ spent` while an agent still runs, null when nothing was recorded. */
export const cost_word = (usd, open) => usd == null ? null : money(usd) + (open ? "+" : "") + " spent";

/** "3 of 7 steps", "2 of 5 tasks landed", "done", "5 tasks, all landed": the count, with what it counts. */
const count_word = (pct, done, total, unit) => unit === "tasks"
	? (pct >= 100 ? total + (total === 1 ? " task, landed" : " tasks, all landed") : done + " of " + total + " tasks landed")
	: (pct >= 100 ? "done" : done + " of " + total + " steps");

/** The short bar, its count in words, and the money, on one line; nothing when there is nothing to say. */
export function meter({ pct = 0, live = false, done, total, unit = "steps" } = {}, usd, open){
	const counted = total > 0, spent = cost_word(usd, open);
	if (!counted && !spent) return;
	div.c("ai2-meter-line flex v-center gap-25", () => {
		// A finished count needs no bar: "5 tasks, all landed" says it.
		if (counted && pct < 100) div.c("ai2-meter" + (live ? " live" : "") + (pct >= 100 ? " done" : ""), () => {
			div.c("ai2-meter-fill").attr("style", "width:" + Math.max(live ? 4 : 0, pct) + "%");
		});
		span.c("ai2-meter-cost muted").text([counted && count_word(pct, done, total, unit), spent].filter(Boolean).join(" · "));
	});
}
