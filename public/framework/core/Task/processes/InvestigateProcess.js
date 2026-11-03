// The "investigate" process template: questions, scout, synthesize: findings, nothing built.
// A step: id, title, `do` (the job), `session` ({run: fresh | same | owner | wait, role, model, effort}). A step id never names a Task verb or field (`improve` would call improve()).
import Process from "../Process.js";

const SONNET = "claude-sonnet-5-5", HAIKU = "claude-haiku-5-5";

export class InvestigateProcess extends Process {
	static template = "investigate";
	static steps = [
	{ id: "questions", title: "Questions", session: { run: "fresh", role: "helper", model: SONNET, effort: "low" },
		do: "Write questions.md beside the brief: the questions it raises, ranked by how much each answer changes the work; for each, what is already known (with the file) and how to find out. Name the known structure as class sketches." },
	{ id: "scout", title: "Scout", session: { run: "fresh", role: "helper", model: HAIKU, effort: "low" },
		do: "Answer the top three questions in questions.md: in the repo (readmes, grep) and, for questions about the world outside, on the web (WebSearch, WebFetch). Keep each read small and stay under 100k tokens. Append each answer to questions.md with its sources." },
	{ id: "synthesize", title: "Synthesize", session: { run: "fresh", role: "helper", model: SONNET, effort: "low" },
		do: "Write findings.md: each question with its answer, marked 'checked in code', 'two sources agree' or 'guess'. Never a made-up confidence number." },
	];
}

export default InvestigateProcess;
