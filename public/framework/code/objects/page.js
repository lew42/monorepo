import { Page, md, h3 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Objects",
	description: "Object-oriented design: every class ships a view of its own state — a chip, a row, a panel — so you can see what an instance knows.",
	icon: "hub",

	content(){
		md(`"I want to see as much of the data as possible to start trying to understand the internal
workings" (the owner, 2026-09-29). Every class here ends up with a way to SHOW an instance, not
just a way to construct one.`);

		h3("Three sizes, one object");
		md(`- **chip** — one glyph for the whole object, with small flags that light up for on/off state (recording, connected, muted)
- **row** — the icon, the name, and the one or two values that matter
- **panel** — everything, opened on demand`);
		md(`This applies to abstract things too (a session, a queue, an audio stream), not just visible ones.`);

		h3("How it's wired");
		md(`\`view(thing)\` checks \`thing.constructor.View\` first, else falls back to a generic tree of
rows — one per own property, lazy, so a big object costs nothing until you open it. A class with
real state earns its own \`View\`; most others use the default. Live: [the Object demo](/framework/ux/Content/Object/).`);

		md("Full explanation, plus the `AIObject`/`Skill`/`Ask`/`Task` example the owner asked for: [doc/views.md](doc/views.md).");

		md.details(import.meta, "readme.md", "Readme");
	},
});
