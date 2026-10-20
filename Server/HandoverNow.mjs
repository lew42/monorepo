// HandoverNow: the computed "NOW" block at the top of handover.md (code writes it, never an agent).
// Plan: public/framework/ai/sessions/2026/10/16/voice-20261016/handover-query/requirements.md
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import SessionIndex from "./SessionIndex.mjs";

export default class HandoverNow {
	static REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
	static FILE = path.join(HandoverNow.REPO, "public", "framework", "ai", "handover.md");
	static START = "<!-- NOW:start (written by Server/HandoverNow.mjs; do not edit by hand) -->";
	static END = "<!-- NOW:end -->";

	constructor({ hours = 24, now = Date.now() } = {}) { this.hours = hours; this.now = now; }

	static line(r) {
		const title = (r.title || r.slug).replace(/\s+/g, " ").slice(0, 110);
		return `- [${title}](${r.url})${r.agent ? ` (${r.agent})` : ""}`;
	}

	async rows() {
		const ix = new SessionIndex({ root: path.join(HandoverNow.REPO, "public", "framework", "ai") });
		await ix.load(); ix.stop();
		const cut = this.now - this.hours * 3600e3, since = new Date(cut).toISOString().slice(0, 10);
		const all = ix.query({ kind: "task", since, limit: 1e6 }).rows;
		return {
			landed: all.filter(r => r.landed && r.landed_at >= cut).sort((a, b) => b.landed_at - a.landed_at),
			open: all.filter(r => !r.landed && r.last >= cut && (r.title || r.brief)).sort((a, b) => b.last - a.last),
		};
	}

	git(...args) { return execFileSync("git", args, { cwd: HandoverNow.REPO, encoding: "utf8", windowsHide: true }).trim(); }

	/** One line from remote.url (host only, token never shown) and remote.changed. */
	static connector() {
		const dir = path.join(process.env.LOCALAPPDATA ?? "", "lew42", "servex");
		try {
			const host = new URL(fs.readFileSync(path.join(dir, "remote.url"), "utf8").trim()).host;
			let at = ""; try { at = fs.readFileSync(path.join(dir, "remote.changed"), "utf8").trim().slice(0, 16).replace("T", " ") + " UTC"; } catch {}
			return `**Connector:** ${host}/mcp/remote/…${at ? ` (changed ${at})` : ""}`;
		} catch { return "**Connector:** tunnel down"; }
	}

	async build() {
		const { landed, open } = await this.rows();
		const pace = execFileSync("node", ["Server/usage-now.mjs"], { cwd: HandoverNow.REPO, encoding: "utf8", windowsHide: true }).trim().split("\n")[0];
		const stamp = new Date(this.now).toISOString().slice(0, 16).replace("T", " ") + " UTC";
		const show = (rows, n) => rows.slice(0, n).map(HandoverNow.line).join("\n") + (rows.length > n ? `\n- …and ${rows.length - n} more (the [task list](/framework/ai/tasks/))` : "");
		return [
			HandoverNow.START,
			`## NOW (computed ${stamp}, last ${this.hours} h)`,
			"",
			`**Pace:** ${pace}`,
			"",
			`**Landed (${landed.length}):**`, show(landed, 12) || "- none",
			"",
			`**Open, touched in the window (${open.length}):**`, show(open, 10) || "- none",
			"",
			"**Latest commits on this branch:**", "```", this.git("log", "--oneline", "-8"), "```",
			"",
			"The dated sections below are written by hand and go stale; this block does not.",
			HandoverNow.END, "",
		].join("\n");
	}

	/** The file text with the NOW block replaced (or inserted before the first "## LATEST" heading). */
	static splice(text, block) {
		const a = text.indexOf(HandoverNow.START), b = text.indexOf(HandoverNow.END);
		if (a >= 0 && b > a) return text.slice(0, a) + block + text.slice(b + HandoverNow.END.length).replace(/^\n/, "");
		const at = text.indexOf("\n## LATEST");
		return at < 0 ? text + "\n" + block : text.slice(0, at + 1) + block + "\n" + text.slice(at + 1);
	}

	async write() {
		const text = fs.readFileSync(HandoverNow.FILE, "utf8"), next = HandoverNow.splice(text, await this.build());
		if (next !== text) fs.writeFileSync(HandoverNow.FILE, next);
		return next !== text;
	}
}

// node Server/HandoverNow.mjs [--write]   (no flag: print the block only)
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const h = new HandoverNow();
	if (process.argv.includes("--selftest")) {
		const b = "<!-- NOW:start (x) -->\nA\n<!-- NOW:end -->\n", t = "# H\n\nintro\n\n## LATEST one\nx\n";
		const once = HandoverNow.splice(t, HandoverNow.START + "\nA\n" + HandoverNow.END + "\n");
		const twice = HandoverNow.splice(once, HandoverNow.START + "\nA\n" + HandoverNow.END + "\n");
		console.log(once === twice && once.includes("## LATEST one") && once.indexOf("NOW:start") < once.indexOf("## LATEST") ? "selftest ok: idempotent, block above LATEST" : "selftest FAILED");
	} else if (process.argv.includes("--write")) console.log((await h.write()) ? "handover.md NOW block written" : "handover.md unchanged");
	else console.log(await h.build());
	process.exit(0);
}
