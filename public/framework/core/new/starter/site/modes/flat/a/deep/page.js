import { Page, p, a } from "/app.js";
import { code } from "../../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Deep",

	content(){
		p("Column 3, two levels below the only file that mentions columns.");

		code(`
.page.flat            ← modes/flat/     grid, 3 tracks
  .page-content       ← its content     track 1
  .pages              display: contents
    .page (a)         display: contents
      .page-content   ← a's content     track 2
      .pages          display: contents
        .page (deep)                    track 3`, "the DOM, and what the grid sees");

		p("The tree still mirrors the url exactly. Only the boxes are gone.").ac("note");

		a.c("page-link", "← Flat columns").href("/modes/flat/");
	}
});
