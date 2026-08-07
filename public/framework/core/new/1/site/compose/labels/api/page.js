import { Page, p, a } from "/app.js";
import { this_file } from "../../../compound/recipe.js";

export default new Page({
	meta: import.meta,
	title: "API",

	content(){
		p("Here is where deriving loses. My title is `API`; `titleize(\"api\")` says `Api`. No amount of cleverness fixes this from the outside — the parent cannot know, because knowing is what importing me is FOR.");
		p("The fix is not a smarter function or a label map. It is a better segment: `/api-reference/` derives to `Api reference`, and nobody has to maintain anything.").ac("note");
		a.c("page-link", "← back to the table").href("/compose/labels/");
		this_file(import.meta);
	}
});
