import { View } from "/app.js";
import UsagePace from "/framework/ai/usage/UsagePace.js";

View.stylesheet(import.meta, "../usage/usage.css");

/** UsageLine — the one-line usage meter at the top of the dashboard: each limit as the existing pace meter (UsagePace.ratio), read from ai/usage.json. Hidden when there is no file. */
export default class UsageLine extends View {
	static DATA = new URL("../usage.json", import.meta.url);
	get classes(){ return "ad-usage up-set"; }

	render(){
		const $box = this.el; // captured now, filled after the fetch (no DOM after an await)
		fetch(UsageLine.DATA).then(r => r.json()).catch(() => null).then(u => {
			const limits = u?.utilization?.limits;
			if (!limits?.length) return $box.remove();
			this.append(() => limits.forEach(l => UsagePace.ratio(UsagePace.of(l))));
		});
	}
}
