import { div, p, a, details, summary } from "../../core/View/View.js";
import Collab from "../Collab/Collab.js";

/* The ⋯ after a member's name on its own page (ext/Doc's API tab): shown only
 * when a design collab named it — `Collab.Decisions.for()` is the shared,
 * cached fetch of `decisions.jsonl`, so a Doc page with no records pays
 * nothing. Opening the popover is the SECOND fetch — that one run's own
 * `collab.jsonl`, for the ask, the winner and the vote count — and it only
 * happens once, the first time someone actually opens it. Contract:
 * public/framework/ai/2026-09-28/collab-rounds/collab-format.md. */
export function decision_menu(module, name){
	return Collab.Decisions.for(module, name).then(href => {
		if (!href) return;
		let $body, loaded = false;
		const $menu = details.c("doc-decision", () => {
			summary.c("doc-decision-btn", "⋯");
			$body = div.c("doc-decision-pop flow", () => p.c("muted", "…"));
		});
		$menu.on("toggle", async () => {
			if (loaded || !$menu.el.open) return;
			loaded = true;
			const src = new URL(href, location.origin);
			const run = await new Collab({ url: src.searchParams.get("src") }).load();
			const d = run.decision(src.hash.slice(1));
			if (!d) return $body.empty(() => p.c("muted", "decision not found"));
			const votes = (d.counts ?? {})[d.winner()] ?? 0;
			const winner = d.options.find(o => o.key === d.winner())?.say ?? d.winner();
			$body.empty(() => {
				p(d.ask);
				p(`Winner: ${winner} — ${votes} vote${votes === 1 ? "" : "s"}`);
				a.c("doc-decision-link", "full decision →").href(href);
			});
		});
		return $menu;
	});
}

export default decision_menu;
