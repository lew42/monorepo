import { Doc, md, demo, pre, input } from "/app.js";
import Query from "./Query.js";

const items = [
	{ id: "a", title: "Fix Sessions grid", usd: 1.5, day: "2026-10-01" },
	{ id: "b", title: "grid paging", usd: 3, day: "2026-10-05" },
	{ id: "c", title: "Docs sweep", usd: 0.5, day: "2026-10-09" },
	{ id: "d", title: "Sessions perf", usd: 2, day: "2026-10-12" },
];

export default new Doc({
	meta: import.meta,
	title: "Query",
	description: "A query as plain JSON, run over items in memory: filter, sort, one page, and totals over every match.",
	icon: "manage_search",

	subject: Query,
	methods: "matches run",
	files: "Query.js QueryServer.mjs QueryClient.js check.mjs page.js readme.md",

	overview: [
		{ title: "Spec in, result out", icon: "manage_search", description: "Type a word: the same spec the dev server receives runs here.", content(){
			md(`Four items, searched with \`contains\` and sorted by cost.`);
			demo(() => {
				const out = pre();
				const show = text => {
					const spec = { where: [{ field: "title", op: "contains", value: text }], sort: { by: "usd", dir: "desc" }, limit: 2, sum: ["usd"] };
					out.text(JSON.stringify(spec) + "\n\n" + JSON.stringify(new Query(spec).run(items), null, 1));
				};
				const box = input().attr("placeholder", "search the titles, e.g. sessions");
				box.on("input", () => show(box.el.value));
				show("");
			});
		} },
	],
});
