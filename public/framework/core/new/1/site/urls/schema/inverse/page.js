import { Page } from "/app.js";
import { md, claim, visit } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Inverse",

	content(){

		claim(() => {
			// this file lives at        /urls/schema/inverse/page.js
			// so import.meta.url is     …/urls/schema/inverse/page.js
			// and naming() derives      /urls/schema/inverse/
			const url = new URL(".", import.meta.url).pathname;
		}, "/urls/schema/inverse/", "The url in the address bar and the path on disk are the same statement, read in two directions.");

		md(`
| direction | expression | example |
|---|---|---|
| url → module | \`url + "page.js"\` | \`/urls/schema/inverse/\` → \`/urls/schema/inverse/page.js\` |
| module → url | \`new URL(".", meta.url).pathname\` | \`…/inverse/page.js\` → \`/urls/schema/inverse/\` |
`);

		md(`Both are one expression because a page url always ends in \`/\`. Drop the trailing slash and \`url + "page.js"\` produces \`/urls/schema/inversepage.js\` — which is why rule 1 is rule 1, and not a formatting preference.`).ac("note");

		visit(["/urls/schema/", "/urls/slash/"]);
	},
});
