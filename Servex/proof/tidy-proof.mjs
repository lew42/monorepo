import { tidy } from "../agents/tidy.js";

/* Proof for Servex/agents/tidy.js — three real-model samples (typos, fillers,
 * a question mark seam, and one that should come back unchanged except
 * punctuation/capitals), then one offline run with a fake `run_query` so
 * this is testable without a model call. Run: `node Servex/proof/tidy-proof.mjs`. */

const samples = [
	"so um i was thinking we should uh we should build the the playground you know",
	"what do you think? about the the layout",
	"the car is red and the door is blue"
];

for (const text of samples){
	const out = await tidy({ text });
	console.log("input: ", text);
	console.log("output:", out.text, `(${out.ms}ms, ${out.model})`);
	console.log();
}

/* Offline: a fake run_query, no real model call, so this proof (and a future
 * test) can run without spending anything or needing network. */
const fake_run_query = async function* ({ prompt }){
	yield { type: "result", result: "Fake cleaned reply." };
};
const offline = await tidy({ text: "some raw text" }, { run_query: fake_run_query });
console.log("offline (fake run_query):", offline);
