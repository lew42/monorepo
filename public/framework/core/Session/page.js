import { Doc } from "/app.js";
import Session from "./Session.js";

export default new Doc({
	meta: import.meta,
	title: "Session",
	description: "A record in its own dated folder (YYYY/MM/DD/slug/) with a page.jsonl; AISession extends it.",
	icon: "history",

	subject: Session,
	methods: "root_url day dir_url scan locate",
	files: "Session.js readme.md page.js",
});
