// A System is anything we keep in order (code, design, layout, the readmes, an AI module). It
// DOCUMENTS itself (where its files live, its rules) and CHECKS itself: check() computes whether
// the rules hold. A generic container, not an AI thing: a human can own a layout system too.
// Extend it: set name/root/rules in a subclass and write check(). Doc: ./doc/system.md
// It is the bridge between the readme an AI loads for a directory and the code that checks it.
// Composition, not a Page subclass (extend Page only for a plain doc-page template).
// Isomorphic on purpose (no fs here): pages import it; node-only subclasses do the reading.
export default class System {
	// The class card reads this table, so the card and the class cannot drift apart.
	static api = [
		{ kind: "field",  name: "name",       means: "What people call it, e.g. \"Sessions\". Shown on its card and in the log." },
		{ kind: "field",  name: "icon",       means: "A Material Symbols icon name; the same icon marks it everywhere." },
		{ kind: "field",  name: "root",       means: "The folder in the repo whose files this system looks after (the system's own module)." },
		{ kind: "field",  name: "readme",     means: "That folder's readme.md: the short index an AI loads first to learn about the system." },
		{ kind: "field",  name: "rules",      means: "The promises it keeps, as {id, text, enforced_by}. enforced_by is script, hook or agent." },
		{ kind: "field",  name: "heal_limit", means: "Most safe fixes per cycle (default 3): too fast does nothing, too slow does not help." },
		{ kind: "method", name: "check()",    means: "Looks at the real files and returns a list of findings, each {rule, path, text}. An empty list means healthy. It only reads." },
		{ kind: "method", name: "heal(finding)", means: "Fixes one finding when the fix is safe and returns true. The default fixes nothing." },
		{ kind: "method", name: "report()",   means: "Runs check() and returns {system, at, count, findings}: one line of the log." },
		{ kind: "method", name: "summary()",  means: "One short sentence for a card: \"Sessions: 2 finding(s)\" or \"healthy\"." },
	];

	name = "System";
	icon = "settings";
	root = "";          // repo path of the files this system owns
	readme = "";        // repo path of its readme
	rules = [];         // [{ id, text, enforced_by }]  enforced_by: "script" | "hook" | "agent"
	heal_limit = 3;     // at most this many safe fixes per cycle: the right pace

	constructor(props){ Object.assign(this, props); }

	// Compute, never recall: return [{ rule, path, text }]. Empty means healthy.
	check(){ return []; }

	// Optional safe fix for one finding; return true when it changed something.
	heal(finding){ return false; }

	report(){
		const findings = this.check();
		return { system: this.name, at: new Date().toISOString(), count: findings.length, findings: findings.slice(0, 20) };
	}

	// One line per system at most, for a card or a log.
	summary(r = this.report()){ return `${this.name}: ${r.count ? r.count + " finding(s)" : "healthy"}`; }
}
