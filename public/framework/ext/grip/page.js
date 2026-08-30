import { Doc, md, code } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Grip",
	description: "A rail's resize edge — a strip inside the edge it drags and a pill that rides your pointer. Shared by the drawer, the dev rail and the Playground's two columns.",
	icon: "drag_handle",

	files: "grip.js grip.css page.js readme.md",
	notes: "decisions",

	content(){
		code.js(`import grip from "/framework/ext/grip/grip.js";

grip({
    write: px => size(px),    // every move — the width the pointer implies
    done: w => remember(w),   // once, on release — the width you let go of
    from: "start",            // omit for a rail docked at the screen's END
});`);

		md("**Try it on this page.** Open [the drawer](/framework/ext/drawer/) or the dev rail and drag their inline edge — both are this one strip. There is no permanent handle: the pill exists only while your pointer is near the edge, and it rides the pointer's Y. Extracted from `dev/DevBar` on 2026-08-18 so `ext/drawer` could resize without `ext/` importing `dev/`; the record is [`doc/decisions.md`](./doc/decisions.md).");
	},
});
