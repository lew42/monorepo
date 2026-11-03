/* An Item's life cycle, for its class page (ext/Doc/ClassDoc.js draws it as one picture): who makes or changes
   one, the hops a change takes to its file, and the way back to every other tab. The source of truth, with the
   file and line of every hop: core/Session/tasks/data-shapes/seats/delta-flow/delta-flow.md.
   A subclass page (List) passes its own `who` and keeps the path. */
export default {
	who: [
		{ icon: "code", name: "Code", code: `new Box({ title })`, says: "builds it; writes nothing" },
		{ icon: "touch_app", name: "A click", code: `item.set({ title })`, says: "changes a field" },
		{ icon: "smart_toy", name: "An agent", code: `item({ path, delta })`, says: "Servex's item tool" },
		{ icon: "history", name: "A replay", code: `root.set(line)`, says: "a fresh load, one line at a time" },
	],
	path: [
		{ icon: "north", name: "Climbs parent", code: `emit("delta")`, says: "from the item that changed, up to the root", src: "core/Events/Events.js" },
		{ icon: "data_object", name: "One line", code: `{"items":{"milk":{"set":{"count":2}}}}`, says: "the root's Store nests it, one hop per level, each naming its list", src: "core/Item/Store.js" },
		{ icon: "description", name: "The file", code: `session.jsonl · page.jsonl`, says: "appended by Servex or the dev socket", src: "Server/plugins/SocketServer/Append.js" },
		{ icon: "podcasts", name: "Tailed", code: `jsonl frame`, says: "the dev server sends the new bytes to every tab", src: "Server/plugins/SocketServer/Tail.js" },
		{ icon: "devices", name: "Every other tab", code: `root.set(line)`, says: "the same set(), walking the same hops down", src: "core/Item/Store.js" },
	],
};
