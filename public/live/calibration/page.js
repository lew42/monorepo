import { Page, View, div, h2, h3, p, span, ul, li, a, details, summary, b } from "/app.js";

View.stylesheet(import.meta, "calibration.css");

/* /live/calibration/: the first prompt-refinement test (2026-11-07). Four of the owner's prompts from the cloud chat, each refined by
 * Sonnet and by Haiku on the same instructions. This page reads the real files (inputs/*.txt, outputs/<model>-<n>.json) and draws them;
 * the verdicts are the judge's (results.md). Nothing here is typed by hand except those four verdict lines. */
const RUN = "/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/calibration/";
const SESSION = "/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/";
const TURNS = 162; // owner turns in the cloud transcript 8849dcc6 (node Server/ClaudeCodeTranscript.mjs <file> --json, 2026-11-09)
const PROMPTS = [
	{ n: 27, about: "why sessions don't complete", verdict: "Both models placed every sentence under existing tasks (close-with-proof, past-work-audit). Nothing missing." },
	{ n: 95, about: "page storage, loading and indexing", verdict: "Sonnet found 4 asks that cover every sentence; Haiku split them finer. No task holds page storage, parent loading or the page index yet." },
	{ n: 114, about: "\"your agents broke my page\"", verdict: "Only Sonnet split out the page error itself (\"P is not a function\"). The worktree rule is already in agents.md, so 0% overstates the gap." },
	{ n: 116, about: "autonomy, the live page, page settings", verdict: "Sonnet grouped 89 sentences into 9 asks against Haiku's 15. No task holds the page settings screen, breadcrumbs or plan-first." },
];
const MODELS = ["sonnet", "haiku"];

// The input file: "PROMPT #n (…)" then "[k] sentence" lines, then CONTEXT and TASKS ALREADY FILED ("- id [state]: title").
const parse = txt => {
	const [head] = txt.split(/^CONTEXT /m), tasks = new Map();
	const sentences = [...head.matchAll(/^\[(\d+)\] (.*)$/gm)].map(m => ({ k: +m[1], text: m[2] }));
	for (const m of txt.matchAll(/^- ([\w-]+) \[(\w+)\]: (.*)$/gm)) tasks.set(m[1], { state: m[2], title: m[3].split(" — ")[0] });
	return { sentences, tasks };
};
const get = (url, as) => fetch(url).then(r => r.ok ? r[as]() : Promise.reject(new Error(`${url}: ${r.status}`)));

export default new Page({
	meta: import.meta,
	title: "Prompt calibration",
	description: "Four of your cloud-chat prompts, refined by Sonnet and by Haiku: what went in, what came out, which won.",
	icon: "tune",

	content(){
		const $out = div.c("calib wide");
		$out.empty(() => p("Loading the four prompts…"));
		Promise.all(PROMPTS.map(x => Promise.all([get(`${RUN}inputs/p${x.n}.txt`, "text"), ...MODELS.map(m => get(`${RUN}outputs/${m}-${x.n}.json`, "json"))])
			.then(([txt, ...outs]) => ({ ...x, ...parse(txt), outs: Object.fromEntries(MODELS.map((m, i) => [m, outs[i]])) }))))
			.then(rows => $out.empty(() => draw(rows)), e => $out.empty(() => p(`Could not load the run's files: ${e.message}`)));
	},
});

function draw(rows){
	p(() => {
		span("Four of your prompts from the ");
		a("cloud chat's session record").attr("href", SESSION);
		span(", refined by Sonnet and by Haiku. Sonnet won. ");
		a("results.md").attr("href", RUN + "results.md");
		span(".");
	});
	for (const r of rows) prompt(r);
	p.c("calib-foot", `Only 4 of the chat's ${TURNS} prompts were checked: this was a model test. The full review is the retro run, after the one refiner lands.`);
}

function prompt(r){
	div.c("calib-prompt", () => {
		h2(`Prompt #${r.n} of ${TURNS}: ${r.about}`);
		p.c("calib-note", "Its place among your turns in that chat, not a task number.");
		const words = r.sentences.map(s => s.text).join(" ");
		if (r.sentences.length > 6) details(() => { summary(`Your words (${r.sentences.length} sentences)`); p.c("calib-words", words); });
		else { h3("Your words"); p.c("calib-words", words); }
		div.c("calib-models", () => { for (const m of MODELS) model(r, m); });
		h3("Verdict");
		p(r.verdict);
	});
}

function model(r, m){
	const out = r.outs[m], res = out.result ?? {}, cov = res.coverage ?? [];
	const matched = [...new Set(cov.map(c => c.task).filter(Boolean))];
	div.c("calib-model", () => {
		h3(m === "sonnet" ? "Sonnet" : "Haiku");
		section("Tasks it matched", matched, id => {
			const t = r.tasks.get(id);
			a(t ? t.title : id).attr("href", SESSION);
			span.c("calib-id", ` ${id}${t ? ", " + t.state : ""}`);
		});
		section("New asks it found", (res.uncovered ?? []).filter(u => u.suggest !== "question"), u => span(`${u.suggest === "note" ? "Note: " : ""}${u.title}`));
		section("Questions", res.questions ?? [], q => span(q.text));
	});
}

function section(title, items, row){
	b.c("calib-label", `${title} (${items.length})`);
	if (items.length) ul(() => { for (const x of items) li(() => row(x)); });
	else p.c("calib-none", "None.");
}
