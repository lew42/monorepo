import { View, div } from "../View/View.js";
import { Router } from "./Router.js";
import { Page } from "./Page.js";

export class App {

	constructor(...args){
		this.assign(...args);
		this.start();
	}

	assign(...args){ return Object.assign(this, ...args); }

	async start(){
		this.render();
		await this.load();
		this.$body.append(this.$app);
	}

	// override in /app.js to put chrome around $app
	render(){
		this.$body = View.body();
		this.$app = div.c("app");
		View.set_captor(this.$app);
	}

	// the Router is created AFTER root exists — it starts listening in its
	// constructor, and every navigation walks from app.root.
	async load(){
		this.root = await Page.import("/") ?? new Page({ url: "/" });
		this.root.app = this;
		this.router = new Router({ app: this });
		await this.router.load(location.pathname);
	}

	// App is the root page's container — same two methods every Page has
	show(page){ this.$app.append(page.render()); }
	hide(page){ page.view.remove(); }
}

export default App;
