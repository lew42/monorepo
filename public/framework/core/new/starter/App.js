import { View, div } from "../../View/View.js";
import { Page } from "./Page.class.js";
import { Router } from "./Router.js";

/* Logging is console.* called directly, never through a helper — a wrapper puts
 * ITS line number on every message in devtools, which makes the source links
 * useless. Groups are only opened around fully synchronous work: a group opened
 * before an await stays open across it and swallows whatever logs next.
 */
export class App {

	constructor(...args){
		this.assign(...args);
		this.start();
	}

	assign(...args){ return Object.assign(this, ...args); }

	// App and Page are interchangeable containers, so they name themselves the
	// same way. There is only ever one app, so it needs no path. Logging only —
	// see the note on Page.log_label().
	log_label(){ return "app"; }

	async start(){
		console.group(`app.start() ${location.pathname} ${"─".repeat(40)}`);

		this.render();
		this.root = await this.load_root();
		this.router = new Router({ app: this });
		await this.router.load(location.pathname);
		this.$body.append(this.$app);

		console.log("app.inject() — $app appended to <body>, first paint");
		console.groupEnd();
	}

	// Override in /app.js to put chrome around $pages.
	//
	// The ONE thing an App owes a Page is `$pages` — the view the root page
	// mounts itself into. It has no show()/hide(): a page activates itself, and
	// the app is just the container above the root.
	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			this.$pages = div.c("pages");
		});

		View.set_captor(this.$app);
		console.log("app.render() — chrome built, still detached from <body>");
	}

	// every url is walked from here, so it loads before the router exists
	async load_root(){
		console.log('app.load_root() — import("/page.js"), the walk needs an origin');
		const root = await Page.import("/") ?? new Page({ url: "/" });
		return root.assign({ app: this });
	}
}

export default App;
