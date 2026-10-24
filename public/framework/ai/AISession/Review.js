/** Review — the one rule for a session's review state, and its numbers (tune them here). Plain code, no DOM.
 *  Review.state({ approved, finished, rolled, last }) -> "approved" | "live" | "leak" | "waiting". Caller: SessionWork. */
export default class Review {
	static FINISHED_MS = 60 * 60000;   // no activity for an hour: finished
	static LEAK_USD = 0.5;             // costs more than this, rolled up through its children
	static LEAK_AGE_MS = 24 * 3600000; // and finished more than a day ago, unapproved: a leak

	static STATES = {
		approved: { label: "approved", hint: "The owner approved it, or a session above it" },
		live:     { label: "working",  hint: "Active in the last hour" },
		waiting:  { label: "waiting",  hint: "Finished, waiting for the owner's approval" },
		leak:     { label: "leak",     hint: `Finished over a day ago, cost over $${Review.LEAK_USD.toFixed(2)}, never approved` },
	};

	/** `finished` is the caller's word for "not running"; `last` the last activity (ms) of it and everything under it. */
	static state({ approved, finished, rolled = 0, last = 0 }, now = Date.now()){
		if (approved) return "approved";
		if (!finished && now - last < Review.FINISHED_MS) return "live";
		return rolled > Review.LEAK_USD && now - last >= Review.LEAK_AGE_MS ? "leak" : "waiting";
	}

	/** Which total a state's dollars go to: approved, waiting (working counts as waiting) or leak. */
	static bucket(state){ return state === "live" ? "waiting" : state; }
}
