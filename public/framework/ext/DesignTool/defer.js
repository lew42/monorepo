/* "these cases of could-be-off could be deferred to the user" (the owner).
 *
 * A judgement call the reader has already made should not keep showing up in the
 * census every time the audit runs. Deferring is per url + rule + selector, kept in
 * localStorage, and it is a decision about THIS site — not a change to the rule,
 * which stays exactly as strict for everyone else.
 *
 * ⚠ Only the polish tier can be deferred. Content that cannot be reached is not
 * a matter of taste, and letting it be dismissed would make the census a
 * measure of how much has been waved through. */

const KEY = "dt-deferred";
const OPEN = new Set(["alignment", "hierarchy", "proportion"]);

const load = () => {
	try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]")); }
	catch { return new Set(); }
};

const save = set => localStorage.setItem(KEY, JSON.stringify([...set]));

export const id = (url, issue) => `${url ?? ""}|${issue.rule}|${issue.sel}`;

export const deferrable = issue => OPEN.has(issue.cat);

export function deferred(url, issue){
	return deferrable(issue) && load().has(id(url, issue));
}

export function defer(url, issue, on = true){
	const set = load();
	on ? set.add(id(url, issue)) : set.delete(id(url, issue));
	save(set);
	return on;
}

export function count(){ return load().size; }

export function clear(){ localStorage.removeItem(KEY); }

/* Splits a report's issues into what still counts and what has been waved
 * through. The caller re-scores from `kept` — a deferred finding costs nothing,
 * which is the entire point of deferring it. */
export function split(url, issues){
	const kept = [], waived = [];
	for (const i of issues) (deferred(url, i) ? waived : kept).push(i);
	return { kept, waived };
}
