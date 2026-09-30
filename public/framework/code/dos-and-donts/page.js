import { Page, md, h3 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Dos and don'ts",
	description: "The traps that never throw — nothing here raises an error, so this list is the only thing that catches it — plus the house opinions on formatting and file size.",
	icon: "rule",

	content(){
		md(`**Nothing on this page throws an error.** That's the point: each entry below is a trap that
looks fine, renders fine, and quietly does the wrong thing. The only defence is knowing the list.`);

		h3("Six kinds of trap");
		md(`- **Names that collide with core** — a page method or field named the same as something core already reads (\`render\`, \`text\`, \`card\`, \`icon\`, …) silently replaces core's own behaviour.
- **The ambient captor** — the biggest family here. \`View.captor\` is one global stack; a factory called in the wrong spot builds the right element in the wrong place.
- **Config fields that mean something narrower than they look** — \`icon:\`, \`index: true\`, \`a({ href })\` all have a specific, narrower meaning than they read at a glance.
- **Timing and lifecycle** — async work started during construction, native \`<details>\` toggle loops, link state read before \`pushState\`.
- **Blast radius** — a handful of mistakes that don't just break one page, they blank the WHOLE SITE: import cycles, a stray backtick in \`css()\`, an Edit that leaves a file unparseable mid-write.
- **Layout and CSS that never throw** — \`flex-shrink\`, layer order, a constant that outlived the layout it was tuned for.`);

		md("Full list, one entry per trap, with the incident that taught it: [doc/traps.md](doc/traps.md).");

		h3("Opinions");
		md(`No npm dependency. No black magic. Comments near zero. A file under ~100 lines is a signal
to look, not a rule — 500 lines that belong together are fine. Full text: [doc/opinions.md](doc/opinions.md).`);

		md.details(import.meta, "readme.md", "Readme");
	},
});
