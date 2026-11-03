import fs from "node:fs";
import Task from "../public/framework/core/Task/Task.js";
import LineKey from "../public/framework/core/Item/LineKey.js";

/* THE CLOSE LOOP (2026-11-02, Servex/agents/readme.md "When an agent stops"): the decision, kept pure so a test can run it
 * on a log and a few facts. An agent's turn ended, or it was stopped, and its task is still open. One of three answers:
 *   "complete"  the work is clearly finished (clean end, and the log has an outcome, a landing line or a commit): the harness
 *               completes the task with the agent's last words as the outcome;
 *   "wake"      anything else: the agent is asked ONCE to complete the task or say why it stays open;
 *   null        nothing to do (already closed, already woken, blocked, waiting on purpose, or children still working).
 * Agents.Agent.close_loop() applies it; the once-flag `close_nagged` lives in the registry row. Audit: task-close-loop/requirements.md. */
export default class CloseLoop {
	static OUTCOME_CHARS = 1500;
	static WAKE = "Your task is still open: complete it with an outcome (the `complete` line, or the landing line), or say in one line why it stays open. This is the only reminder.";

	/** The task log's lines (bad lines skipped); [] when the file cannot be read. */
	static lines(file){
		let text; try { text = fs.readFileSync(file, "utf8"); } catch { return []; }
		const out = [];
		for (const raw of text.split("\n")){ if (!raw.trim()) continue; try { out.push(LineKey.deep(JSON.parse(raw))); } catch {} }   // D13: marks off
		return out;
	}

	/** True when the log shows finished work: an outcome or a landing line, or (a worker, not a mastermind, which commits at every step and
	 *  may end a turn waiting on a review) a commit line. */
	static finished(lines, role = ""){
		const commits = !/^(task-mastermind|mastermind|sub-mastermind)/.test(role ?? "");
		return lines.some(l => (commits && l.commit) || l.assign?.outcome || l.assign?.landed_at || l.complete?.outcome);
	}

	/** `facts`: { lines, ok (the turn ended without an error), text (the last words), nagged, kids (children still working) } */
	static decide({ lines, ok, text, nagged, kids = 0, role = "" }){
		if (nagged) return null;
		let state; try { state = Task.replay(lines).state; } catch { return null; }
		if (state === "complete" || state === "stopped" || state === "waiting" || state === "paused") return null;
		if (/^BLOCKED/i.test(text ?? "") || kids > 0) return null;
		if (ok && this.finished(lines, role) && text) return "complete";
		return ok ? "wake" : null;
	}

	/** The line that completes the task: a `complete` verb (a landed_at assign does not complete a log that has verb lines). Its evidence is the
	 *  log's own commits and outcome; the caveat says the harness wrote it. */
	static complete_line(text, by, lines = []){
		const outcome = String(text ?? "").trim().slice(0, this.OUTCOME_CHARS);
		const evidence = lines.filter(l => l.commit).map(l => typeof l.commit === "string" ? l.commit : l.commit.sha ?? l.commit.msg).filter(Boolean).slice(-5);
		if (!evidence.length) evidence.push("the task log: it holds an outcome or landing line");
		return { complete: { at: "NOW", outcome, evidence, confidence: "medium", caveats: ["completed by the harness from the agent's last words: the agent ended its turn without completing its own task"] }, by };
	}
}
