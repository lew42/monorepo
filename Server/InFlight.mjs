// Server/InFlight.mjs — the "inflight" query source: every session running right now, computed from the session index (DatedFiles.sessions.in_flight), never written by an agent.
// Page: /framework/ai/now/ (ai/now/). A row is the session's snapshot plus `doing` (the newest line of its record) and `url` (its folder). Doc: Server/doc/dated-files.md ("In flight").
import fs from "node:fs";
import path from "node:path";
import DatedFiles from "./DatedFiles.mjs";
import SessionRecord from "./SessionRecord.mjs";
import QueryServer from "../public/framework/ext/Query/QueryServer.mjs";

export default class InFlight {

	/** The newest words a session's own record says, if its folder holds one: a `now`, `log` or `chat` line. */
	static doing(snap) {
		const dir = DatedFiles.sessions.day_dir(String(snap.day ?? "").replaceAll("/", "-")), folder = path.join(dir, snap.folder ?? "");
		const file = SessionRecord.file(folder) ?? SessionRecord.log_file(folder);
		if (!file) return "";
		let text; try { text = fs.readFileSync(file, "utf8"); } catch { return ""; }
		const lines = text.split("\n");
		for (let i = lines.length - 1; i >= 0 && i > lines.length - 60; i--) {
			if (!lines[i].startsWith("{")) continue;
			try { const o = JSON.parse(lines[i]); const m = o.log?.msg ?? o.assign?.now ?? o.now ?? o.chat?.text; if (typeof m === "string" && m) return m.slice(0, 200); } catch {}
		}
		return "";
	}

	/** A snapshot as the page's row: who, what model, doing what, where, cost. */
	static shape(snap) {
		const folder = String(snap.day ?? "").replaceAll("-", "/") + "/" + (snap.folder ?? "");
		return { id: snap.id, state: snap.state, agent: snap.agent ?? null, title: snap.title ?? "", model: snap.model ?? "", usd: snap.tree_usd ?? snap.usd ?? 0,
			last_activity: snap.last_activity, first_at: snap.first_at, doing: InFlight.doing(snap), url: `/framework/ai/sessions/${folder}/`.replace(/\/+$/, "/") };
	}

	static register() {
		return QueryServer.source("inflight", {
			items: () => DatedFiles.sessions.in_flight(),
			on: fn => DatedFiles.live?.on?.(fn),
			shape: InFlight.shape,
		});
	}
}
InFlight.register();
