import { Page, div, p, a, button, span } from "/app.js";

/**
 * Task audit: every ask that was never started, half done, or landed without proof.
 * Data: loose-ends.jsonl beside this file (built by build.mjs). Click a chip to filter by state.
 */
const url = new URL("./loose-ends.jsonl", import.meta.url);

export default new Page({
	name: "task-audit",
	content() {
		p("Each row is something the owner asked for. Pick a state to see only those. Most important first.");
		const chips = div(), list = div();
		fetch(url).then(r => r.text()).then(t => {
			const rows = t.split("\n").filter(Boolean).map(l => JSON.parse(l));
			const states = ["never-started", "half-done", "done-unverified", "scratch"];
			const show = s => {
				list.innerHTML = "";
				for (const r of rows.filter(r => r.state === s).slice(0, 300)) {
					const row = document.createElement("p");
					row.textContent = `${r.title} (${r.date || "?"}${r.count > 1 ? ", asked " + r.count + "x" : ""}) - ${r.evidence}`;
					list.append(row);
				}
			};
			for (const s of states) {
				const b = document.createElement("button");
				b.textContent = `${s} (${rows.filter(r => r.state === s).length})`;
				b.onclick = () => show(s);
				chips.append(b);
			}
			show("never-started");
		});
	}
});
