import { Page, h2, demo, div, span } from "/app.js";
import badge from "/framework/styles/components/badge/component.js";
import { pill } from "/framework/styles/components/parts.js";

const sizes_demo = () => div.c("flex gap wrap v-center", () => {
	span.c("h4", "Small").style({ ...pill, fontSize: "0.75em", padding: "0.1em 0.5em" });
	span.c("h4", "Default").style(pill);
	span.c("h4", "Large").style({ ...pill, fontSize: "1.1em", padding: "0.25em 0.9em" });
});

export default new Page({
	meta: import.meta,
	title: "Badges",
	description: "Six pills from one style object, and the tones the token set can't give you.",

	content(){
		demo(badge, "`pill` is one style object in framework/styles/components/parts.js, reused for the tone, the status dot, and the count.").ac("mb");

		h2("Sizes").ac("mb");
		demo(sizes_demo, "The same `pill` object, `font-size` and `padding` are the only two declarations that change.");
	}
});