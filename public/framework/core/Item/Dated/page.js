import { Doc, md, demo, div, span, button, pre } from "/app.js";
import Dated from "../Dated.js";
import Day from "../../Session/Day.js";
import Socket from "/framework/dev/Socket/Socket.js";

const today = () => Day.of();
const collection = new Dated("projects");

export default new Doc({
	meta: import.meta,
	title: "Dated",
	description: "A collection filed by day: one folder per item, one pointer row per item in the day's index. Projects are the first.",
	icon: "event_note",

	subject: Dated,
	methods: "path index_path rows",
	files: "../Dated.js ../Dated.test.mjs page.js",

	overview: [
		{ title: "Projects, live", icon: "event_note", description: "Press the button: a project is made on the server and its row appears below, no reload.", content(){
			md(`A **project** lives at \`<module>/projects/YYYY/MM/DD/<slug>/\`. Its row sits in today's index file, \`${collection.index_path(today())}\`. This list tails that file, so a project made by anyone shows up here at once. The button makes a tiny real project folder in \`core/Item\`.`);
			demo(() => {
				const list = div.c("flex v gap"), note = span.c("muted");
				const draw = rows => {
					list.empty();
					const mine = rows.filter(r => r.kind === collection.kind);
					note.text(mine.length ? `${mine.length} project row${mine.length === 1 ? "" : "s"} today` : "no project rows today yet");
					for (const r of mine.slice().reverse()) list.append(div.c("flex gap", () => { span(r.title ?? r.id); span.c("muted", r.path); }));
				};
				const open = async () => {
					try { const index = await Dated.Index.open(`/${collection.index_path(today())}`.replace("/public", "")); index.on("rows", draw); draw(index.rows); }
					catch (e){ note.text("no index file for today yet: make a project"); }
				};
				button("Make a demo project").on("click", async () => {
					const socket = Socket.singleton();
					if (socket.disabled) return note.text("no dev server here: this button needs one");
					const slug = "demo-" + Date.now().toString(36);
					const res = await socket.request({ method: "dated_create", args: [{ module: "core/Item", slug, title: "Demo project " + slug.slice(5) }] });
					note.text(res?.response?.ok ? "made " + res.response.dir : "refused: " + (res?.response?.error ?? "no answer (restart the dev server to load dated_create)"));
					if (res?.response?.ok) open();
				});
				open();
			});
		} },
	],
});
