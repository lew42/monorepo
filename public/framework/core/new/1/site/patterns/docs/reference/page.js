import { Page, p, div, a } from "/app.js";
import { code, section } from "../../../ui.js";
import { recipe } from "../../recipe.js";

/* The flat, wide branch — fourteen real urls and no directories. A reference is
 * a list, and a list is data; making fourteen folders for it would be filing.
 */
const keys = [
	["visibility-timeout", "duration", "30s",    "How long a leased job is invisible to other workers before the lease expires and it becomes available again."],
	["max-attempts",       "integer",  "5",      "Attempts before a job is moved to the dead-letter table. Counted per job, not per worker."],
	["backoff",            "string",   "expo",   "`expo`, `linear` or `none`. Applied between attempts, from the moment the lease expires."],
	["backoff-base",       "duration", "1s",     "The first retry delay. `expo` doubles it per attempt; `linear` multiplies by the attempt number."],
	["backoff-cap",        "duration", "1h",     "Upper bound on the computed delay, so attempt 12 does not schedule itself into next week."],
	["concurrency",        "integer",  "10",     "Jobs a single worker leases at once. The total across a fleet is this times the worker count."],
	["poll-interval",      "duration", "1s",     "How often a worker asks for work when the last ask came back empty. Ignored when `listen` is on."],
	["listen",             "boolean",  "true",   "Use Postgres LISTEN/NOTIFY instead of polling. Falls back to polling on SQLite."],
	["batch-size",         "integer",  "50",     "Rows fetched per lease query. Higher is fewer round trips and a longer tail on shutdown."],
	["priority-column",    "string",   "null",   "Order the lease query by this column, descending, before `available_at`."],
	["dead-letter",        "string",   "kettle_dead", "Table that exhausted jobs are moved to. Set to `null` to delete them instead."],
	["retention",          "duration", "7d",     "How long acknowledged jobs are kept before the sweeper deletes them."],
	["shutdown-grace",     "duration", "20s",    "Time a worker is given to finish leased jobs on SIGTERM before leases are released."],
	["clock-skew",         "duration", "5s",     "Tolerance added to lease expiry, so a slightly fast worker cannot steal a live lease."],
];

const nav = () => ({
	meta: import.meta,
	title: "Config reference",

	// Fourteen pages, no files and no `children` string. initialize() is the
	// seam for inline children and it runs in the constructor, so every one of
	// these is in the map before the Router could walk to it.
	initialize(){
		keys.forEach(([name, type, fallback, text]) => this.add(name, {
			title: name,
			content(){ code(`${name}\n\ntype     ${type}\ndefault  ${fallback}`); p(text); },
		}));
	},

	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("Fourteen urls, zero directories. `/patterns/docs/reference/backoff-cap/` is as real as any page with a file behind it — same `chain()`, same `link()`, same everything.");

		section("Keys");

		this.previews();

		section("What inline children buy you that lazy names do not");

		code(`
children: "a b c"        names on disk    labels are the NAME until visited
initialize(){ add… }     objects in RAM   labels are the TITLE, always`);

		p("A tab bar over lazy children has to print declared names, because a title only exists once that page is imported and which pages are imported depends on the url you arrived at. Inline children are already objects, so every label is honest from the first paint. That is the same trade the API reference makes, one order of magnitude up.").ac("note");

		div.c("row", () => {
			a.c("page-link", "backoff-cap").href("/patterns/docs/reference/backoff-cap/");
			a.c("page-link", "the API reference →").href("/patterns/api/");
		});
	},
});
