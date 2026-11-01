import Box from "../Item/watch/Box.js";

/* List's methods for its class page (ext/Doc/ClassDoc.js): each one's job in one line, and a tiny example whose
   body the page shows as code and whose result it draws live. The four verbs that write a line come first. */
const shop = () => { const s = new Box({ id: "shop" }); ["milk", "bread", "eggs"].forEach(id => s.items.add({ id })); return s; };

export default {
	add: { job: "Put a member in, after the one you name (else last). Writes one line.",
		example(){ const s = shop(); s.items.add({ id: "tea" }, { after: "milk" }); return s.items; } },
	remove: { job: "Take a member out by its id. Writes one line.",
		example(){ const s = shop(); s.items.remove("bread"); return s.items; } },
	move: { job: "Move a member after another (null: first), or into this list from another. Writes one line.",
		example(){ const s = shop(); s.items.move("eggs", { after: null }); return s.items; } },
	order: { job: "Put every member in the order of these ids. Writes one line.",
		example(){ const s = shop(); s.items.order(["eggs", "milk", "bread"]); return s.items; } },
	find: { job: "A member by its id, or undefined.",
		example(){ return shop().items.find("bread"); } },
	at: { job: "A member by position; -1 is the last.",
		example(){ return shop().items.at(-1); } },
	forEach: { job: "Call a function on each member, in order.",
		example(){ const ids = []; shop().items.forEach(x => ids.push(x.id)); return ids; } },
	map: { job: "A plain array of what a function returns for each member.",
		example(){ return shop().items.map(x => x.id.toUpperCase()); } },
	insert: { job: "Put a member in quietly, with no line: for loading, not for changes.",
		example(){ const s = shop(); s.items.insert(new Box({ id: "jam" })); return s.items; } },
	toJSON: { job: "The saved shape: a bare array of the members' own shapes.",
		example(){ return shop().items.toJSON(); } },
};
