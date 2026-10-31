// The lab's fake outside world, the only fake part: an agent spawner and an AI, each counting its calls.
// A page or a test asks "what happened?" with mark() before and since(mark) after. Doc: readme.md.
export default class LabWorld {

	static PRICE = 0.03;   // dollars per fake AI call
	static SUMMARIES = [
		"Ship the sync fix first, then the snapshot work; hiring waits until January.",
		"Three risks: the socket drop, the log size, and the October deadline.",
		"The team agreed to move search to SQLite and keep the item core.",
		"Most of the meeting was about naming; the one decision was snake_case.",
		"Budget is fine; the open question is who owns the dev server.",
	];

	agents = 0;
	ai_calls = 0;

	spawn_agent(){ return "agent-" + ++this.agents; }
	ask_ai(){ return LabWorld.SUMMARIES[this.ai_calls++ % LabWorld.SUMMARIES.length]; }

	mark(){ return { agents: this.agents, ai_calls: this.ai_calls }; }
	// What happened since mark(): agents spawned, AI calls and their cost in dollars.
	since(mark){
		const ai = this.ai_calls - mark.ai_calls;
		return { agents: this.agents - mark.agents, ai, cost: Math.round(ai * LabWorld.PRICE * 100) / 100 };
	}

	static shared = new LabWorld();   // the one world the lab classes use unless a test swaps its own
}
