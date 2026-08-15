import { Doc, md, code } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Doc",
	description: "A module as a page: its files, its members, its notes — each one a real url backed by a .md you wrote.",
	icon: "menu_book",

	subject: Doc,
	properties: "intrinsic",
	methods:    "sections section member_page bar is_class declaration",
	notes:      "rail reflection files",
	overview:   "urls",
	files:      "Doc.js doc.css page.js readme.md overview/urls/page.js",

	content(){

		code.js(`export default new Doc({
    meta: import.meta,
    title: "View",
    subject: View,
    methods:    "append ac on style stylesheet",
    properties: "el capture",
    notes:      "capturing",
    files:      "View.js View.css page.js",
    content(){ /* the overview */ },
});`);

		md("One call is a whole module page: **Overview · API · Docs · Files** across the top, and inside each one a **left rail of sub sections**. Live example — [View](/framework/core/View/). This page is one too, documenting `Doc` with `Doc`.");

		md("## The tabs are derived, never declared");

		md(`| the call site lists | it lands in | at |
|---|---|---|
| \`content()\` | **Overview** | \`/View/\` |
| \`overview: "demos"\` | Overview's own rail | \`/View/overview/demos/\` |
| \`children: "guide"\` | a top tab of its own | \`/View/guide/\` |
| \`properties\` then \`methods\` | **API** | \`/View/api/append/\` |
| \`notes\` | **Docs** | \`/View/docs/capturing/\` |
| \`files\` | **Files** | \`/View/files/\` |`);

		md("Nothing at the call site ever says *\"tab\"* — it lists members, and the grouping falls out. **An empty section has no tab.** [Urls](/framework/ext/doc/overview/urls/), in the rail beside this text, is `overview: \"urls\"` — a page on disk at `doc/overview/urls/page.js`.");

		md("## Four kinds of page, four kinds of file");

		md(`| list | the page shows | prose from |
|---|---|---|
| \`methods\` | the member's real source | \`doc/method/<name>.md\` |
| \`properties\` | what can be shown without running anything | \`doc/property/<name>.md\` |
| \`notes\` | nothing — the prose *is* the page | \`doc/<name>.md\` |
| \`files\` | the fetched file, and what it's for | \`doc/file/<path>.md\` |`);

		md("A **property** mostly has no source: an instance field assigned in the constructor leaves nothing on the prototype, so its page is the prose alone. An accessor shows its function, and a prototype default shows its one-line declaration — [capture](/framework/core/View/api/capture/) shows `capture = true`. Read via `getOwnPropertyDescriptor`, never `subject.prototype[name]`: reading a getter **executes** it.");

		md("A **note** is prose that earned a url — a worked trap, a topic bigger than one member, **the design record**. `doc/<name>.md` is the same file the module's `readme.md` cites as *\"see ./doc/capturing.md\"*, so the record is written once and served twice.");

		md("## Classes and non-classes alike");

		code.js(`subject: View     // a class — members on the prototype, then the statics
subject: md       // a function with properties — md.file, md.details
subject: ui       // a plain namespace object
// …or no subject at all: notes: and files: document a module of loose functions`);

		md("`member()` looks on `subject.prototype` first and on the subject itself second, which covers all four with one lookup. Only a real **class** gets the *Overrides* line under a member, because only a class has instances for an assigned member to shadow — and `Doc.is_class` tests the source text rather than `typeof`, since `md` is a function too and owns a `prototype` like every other one.");

		md("## Files — the module as a pseudo-IDE");

		md("The [Files](/framework/ext/doc/files/) tab is [ext/files](/framework/ext/files/) with an `about` hook: the tree, then `doc/file/<path>.md`, then the fetched source. **What a file is for, beside what it says.** `doc/` and `ai/` are never listed — they are the documentation, not the module.");

		md("The list is hand-typed for the same reason `methods` is, and for one more: `directory.json` is gitignored, so a crawler-driven tab would be blank in production and nobody who could fix it would ever see it break. [Why the file list is declared](/framework/ext/doc/docs/files/).");

		md("## It's `tabs()`, twice");

		code.js(`this.tabs(this.bar())     // the sections, across the top
this.tabs().ac("vertical")   // the sub sections, as a left rail`);

		md("That's the entire layout — **no new JS**. A section is an ordinary [Page](/framework/core/Page/) whose children are a rail, so both levels get real urls, real marking and a real back button, and a member deep-link paints the same DOM a click does.");

		md("## Every part is a method");

		md("`Doc extends Page`, so a module with a different shape **overrides** rather than the config growing an option: `sections()` says which sections exist, `section()` builds one, `api()` and `docs()` fill them, `member_page()` is the one page shape, `bar()` is the order, `well()` is the header. An option is API surface forever; an override lives in the file that wanted it.");

		md("## Why the lists are hand-typed");

		md("`Object.getOwnPropertyNames(View.prototype)` would keep a method list in sync for free. It is still the wrong call: it cannot know which members have **prose**, and the prose is the feature.\n\nThe list is **authorial**, the same way [`children`](/framework/core/Page/children/) is: it says which members are worth reading, and in what order. That is the one thing reflection cannot answer.");

		md("## It shows what actually runs");

		md("`ext/highlight` **replaces** `View.prototype.append` at import time. So on this site, `View.append`'s source *is* the patch — and [the page says so](/framework/core/View/api/append/) rather than quietly showing the original.\n\nA patch is detectable because JS infers a function's name from assignment to an identifier but never to a member expression: `View.prototype.append = function(){}` has `fn.name === \"\"`. That one line of trivia is the whole check.");

		md("Next: [Tabs](/framework/ext/tabs/) — the component both levels of this page are made of. Or [Files](/framework/ext/files/), which the Files tab is.");

		md.details(import.meta, "readme.md", "Design record — the sections, and what was rejected");
	}
});
