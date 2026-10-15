import { Doc } from "/app.js";
import AISession from "./AISession.js";

export default new Doc({
	meta: import.meta,
	title: "AISession",
	description: "One Claude session read once from its transcript, and the family of classes around it: the sessions grid, a session's own page, the node tools.",
	icon: "forum",
	subject: AISession,
});
