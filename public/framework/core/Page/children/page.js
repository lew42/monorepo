import { Page, md, code, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Children",
	description: "How a page knows what is under it — and what a manifest would change.",
	icon: "account_tree",

	content(){

		code.js(`children: "guide api"`);

		md("Names, not imports — and every one of them **is** imported, at construction. So a menu can read its children's real titles and icons, and [Router](/framework/core/Router/) waits for the whole chain before it shows anything: the menu draws **once**, correct, never names-first-then-titles.");

		h2("Not a registration");

		md("`child()` resolves a segment in three steps: **memory, then `route()`, then a filesystem probe** for `<url><name>/page.js`. So a folder nobody declared still works when you navigate to it.");

		md("**Forgetting to declare costs the menu entry, not the url.** That is a deliberate reversal — this line used to be the registration, and a name nobody declared was a loud 404. A 404 for a `page.js` that plainly exists on disk turned out to be the wrong loudness: not a report, a puzzle, with the same one-line fix every time.");

		h2("So what is the line for?");

		md("**Navigation: which children, and in what order.** That is the one job a filesystem cannot do — `api` before `guide` before `intro` is alphabetical, and alphabetical is not a curriculum.");

		md(`| | the question | who knows |
|---|---|---|
| **discovery** | which children exist? | the filesystem — now probed |
| **presentation** | what order? what label, what icon? | a human — this line for order, each page for the rest |
| ~~laziness~~ | ~~which do I load *now*?~~ | gone: all of them, up front |`);

		h2("Can't it just read the folder?");

		md("**No, and this is not a design choice.** A browser has no directory listing. `import()` takes a path; there is no way to ask a static host what is in `/docs/`. The probe guesses one name at a time because that is the only thing available without a generated file.");

		h2("A label belongs to the parent's list; a title belongs to the page");

		md("**One declaration, on the page it describes.** Every menu that lists it follows — there is no map on the parent.");

		code.js(`export default new Page({
    meta: import.meta,
    title: "Start",         // the h1 on this page
    label: "Start here",    // what every menu calls it
    icon: "flag",
});`);

		md("`start` is labelled *\"Start here\"* in `/framework/`'s menu and titled *\"Start\"* on its own page, deliberately — a menu entry and a page heading are different sentences. A parent that wants a different word in *its own* list spreads over the entry where you can see it happen: `{ ...this.nav_for(name), label: \"Overview\" }`.");

		h2("What a manifest would change");

		md("The reasonable next idea is a generated `/directory.json` — every page on disk, one fetch. It is the right idea and it does **not** replace this line.");

		md(`| | discovery | presentation |
|---|---|---|
| \`children: "…"\` | not needed — probed | ✅ order is the list |
| \`/directory.json\` | ✅ generated, checkable at build time | ❌ alphabetical |
| \`./page.json\` per page | ❌ still declared | ✅ **readable without executing** |

A flat list of paths is alphabetical, so a manifest grows entries — and **an entry with a label and an order in it is this declaration, moved further from the page it describes.**`);

		md("The one thing a manifest buys that nothing else does: **a parent could read a child's title without executing it.** That is the job the eager imports pay one HTTP request per child to do, and it is the real argument for building one.");

		md("The shape that keeps both: **discovery generated, presentation declared, the generated half a *default*.** The full weighing is in the design record below.");

		h2("Urls with no folder at all");

		code.js(`route(name){
    const entry = catalogue[name];
    return entry && { title: entry.title, content(){ … } };
}`);

		md("[Sections](/framework/styles/sections/) does exactly this: nine urls, one object, **no directories**. It runs for **undeclared** names only, so it structurally cannot shadow a `page.js`. When your children come from data rather than from decisions, this is the answer and `children` is the wrong tool.");

		md("Next: [Fit](/framework/styles/layouts/fit/) — what a page can be once it has some.");

		md.details(import.meta, "../doc/declaring.md", "Design record — the reversal, and the CMS question in full");
	}
});
