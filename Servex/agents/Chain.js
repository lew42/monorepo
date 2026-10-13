import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clean } from "../../public/framework/ext/Refine/engine.js";
import { structure } from "../../public/framework/ext/Refine/structure.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = (name, dflt) => process.env[name] ?? dflt;

/* THE ASSISTANT CHAIN, behind SERVEX_CHAIN=on (doc/assistant-chain.md). ONE fast assistant for the
 * owner, not one per page: each Dictate sentence on the `prompts` log is answered at once on the page
 * the owner is on, and a BATCH boundary (a pause, "send it off", N sentences) refines the batch with
 * ext/Refine and hands it to the standing mastermind once. Assistant.install() builds it. */
export default class Chain {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	defaults(){
		return {
			id: "assistant-chain", log: "prompts",
			model: env("SERVEX_CHAIN_FAST_MODEL", "claude-haiku-5-5"),
			mastermind: env("SERVEX_CHAIN_MASTERMIND", "mastermind-servex"),
			batch_n: Number(env("SERVEX_CHAIN_BATCH_N", 5)), pause_ms: Number(env("SERVEX_CHAIN_PAUSE_MS", 6000)),
			batch: [], page: null, pages: [], asked: [], sent_through: 0,
		};
	}

	static enabled(){ return env("SERVEX_CHAIN", "off") === "on"; }
	static SEND_IT = /\bsend (it|that|this|all of it) (off|along|now)\b/i;

	install(){ this.listen(); this.watch(); return this; }
	live(){ const a = this.servex.agents.live.get(this.id); return a && a.state !== "stopped" ? a : null; }

	start(){
		const live = this.live();
		if (live) return live;
		this.servex.agents.live.delete(this.id);
		this.duty = true;   // the spawn prompt's own turn ends with a result that answers no sentence
		return this.servex.agents.spawn({
			id: this.id, role: "assistant", name: "chain", model: this.model, effort: "low",
			system: fs.readFileSync(path.join(HERE, "chain-fast.md"), "utf8"),
			permission_mode: "bypassPermissions", allowed_tools: [], setting_sources: [],
			prompt: "You are on duty. The next messages are the owner's dictated sentences. Answer nothing now.",
		});
	}

	/* The seam Assistant.listen() hangs off: every accepted `prompts` line is announced. */
	listen(){
		this.servex.log.on("append", (name, entry) => {
			if (name !== this.log || entry.type !== "prompt" || String(entry.via ?? "").startsWith("worktree:")) return;
			setImmediate(() => this.heard(entry));   // after the POST has answered: a cold spawn must not hold the owner's request
		});
	}

	/* A fast reply is an agent's final text: read off the host's event stream, like Sessions.js does. */
	watch(){
		const agents = this.servex.agents, watch = agents.watch.bind(agents);
		agents.watch = (event, agent) => {
			watch(event, agent);
			if (agent.id === this.id && event.type === "result" && !event.stopped) this.replied(String(event.text ?? agent.last_text ?? "").trim());
		};
	}

	sentences_of(entry){ return (entry.sentences?.length ? entry.sentences : [entry.text ?? ""]).filter(s => String(s).trim()); }

	heard(entry){
		const sentences = this.sentences_of(entry);
		if (!sentences.length) return;
		const page = entry.path ?? entry.selected ?? this.page ?? "/";
		const move = this.page && page !== this.page ? `(now on ${page})\n` : "";
		if (page !== this.page){ this.page = page; this.pages.push(page); }
		this.batch.push({ id: entry.id, page, sentences });
		this.asked.push({ id: entry.id, page, selected: entry.selected ?? null, at: Date.now() });
		this.servex.log.append("chain", { type: "heard", id: entry.id, page, sentences: sentences.length }).catch(() => {});
		try { this.start().send(`${move}[on ${page}] ${sentences.join(" ")}`, { from: "owner" }); }
		catch (e){ this.servex.say(`chain: fast assistant could not hear: ${e.message || e}`); }
		this.boundary(sentences);
	}

	/* A boundary: the owner said "send it off", N sentences piled up, or it went quiet. */
	boundary(sentences) {
		clearTimeout(this.timer);
		const count = this.batch.reduce((n, b) => n + b.sentences.length, 0);
		if (Chain.SEND_IT.test(sentences.join(" "))) return void this.handoff("said send it off").catch(e => this.servex.say(`chain: ${e.message || e}`));
		if (count >= this.batch_n) return void this.handoff(`${count} sentences`).catch(e => this.servex.say(`chain: ${e.message || e}`));
		this.timer = setTimeout(() => this.handoff(`quiet for ${Math.round(this.pause_ms / 1000)} s`).catch(() => {}), this.pause_ms);
		this.timer.unref?.();
	}

	/* The fast agent answers messages in order, so a result belongs to the oldest unanswered sentence. */
	replied(text){
		if (this.duty){ this.duty = false; return; }
		const ask = this.asked.find(a => !a.replied);
		if (!ask) return;
		ask.replied = Date.now();
		text = text.replace(/^(\(now on [^)]*\)\s*)?\[on [^\]]*\]\s*/i, "");   // the model may echo the page tag
		if (!text || /^\(listening\)$/i.test(text)) return;
		this.servex.log.append(this.log, { type: "reply", by: this.id, re: ask.id, chain: true, text, ms: ask.replied - ask.at, ...(ask.selected ? { card: ask.selected } : {}) }).catch(() => {});
		if (ask.selected) this.servex.assistant?.card_reply({ card: ask.selected, text, from: this.id }).catch?.(() => {});
	}

	/* The refined prompt: ext/Refine's clean + structure over the batch, one delta since the last hand-off. */
	async refine(text){
		const call = (p, o) => this.servex.echo.call(p, o);
		const { sentences, flags } = await clean(text, { call });
		const built = sentences.length ? await structure(sentences, { call }) : { md: "" };
		return { sentences, flags, md: built.md ?? "" };
	}

	async handoff(why){
		clearTimeout(this.timer);
		const batch = this.batch.splice(0);
		if (!batch.length) return null;
		const t0 = Date.now(), n = ++this.sent_through;
		const text = batch.flatMap(b => b.sentences).filter(x => !Chain.SEND_IT.test(x) || x.replace(Chain.SEND_IT, "").replace(/W/g, "").length > 12).join(" ");   // the command itself is not content
		let refined = null;
		try { refined = await this.refine(text); } catch (e){ this.servex.say(`chain: refine failed (${e.message || e}); sending the raw words`); }
		const refine_ms = Date.now() - t0;
		const body = { batch: n, why, pages: [...new Set(batch.map(b => b.page))], ids: batch.map(b => b.id), raw: text,
			...(refined ? { sentences: refined.sentences.map(s => s.text), refined_md: refined.md, flags: refined.flags } : {}) };
		const message = `REFINED PROMPT, batch ${n} (${why}). Owner pages: ${body.pages.join(", ")}.\n\n${refined?.md || text}\n\n${JSON.stringify(body)}`;
		const target = this.servex.agents.live.get(this.mastermind);
		let delivered = false;
		if (target && target.state !== "stopped"){ try { target.send(message, { from: this.id }); delivered = true; } catch {} }
		await this.servex.log.append("chain", { type: "handoff", batch: n, why, to: this.mastermind, delivered, refine_ms, ms: Date.now() - t0, sentences: body.sentences?.length ?? 0 });
		await this.servex.log.append(this.log, { type: "reply", by: this.id, re: batch.at(-1).id, chain: true, text: `Sent to ${this.mastermind}: ${body.sentences?.length ?? 0} refined sentences (${why}).` });
		return { delivered, ...body, refine_ms };
	}
}
