import fs from "fs";
import path from "path";

/* The node side of the Sessions grid's rows: what the "sessions" query source (ext/Query) adds to each index snapshot so the browser draws
 * the same row the files path does. `shape` is the join; the snapshot itself stays as the index wrote it (no second store).
 * Doc: ext/Query/doc/architecture.md. */
export default class AISessionSource {

	/** id -> source tag ("sdk", "cli", "vscode") from sessions.json, the legacy snapshot the files path also reads. Filled by load(). */
	static tags = new Map();

	/** Read the join file once, when the source loads. A missing file is an empty join. */
	static load(root) {
		AISessionSource.tags = new Map();
		try {
			for (const r of JSON.parse(fs.readFileSync(path.join(root, "sessions.json"), "utf8")).rows ?? [])
				if (r.source && r.source !== "servex") AISessionSource.tags.set(r.session_id ?? r.id, r.source);
		} catch {}
	}

	/** A Servex-spawned session has a registry agent id; any other is the tag sessions.json gave it, else a VS Code tab (what the files path draws for a session only the index knows). */
	static source_of(snap) { return snap.agent ? "servex" : AISessionSource.tags.get(snap.id) ?? "vscode"; }

	static shape(snap) { return { ...snap, source: AISessionSource.source_of(snap) }; }
}
