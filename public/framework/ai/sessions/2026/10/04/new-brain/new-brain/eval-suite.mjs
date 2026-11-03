// Level (a) Questions: Deterministic Framework Facts
export const level_a = [
	{
		id: "a1",
		question: "In the Lew42 framework (core/Item/Item.js), what exact two events does Item.prototype.set_one() emit when a field's value changes?",
		verify: (ans) => {
			const lower = ans.toLowerCase();
			const hasChange = lower.includes('"change"') || lower.includes("'change'") || lower.includes("change");
			const hasDelta = lower.includes('"delta"') || lower.includes("'delta'") || lower.includes("delta");
			return hasChange && hasDelta;
		},
		expected: '"change" and "delta"'
	},
	{
		id: "a2",
		question: "In core/Item/Item.js, what does define_fields() do if a field name collides with an existing property on the Item prototype?",
		verify: (ans) => {
			const lower = ans.toLowerCase();
			return lower.includes("throw") || lower.includes("error");
		},
		expected: "Throws an Error (`field \"${name}\" collides with Item.prototype`)"
	},
	{
		id: "a3",
		question: "In Lew42's CSS architecture (framework.css, CLAUDE.md), what is the exact order of the 4 cascade layers defined in `@layer`?",
		verify: (ans) => {
			const lower = ans.toLowerCase();
			return /base\s+theme\s+site\s+util/.test(lower) || (lower.includes("base") && lower.includes("theme") && lower.includes("site") && lower.includes("util") && lower.indexOf("base") < lower.indexOf("theme") && lower.indexOf("theme") < lower.indexOf("site") && lower.indexOf("site") < lower.indexOf("util"));
		},
		expected: "base theme site util"
	},
	{
		id: "a4",
		question: "In core/Item/Store.js, what does the static method `Store.for(url)` return when called multiple times with the exact same url?",
		verify: (ans) => {
			const lower = ans.toLowerCase();
			return (lower.includes("same") && (lower.includes("instance") || lower.includes("store") || lower.includes("object"))) || lower.includes("singleton") || lower.includes("cached") || lower.includes("map");
		},
		expected: "The same cached Store instance (singleton via Store.instances Map)"
	},
	{
		id: "a5",
		question: "According to CLAUDE.md Traps that never throw, which specific HTML helper tags read backticks, and why is a backtick dangerous inside css(`...`)?",
		verify: (ans) => {
			const lower = ans.toLowerCase();
			const hasTags = lower.includes("p()") || lower.includes("h1") || lower.includes("h6");
			const hasKills = lower.includes("kills every page") || lower.includes("kills") || lower.includes("breaks") || lower.includes("syntax error") || lower.includes("unmatched");
			return hasTags && hasKills;
		},
		expected: "Only p()/h1–h6 read backticks; one backtick inside css(`...`) kills every page."
	}
];

// Level (b) Multi-step reasoning questions
export const level_b = [
	{
		id: "b1",
		question: `Trace through the following code in Lew42 framework step by step:
\`\`\`js
const item = new Item({ a: 1 });
let changes = [];
item.on("change", (key, val, old) => changes.push({ key, val, old }));
item.set({ a: 1, b: 2 });
item.set({ b: 3 });
\`\`\`
1. How many "change" events fire in total?
2. What are the recorded entries in \`changes\` in chronological order?
3. What is item.data at the end?`,
		verify: (ans) => {
			const lower = ans.toLowerCase();
			const has2 = lower.includes("2") || lower.includes("two");
			const hasB2 = lower.includes("b") && (lower.includes("2") || lower.includes("undefined"));
			const hasB3 = lower.includes("3");
			return has2 && hasB2 && hasB3;
		},
		expected: "2 change events. First: key 'b', val 2, old undefined. Second: key 'b', val 3, old 2. 'a' does not fire because old === val. End data: { a: 1, b: 3 }."
	},
	{
		id: "b2",
		question: `In Lew42's core/Item persistence architecture:
Suppose a parent Item 'doc' has an attached Store, and a child Item 'child' is nested inside doc.data.section.
When \`child.set({ title: "Hello" })\` is called:
1. What event is emitted on 'child'?
2. How does the event reach 'doc' and its Store?
3. How does Store compute the line to append to the .jsonl file without using a path string or 'at' key?`,
		verify: (ans) => {
			const lower = ans.toLowerCase();
			const bubbles = lower.includes("delta") || lower.includes("bubble") || lower.includes("parent");
			const nesting = lower.includes("nest") || lower.includes("hops") || lower.includes("key") || lower.includes("object");
			return bubbles && nesting;
		},
		expected: "1. child emits 'delta' ({ set: { title: 'Hello' } }, child). 2. delta bubbles up the parent tree to doc. 3. Store walks hops from host down to source item, constructing nested object delta line."
	},
	{
		id: "b3",
		question: `Consider this bug scenario in Lew42 framework:
A developer defines:
\`\`\`js
class Task extends Item {
  static fields = ["title", "set", "items"];
}
Task.define_fields();
\`\`\`
1. What error will throw and on which field?
2. If "set" is removed, will "items" throw or succeed? Why?`,
		verify: (ans) => {
			const lower = ans.toLowerCase();
			const throwsSet = lower.includes("set") && (lower.includes("collide") || lower.includes("error") || lower.includes("throw"));
			const itemsOk = lower.includes("items") && /succeed|fine|no (error|collision)|won't throw|will not throw|does not throw/.test(lower);
			return throwsSet && itemsOk;   // Item has no `items` (core/Item/readme.md), so "items" succeeds
		},
		expected: "1. 'set' throws because Item.prototype.set is already a core method. 2. 'items' succeeds: Item has no items property or method of its own (lists are named properties a subclass gives itself)."
	}
];

