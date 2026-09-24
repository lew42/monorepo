import { Page, md } from "/app.js";

/* The numbered eighteen (`/imagine/layouts/2/golden/`) are retired. Their names live on,
   unchanged, as the entries of core/Layout, so the redirect is a pure rewrite:
   `/imagine/layouts/<n>/<name>/`  →  `/framework/core/Layout/<name>/`
   `/imagine/layouts/<n>/`         →  `/framework/core/Layout/`
   `route()` claims every undeclared segment, so an old bookmark answers instead of 404ing.
   The moved page says where you are going, then `location.replace` takes you there. */
const NEW = "/framework/core/Layout/";

const depth = () => location.pathname.split("/").filter(Boolean).length; // /imagine/layouts/2/ = 3, /imagine/layouts/2/golden/ = 4

const moved = (to, at) => ({
	title: "Moved",
	icon: "moving",
	content(){
		md(`**This page moved.** Layouts have names now, not numbers. It is now [${to}](${to}).`);
		// a number page renders as a parent of its name page: only the page the url ENDS at redirects
		if (depth() === at) setTimeout(() => location.replace(to), 0);
	},
});

export default new Page({
	meta: import.meta,
	title: "Moved",
	icon: "moving",
	description: "The numbered layouts became named layouts in /framework/core/Layout/.",

	route(number){
		if (!/^\d+$/.test(number)) return;
		return { ...moved(NEW, 3), route: name => moved(NEW + name + "/", 4) };
	},

	content(){ md("**This page moved.** Layouts have names now, not numbers: see [/framework/core/Layout/](/framework/core/Layout/), or the layout standard at [/layouts/](/layouts/)."); },
});
