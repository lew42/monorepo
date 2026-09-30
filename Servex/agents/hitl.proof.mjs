import { hitl } from "./hitl.js";

/* Proof for Servex/agents/hitl.js — fake `run_query` cases first (good JSON,
 * fenced JSON, garbage, unknown op), so this is testable with no model call
 * and no network, then one real call of each op. Run: `node Servex/agents/hitl.proof.mjs`. */

function fake(reply){
	return async function* (){ yield { type: "result", result: reply }; };
}

// 1. Good JSON, no fence.
const good = await hitl(
	{ op: "marks", sentences: ["The sky is blue.", "Fix it."] },
	{ run_query: fake(`{"marks":[{"i":0,"mark":"ok","purpose":"an observation"},{"i":1,"mark":"unclear","purpose":"a request","question":{"ask":"Fix what?","options":["the bug just discussed","the whole file"]}}]}`) }
);
console.log("1. good JSON:", JSON.stringify(good));

// 2. The same shape wrapped in a ```json fence, as models often do.
const fenced = await hitl(
	{ op: "rename", title: "Untitled card" },
	{ run_query: fake("```json\n" + `{"names":["Sign-up flow","Onboarding step","New user path","Welcome screen","First-run setup"]}` + "\n```") }
);
console.log("2. fenced JSON:", JSON.stringify(fenced));

// 3. Garbage — not JSON at all.
const garbage = await hitl(
	{ op: "marks", sentences: ["hello"] },
	{ run_query: fake("sorry, I can't do that") }
);
console.log("3. garbage reply:", JSON.stringify(garbage));

// 4. Unknown op.
const unknown = await hitl({ op: "translate", text: "hi" }, { run_query: fake("{}") });
console.log("4. unknown op:", JSON.stringify(unknown));

// 5, 6. One real call of each op, no fake run_query — an actual model call.
console.log("\n--- real calls ---\n");

const real_marks = await hitl({
	op: "marks",
	sentences: [
		"So I was thinking we should build the playground next.",
		"Maybe do it, or maybe not, I'm not sure which one is more important.",
	],
});
console.log("5. real marks:", JSON.stringify(real_marks, null, 2));

const real_rename = await hitl({ op: "rename", title: "Untitled card", context: "a task card about renaming chat titles" });
console.log("6. real rename:", JSON.stringify(real_rename, null, 2));
