import Answer from "../Answer.js";
import { div, span, label, select, option } from "../../../core/View/View.js";

// T19: three selects (1st, 2nd, 3rd), no drag UI. An item can hold one place only: picking it
// again elsewhere empties its old place. Stored: three option values, null where unpicked, e.g. ["b","a",null].
export default class RankTop3 extends Answer {
	static type = "T19";
	static title = "Rank top 3";
	static shape = "array of 3 option values · null for an empty place";
	static native = "<select> ×3";
	static use = "a ranking without custom drag UI";
	static initial = [null, null, null];
	static example = { label: "Order these", options: [["a", "Short films"], ["b", "Live shows"], ["c", "Tutorials"], ["d", "Interviews"]] };

	coerce(v){
		const list = Array.isArray(v) ? v.slice(0, 3) : [];
		while (list.length < 3) list.push(null);
		return list.map(x => x === undefined || x === "" ? null : x);
	}

	render(){
		this.selects = [];
		div.c("fm-rank", () => {
			["1st", "2nd", "3rd"].forEach((place, i) => {
				label.c("fm-rank-row", () => {
					span.c("fm-rank-n", place);
					const sel = select(() => {
						option().attr("value", "").text("Choose…");
						this.choices.forEach(([val, text]) => option().attr("value", String(val)).text(text));
					}).ac("fm-field");
					sel.on("change", () => this.pick(i, sel.el.value));
					this.selects.push(sel);
				});
			});
		});
	}

	pick(i, raw){
		const next = [...this.value];
		const found = this.choices.find(([val]) => String(val) === raw);
		const val = found ? found[0] : null;
		if (val !== null) next.forEach((x, k) => { if (k !== i && this.same(x, val)) next[k] = null; });
		next[i] = val;
		this.value = next;
	}

	sync(){
		this.selects?.forEach((sel, i) => {
			const v = this.value[i];
			const text = v === null ? "" : String(v);
			if (sel.el.value !== text) sel.el.value = text;
		});
	}
}
