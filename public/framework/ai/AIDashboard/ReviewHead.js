import { View, div, span, button } from "/app.js";
import SessionRow from "./SessionRow.js";
import Review from "./Review.js";

/** ReviewHead — the day's review line: approved $, waiting $, leaking $ (they add up to the day's spend), and one
 *  "Approve all" for every finished session not approved yet. Reads the dashboard's Review; writes through dash.approve(). */
export default class ReviewHead extends View {
	get classes(){ return "ad-review"; }

	render(){
		const { dash } = this, review = dash.review, t = review.totals(), ready = review.ready();
		div.c("ad-stats", () => {
			for (const [key, label] of [["approved", "approved"], ["waiting", "waiting"], ["leak", "leaking"]]) div.c("ad-stat ad-stat-" + key, () => {
				span.c("ad-stat-usd", SessionRow.usd(t[key].usd));
				span.c("ad-stat-label", `${label} · ${t[key].n}`);
			}).attr("title", key === "leak" ? Review.STATES.leak.hint : key === "waiting" ? "Not approved yet: working now, or finished and waiting for you" : Review.STATES.approved.hint);
		});
		if (!ready.length) return;
		const usd = ready.reduce((sum, r) => sum + r.rolled, 0), n = ready.reduce((sum, r) => sum + r.count, 0);
		button.c("ad-approve ad-approve-all", `Approve all finished · ${ready.length} · ${SessionRow.usd(usd)}`).attr("type", "button")
			.attr("title", `Approve the ${ready.length} finished sessions not approved yet, and the ${n - ready.length} below them`)
			.on("click", e => { e.target.disabled = true; dash.approve(ready); });
	}
}
