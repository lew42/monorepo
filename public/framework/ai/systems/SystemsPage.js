import { Page, div, p, a } from "/app.js";

// The Systems page: one card per System class (its rules and who enforces them) with the latest
// check result from results.jsonl. The checks run in node (Server/systems-beat.mjs); this only reads.
export default class SystemsPage extends Page {
	constructor(...args){
		super({
			title: "Systems",
			description: "Things we keep in order: each documents itself, checks itself, reports hourly.",
			icon: "account_tree",
		}, ...args);
	}

	content(){
		p("A System lists where its files live, its rules, and a check that proves the rules hold."); a({ href: "/framework/ai/doc/md/organization/" }, "What goes where, and why");
		const box = div();   // captured now; filled after the await
		fetch(new URL("./results.jsonl", import.meta.url)).then(r => r.ok ? r.text() : "").then(text => {
			const latest = {};
			for (const l of text.split("\n")) if (l.trim()) { const r = JSON.parse(l); latest[r.system] = r; }
			for (const [name, r] of Object.entries(latest)){
				const card = div("card");
				card.el.append(...[
					Object.assign(document.createElement("h3"), { textContent: `${name}: ${r.count ? r.count + " finding(s)" : "healthy"}` }),
					Object.assign(document.createElement("small"), { textContent: `checked ${r.at}` }),
					...r.findings.slice(0, 5).map(f => Object.assign(document.createElement("p"), { textContent: `${f.rule}: ${f.path} — ${f.text}` })),
				]);
				box.el.append(card.el);
			}
		});
	}
}
