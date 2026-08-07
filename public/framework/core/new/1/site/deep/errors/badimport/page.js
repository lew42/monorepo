import { Page, p } from "/app.js";

// EXISTS, and fails — for a different reason than boom/. This file is fine; its
// dependency is not. The browser reports that as "Failed to fetch dynamically
// imported module: .../badimport/page.js", naming THIS file, so Page.missing()
// matches and classifies a file that exists as a 404. See /deep/errors/.
import "./does-not-exist.js";

export default new Page({
	meta: import.meta,
	title: "Unreachable",
	content(){ p("Never rendered."); }
});
