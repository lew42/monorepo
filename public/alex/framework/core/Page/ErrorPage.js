import { el, h1 } from "../View/View.js";
import Page from "./Page.js";

/* Shared error page — used by the Router when a page module fails to load. */
export default class ErrorPage extends Page {
	render() {
		h1("Page Load Error");
		el.c("pre", "error",
			String((this.error && (this.error.stack || this.error.message)) || this.error || "Unknown error"));
	}
}

ErrorPage.prototype.title = "Page Load Error";

export { ErrorPage };
