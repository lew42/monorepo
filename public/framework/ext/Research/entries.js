/**
 * A PROGRAM's entry schema — the second shape this module reads.
 *
 * `verbs.js` is a TOPIC: one question, argued to a verdict, then closed. A
 * program is the other half of the same job — several topics dug continuously,
 * nobody arguing to a close, each minion appending flat entries to its own file:
 *
 *   public/<program>/<topic>/log.jsonl
 *   {"at":"…","topic":"stone","kind":"finding","title":"…","summary":"…","url":"…","credence":"contested"}
 *
 * One line = one entry, no verb key, self-contained. That is the whole
 * difference: a topic line says {"node": {…}} and joins a tree; a program line
 * IS the entry and joins a stream. A reader that takes both is `Program.js`.
 *
 * ⚠ CREDENCE is the schema's point, not decoration. The four words are ordered
 *   worst-evidence-last and the presentation gives each its own treatment, so a
 *   fringe claim cannot be read as a fact. A line without one is refused: the
 *   whole system exists to stop an unmarked claim entering the record.
 *
 * `validate()` returns the reason a line is illegal, never an exception — the
 * same contract `verbs.js` keeps, so a writer prints it and exits 1.
 */

export const KINDS = ["finding", "source", "theory", "opinion", "question"];

/** Strongest first — the order the legend and every tally read in. */
export const CREDENCE = ["established", "contested", "fringe", "speculation"];

export const FIELDS = ["at", "topic", "kind", "title", "summary", "url", "credence"];

/* Long enough to say a claim and its evidence, short enough that the wall stays
   scannable. A source belongs behind `url`, not inside `summary`. */
export const LIMITS = { title: 140, summary: 700 };

const one_of = (field, value, list) => list.includes(value)
	? null : `${field} "${value}" is not one of: ${list.join(" ")}`;

const cap = (field, value, max) => String(value ?? "").length > max
	? `${field} is ${String(value).length} chars, the limit is ${max} — say less, and put the detail behind url`
	: null;

/**
 * null when the line is legal, otherwise the one-line reason. Exactly the
 * contract and nothing more — a rule invented here would refuse lines minions
 * already wrote against the contract they were given.
 */
export function validate(entry){
	if (!entry || typeof entry !== "object" || Array.isArray(entry)) return "the entry must be an object";

	for (const key of Object.keys(entry))
		if (!FIELDS.includes(key)) return `no field "${key}" — an entry carries: ${FIELDS.join(" ")}`;

	for (const key of ["at", "topic", "kind", "title", "credence"])
		if (entry[key] == null || entry[key] === "") return `"${key}" is required`;

	return one_of("kind", entry.kind, KINDS)
		?? one_of("credence", entry.credence, CREDENCE)
		?? cap("title", entry.title, LIMITS.title)
		?? cap("summary", entry.summary, LIMITS.summary)
		?? (entry.url && !/^https?:\/\//.test(entry.url) ? `url "${entry.url}" is not a url` : null);
}

/**
 * Advice, not law — a legal line that is nonetheless weak evidence. The writer
 * prints these and still writes; the page marks them on the card. Kept apart
 * from `validate()` on purpose: the contract is the mastermind's, the taste is
 * this module's, and only one of them may refuse a line.
 */
export function notes(entry){
	const out = [];
	if (!entry.url && entry.credence === "established") out.push("established with no url — nothing to check it against");
	if (!entry.url && entry.kind === "source") out.push("a source with no url");
	if (!entry.summary) out.push("no summary — the title is carrying the whole claim");
	return out;
}

/** One line, ready to append. Throws on an illegal entry — nothing half-written. */
export function line(entry){
	const bad = validate(entry);
	if (bad) throw new Error(bad);
	return JSON.stringify(entry) + "\n";
}

/** The tally every card and the legend read: {established: 3, fringe: 1, …}, in CREDENCE order. */
export function credences(entries){
	return CREDENCE.map(c => [c, entries.filter(e => e.credence === c).length]).filter(([, n]) => n);
}

/** The same, by kind, in KINDS order. */
export function kinds(entries){
	return KINDS.map(k => [k, entries.filter(e => e.kind === k).length]).filter(([, n]) => n);
}
