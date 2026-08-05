import { div, input, textarea, button } from "/app.js";
import { box } from "../parts.js";

/* `flow` is the rhythm class Page.css already uses for page copy, so a stack of
 * fields is spaced by `--flow` with nothing written here. Inputs are full width
 * out of the box (framework.css), so a field is a label and a control. */
export default () => {
	box("Sign up", () => {
		div(() => { div.c("h4", "Email"); input().attr("type", "email"); });
		div(() => { div.c("h4", "Message"); textarea.c("auto"); });
		div.c("flex gap", () => { button.c("prim", "Send"); button("Cancel"); });
	}).ac("layout-measure");
};
