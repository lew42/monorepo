import { spawn } from "child_process";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import stamp from "../stamp.js";
import Assistant from "./Assistant.js";

const now = () => stamp();

/* card_answer {id, answer} — the doorbell for a card that asked the owner a question
 * (`say.mjs --ask`, `.claude/skills/every-prompt/say.mjs`). A SIBLING of Assistant.js
 * rather than a change to it: Assistant.js's own header says "this is a plain module,
 * not a Socket plugin — nothing here listens on the wire directly", and this file is
 * the one thing in this task that DOES need an `rpc:` handler, so keeping it separate
 * keeps that line true and stays the same one-purpose shape as Append.js and Ask.js.
 * It reuses Assistant.board()/.append() rather than re-deriving the board path, since
 * Assistant.js already owns that.
 *
 * WIRED in Server/run.js beside its neighbours:
 *     import CardAnswer from "./plugins/CardAnswer.js";
 *     DevSocket.Socket.use(CardAnswer);
 *
 * Three things happen, in this order, for every answer — see `ai/2026-09-19/
 * card-replies/requirements.md` for the brief this was built from:
 *
 *   (a) the answer lands on the board, appended onto the SAME card id — V3's board
 *       reader merges card lines by id, so the question card GROWS an
 *       answer/answered_at/status instead of a second card appearing beside it.
 *   (b) one `chat` line reaches the mastermind's inbox: the newest unlanded
 *       mastermind run's own task.jsonl (under ai/<date>/mastermind-<slug>), the exact
 *       file say.mjs's own `run()` finds (this file has its own tiny copy of that
 *       search — see `mastermind_run()` below for why it isn't imported from say.mjs).
 *   (c) the RING: one tiny headless `claude -p` turn, given ONLY the `SendMessage`
 *       tool, told to send the target session (`ask_to` — written onto the question
 *       card by `say.mjs --ask` at the moment it asked) one line naming the card and
 *       the answer.
 *
 * (a) and (b) happen synchronously and the rpc ACKs before the ring is even started —
 * the ring can take several seconds and nothing about it belongs in a button click's
 * own round trip. A failed ring is logged and NEVER thrown back at the browser as an
 * error on this request; a `card_rung` push tells whichever tab is listening how the
 * ring actually went, for a page that wants to show that timing.
 *
 * ⚠ Env overrides — the SAME two names Assistant.js already reads, so a private test
 * server's card_answer never touches the owner's real board or the real mastermind's
 * real inbox:
 *   ASSISTANT_BOARD    the board.jsonl (a) appends to — Assistant.board().
 *   ASSISTANT_LEDGER   when set, (b) appends directly here instead of searching for a
 *                       real mastermind run — the same override Assistant.relay() honours. */
export default class CardAnswer {

	static setup(socket){ new CardAnswer(socket); }

	constructor(socket){
		this.socket = socket;
		socket.on("rpc:card_answer", (args, index) => this.card_answer(args[0] || {}, index));
	}

	async card_answer({ id, answer }, index){
		if (!id || answer === undefined || answer === null)
			return this.socket.send({ index, error: "card_answer needs {id, answer}" });

		const at = now();
		const asked = CardAnswer.find_card(id);
		const title = asked?.title || id;
		const ask_to = asked?.ask_to || null;

		// (a) the board — merges onto the question card's own id.
		Assistant.append({ card: { id, answer, answered_at: at, author: "owner", status: "done" } });

		// (b) the mastermind's inbox.
		CardAnswer.inbox({ at, from: "owner", via: "card", card: id, msg: `${title} → ${answer}` });

		// The ack is fast on purpose — see the file header. `ask_to` rides along so a
		// caller can tell at once whether a ring is even going to happen.
		this.socket.send({ index, ok: true, ask_to });

		// (c) the ring — fire-and-forget from here; failures are logged, never re-thrown.
		if (!ask_to){
			console.warn(`CardAnswer: card ${id} has no ask_to — ring skipped.`);
			this.socket.rpc("card_rung", { id, ok: false, error: "no ask_to on the card" });
			return;
		}
		CardAnswer.ring(ask_to, `From the owner, via a card: ${title} → ${answer} (card ${id})`)
			.then(() => this.socket.rpc("card_rung", { id, ok: true }))
			.catch(e => {
				console.warn(`CardAnswer: ring to ${ask_to} failed —`, e.message || e);
				this.socket.rpc("card_rung", { id, ok: false, error: String(e.message || e) });
			});
	}

	/* The newest line on the board naming this id, fields merged shallowly — say.mjs
	 * writes the question card with `title`/`ask`/`ask_to` already on it, and this is
	 * the read-side of that same file (never a second store to keep in sync). */
	static find_card(id){
		const file = Assistant.board();
		if (!fs.existsSync(file)) return null;
		let found = null;
		for (const line of fs.readFileSync(file, "utf8").split("\n")){
			if (!line.trim()) continue;
			let e; try { e = JSON.parse(line); } catch { continue; }
			if (e.card?.id === id) found = { ...found, ...e.card };
		}
		return found;
	}

	static inbox(chat){
		const ledger = process.env.ASSISTANT_LEDGER;
		const file = ledger ? path.resolve(ledger) : CardAnswer.mastermind_run();
		if (!file){ console.warn("CardAnswer: no open mastermind run — inbox line NOT delivered."); return; }
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.appendFileSync(file, JSON.stringify({ chat }) + "\n");
	}

