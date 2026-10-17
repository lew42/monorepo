/**
 * class Placement — decides where one cleaned sentence goes: onto the previous paragraph, or
 * into a new one. Runs once per sentence, after the Cleaner (`doc/placement.md`).
 *
 *   const placement = new Placement();
 *   const state = Placement.state();                 // { paragraphs: [[text, …], …] }
 *   await placement.add("The page should show a flag.", state);
 *   // → { action: "new", to: "paragraph", paragraph: 0, confidence: 1, reason: "first sentence" }
 *
 * Each decision says it twice: `action` ("append" | "new") and `to` ("same" | "paragraph"), the same meaning.
 *
 * Rules first, no model: a question starts a new paragraph, a cue word decides, and when
 * nothing decides it is "unsure", which means APPEND to the previous paragraph.
 * `Placement.use_model` (false) would let `this.ask` decide the unsure ones; no caller sets it yet.
 */
export default class Placement {

	/** Off: rules only. On: `this.ask(text, state)` decides the sentences the rules cannot. */
	static use_model = false;

	/** A sentence that starts with one of these begins a new thought. */
	static NEW_CUE = /^(next|another|separately|switching|moving on|on a different|one more thing|the other thing|second thing|new topic)\b/i;

	/** A sentence that starts with one of these carries on the thought before it. */
	static CONTINUE_CUE = /^(and|but|so|because|since|or|also|then|plus|which|that|it|this|they)\b/i;

	/** Empty state: no paragraphs yet. */
	static state(){ return { paragraphs: [] }; }

	/** Model caller, only used when `Placement.use_model` is true: (text, state) => "append" | "new". */
	ask = null;

	/** Rules only: the decision for one sentence, without changing `state`. */
	place(sentence, state){
		const text = Placement.text_of(sentence);
		const last = state.paragraphs.length - 1;
		if (!text) return Placement.decision("append", Math.max(last, 0), 0, "empty");
		if (last < 0) return Placement.decision("new", 0, 1, "first sentence");
		if (/\?\s*$/.test(text)) return Placement.decision("new", last + 1, 0.9, "a question stands alone");
		if (Placement.NEW_CUE.test(text)) return Placement.decision("new", last + 1, 0.8, "new-topic cue word");
		if (Placement.CONTINUE_CUE.test(text)) return Placement.decision("append", last, 0.8, "continuation cue word");
		return Placement.decision("append", last, 0.5, "unsure: previous paragraph");
	}

	/** Decide, then add the sentence to `state`. Returns the decision (store it on the sentence as `placed`). Never throws. */
	async add(sentence, state){
		let decision = this.place(sentence, state);
		try {
			if (decision.reason.startsWith("unsure") && Placement.use_model && this.ask){
				const action = await this.ask(Placement.text_of(sentence), state);
				if (action === "new" || action === "append")
					decision = Placement.decision(action, action === "new" ? state.paragraphs.length : Math.max(state.paragraphs.length - 1, 0), 0.7, "model");
			}
		} catch { /* a model failure keeps the rule's answer: unsure means append */ }
		const text = Placement.text_of(sentence);
		if (text){
			if (decision.action === "new" || !state.paragraphs.length) state.paragraphs.push([text]);
			else state.paragraphs[state.paragraphs.length - 1].push(text);
		}
		return decision;
	}

	/** One decision: `action` is "append" | "new"; `to` says the same thing for the chat bubble: "same" | "paragraph". */
	static decision(action, paragraph, confidence, reason){
		return { action, to: action === "new" ? "paragraph" : "same", paragraph, confidence, reason };
	}

	static text_of(sentence){ return String(typeof sentence === "string" ? sentence : sentence?.text ?? "").trim(); }
}
