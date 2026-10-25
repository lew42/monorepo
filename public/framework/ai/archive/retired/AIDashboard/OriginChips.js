import { View, button } from "/app.js";
import SessionTree from "./SessionTree.js";
import SessionRow from "./SessionRow.js";

/** OriginChips — one chip per origin with its count and rolled-up cost, plus Live. Picking one writes `?origin=` (none picked = all). */
export default class OriginChips extends View {
	get classes(){ return "ad-strip"; }

	render(){
		const { dash } = this, t = dash.store.tree.totals();
		button.c("ad-chip" + (!dash.q.origin ? " ad-chip-on" : ""), "All").attr("type", "button").on("click", () => dash.set({ origin: null }));
		Object.entries(SessionTree.ORIGINS).forEach(([key, o]) => t[key].roots && button.c("ad-chip" + (dash.q.origin === key ? " ad-chip-on" : ""),
			`${o.icon} ${o.label} ${t[key].roots} · ${SessionRow.usd(t[key].usd)}`).attr("type", "button").attr("title", o.hint).on("click", () => dash.set({ origin: key })));
		button.c("ad-chip" + (dash.q.live ? " ad-chip-on" : ""), "● Live").attr("type", "button").attr("title", "Working now, or active in the last 10 minutes").on("click", () => dash.set({ live: !dash.q.live }));
	}
}
