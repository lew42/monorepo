import { Page, p } from "/app.js";
import { code, section } from "../../../ui.js";
import { recipe } from "../../recipe.js";

const nav = () => ({
	meta: import.meta,
	title: "Guide",
	children: "install concepts",     // and concepts has two of its own
	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("The deep branch. I claim no region, so my children walk past me to the docs page's `cols` and land as my siblings — which is why a four-level guide is four columns and not a column inside a column.");

		section("In this section");

		this.previews();

		section("Kettle in one paragraph");

		p("A queue is a durable list of jobs. A worker leases a job, runs it, and either acknowledges it or lets the lease expire, at which point another worker picks it up. There is no broker and no daemon: Kettle is a table and a loop.");

		code(`
import { Queue } from "kettle";

const emails = new Queue("emails", { db });

await emails.push({ to: "ada@example.com", template: "welcome" });

emails.work(async job => { await send(job.data); });`, "the whole of it");
	},
});
