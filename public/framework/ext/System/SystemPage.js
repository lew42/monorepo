import { Page, div, p, a } from "/app.js";
import System from "./System.js";
import DemoSystem from "./DemoSystem.js";

// The System page: first the class card (what every field and method means), then a live demo you
// can run, then the real systems' latest check results from results.jsonl (node writes those).
export default class SystemPage extends Page {
	constructor(...args){
		super({
			title: "System",
			description: "A generic container for anything we keep in order: it knows its files and rules, checks itself and reports.",
			icon: "account_tree",
		}, ...args);
	}

	// el("h3", "text") — plain DOM, built synchronously
	el(tag, text, cls){ const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }

	content(){
		p("A System looks after one part of the project. It knows where its files live (root), what promises it keeps (rules), and can check whether they hold. Any part can be one: code, a layout, the readmes, an AI module. Built 2026-10-12.");
		this.class_card(div("card"));
		this.demo(div("card"));
		this.real(div());
		a({ href: "/framework/ai/doc/md/organization/" }, "What goes where, and why");
	}

	class_card(card){
		const rows = System.api.map(r => this.el("p", `${r.name} — ${r.means}`));
		card.el.append(this.el("h3", "System  (icon: settings)"), this.el("small", "Every field and method of the base class; subclasses add their own check()."), ...rows);
	}

	// Pick a system, press Check, watch findings appear, press Heal to fix one.
	demo(card){
		const systems = DemoSystem.samples();
		let system = systems[0];
		const pick = this.el("select"), check = this.el("button", "Check"), heal = this.el("button", "Heal one safe finding");
		const list = this.el("div"), out = this.el("div");
		for (const s of systems) pick.append(Object.assign(this.el("option", s.name), { value: s.name }));
		const items = () => { list.replaceChildren(...system.items.map(i => this.el("p", `• "${i}"`))); };
		const found = () => system.check();
		const show = () => {
			const f = found();
			out.replaceChildren(this.el("p", f.length ? `${f.length} finding(s)` : "healthy"), ...f.map(x => this.el("p", `${x.rule}: ${x.text}`)));
			heal.disabled = !f.length;
		};
		pick.addEventListener("change", () => { system = systems.find(s => s.name === pick.value); out.replaceChildren(); items(); heal.disabled = true; });
		check.addEventListener("click", show);
		heal.addEventListener("click", () => { const f = found()[0]; if (f && system.heal(f)){ items(); show(); } });
		heal.disabled = true;
		items();
		card.el.append(this.el("h3", "Try it"), this.el("small", "Demo systems over a small list. The real systems read files, so only node runs them."), pick, check, heal, list, out);
	}

	real(box){   // captured now; filled after the await
		fetch(new URL("./results.jsonl", import.meta.url)).then(r => r.ok ? r.text() : "").then(text => {
			const latest = {};
			for (const l of text.split("\n")) if (l.trim()) { const r = JSON.parse(l); latest[r.system] = r; }
			box.el.append(this.el("h3", "Real systems, last check"));
			for (const [name, r] of Object.entries(latest)){
				const card = div("card");
				card.el.append(
					this.el("h3", `${name}: ${r.count ? r.count + " finding(s)" : "healthy"}`),
					this.el("small", `checked ${r.at}`),
					...r.findings.slice(0, 5).map(f => this.el("p", `${f.rule}: ${f.path} — ${f.text}`)),
				);
				box.el.append(card.el);
			}
		});
	}
}
