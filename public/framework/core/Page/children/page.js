import { Page, md, demo, code, h2, div, p, span, a, icon, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Children",
	description: "How a page knows what is under it — and what a manifest would change.",
	icon: "account_tree",

	content(){

		toc();

		code.js(`children: "guide api"`);

		md("Names, not imports. Each is a folder with a `page.js` in it, and **none of them is fetched until someone navigates there** — that is the whole of lazy loading.");

		md("**Nothing crawls the filesystem**, so this line *is* the registration. A folder nobody declared is a 404, loudly, on the first click.");

		h2("One line, three jobs");

		md("It reads like a chore because it looks like one decision. It is three, and they collapse into one token each — which is why every attempt to remove it puts most of it straight back.");

		md(`| | the question | who knows |
|---|---|---|
| **discovery** | which children exist? | the filesystem |
| **presentation** | what order, what label, what icon? | a human |
| **laziness** | which do I load *now*? | the router, at click time |

Discovery is the list. Presentation is the **order** of the list. Laziness is that they are names and not imports.`);

		h2("Can't it just read the folder?");

		md("**No — and this is not a design choice.** A browser has no directory listing. `import()` takes a path; there is no way to ask a static host what is in `/docs/`. Discovery has to come from somewhere a browser can fetch, which means a file someone generated.");

		md("What *is* available is importing the names you already declared:");

		code.js(`initialize(){ this.load_all_children(); }`);

		md("The opt-out of laziness. With it, a menu can show real titles and icons, so **an icon lives on the page it belongs to and nowhere else** — change it once and every menu follows. Measured on `/framework/`: 28 page fetches, **+51ms to first paint**. Pay the imports, delete the duplication.");

		h2("A label belongs to the parent's list; a title belongs to the page");

		code.js(`nav: {
    guide: "The guide",                          // a label
    api:   { label: "API", icon: "code" },       // and an icon
}`);

		md("Not two copies of one thing. `start` is labelled *\"Start here\"* in its parent's menu and titled *\"Start\"* on its own page, deliberately — a menu entry and a page heading are different sentences.");

		md("Declare nothing and it still works: the label falls back to an imported child's `title`, then to the bare segment. A card reads `columns` until you visit it and `Columns` after — the honest cost, and a visible one.");

		h2("What a manifest would change");

		md("The reasonable next idea is a generated `/directory.json` — every page on disk, one fetch, no hand-maintained list. It is the right idea and it does **not** replace this line.");

		md(`| | discovery | presentation | laziness |
|---|---|---|---|
| \`children: "…"\` | hand-typed | ✅ order is the list | ✅ names, not imports |
| \`/directory.json\` | ✅ generated | ❌ alphabetical | ✅ still names |
| \`./page.json\` per page | ❌ still declared | ✅ **readable without executing** | ✅ a fetch, not an import |

A flat list of paths is alphabetical, and \`api\` before \`guide\` before \`intro\` is not a curriculum. So a manifest grows entries — and **an entry with a label and an order in it is this declaration, moved further from the page it describes.**`);

		md("The one thing a manifest buys that nothing else does: **a parent could read a child's title without executing it.** That is the job `load_all_children()` currently pays 28 HTTP requests to do, and it is the real argument for building one.");

		md("The shape that keeps both: **discovery generated, presentation declared, the generated half a *default*.** A page that says nothing gets its real children in filesystem order — right for a blog, a docs folder, a CMS collection. A page that cares says so, and its declaration wins.");

		md("The full weighing, including why a stale manifest is worse than a hand-typed list: the design record below.");

		h2("Urls with no folder at all");

		md("For anything catalogue-shaped, the declaration is already avoidable — `route()` claims segments the parent could not list in advance:");

		code.js(`route(name){
    const entry = catalogue[name];
    return entry && { title: entry.title, content(){ … } };
}`);

		md("[Sections](/framework/styles/sections/) does exactly this: nine urls, one object, **no directories**. It runs *after* the declared names, so a dynamic name costs no doomed import and structurally cannot shadow a `page.js`. When your children come from data rather than from decisions, this is the answer and `children` is the wrong tool.");

		md("Next: [Fit](/framework/styles/layouts/fit/) — what a page can be once it has some.");

		md.details(import.meta, "../readme.md", "Design record — the CMS question, in full");
	}
});
