import { div, span, p, button, textarea } from "../../core/View/View.js";
import Socket from "/framework/dev/Socket/Socket.js";
import md from "../markdown/md.js";
import { ask, available } from "./Ask.js";
import Dictate from "../../ux/Dictate/Dictate.js";

/**
 * Reply to ONE thing, where it already is.
 *
 * Every item of the hierarchy — an ask card, a decision row, a task card — can
 * carry this control: two small buttons, **reply** and **🎤**, that open a
 * one-line box under that item. What you type or say goes to Claude with the
 * item already explained, so you never have to say which one you mean, and the
 * answer lands under the same item a few seconds later.
 *
 *     import { reply } from "/framework/ext/Ask/reply.js";
 *     reply({ m, about: { kind: "ask", id: ask.id, summary: ask.summary, quote: ask.quote } });
 *
 * `m` is the task's own manifest (an `ext/JSONL` `TaskJSONL`) — the thread is
 * read out of `m.chats` and written back into `m.url`, so the record is the
 * task's own log and there is no second store. `about` is the item: its `kind`
 * and `id` are what the thread is filed under, everything else is what the turn
 * is told about it.
 *
 * Off the dev server the buttons are not drawn at all and the thread renders
 * read-only — the same rule `ext/AITask`'s Approve and Improve already follow.
 *
 * See `readme.md` (Use) and `doc/decisions.md` (the record, the cost, the tools).
 */
export function reply(opts){ return new Reply(opts).view(); }

/** The dictation box: one box at the top of a wall that turns talking into asks. */
export function dictate(opts){ return new Reply.Dictation(opts).view(); }

/* How long the wire gets to take an append. `ext/AITask`'s decisions tab waits
   the same 2s for the same reason: /imagine/stream/ measures the real round trip
   at 9ms, and this is the net for a dev server that is up enough to accept an
   append and not to stream it. */
const WIRE = 2000;

/** Every thread on the page right now, so a streamed line can redraw them. */
const open_threads = new Set();

/**
 * Redraw every reply thread on the page — call it when the task's log has
 * streamed a new line. `ext/AITask`'s `streamed()` does, so a reply sent in one
 * tab appears in every other tab on that task without a reload.
 */
export function streamed(){
	for (const item of open_threads)
		item.$thread.el.isConnected ? item.draw() : open_threads.delete(item);
}

/**
 * An ISO timestamp carrying the reader's own offset, so a line says when it was
 * written where it was written — `toISOString()` would silently move it to UTC.
 * ⚠ A copy of `ext/AITask/rank.js`'s, on purpose: imports flow DOWN, and
 *   `ext/AITask` imports `ext/Ask`, so `ext/Ask` may never import back.
 */
export function stamp(){
	const now = new Date();
	const off = -now.getTimezoneOffset();
	const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
		+ "T" + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds())
		+ (off < 0 ? "-" : "+") + pad(off / 60) + ":" + pad(off % 60);
}

/** Whole lines into a task's own log, through the dev socket. True when it took them. */
export async function append(url, lines){
	const answer = await Promise.race([
		Socket.singleton().async_rpc("append", url, [lines].flat().map(l => JSON.stringify(l))),
		new Promise(done => setTimeout(done, WIRE, null)),
	]);

	if (answer?.response === "append successful") return true;
	console.error("Ask/reply: the dev server refused the append — restart it (rpc:append landed 2026-08-31)", answer);
	return false;
}

/* What the turn is asked to be. It is not a chat partner: the owner is looking
   at the item right now, so the answer is four sentences, and anything they
   ASKED for becomes lines in the log that show up on the tab within seconds. */
const MINION = `You are this item's own minion inside the web UI. The owner is looking at the item right now and your answer appears under it within seconds.

Answer their words in at most four plain sentences. No preamble, no restating the question.

Then, only if their words asked for something — a new piece of work, a choice to record, anything the next session must know — end your answer with ONE fenced block labelled jsonl, one JSON object per line, each carrying exactly one of these three verbs:

\`\`\`jsonl
{"ask": {"id": "kebab-case-id", "summary": "one line", "quote": "their sentence, verbatim", "topic": "the item's topic", "status": "open"}}
{"decision": {"id": "kebab-case-id", "about": "the question in one line", "options": [{"id": "a", "say": "one option"}, {"id": "b", "say": "the other"}], "chose": "a", "because": "why"}}
{"log": {"msg": "reply handled: one line the mastermind reads at its next wake"}}
\`\`\`

Rules for that block: ids are kebab-case, and reusing an existing id AMENDS that item rather than adding a second one — every verb merges by id. Leave out \`at\`; the browser stamps every line. Nothing outside those three verbs. Always include the \`log\` line. Leave the whole block out when their words asked for nothing.`;

