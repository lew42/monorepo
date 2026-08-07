import { Page, p } from "/app.js";
import { code, section } from "../../../../ui.js";
import { recipe } from "../../../recipe.js";

const nav = () => ({
	meta: import.meta,
	title: "Concepts",
	children: "batches fan-out",     // level four lives under here
	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("Level three, and the point where a real guide stops being a list and starts being a tree.");

		section("In this section");

		this.previews();

		section("Leases, not locks");

		code(`
job.lease   = now + visibility_timeout
job.attempt = 1

worker crashes  ->  lease expires  ->  another worker leases it, attempt 2
worker acks     ->  row deleted
attempt > max   ->  row moved to kettle_dead`);

		p("Everything else in Kettle is a consequence of that table. Retries are an attempt counter, priorities are an index, and a dead-letter queue is a second table with the same shape.");
	},
});
