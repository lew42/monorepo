import { classdoc, md, code } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "Classdoc",
	description: "A class's methods as pages: real source, plus notes from a .md file next door.",
	icon: "menu_book",

	overview: "urls",           // Overview > Urls — an arbitrary sub page
	notes: "rail reflection",   // the Docs tab. No Class here, so there is no API tab

	content(){

		code.js(`export default classdoc.page({
    meta: import.meta,
    title: "View",
    Class: View,
    methods:    "append ac on style stylesheet",
    properties: "el capture",
    notes:      "capturing",
    content(){ /* the overview */ },
});`);

		md("One call is a whole class page: **Overview · API · Docs** across the top, and inside API and Docs a **left rail of members**, each showing the member's real source above prose you wrote in a file. Live example — [View](/framework/core/View/). This page is one too.");

		md("## The tabs are derived, never declared");

		md(`| the call site lists | it lands in | at |
|---|---|---|
| \`content()\` | **Overview** | \`/View/\` |
| \`overview: "demos"\` | Overview's own rail | \`/View/overview/demos/\` |
| \`children: "guide"\` | a top tab of its own | \`/View/guide/\` |
| \`properties\` then \`methods\` | **API** | \`/View/api/append/\` |
| \`notes\` | **Docs** | \`/View/docs/capturing/\` |`);

		md("Nothing at the call site ever says *\"tab\"* — it lists members, and the grouping falls out. **An empty group has no tab**: this page passes no `Class`, which is why there is no API above. [Urls](/framework/ext/classdoc/overview/urls/), in the rail beside this text, is `overview: \"urls\"` — a page on disk at `classdoc/overview/urls/page.js`.");

		md("## Three kinds of member page");

		md(`| list | the page shows | prose from |
|---|---|---|
| \`methods\` | the method's real source | \`doc/method/<name>.md\` |
| \`properties\` | what can be shown without running anything | \`doc/property/<name>.md\` |
| \`notes\` | nothing — the prose *is* the page | \`doc/<name>.md\` |`);

		md("A **property** mostly has no source: an instance field assigned in the constructor leaves nothing on the prototype, so its page is the prose alone. An accessor shows its function, and a prototype default shows its one-line declaration — [capture](/framework/core/View/api/capture/) shows `capture = true`. Read via `getOwnPropertyDescriptor`, never `Class.prototype[name]`: reading a getter **executes** it.");

		md("A **note** is prose that earned a url — a worked trap, a topic bigger than one member, **the design record**. `doc/<name>.md` is the same file the class's `readme.md` cites as *\"see ./doc/capturing.md\"*, so the record is written once and served as a page. Live example — [capturing](/framework/core/View/docs/capturing/).");

		md("## It's `tabs()`, twice");

		code.js(`this.tabs("overview api docs")     // the page
this.tabs().ac("vertical")         // inside each group`);

		md("That's the entire layout — **no new JS**. A group is an ordinary [Page](/framework/core/Page/) whose children are a rail, so both levels are real urls with real marking, and a member deep-link paints the same DOM a click does. A rail of one hides its own bar, which is why an overview with no sub pages looks like a plain page.");

		md("The composable form is still there for a page that wants something else — `classdoc(page, Class, meta, names)` just adds the children and returns the page.");

		md("## Why the list is hand-typed");

		md("`Object.getOwnPropertyNames(View.prototype)` would keep a method list in sync for free. It is still the wrong call: it cannot know which methods have **prose**, and the prose is the feature.\n\nThe list is **authorial**, the same way [`children`](/framework/core/Page/children/) is: it says which members are worth reading, and in what order. That is the one thing reflection cannot answer.");

		md("## Two traps it already handles");

		md("**Getters execute when you read them.** `Class.prototype[name]` on `App.get loaded()` runs `Promise.all` against a bare prototype and throws before you reach `toString()`. `member()` goes through `Object.getOwnPropertyDescriptor` and holds the function without calling it.");

		md("**`source()` would eat the signature.** It strips everything before the first `{` — right for `demo(fn)`, whose subject is an anonymous function, and wrong here: `append(...args)` is the one line a reader needs to confirm they're in the right place. Classdoc uses `dedent(String(fn))` instead.");

		md("## It shows what actually runs");

		md("`ext/highlight` **replaces** `View.prototype.append` at import time. So on this site, `View.append`'s source *is* the patch — and [the page says so](/framework/core/View/api/append/) rather than quietly showing the original.\n\nA patch is detectable because JS infers a function's name from assignment to an identifier but never to a member expression: `View.prototype.append = function(){}` has `fn.name === \"\"`. That one line of trivia is the whole check.");

		md("Next: [Tabs](/framework/ext/tabs/) — the component both levels of this page are made of.");

		md.details(import.meta, "readme.md", "Design record — the grouping, and what was rejected");
	}
});
