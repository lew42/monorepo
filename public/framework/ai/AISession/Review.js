/** Review — the owner's review of one day: each session's state and the day's three totals (approved, waiting, leaking).
 *  Plain code over a SessionTree and the Approvals; computed on every paint, never stored. The rule and its numbers: readme.md, "Review". */
export default class Review {
	static FINISHED_MS = 60 * 60000;   // no activity for an hour: finished
	static LEAK_USD = 0.5;             // costs more than this (rolled up through its children)
	static LEAK_AGE_MS = 24 * 3600000; // and finished more than a day ago, unapproved: a leak

	static STATES = {
		approved: { label: "approved", hint: "The owner approved it, or a session above it" },
		live:     { label: "working",  hint: "Active in the last hour" },
		waiting:  { label: "waiting",  hint: "Finished, waiting for the owner's approval" },
		leak:     { label: "leak",     hint: `Finished over a day ago, cost over $${Review.LEAK_USD.toFixed(2)}, never approved` },
	};

	constructor(tree, approvals, now = Date.now()){
		this.tree = tree; this.approvals = approvals; this.now = now;
		tree.roots.forEach(r => this.walk(r, null));
	}

	/** Sets on every node: `approved` (the approve line, its own or inherited), `by_parent`, `finished`, `state`. */
	walk(n, up){
		const own = this.approvals.of(n.s.id);
		n.approved = own ?? up?.approved ?? null;
		n.by_parent = !own && !!n.approved;
		n.finished = n.s.state !== "active" && this.now - n.last >= Review.FINISHED_MS;
		n.state = n.approved ? "approved" : !n.finished ? "live" : this.leaks(n) ? "leak" : "waiting";
		n.kids.forEach(k => this.walk(k, n));
	}
	leaks(n){ return n.rolled > Review.LEAK_USD && this.now - n.last >= Review.LEAK_AGE_MS; }

	/** Every session's own cost, put in the bucket of its own state: { approved, waiting, leak } dollars and counts. They add up to the day. */
	totals(){
		const t = { approved: { usd: 0, n: 0 }, waiting: { usd: 0, n: 0 }, leak: { usd: 0, n: 0 } };
		this.tree.nodes.forEach(n => { const b = t[n.state === "live" ? "waiting" : n.state]; b.usd += n.own; b.n++; });
		return t;
	}

	/** Roots "Approve all" would approve: finished and not approved. */
	ready(){ return this.tree.roots.filter(r => r.finished && !r.approved); }
}
