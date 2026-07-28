import { Page, p, ul, ol, li } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "List",
	description: "Unordered, ordered, and nested lists.",
	content(){
		p("Base styles give lists a `1.2em` left padding — enough for markers, no more.");

		ul(() => {
			li("First item");
			li("Second item");
			li("Third item, with a nested list:", () => {
				ul(() => {
					li("Nested one");
					li("Nested two");
				});
			});
		});

		p("Ordered:");

		ol(() => {
			li("Step one");
			li("Step two");
			li("Step three");
		});
	}
});
