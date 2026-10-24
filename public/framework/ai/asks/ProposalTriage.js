import View, { div, span, button, a, p, small } from "/framework/core/View/View.js";
import Task from "/framework/core/Task/Task.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";

View.stylesheet(import.meta, "triage.css");

/**
 * class ProposalTriage — the one card that answers "what became of the proposed tasks?" (the owner, 2026-10-23).
 * Reads `triage.jsonl` (written by `node Server/ProposalTriage.mjs --apply`, one line per proposal it moved) and replays each
 * task's own task.jsonl for its live state, so a task that was approved, rejected or moved since still counts right.
 * Shows how many went into each of the three big things (a click lists them), how many wait in the backlog, and one
 * **Approve all** button: one `{approve}` line appended to every backlog task's task.jsonl through FsFile.append.
 * Doc: ./readme.md ("Triage"). The Server class of the same name is the writer; this class never changes a task except on that press.
 */
export default class ProposalTriage {

	static MANIFEST = new URL("./triage.jsonl", import.meta.url).pathname;
	static PRIORITY = { 1: "See and approve the work", 2: "Every ask becomes a task that finishes", 3: "Agents that know the rules" };

	rows = [];
	open = null;   // the group whose list is showing: 1, 2, 3 or "backlog"

	constructor({ manifest = ProposalTriage.MANIFEST } = {}){ this.manifest = manifest; }

	static text(url){ return fetch(url, { cache: "no-store" }).then(r => r.ok ? r.text() : ""); }
	static lines(text){ return String(text).split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }

	/** The manifest lines (the last line of a task wins), each joined with the task's live state and title. */
	async load(){
		const seen = new Map();
		for (const l of ProposalTriage.lines(await ProposalTriage.text(this.manifest))) seen.set(l.task, l);
		this.rows = await Promise.all([...seen.values()].map(async l => {
			const lines = ProposalTriage.lines(await ProposalTriage.text(l.task + "task.jsonl")), t = Task.replay(lines);
			return { ...l, title: t.get_one("title") ?? l.task, state: t.state, waiting_on: t.get_one("waiting_on") ?? null };
		}));
		return this;
	}

	backlog(){ return this.rows.filter(r => r.state === "waiting" && r.waiting_on === "backlog"); }
	/** The ones accepted into big thing `n` (still queued or since started; a rejected one is not counted). */
	accepted(n){ return this.rows.filter(r => r.priority === n && r.action === "approve" && r.state !== "stopped"); }
	/** Backlog proposals the owner has since approved (Approve all, or one by one): they left the backlog, so the head counts them here. */
	approved(){ return this.rows.filter(r => r.action === "backlog" && r.state !== "waiting" && r.state !== "stopped"); }

	/** One press: an `approve` line for every backlog task, written the way the session page writes its Approve. */
	async approve_all(){
		await Promise.all(this.backlog().map(r => FsFile.append(r.task + "task.jsonl", { approve: { at: "NOW", by: "owner", note: "Approve all, from the triage card" } })));
		return this.load();
	}

	/** Draws the card into the current captor (call it inside a content() or a div callback). */
	draw(){
		const $card = div.c("card pad flow triage-card");
		const paint = () => $card.empty(() => {
			if (!this.rows.length) return p("No triage has run yet.");
			const bl = this.backlog();
			p.c("triage-head").text(`${this.rows.length} proposals sorted: ${[1, 2, 3].reduce((n, k) => n + this.accepted(k).length, 0)} accepted into a priority, ${bl.length} in the backlog${this.approved().length ? `, ${this.approved().length} approved by you from it` : ""}.`);
			div.c("triage-counts", () => {
				for (const n of [1, 2, 3]) button.c(`triage-chip${this.open === n ? " on" : ""}`, `${n} · ${ProposalTriage.PRIORITY[n]}: ${this.accepted(n).length}`).attr("type", "button").click(() => { this.open = this.open === n ? null : n; paint(); });
				button.c(`triage-chip${this.open === "backlog" ? " on" : ""}`, `Backlog: ${bl.length}`).attr("type", "button").click(() => { this.open = this.open === "backlog" ? null : "backlog"; paint(); });
			});
			if (bl.length) button.c("triage-approve-all", `Approve all ${bl.length} backlog proposals`).attr("type", "button").click(async () => { await this.approve_all(); paint(); });
			const list = this.open === "backlog" ? bl : this.open ? this.accepted(this.open) : [];
			if (list.length) div.c("flow triage-list", () => list.forEach(r => div(() => { a.c("page-link").href(r.task).text(r.title); small.c("muted").text("  " + (r.module ?? "")); })));
		});
		this.load().then(paint);
		return $card;
	}
}
