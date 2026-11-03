import System from "./System.js";

// A System over a small in-memory list, so the page can run check() and heal() in the browser
// (the real systems read files, which only node can). Same class contract, just a tiny world.
// `tests`: [{ id, text, bad(item) -> true when it breaks the rule, fix(item) -> the repaired item }]
export default class DemoSystem extends System {
	constructor(props){ super(); this.tests = []; this.items = []; Object.assign(this, props); }

	check(){
		return this.items.flatMap((item, i) => this.tests.filter(t => t.bad(item))
			.map(t => ({ rule: t.id, path: `item ${i + 1}`, text: `"${item}" — ${t.text}`, index: i })));
	}

	// Fix one finding and return true; "safe" because it only repairs that one item.
	heal(finding){
		const t = this.tests.find(t => t.id === finding.rule), item = this.items[finding.index];
		if (!t || item === undefined) return false;
		this.items[finding.index] = t.fix(item);
		return this.items[finding.index] !== item;
	}

	static samples(){
		return [
			new DemoSystem({
				name: "Titles", icon: "title", readme: "", root: "(in memory)",
				rules: [{ id: "capital", text: "Every title starts with a capital letter.", enforced_by: "script" }],
				tests: [{ id: "capital", text: "starts with a lowercase letter", bad: s => /^[a-z]/.test(s), fix: s => s[0].toUpperCase() + s.slice(1) }],
				items: ["Home", "about us", "Contact", "pricing", "blog"],
			}),
			new DemoSystem({
				name: "Spacing", icon: "space_bar", readme: "", root: "(in memory)",
				rules: [{ id: "tidy", text: "No doubled or trailing spaces.", enforced_by: "script" }],
				tests: [{ id: "tidy", text: "has doubled or trailing spaces", bad: s => /  |\s$/.test(s), fix: s => s.replace(/ {2,}/g, " ").trim() }],
				items: ["one  two", "fine", "ends here ", "three   spaces   here"],
			}),
		];
	}
}