	/* The newest mastermind run that has not landed — the exact same rule say.mjs's own
	 * `run()` uses. Not imported from say.mjs: that file is a CLI script with no
	 * exports, and the one verb it DOES export behaviour through (`relay`) writes a
	 * fixed shape (`via: "assistant"`, no `card` field) that isn't the line this
	 * doorbell needs to write — spawning it would still leave this search duplicated
	 * one level up. Ten lines, read-only, kept beside its one caller. */
	static mastermind_run(){
		const AI = path.resolve("public/framework/ai");
		const days = fs.readdirSync(AI).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse();
		for (const day of days){
			const dir = path.join(AI, day);
			for (const slug of fs.readdirSync(dir).filter(s => s.startsWith("mastermind-")).sort().reverse()){
				const file = path.join(dir, slug, "task.jsonl");
				if (!fs.existsSync(file)) continue;
				const lines = fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } });
				const state = Object.assign({}, ...lines.filter(e => e.assign).map(e => e.assign));
				if (!state.landed_at) return file;
			}
		}
		return null;
	}

	/* The ring queue — one per TARGET session, so answering two cards addressed to two
	 * different sessions never makes one wait on the other, but two answers for the
	 * SAME session in quick succession coalesce into one turn instead of racing two
	 * spawns at once. "Never more than one ring in flight" (the brief), scoped per
	 * target rather than globally — the one target that exists today (the mastermind)
	 * behaves identically either way; per-target is the version that doesn't invent a
	 * problem for a future second target. */
	static rings = new Map();

	static ring(ask_to, text){
		let state = CardAnswer.rings.get(ask_to);
		if (!state) CardAnswer.rings.set(ask_to, state = { busy: false, queue: [] });
		return new Promise((resolve, reject) => {
			state.queue.push({ text, resolve, reject });
			if (!state.busy) CardAnswer.drain(ask_to, state);
		});
	}

	static async drain(ask_to, state){
		state.busy = true;
		while (state.queue.length){
			const batch = state.queue.splice(0, state.queue.length);
			const msg = batch.map(b => b.text).join("\n");
			try { await CardAnswer.send_ring(ask_to, msg); batch.forEach(b => b.resolve()); }
			catch (e){ batch.forEach(b => b.reject(e)); }
		}
		state.busy = false;
	}

	/* One headless turn, given ONLY the SendMessage tool — `--tools SendMessage` plus
	 * `--strict-mcp-config`, the same belt-and-braces Ask.js's "assistant" preset needed
	 * (its own args() comment: `--tools` alone does not stop the `.mcp.json` `site`
	 * server from still reaching a headless turn). Haiku: proven during this task with
	 * a scratch run against a fake session name — it called SendMessage with the right
	 * `to`/`message`, got back `{"success":false,"message":"No agent named …"}` (the
	 * fake name), and reported that failure correctly in its own reply; this task's log
	 * has the captured stream. 60s hard timeout; every turn is fresh — nothing here is
	 * worth resuming a session for. */
	static MODEL = "haiku";

	static send_ring(ask_to, text){
		return new Promise((resolve, reject) => {
			const args = ["-p", "--output-format", "stream-json", "--verbose",
				"--model", CardAnswer.MODEL, "--tools", "SendMessage", "--effort", "low",
				"--strict-mcp-config", "--session-id", randomUUID()];
			const child = spawn(process.env.CLAUDE_BIN || "claude", args, { windowsHide: true });
			const prompt = `Call the SendMessage tool exactly once: to: ${JSON.stringify(ask_to)}, message: ${JSON.stringify(text)}. Do nothing else -- no other tool, no extra reply.`;
			child.stdin.end(prompt);

			let buf = "", err = "", used = false, success = null, done = false;
			const timer = setTimeout(() => {
				if (done) return;
				done = true; child.kill();
				reject(new Error("ring timed out after 60s"));
			}, 60000);

			child.stdout.on("data", d => {
				buf += d;
				const lines = buf.split("\n");
				buf = lines.pop();
				for (const line of lines){
					if (!line.trim()) continue;
					let e; try { e = JSON.parse(line); } catch { continue; }
					if (e.type === "assistant") for (const c of e.message?.content ?? [])
						if (c.type === "tool_use" && c.name === "SendMessage") used = true;
					if (e.type === "user") for (const c of e.message?.content ?? [])
						if (c.type === "tool_result"){
							const rtext = c.content?.[0]?.text ?? (typeof c.content === "string" ? c.content : "");
							try { const r = JSON.parse(rtext); if (typeof r.success === "boolean") success = r.success; } catch {}
						}
				}
			});
			child.stderr.on("data", d => { err += d; });
			child.on("error", e => { if (!done){ done = true; clearTimeout(timer); reject(e); } });
			child.on("close", code => {
				if (done) return;
				done = true; clearTimeout(timer);
				if (code === 0 && used && success === true) resolve();
				else reject(new Error(!used ? "the turn never called SendMessage"
					: success === false ? "SendMessage reported failure"
					: `claude exited ${code}${err ? ": " + err.trim().slice(-300) : ""}`));
			});
		});
	}
}
