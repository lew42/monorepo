import { Doc, md, demo, code, h2, div, span } from "/app.js";
import item from "/framework/ui/item/item.js";
import { mentions, unknown } from "./Mention.js";
import refs from "./maps/refs.js";
import people from "./maps/people.js";

// One wall of real rows, straight off a map — this is the actual `item()` call
// every `#Name` or `@name` on the site turns into, not a picture of one, down to the
// same `page-surface-dark` look a `class_card` entry gets inline (`Mention.js`'s own
// `build_row()` — the two never disagree because both read `entry.class_card`).
function wall(map){
	return div.c("grid gap auto", () => {
		Object.entries(map).forEach(([name, entry]) => {
			const row = entry.url ? item({ icon: entry.icon, name, href: entry.url }) : item({ icon: entry.icon, name });
			row.ac(entry.class_card && "page-surface-dark");
		});
	});
}

export default new Doc({
	meta: import.meta,
	title: "Mention",
	description: "`#Page` and `@owner` become a small icon + the word, wherever the site renders written content.",
	icon: "alternate_email",

	subject: mentions,
	methods: "mention_html",
	notes: "syntax",
	files: "Mention.js maps/refs.js maps/people.js page.js readme.md",

	content(){

		md("Write `#Page` anywhere the site renders markdown or a chat bubble, and it becomes a small icon + the word, linking to the real page. `@owner` works the same way, from a separate list for people and agent roles. **Nothing is typed by hand below** — every row is the real `item()` call a mention turns into, straight off the same two maps the site itself reads.");

		h2("Every #reference — ext/Mention/maps/refs.js");

		md(`${Object.keys(refs).length} names today, each a real page: the seven core classes, Servex, nineteen \`ext/\` modules, and four one-off links the owner asked for by name (\`CLAUDE.md\`, \`skills\`, \`MCP\`, \`dev-server\`).`);

		wall(refs);

		h2("Every @person — ext/Mention/maps/people.js");

		md("Users and agent roles — a separate namespace on purpose, so `#Page` (a thing) and `@mastermind` (a someone) never collide. `owner` has no page to link to, so it draws as an icon and a word, not a link.");

		wall(people);

		h2("Live, in a real sentence");

		md("This line is markdown, rendered the normal way — `md()` already calls `mentions()` after every parse, so what you see below is the real pipeline: #Page and #Servex resolve, and #Nope does not (it isn't in either map, so it stays plain text).");

		demo(() => {
			md("Ask #Page how routing works, or open #Servex to see what's running. #Nope isn't a real name, so it stays plain — and @owner reads the same way when nobody's map has a `url`.");
		}, "The three outcomes: a known `#name` becomes a link, an unknown one stays plain text, and a person with no page (`@owner`) still gets its icon, just no link.");

		h2("Unknown names seen this session");

		md("Every `#name` or `@name` nobody's map recognised, collected once the page you're looking at renders one — `Mention.js`'s own `unknown` Set, never cleared, so this list only grows while this tab is open.");

		// The `#Nope` above already rendered, synchronously, by the time this runs —
		// a demo's function is a normal capture fn, same as page content itself — so
		// `unknown` already has it the first time this draws.
		div.c("flex wrap gap-25", () => {
			if (!unknown.size) return void span.c("muted").text("None yet — render a page with an unresolved mention and it shows up here.");
			[...unknown].forEach(name => { span.c("item inline boxed").text(name); });
		});

		h2("How the map keeps itself honest");

		md("The LIST of names is still hand-written — which few hundred pages are worth a one-word mention is a judgment call, not a mechanical one. But `refs.js`'s `icon` and `class_card` no longer have to be re-typed by hand when a page changes: [`sync.mjs`](sync.mjs) reads each page's own `icon:` property and its real, live `nav().class_card` and corrects any entry that disagrees. `doc/syntax.md` has the detail; run it with `node public/framework/ext/Mention/sync.mjs` after changing a mentioned page's icon or its `subject`.");

		code.js(`import { mentions } from "/framework/ext/Mention/Mention.js";
mentions(someElement);                 // walk it in place, using the site's own two maps
mention_html("See #Page for more.");   // the string form, for a template literal`);

		md("Next: [Markdown](/framework/ext/markdown/) — the render `mentions()` rides on for every page on this site.");

		md.details(import.meta, "readme.md");
	}
});
