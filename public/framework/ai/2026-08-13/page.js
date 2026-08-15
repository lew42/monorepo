import { Page, md, AITask } from "/app.js";
import { dashboard, glance } from "/framework/ext/AITask/dashboard.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-13",
	description: "The persistence + list + drag stack: designed by council, built in two waves, proven in a browser.",
	icon: "history",
	// Task dirs with no page.js (log-feed, improve-daily-task-dashboard) stay
	// undeclared: a declared child skips route() and 404s on the page.js probe;
	// the dynamic route below serves them as AITasks.
	children: "persistence panel editor-panels sessions task-previews manifest-vs-log renames",

	// An undeclared task dir still gets a page: the manifest viewer, pointed at it.
	route(name){
		if (!name.includes(".")) return new AITask({
			title: name, icon: "receipt_long",
			url: this.url + name + "/", src: this.url + name + "/session.json",
		});
	},

	// My tile on /framework/ai/: preview_card()'s `thumb` slot, live — task-previews/page.js's bridge.
	preview(nav){ return this.preview_card(nav, () => glance(this)); },

	content(){
		dashboard(this);

		md(`**A design council (three opus seats, forked off a shared library of the
frozen-helix prior art) designed the persistence stack; four workers built it;
the editor acceptance test passed in a real browser the same day.**

What landed — one class each, no numbered progressions:

- [core/Item](/framework/core/Item/) + [core/List](/framework/core/List/) — the
  document tree. 18 assertions render green on the Item page.
- [ext/Saver](/framework/ext/Saver/) — the coalescing write queue; File, Memory
  and LocalStorage backends. Fetch reads, socket-RPC writes, static compatible.
- [ext/Draggable](/framework/ext/Draggable/) — Draggable + Sortable, pointer
  capture with \`elementsFromPoint\`, cancel on \`pointercancel\`/Escape.
- [ext/editor](/framework/ext/editor/) — the drag-and-drop builder prototype:
  palette, canvas, layers, properties, undo, persistence. *Drag a block into a
  nested container, reload — still there. Ctrl+Z undoes a drag.*

The council **executed** the prior art rather than trusting it, and five
confirmed defects drove the rulings — the full record, question by question, is
in [persistence](/framework/ai/2026-08-13/persistence/).

Also: \`server.js\` now wires the socket RPC runtime (\`write\`/\`ls\`/\`rm\`) and the
\`directory.json\` builder; generated artifacts are gitignored.

---

**The afternoon wave: [ext/Panel](/framework/ext/Panel/)** — Blender-style
split/drag/drop panels, persisted through the morning's Item + saver stack,
with a T vocabulary of fifteen live sections and eight 3440-ready experiences.
Brief and exec summary in [panel](/framework/ai/2026-08-13/panel/).`);
	},
});