export class Reply {

	label = "reply";

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	view(){
		return div.c("ask-reply", $reply => {
			this.$reply = $reply;
			/* ⚠ The ask card's WHOLE body is a click target (it opens the detail
			   sheet) and a task card's title spreads a link over its whole row —
			   so a press in here must stop before it reaches either. */
			$reply.on("click", e => e.stopPropagation());

			// The record, then whatever is in flight, then the controls — a
			// conversation, with the place you write at the bottom of it.
			this.thread();
			this.$pending = div.c("ask-pending");
			if (!available()) return;
			this.acts();
			this.box();
		});
	}

	/* The record, newest last, read straight out of the task's log. Filed under
	   the item, so an ask card shows only the replies made to that ask. */
	thread(){
		const item = { $thread: this.$thread = div.c("ask-thread"), draw: () => this.draw() };
		open_threads.add(item);
		this.draw();
	}

	mine(){
		return (this.m?.chats ?? []).filter(c =>
			c.about?.id === this.about.id && c.about?.kind === this.about.kind
			// The line for the question being asked RIGHT NOW is already on screen
			// in `$pending`; drawing it from the log too would double it.
			&& c.id !== this.pending_id);
	}

	draw(){
		const said = this.mine();
		this.$thread.empty(() => said.forEach(c => this.turn(this.$thread, c.role, () => md(c.text ?? ""), c.cost_usd)));
		this.$thread.el.hidden = !said.length;
	}

	/* One bubble — `chat.js`'s bubble, wearing `chat.js`'s classes, because a
	   reply is the same thing said in a smaller box. `ask.css` sizes it down
	   where it lands; nothing here is a second look to keep in step.
	   ⚠ Built inside `append(fn)` on purpose — the callback re-establishes the
	     captor, so a bubble raised from a click handler still lands in the thread
	     instead of wherever the page happens to be rendering. */
	turn($where, role, body, cost){
		let $body;
		$where.append(() => { div.c("chat-turn chat-" + role, () => {
			span.c("chat-role muted", role === "user" ? "you" : "Claude");
			$body = div.c("chat-body", body);
			if (cost != null) span.c("chat-cost muted", "$" + cost.toFixed(3));
		}); });
		return $body;
	}

	/* The two buttons. The microphone opens the same box the reply button does
	   and starts listening in one press — talking is the whole point of it.
	   ⚠ Built on `ux/Dictate` since 2026-09-19 (was `ext/Ask/mic.js`'s `Mic`
	   directly) — it draws its OWN "no engine reachable" note when neither
	   whisper nor the browser can hear, so this no longer needs the old
	   `!$mic` fallback branch. */
	acts(){
		div.c("ask-reply-acts flex v-center wrap", () => {
			button.c("ask-reply-btn", this.label).attr("type", "button")
				.attr("title", "reply to this " + this.about.kind + ", with Claude already knowing which one")
				.on("click", () => this.open());

			new Dictate({ $input: () => this.$input, on_start: () => this.open(), on_error: e => this.say(e) });

			// One line saying what the control is for, where a bare verb would not.
			if (this.hint) span.c("ask-reply-hint muted", this.hint);
		});
	}

	box(){
		this.$box = div.c("ask-reply-box flow", () => {
			this.$input = textarea.c("ask-reply-input").attr("rows", this.rows ?? "2")
				.attr("placeholder", this.placeholder ?? "reply — Claude already knows which one this is");

			div.c("ask-reply-foot flex v-center wrap", () => {
				button.c("ask-reply-send prim", "Send").attr("type", "button").on("click", () => this.send());
				this.$say = span.c("ask-reply-say muted");
			});

			// Escape closes the box and NOTHING else — it must never reach the card.
			this.$input.on("keydown", e => {
				if (e.key === "Escape"){ e.stopPropagation(); this.close(); }
				if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) this.send();
			});
		});

