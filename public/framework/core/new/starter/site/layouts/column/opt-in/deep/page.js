import { Page, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Deep",

	content(){
		p("Column 3. Three files, three copies of the same two lines.");
		p("That's the explicit end of the trade: you can read any one of them and know exactly what it does — and you had to write it three times.").ac("note");
	}
});
