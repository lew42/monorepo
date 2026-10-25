// A question the owner asked, as a Task: open (asked) -> answered (has an `answer`) -> complete (the owner has read the answer).
// "Answered but not complete" is one query: `{unread: {}}` on a session (Task.unread). It nests under the Prompt it came from, or sits in the
// session's own list with `from` naming that Prompt; either way Prompt.trace finds it.
import Task from "./Task.js";
import Item from "../Item/Item.js";

export class Question extends Task {

	static line_fields = ["text", "from", "answer", "working"];
	static queries = [...Task.queries, "phase"];

	get text(){ return this.get_one("text") ?? this.get_one("title") ?? null; }
	/** {text, by, at}: what the answering assistant said; written once or replaced, never required to be long. */
	get answer(){ return this.get_one("answer") ?? null; }
	/** "open" | "answered" | "complete": computed on read from the answer and the state, never stored. */
	get phase(){ return this.state === "complete" ? "complete" : this.answer ? "answered" : "open"; }
	/** The smart seat's "seen it, writing" sign: `{by, at}` while it writes the answer, else null (`{working: null}` clears it). */
	get working(){ return this.get_one("working") ?? null; }

	/* Reading the answer is the evidence, so an answered Question completes with a bare {complete: {}}; an unanswered one needs the
	   usual evidence (an owner who drops a question writes why). `node` is the Question itself (the item tool passes it). */
	static completion_problem(args, node){
		if (node?.answer) return null;
		return Task.completion_problem(args) && `${Task.completion_problem(args)} (this Question has no answer yet; once it has one, {complete:{}} is enough)`;
	}
	complete(args){
		return super.complete({ auto: !!this.answer, ...(args && typeof args === "object" ? args : {}) });
	}
}

export default Question;

Item.register(Question, "Question");
