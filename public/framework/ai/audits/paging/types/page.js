import { Page, p } from "/app.js";
import { typesWall } from "./types.js";

/* Seven page types, each a page; open one to see its variants, each its own page. */
export default new Page({
	meta: import.meta,
	title: "Page types",
	icon: "category",
	description: "The page-type library as a wall: each type is a page, each variant is a page inside it.",
	children: "module doc index demo board task program",
	content(){
		p("Pick a type. Each one opens a wall of its variants.");
		typesWall(import.meta);
	},
});
