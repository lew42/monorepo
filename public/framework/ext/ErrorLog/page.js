import { Page, md, code, div, button, pre } from "/app.js";
import ErrorLog from "./ErrorLog.js";

export default new Page({
	meta: import.meta,
	title: "ErrorLog",
	icon: "bug_report",
	description: "A UI error becomes one log line a session can follow.",

	content(){
		md("**ErrorLog** turns an error on the screen into one line in a log file, so an assistant can see it without you dictating it. Press the button: it builds the line it would write.");
		const $out = pre("(nothing yet)");
		button("Throw a test error").click(() => {
			ErrorLog.watch(() => ({ demo: "state snapshot goes here" }));
			ErrorLog.seen.clear();
			const line = ErrorLog.report(new Error("test error from the ErrorLog page"), { where: "ErrorLog page" });
			$out.text(JSON.stringify(line, null, 2));
		});
		code.js(`import ErrorLog from "/framework/ext/ErrorLog/ErrorLog.js";
ErrorLog.watch(() => ({ status: page.status }));   // once per page
ErrorLog.report(error, { where: "Refine.go" });    // a caught error`);
		md("Design, the options weighed and the open questions: [design](/framework/ext/ErrorLog/md/doc/design/).");
	},
});
