import { View, button } from "/app.js";

/** DayStrip — the last seven days as chips (Today, Yesterday, then the weekday). Picking one writes `?day=` through the dashboard. */
export default class DayStrip extends View {
	get classes(){ return "ad-strip"; }
	static label(day, i){ return i === 0 ? "Today" : i === 1 ? "Yesterday" : new Date(day + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric" }); }

	render(){
		const { dash } = this;
		dash.days.forEach((day, i) => button.c("ad-chip" + (day === dash.q.day ? " ad-chip-on" : ""), DayStrip.label(day, i)).attr("type", "button").attr("title", day).on("click", () => dash.set({ day })));
	}
}
