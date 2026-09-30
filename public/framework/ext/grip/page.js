import { Doc, md, code, h2 } from "/app.js";

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

		h2("Its name, and where it lives");
		md("This widget is called **the grip**. It lives here, at `ext/grip` — one link answers \"where's the resize handle?\" for good. Where it drags AI 2's inbox, it sits between two named layouts: the **preview rail** (a flush stack of card previews — [design/layout](/framework/design/layout/doc/rules.md), [list and detail](/framework/core/Layout/list-and-detail/)) and the **detail** beside it.");

		h2("Two invisible zones");
		md("A ~50px **show** zone around the strip makes the line and the pill visible from well before your pointer is on them — it never grows a hit box, so nothing under it (a link, a scrollbar) ever loses a click. The real **grab** zone is the small strip itself: on a rail docked with `mirror: true` (AI 2's preview rail, the Playground tree), it leans almost entirely OUT across the boundary it drags, away from the scrollbar the rail keeps flush against that same edge, and holds back to about a pixel on that side. Full record: [`doc/decisions.md`](./doc/decisions.md#two-zones-not-one--and-why-only-grip-start-gets-the-asymmetric-box-grip-zones-2026-09-30).");
	},
});