// Level (c) 10 Real Prompts from session-361c4d18 and session-60d9def6
export const level_c = [
	{
		id: "c1",
		source: "session-361c4d18:f910c52c",
		raw: `Where does the task dot, the, or sorry, the task JSONL class and the task tree class, where do those live? Also, if we have a task class in AI slash objects.js, that's an object oriented pattern. And I almost always use a capital file name. Cause like, if you're look, looking for the class of uh, the task class, why would you look in objects.js? You know, it just seems like a, a break of that pattern or convention we, we've been using.`
	},
	{
		id: "c2",
		source: "session-361c4d18:0adde573",
		raw: `All right, so the, the starting the servers should be a node like managed process that can then automatically sh shut itself down when the, when the, the spawned agent kind of sleeps or whatever, then I don't know, figure out the best way to manage that. I don't know if, if an agent wakes back up and needs to use its server again, I don't know if we can have it reawaken or if it just knows to spawn a new one, but obviously we don't want zombie processes, right?`
	},
	{
		id: "c3",
		source: "session-361c4d18:cbc8e3df",
		raw: `All right, so give me an overview. What is queued, in flight, finished? What's our usage looking like? What's our major limitations? Are we still limited on RAM?`
	},
	{
		id: "c4",
		source: "session-361c4d18:9afbfc53",
		raw: `How are we doing on open router minions? And can we, if we have RAM, can we lean into uh, using open router minions to kind of reduce the stress on our uh, Claude Anthropic tokens or usage windows?`
	},
	{
		id: "c5",
		source: "session-361c4d18:4f44ccdf",
		raw: `this message, and the last, are coming from vs code sidebar`
	},
	{
		id: "c6",
		source: "session-361c4d18:1f50814e",
		raw: `Hello? This message, however, is being transcribed on my mobile using the remote control app. Are you able to see the source of these messages and see whether I'm on PC or mobile?`
	},
	{
		id: "c7",
		source: "session-60d9def6:cfc5db58",
		raw: `you're our new vs-code mastermind

can you read the handoff?`
	},
	{
		id: "c8",
		source: "session-60d9def6:ec120b62",
		raw: `Do some thinking about each task and whether it's complete or whether anything's unclear. Uh, just kind of like do a review of each of the things and uh, kind of ask the major questions to see if everything's been covered in terms of major, I don't know, implications or things that we might have missed or don't make sense or might be even completely wrong.`
	},
	{
		id: "c9",
		source: "session-60d9def6:8ab87858",
		raw: `Also, do we have a VS Code mastermind skill? Okay, so the last VS Code Mastermind tab, uh, we were working on a pr prompt refinement system. And, uh, you know, we have this fast assistant and smart assistant system. And the fast assistant's supposed to do the prompt refinement. And we're supposed to work on a bunch of that, but I'm not sure where it's at. Uh, There's a link you can link to. Um, also, I'm wondering, is there, is there any documentation in your system about being a VS Code sidebar? You know, because this VS Code tab is like a separate type of session, and I think it can work with the SDK, but I think there's some limitations to it in terms of, or at least the way we have it set up. In order to get a the prompt refinement working, I was thinking we needed to hook into the, well, so now it's this tab before it was the other tab. I'm not sure how that system works and if it's documented, let me know, know please.`
	},
	{
		id: "c10",
		source: "session-60d9def6:d992d01e",
		raw: `Is is my dev server running? I just tried to access it from my phone phone and I don't know if I had typed, you know, node server.js or if if you have the ability to run the server if it's not running, please do that so that I don't have to stand up and go type it in myself.`
	}
];