		this.$box.el.hidden = true;
	}

	/* ⚠ No `scrollIntoView` here. The owner pressed a button they were already
	     looking at; moving the page under them is the one thing a control like
	     this must not do. */
	open(focus = true){
		this.$box.el.hidden = false;
		if (focus) this.$input.el.focus();
	}

	close(){
		this.$box.el.hidden = true;
		this.say("");
	}

	say(text){ this.$say?.text(text); }

	async send(){
		const text = this.$input.el.value.trim();
		if (!text || this.sending) return;

		this.sending = true;
		this.$input.el.value = "";
		this.say("");

		this.turn(this.$pending, "user", () => md(text));
		const $answer = this.turn(this.$pending, "assistant", () => span.c("chat-wait muted", "thinking…"));

		try {
			/* ⚠ THE QUESTION IS FILED BEFORE THE TURN RUNS, in its own append.
			   A turn takes seconds, and in this repo any agent creating a task dir
			   reloads every open tab — which is exactly what happened to the first
			   proof run of this control (2026-09-18). The turn survives that (it is
			   its own process) but the browser is the writer, so a reply filed only
			   at the end is lost with the page. Losing the answer costs one cheap
			   turn; losing what the owner just dictated costs the thing they said. */
			const said = await this.asked(text);
			const answer = await this.turn_it(text, $answer);
			await this.record(answer, said);
			// The lines come back off the wire and `draw()` rebuilds the thread from
			// the log — so the bubbles held here go, and never double.
			this.pending_id = null;
			this.$pending.empty();
			this.draw();
		} catch (e){
			$answer.empty(() => p.c("chat-error", e.message));
		}

		this.sending = false;
	}

	/** The owner's words, filed on their own, the instant Send is pressed. */
	async asked(text){
		const said = { id: crypto.randomUUID(), at: stamp(), role: "user", text,
			about: { kind: this.about.kind, id: this.about.id } };

		this.pending_id = said.id;
		if (!await append(this.m.url, [{ chat: said }])) throw new Error("The dev server refused to file this reply.");
		return said;
	}

	/**
	 * The turn, and the session it runs in.
	 *
	 * A reply thread resumes ITS OWN session (`chat_session_id`) and, by default,
	 * starts that session fresh rather than forking the task's. The prompt below
	 * already says everything about the item, so a fresh turn answers just as
	 * well — and a fork of a session that has been running all day is both
	 * expensive and, past the model's context, impossible: one measured $0.18 and
	 * came back with the four words "Prompt is too long" (2026-09-18).
	 * `fork: true` opts back in when the task's own history really is wanted;
	 * `recover()` below catches it when that turns out to be too much.
	 */
	async turn_it(text, $answer){
		const prompt = this.prompt(text);
		const session = this.m?.chat_session_id ? { resume: this.m.chat_session_id }
			: this.fork ? { from: this.m?.session_id } : {};

		const r = await this.once(prompt, $answer, session);
		if (!failed(r.text) || !Object.keys(session).length) return r;

		/* The session it tried to continue is too big for this model. Say so where
		   the answer goes, and ask again with no session at all — the prompt is
		   self-contained, so the answer is the same one. Every later reply resumes
		   the fresh session, because `record()` writes ITS id over the dead one. */
		$answer.empty(() => span.c("chat-wait muted", "that session is too big for this model — starting a fresh one…"));
		return this.once(prompt, $answer, {});
	}

	/* One turn, streaming into the bubble as it arrives. `context` is a STRING on
	   purpose: the server slices it into `--append-system-prompt`, and an object
	   would arrive there as "[object Object]". The item itself rides in the
	   PROMPT, where there is no length limit — the same split `pick.js` makes. */
	async once(prompt, $answer, session){
		let streamed = "";

		const r = await ask(prompt, { ...session, model: this.model, tools: this.tools,
			context: this.line(),
			on: e => { streamed += e.text ?? (e.tool ? `\`${e.tool}\`… ` : ""); $answer.empty(() => md(streamed)); },
		});

		if (r.error) throw new Error(r.error);
		return r;
	}

	/** The one-line version, for the system prompt and for the chip. */
	line(){
		return `the ${this.about.kind} \`${this.about.id}\` on ${this.m?.url ?? "this task"}`;
	}

	/** The plain sentences the turn opens with, then their words, then the job. */
	prompt(text){
		const a = this.about;
		const lines = [`The owner is replying to ${a.kind} \`${a.id ?? "(unnamed)"}\``
			+ (a.summary || a.about ? `: ${a.summary ?? a.about}` : "") + "."];

		if (a.quote) lines.push(`They first asked for it like this: "${a.quote}"`);
		if (a.status) lines.push(`Its status right now is \`${a.status}\`.`);
		if (a.tasks?.length) lines.push(`The tasks serving it are: ${a.tasks.join(", ")}.`);
		if (a.options?.length) lines.push(`The options weighed were ${a.options.map(o => o.say ?? o.id).join("; ")}`
			+ (a.chose ? ` — \`${a.chose}\` was chosen.` : "."));
		if (this.m?.url) lines.push(`It lives in this task's log, ${this.m.url}.`);

		lines.push(`Their words, verbatim:\n\n"${text}"`, MINION);
		return lines.join("\n\n");
	}

	/**
	 * The exchange, and whatever the turn asked for, into the task's own log.
	 *
	 * ⚠ The turn was NOT given a `task`, so `Server/plugins/Ask.js` records
	 *   nothing — the browser writes the `chat` lines itself, because only the
	 *   browser knows which item they belong to (`about`). Two writers for one
	 *   exchange would file it twice.
	 *
	 * `said` is the question's own line, already filed by `asked()` — this is the
	 * answer, and whatever the turn asked to be written alongside it.
	 */
	async record(r, said){
		const at = stamp();
		const { answer, lines } = harvest(r.text ?? "", at, this.about);

		const all = [
			{ chat: { id: crypto.randomUUID(), at, role: "assistant", text: answer,
				cost_usd: r.cost_usd, about: said.about } },
			...this.written(lines, said.id),
		];

		/* The id of the session that actually ANSWERED — which every later reply
		   resumes (doc/fork.md). `assign` replaces the field, so a session that has
		   since grown too big to continue is corrected by the next reply rather
		   than failing forever. */
		if (r.session_id && r.session_id !== this.m?.chat_session_id && !failed(r.text))
			all.unshift({ assign: { chat_session_id: r.session_id } });

		if (!await append(this.m.url, all)) throw new Error("The dev server refused to file this reply.");
		this.say(report(lines, r));
	}

	/** What the turn asked to be written. Subclasses shape it; this one takes it as is. */
	written(lines){ return lines; }
}

