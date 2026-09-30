import { Page, md, code, h3 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Patterns",
	description: "The shape of a module: assign-based classes, parts as static subclasses, the page shape, and how capturing works.",
	icon: "extension",

	content(){
		md(`No bundler, no build, no transpile — \`public/\` runs in the browser as native ESM, and the thesis is that you can read a class top to bottom and know what happens. Four shapes make that true everywhere:`);

		h3("1. Capturing is synchronous");
		md(`\`View.captor\` is one global with a push/pop stack, restored the instant your function *returns* — for an \`async\` function, its **first \`await\`**. A factory call built after that lands somewhere else, and nothing throws. Capture the box now, fill it in a callback:`);
		code.js(`previews(){
    return div.c("page-previews", async ($previews) => {
        const children = await Promise.all(names.map(n => this.child(n)));
        $previews.append(() => children.forEach(c => c.preview()));   // captor is $previews again
    });
}`);

		h3("2. A module is a class; every method is a seam");
		md(`Behaviour lives in methods, so any piece can be cherry-picked or overridden by a subclass without editing the file. Every constructor is assign-based — copy exactly:`);
		code.js(`constructor(...args){ this.assign(...args); }
assign(...args){ return Object.assign(this, ...args); }`);
		md(`\`...args\`, never named parameters or a \`config\` object; defaults live on the prototype; later args win (\`new Router(this.router, { app: this })\`). What the caller knows arrives by assign; what only the container knows arrives by **adoption** (\`child.parent = this\`) — a \`page.js\` never mentions \`app\` or \`parent\`. Never read \`window.app\` inside \`framework/\`; take the app as an arg, read \`this.app\`.`);

		h3("3. Parts are classes — hang them on the constructor");
		md(`If a class needs several things, give the thing a class. Attach it as a static and it inherits down the whole chain:`);
		code.js(`List.View = class ListView extends View { … };

Sortable.List = class SortableList extends List { … };
// Sortable.List.View === List.View — inherited, nothing to wire

Sortable.List.View = class SortableListView extends List.View { … };
// only Sortable's branch has the sortable view; List.View is untouched`);
		md(`Reach a part through the **live** class, never the lexical name — \`new this.constructor.View(…)\`, never \`new List.View(…)\`, or no subclass can ever replace it.`);

		h3("4. Names");
		md(`- If it does work, it's a method (\`page.chain()\`); a getter only aliases state.
- Short and exactly right beats long and complete. Say a new name out loud before adding it to \`View\`/\`Page\`/\`App\`/\`Router\`/\`Sidebar\`.
- A dir or file named after the class it exports is PascalCase (\`ext/Panel/Panel.js\`); everything else lowercase. \`$prop\` after the class it carries (\`this.$sidebar_inner\` ↔ \`.sidebar-inner\`).
- A new class or public method gets its name recorded, so the Docs API tab shows how it was chosen — run a names vote (\`node Server/collab.mjs <taskdir>\`) if the name is still open.`);

		h3("5. The blessed page shape");
		code.js(`import { Page, p } from "/app.js";
export default new Page({ meta: import.meta, title: "Text", children: "intro guide", content(){ p("Body."); } });`);
		md(`Dormant until placed; \`children\` are names in nav order, auto-imported; imports flow **down**, \`.parent\` points **up** — never both. The [new-page skill](/framework/ai/) has the full mechanics.`);

		md("CSS gets its own page — see [code/css](../css/) for layers and where a declaration belongs, and [/framework/styles/](/framework/styles/) for the vocabulary itself.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
