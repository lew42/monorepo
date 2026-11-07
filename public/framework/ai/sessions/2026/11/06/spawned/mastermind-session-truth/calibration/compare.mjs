// node compare.mjs: the calibration table (results.md) from outputs/<model>-<prompt>.json. Coverage = ask and context sentences placed under a task.
import fs from "node:fs";
const D = import.meta.dirname + "/outputs/";
const P = (m, n) => { const j = JSON.parse(fs.readFileSync(`${D}${m}-${n}.json`, "utf8")); return { cost: j.usd, r: j.result }; };
const st = r => {
	const c = r.coverage ?? [], k = x => c.filter(y => y.kind === x).length, sub = c.filter(y => y.kind !== "chatter");
	return { sent: c.length, ask: k("ask"), ctx: k("context"), chat: k("chatter"), coverage: sub.length ? +(sub.filter(y => y.task).length / sub.length).toFixed(2) : null, asks: r.asks?.length, primary: r.asks?.filter(a => a.kind === "primary").length, questions: r.questions?.length, suggestions: r.uncovered?.length };
};
const rows = [];
for (const n of [27, 95, 114, 116]) {
	const h = P("haiku", n), s = P("sonnet", n), hm = new Map((h.r.coverage ?? []).map(c => [c.sentence, c.task ?? "-"]));
	const agree = (s.r.coverage ?? []).filter(c => hm.get(c.sentence) === (c.task ?? "-")).length;
	rows.push({ prompt: n, model: "haiku", usd: h.cost, ...st(h.r) }, { prompt: n, model: "sonnet", usd: s.cost, ...st(s.r), same_task_as_haiku: `${agree}/${s.r.coverage.length}` });
}
console.table(rows);