/* On the PROTOTYPE, not class fields, so one line in a page changes the default
   for every reply control on it — the same move `Picker.prototype.skip` makes.
   A class field is an own property and an instance would carry its own copy.

   `model`: sonnet, because a reply is usually a request to act on and haiku
   writes a weaker `ask` line. `tools`: none, and that IS the scoping, not the
   absence of it — the turn never touches a file, it answers, and the BROWSER
   writes its lines through `rpc:append`, which can only ever reach a `.jsonl`
   under `public/`. A turn holding Bash or Edit would have the run of the repo to
   do the same job. doc/decisions.md. */
Reply.prototype.model = "sonnet";
Reply.prototype.tools = "";
/* `fork`: whether the reply thread INHERITS the task's own session. Off, because
   the prompt already says everything about the item and a day-long session is
   both dear and, past the model's context, unusable — see `turn_it()`. */
Reply.prototype.fork = false;

/* ── the answer, split from the lines it asked for ─────────────────────────── */

/**
 * A turn answers in prose and may end with one fenced `jsonl` block. The prose is
 * what the owner reads; the block is what the log gets. ⚠ The block is stripped
 * out of the answer — raw jsonl under a card is not something anybody reads, and
 * the lines are about to appear on the tab as cards and rows anyway.
 */
export function harvest(text, at, about){
	const block = text.match(/```(?:jsonl|json)?\s*\n([\s\S]*?)```/);
	const answer = (block ? text.replace(block[0], "") : text).trim();

	const lines = (block?.[1] ?? "").split("\n").map(s => s.trim()).filter(Boolean)
		.map(s => { try { return JSON.parse(s); } catch { return null; } })
		.filter(l => l && VERBS.some(v => l[v]))
		.map(l => { VERBS.forEach(v => l[v] && (l[v].at ??= at)); return l; });

	/* The mastermind reads `log` lines at its next wake, so a reply that left no
	   trace there is a reply it never hears about. If the turn didn't write one,
	   the browser writes it from the answer's own first line. */
	if (!lines.some(l => l.log)) lines.push({ log: { at,
		msg: `reply handled: ${about.kind} ${about.id} — ${first_line(answer)}` } });

	return { answer, lines };
}

