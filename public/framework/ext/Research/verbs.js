/**
 * The research log's schema, as data.
 *
 * One topic = one dir = one append-only file:
 * `public/framework/research/<slug>/research.jsonl`. One JSON object per line,
 * one verb per line, the value self-contained:
 *
 *   {"node": {"id": "c7k2q", "kind": "claim", "text": "…", "by": "m1", "at": "…"}}
 *   {"vote": {"node": "c7k2q", "by": "m2", "at": "…", "importance": 4}}
 *
 * Everything that writes a line — the CLI, the MCP tools — and everything that
 * reads one — the page — imports this file, so there is one answer to "what is
 * a legal line". No DOM, no Node: it runs in both.
 *
 * `validate()` is where "no walls of text" lives, in code rather than in a
 * prompt: it returns a reason string the writer prints, never an exception.
 */

export const KINDS = ["question", "claim", "evidence", "support", "dissent", "alternative", "note"];
export const STATES = ["accepted", "rejected", "parked", "merged"];
export const LIMITS = { text: 240, why: 1000, summary: 7 };

/** `need` = required fields; `fields` = every field this verb may carry. */
export const VERBS = {
	assign:  { who: "orchestrator", need: ["at"],                             fields: "title question by at config status summary" },
	node:    { who: "anyone",       need: ["id", "kind", "text", "by", "at"], fields: "id parent kind text by at why refs icon img importance" },
	vote:    { who: "anyone",       need: ["node", "by", "at", "importance"], fields: "node by at importance" },
	verdict: { who: "orchestrator", need: ["node", "by", "at", "state", "why"], fields: "node by at state why into" },
	agent:   { who: "orchestrator", need: ["name", "at"],                     fields: "name persona model at doing done" },
	log:     { who: "anyone",       need: ["at", "msg"],                      fields: "at msg" }
};

const one_of = (field, value, list) => list.includes(value)
	? null : `${field} "${value}" is not one of: ${list.join(" ")}`;

const cap = (field, value, max) => String(value ?? "").length > max
	? `${field} is ${String(value).length} chars, the limit is ${max} — say less, and put the detail behind refs`
	: null;

const rank = (field, value) => Number.isInteger(value) && value >= 1 && value <= 5
	? null : `${field} must be a whole number 1–5, got ${JSON.stringify(value)}`;

/* Per-verb rules, after the shared required/unknown-field pass. */
const CHECKS = {
	assign(v){
		if (v.summary && !Array.isArray(v.summary)) return "summary must be an array of lines";
		if (v.summary?.length > LIMITS.summary) return `summary is ${v.summary.length} lines, the limit is ${LIMITS.summary}`;
		return null;
	},

	node(v){
		return one_of("kind", v.kind, KINDS)
			?? (/^[a-z][a-z0-9]{3,7}$/.test(v.id) ? null : `id "${v.id}" is not an id — use the one id() gives you`)
			?? cap("text", v.text, LIMITS.text)
			?? cap("why", v.why, LIMITS.why)
			?? (v.refs && !Array.isArray(v.refs) ? "refs must be an array of \"file:line\" or url strings" : null)
			?? (v.importance == null ? null : rank("importance", v.importance))
			?? (["support", "dissent"].includes(v.kind) && !v.parent ? `a ${v.kind} answers something — give it a parent` : null)
			?? (["support", "dissent"].includes(v.kind) && !v.why ? `a ${v.kind} without why is noise — give the reasoning` : null);
	},

	vote(v){ return rank("importance", v.importance); },

	/* Lines merge by name, so the landing line is just {name, done} — but a line
	   that says neither what it is doing nor what it did says nothing. */
	agent(v){ return v.doing || v.done ? null : "say either what it is doing or what it did"; },

	verdict(v){
		return one_of("state", v.state, STATES)
			?? cap("why", v.why, LIMITS.why)
			?? (v.state === "merged" && !v.into ? "a merged verdict names what it merged into" : null);
	}
};

/** null when the line is legal, otherwise the one-line reason to print. */
export function validate(verb, value){
	const spec = VERBS[verb];
	if (!spec) return `unknown verb "${verb}" — one of: ${Object.keys(VERBS).join(" ")}`;
	if (!value || typeof value !== "object" || Array.isArray(value)) return `${verb}: the value must be an object`;

	const fields = spec.fields.split(" ");
	for (const key of Object.keys(value))
		if (!fields.includes(key)) return `${verb}: no field "${key}" — this verb carries: ${spec.fields}`;

	for (const key of spec.need)
		if (value[key] == null || value[key] === "") return `${verb}: "${key}" is required`;

	const bad = CHECKS[verb]?.(value);
	return bad ? `${verb}: ${bad}` : null;
}

/**
 * A node id: the kind's letter + 4 random base36 chars (`c7k2q`).
 * Random, not sequential, because parallel writers must never coordinate — and
 * the letter means an outline reads without a legend.
 */
export function id(kind){
	return (kind ?? "note")[0] + Math.random().toString(36).slice(2, 6).padEnd(4, "0");
}

/** One line, ready to append. Throws on an illegal value — nothing half-written. */
export function line(verb, value){
	const bad = validate(verb, value);
	if (bad) throw new Error(bad);
	return JSON.stringify({ [verb]: value }) + "\n";
}

/**
 * A node's rank: the mean of its author's own guess and every vote on it.
 * Shared so the CLI's outline and the page agree on what "top" means.
 */
export function score(node, votes = []){
	const all = [node.importance, ...votes.map(v => v.importance)].filter(n => typeof n === "number");
	return all.length ? Math.round(all.reduce((a, b) => a + b) / all.length * 10) / 10 : 0;
}
