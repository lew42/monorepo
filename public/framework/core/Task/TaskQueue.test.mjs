// Node test for TaskQueue.estimate — no DOM, no server. Run: `node TaskQueue.test.mjs`.
import TaskQueue from "./TaskQueue.js";

const landed = [
	{ module: "ai", usd: 1, title: "Fix sessions tab layout bug" },
	{ module: "ai", usd: 2, title: "Sessions tab layout columns" },
	{ module: "ai", usd: 3, title: "Sessions tab layout header" },
	{ module: "ai", usd: 20, title: "Build dictation pipeline rewrite" },
	{ module: "ai", usd: 30, title: "Dictation pipeline benchmark rewrite" },
	{ module: "ai", usd: 40, title: "Whisper dictation pipeline server" },
];
const results = [];
const check = (title, fn) => { let ok; try { ok = !!fn(); } catch (e){ ok = false; console.error(e); } results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} — ${title}`); };

check("different titles get different estimates", () => {
	const a = TaskQueue.estimate(landed, "ai", "Sessions tab layout polish"), b = TaskQueue.estimate(landed, "ai", "Dictation pipeline cleanup");
	return a.usd === 2 && b.usd === 30 && a.basis.startsWith("median of 3 similar landed tasks:");
});
check("fewer than 3 similar falls back to the module median", () => {
	const e = TaskQueue.estimate(landed, "ai", "Sessions header thing");
	const f = TaskQueue.estimate(landed, "ai", "Totally different thing");
	return e.usd === 11.5 && e.basis === "median of 6 landed ai tasks" && f.usd === 11.5;
});
check("other module with no similar falls back to all landed", () => {
	const e = TaskQueue.estimate(landed, "ext/x", "Nothing alike");
	return e.basis.startsWith("median of 6 landed tasks") && e.usd === 11.5;
});
check("no landed tasks gives the fixed fallback", () => TaskQueue.estimate([], "ai", "Anything at all").usd === TaskQueue.FALLBACK_USD);

console.log(results.every(Boolean) ? "ALL PASS" : "FAILED");
process.exit(results.every(Boolean) ? 0 : 1);
