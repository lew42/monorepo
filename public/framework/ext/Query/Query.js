/* One query as plain JSON, run over an array of objects. Works in node and the browser (no imports).
 * Doc: doc/architecture.md. Spec: { where: [{ field, op, value, fields? }], sort: { by, dir }, offset, limit, sum: [fields] }.
 * ops: eq in gte lte contains (contains = case-insensitive substring over `field`, or over every name in `fields`). */
export default class Query {

	static OPS = {
		eq: (v, w) => v === w,
		in: (v, w) => Array.isArray(w) && w.includes(v),
		gte: (v, w) => v != null && v >= w,
		lte: (v, w) => v != null && v <= w,
	};

	constructor(spec = {}) {
		this.where = spec.where ?? [];
		this.sort = spec.sort ?? null;
		this.offset = Math.max(0, spec.offset ?? 0);
		this.limit = spec.limit ?? 50;
		this.sum = spec.sum ?? [];
		this.spec = spec;
		this.tests = this.where.map(w => Query.test(w));
	}

	/** A predicate for one `where` clause. */
	static test({ field, fields, op, value }) {
		if (op === "contains") {
			const needle = String(value ?? "").toLowerCase(), names = fields ?? [field];
			return item => !needle || names.some(n => item[n] != null && String(item[n]).toLowerCase().includes(needle));
		}
		const fn = Query.OPS[op];
		if (!fn) throw new Error("Query: unknown op " + op);
		return item => fn(item[field], value);
	}

	matches(item) { return this.tests.every(t => t(item)); }

	/** `items` is any iterable. Returns { rows (the page), total (rows to page over), matched (all matches), totals ({field: sum over ALL matches}), offset }.
	 * `arrange(hit, spec)` (optional) turns the sorted matches into the list to page over (heads, nesting); sums and `matched` still count every match. */
	run(items, arrange) {
		const hit = [];
		for (const item of items) if (this.matches(item)) hit.push(item);
		const totals = {};
		for (const f of this.sum) totals[f] = hit.reduce((n, r) => n + (typeof r[f] === "number" ? r[f] : 0), 0);
		if (this.sort?.by) {
			const { by, dir } = this.sort, sign = dir === "asc" ? 1 : -1;
			hit.sort((a, b) => {
				const x = a[by], y = b[by];
				if (x == null || y == null) return x == null ? (y == null ? 0 : 1) : -1;   // nulls last either way
				return (x < y ? -1 : x > y ? 1 : 0) * sign;
			});
		}
		const list = arrange ? arrange(hit, this.spec) : hit;
		return { rows: list.slice(this.offset, this.offset + this.limit), total: list.length, matched: hit.length, totals, offset: this.offset };
	}
}
