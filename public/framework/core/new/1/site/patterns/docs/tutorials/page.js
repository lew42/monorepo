import { Page, p, div, a } from "/app.js";
import { code, section } from "../../../ui.js";
import { recipe } from "../../recipe.js";

const walkthroughs = [
	["first-queue", "Your first queue", [
		"Create the table with `npx kettle migrate`.",
		"Declare a queue and push one job.",
		"Start a worker in a second terminal and watch the row disappear.",
	]],
	["retries", "Surviving a bad worker", [
		"Throw from the handler on purpose.",
		"Watch `attempt` climb and the delay double.",
		"Find the job in `kettle_dead` and requeue it.",
	]],
	["deploys", "Zero-downtime deploys", [
		"Send SIGTERM and watch leases drain rather than expire.",
		"Roll the workers while the producer keeps pushing.",
		"Confirm nothing ran twice by checking the ack log.",
	]],
];

const nav = () => ({
	meta: import.meta,
	title: "Tutorials",

	initialize(){
		walkthroughs.forEach(([name, title, steps]) => this.add(name, {
			title,
			content(){ code(steps.map((s, i) => `${i + 1}. ${s}`).join("\n\n")); },
		}));
	},

	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("The medium branch. Three walkthroughs, one level, inline — the same recipe as the reference with a different number in it, which is the point: shape drives the recipe, size does not.");

		section("Walkthroughs");

		this.previews();

		div.c("row", () => a.c("page-link", "← Kettle docs").href("/patterns/docs/"));
	},
});
