// A System is anything we keep in order (code, design, layout, the readmes). It mostly DOCUMENTS
// itself: where its files live, its rules, and a check() that computes whether the rules hold.
// Extend it: set name/root/rules in a subclass and write check(). Doc: ../doc/organization.md
// A README system for a directory: the bridge between the readmes an AI loads and code that checks them; a human can use it too.
// Composition, not a Page subclass (extend Page only for a plain doc-page template).
// Isomorphic on purpose (no fs here): the page imports it; node-only subclasses do the reading.
export default class System {
	name = "System";
	icon = "settings";
	root = "";          // repo path of the files this system owns
	readme = "";        // repo path of its readme
	rules = [];         // [{ id, text, enforced_by }]  enforced_by: "script" | "hook" | "agent"
	heal_limit = 3;     // at most this many safe fixes per cycle: the right pace

	constructor(props){ Object.assign(this, props); }

	// Compute, never recall: return [{ rule, path, text, fix? }]. Empty means healthy.
	check(){ return []; }

	// Optional safe fix for one finding; return true when it changed something.
	heal(finding){ return false; }

	report(){
		const findings = this.check();
		return { system: this.name, at: new Date().toISOString(), count: findings.length, findings: findings.slice(0, 20) };
	}

	// One line per finding at most, for a card or a log.
	summary(r = this.report()){ return `${this.name}: ${r.count ? r.count + " finding(s)" : "healthy"}`; }
}
