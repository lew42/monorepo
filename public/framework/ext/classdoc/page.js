import { Page, md, code, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Classdoc",
	description: "A class's methods as pages: real source, plus notes from a .md file next door.",
	content(){

		code.js(`classdoc(this, View, import.meta, "append ac on style");
this.previews();`);

		md("Two lines in a `page.js` and every named method becomes a child page showing **the method's actual source** above prose you wrote in a file. Live example: [View](/framework/core/View/) — the five links at the top of it.");

		md("## The files");

		md("```\ncore/View/\n    View.js\n    page.js                     ← calls classdoc()\n    doc/method/\n        append.md               ← /framework/core/View/append/\n        ac.md\n        style.md\n```\n\nDocumenting a method is **writing a file**. No registration, no UI, no build step — which is the requirement, because the author here is usually an AI and a plain file is the only interface that needs nothing else present.");

		md("## Why the list is hand-typed");

		md("`Object.getOwnPropertyNames(View.prototype)` would keep a method list in sync for free. It is still the wrong call: it cannot know which methods have **prose**, and the prose is the feature. Reflection would document `append_fn` and `prepend_pojo` — private helpers — as reader-facing pages with an error box where the notes should be.\n\nThe list is authorial, exactly like `children`, and it is a string for the same reason: a static host has no directory listing, so *nothing* can be discovered. Declaring is not a workaround here, it's the only thing that works.");

		md("## Two traps it already handles");

		md("**Getters execute when you read them.** `Class.prototype[name]` on `App.get loaded()` runs `Promise.all` against a bare prototype and throws before you reach `toString()`. `member()` goes through `Object.getOwnPropertyDescriptor` and holds the function without calling it.");

		md("**`source()` would eat the signature.** It strips everything before the first `{` — right for `demo(fn)`, whose subject is an anonymous function, and wrong here: `append(...args)` is the one line a reader needs to confirm they're in the right place. Classdoc uses `dedent(String(fn))` instead.");

		md("## It shows what actually runs");

		md("`ext/highlight` **replaces** `View.prototype.append` at import time. So on this site, `View.append`'s source *is* the patch — and [the page says so](/framework/core/View/append/) rather than quietly showing the original.\n\nA patch is detectable because JS infers a function's name from assignment to an identifier but never to a member expression: `View.prototype.append = function(){}` has `fn.name === \"\"`. That one line of trivia is the whole check.");

		md.details(import.meta, "readme.md", "Design record — the council's verdict, and what was rejected");
	}
});
