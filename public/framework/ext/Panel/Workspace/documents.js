import FileSaver from "/framework/ext/Saver/FileSaver.js";
import LocalStorageSaver from "/framework/ext/Saver/LocalStorageSaver.js";
import Panel from "../Panel.js";

/* Documents are FILES: one Saver per name, an index the Workspace writes itself — no
   server route, the same mechanism dev and static. ⚠ Not the directory listing:
   `Server/plugins/Directory.js:21` ignores every `.json`, so a new document never rebuilds
   `directory.json` and reading THAT instead would go stale with nothing thrown. design §4,
   doc/documents.md. */

// ⚠ THE line that chooses where a document lives — moved from workspace.js verbatim. Off
// localhost there is no dev socket, so FileSaver warns once and writes nothing; localStorage
// genuinely persists there instead.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
const store = (path, key) => dev ? new FileSaver({ path }) : new LocalStorageSaver({ key });

/* The default document never moved — zero migration, so `ext/Panel`'s own page and every
   caller that never heard of `documents.js` keep working throughout. */
export const saver = store("/data/panels.json", "panels");
const index = store("/data/panels/index.json", "panels/index");

const path_of = name => `/data/panels/${name}.json`;

/* The name back out of a Saver — the bar, the rail's document block and the playground all
   ask it; one derivation, so they cannot drift. `""` for a Saver documents.js never made. */
export function name_of(saver){
	const from = saver?.path ?? saver?.key ?? "";
	if (/(^|\/)panels(\.json)?$/.test(from)) return "default";
	return /\/panels\//.test(from) ? from.split("/").pop().replace(/\.json$/, "") : "";
}

// A document's own Saver. `default` is the one name that does NOT follow the pattern above.
export const open = name => name === "default" ? saver : store(path_of(name), `panels/${name}`);

/* The index, read. A missing file is not an error — it is the state before anyone ever
   created a second document — and it still SEEDS `default`, because that document exists
   whether or not the index has ever been written. Nothing is written here; `create()`/
   `remove()` are the only writers. */
export async function list(){
	const data = await index.load();
	return data?.names ?? ["default"];
}

/* Mints `untitled`, `untitled-2`… unless `name` is given — the door a headless proof (or a
   future rename) uses to pick its own. A fresh document is a blank leaf; nothing seeds it,
   unlike `workspace()`'s own scatter — "+" is an intentional empty page, not a demo. */
export async function create(name){
	const found = await list();

	if (!name){
		name = "untitled";
		for (let n = 2; found.includes(name); n++) name = `untitled-${n}`;
	}

	const root = new Panel({ saver: open(name), data: { mode: "document" } });
	await Promise.all([ root.save(), index.save({ names: [...found, name] }) ]);
	return name;
}

// Three lines, as the design promised: `FileSaver.delete()` already exists.
export async function remove(name){
	await open(name).delete();
	await index.save({ names: (await list()).filter(n => n !== name) });
}
