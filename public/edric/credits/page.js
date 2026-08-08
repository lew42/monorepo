import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Credits",
	description: "Who built this, and what it's built with.",

	content(){
		md("This documentation, `edric/`, was written and built by **Edric**.");

		md("It runs on the framework built by **Michael** ([lew42](https://github.com/lew42)): no build step, native ES modules, `App` + `View` at the core, and the `Page`/`Router`/`Sidebar` system that everything on this site now runs on.");

		md("Thanks also to everyone else whose work is linked from the sidebar on the site's home page, `Alex`, `Arya`, `Castin`, and `Michael`, each of whom wrote their own take on these same docs. Worth reading all of them.");
	}
});