const VERBS = ["ask", "decision", "log"];

/* The CLI answers a FAILED turn the same way it answers a good one: a `result`
   event whose text is its own one-line complaint, with a real cost attached. The
   dev server hands the browser that text and not the error flag, so the handful
   of complaints worth recovering from are matched by name. The list is short on
   purpose — a miss costs nothing worse than the answer it already was. */
const CLI_FAILED = /^(prompt is too long|credit balance|api error|execution error|invalid api key)/i;
const failed = text => CLI_FAILED.test(String(text ?? "").trim());
const first_line = s => (String(s).trim().split("\n")[0] || "no answer").slice(0, 180);

/* What the send line says once it is done: the money, the seconds, and — the part
   the owner actually wants — how many things were written and appeared on the tab. */
function report(lines, r){
	const wrote = lines.filter(l => !l.log).length;
	return `$${(r.cost_usd ?? 0).toFixed(3)} · ${Math.round((r.duration_ms ?? 0) / 1000)}s`
		+ (wrote ? ` · wrote ${wrote} line${wrote === 1 ? "" : "s"}` : "");
}

/* ── dictation: talking, turned into asks ──────────────────────────────────── */

/**
 * The same machine with a different job: one box at the top of a wall, where the
 * owner talks through what they want and each sentence comes back as its own
 * `ask` card, live. The turn's whole instruction is "split this into asks".
 *
 * ⚠ Attached as a static, so it travels with the class and a subclass can
 *   replace just this branch (`code` §3).
 */
Reply.Dictation = class Dictation extends Reply {

	label = "dictate";
	hint = "talk or type — each thing you name becomes its own ask card";
	rows = "3";
	placeholder = "say or type what you want — each thing you name becomes its own ask card";

	/* Dictation is not filed under one item — it is about the whole wall — so the
	   thread under the box is every dictation made on this task. */
	line(){ return `the ${this.about.kind} box on ${this.m?.url ?? "this task"}`; }

	/* ⚠ ONLY THE LAST EXCHANGE. This box sits at the top of the Asks tab, and its
	   thread grows downward into the wall: after two dictations the cards started
	   below the fold (measured 2026-09-18). It is a control, not a conversation —
	   the receipt for the last thing said is all it owes, and the real record of
	   every dictation is the ask cards on the wall underneath it. */
	mine(){ return super.mine().slice(-2); }

	prompt(text){
		return [
			`The owner is dictating into the Asks tab of ${this.m?.url ?? "a task"}. They are saying out loud what they want done; nothing here is a question to answer.`,
			"Split what they said into separate asks — one per thing they actually want, never one per sentence, and never an ask for a thing they only mentioned in passing.",
			"Reply with ONE plain sentence saying how many asks you made and what they are. Then one fenced block labelled jsonl, one `ask` line per ask:",
			"```jsonl\n" + '{"ask": {"id": "kebab-case-id", "summary": "one line, in their own words", "quote": "the sentence they said it in, verbatim", "topic": "a short topic they would recognise", "status": "open"}}' + "\n```",
			"Every ask needs all five fields. `quote` is copied, never paraphrased. Ids are kebab-case and unique. End the block with one `log` line: {\"log\": {\"msg\": \"dictation: <n> asks opened — <one line>\"}}",
			`What they said, verbatim:\n\n"${text}"`,
		].join("\n\n");
	}

	/* Each new ask is linked back to the sentence it came from: `prompt` is the id
	   of the `chat` line this dictation was filed as, which the Asks tab's "the
	   prompt" pill opens. */
	written(lines, chat_id){
		lines.forEach(l => l.ask && (l.ask.prompt ??= chat_id));
		return lines;
	}
};

/* A split is mechanical work, not judgement: every `quote` is copied verbatim, so
   there is nothing to weigh. haiku does it for about a fifth of the money — and
   on its own prototype, so it stays haiku when a page retunes `Reply`'s. */
Reply.Dictation.prototype.model = "haiku";

export default reply;
