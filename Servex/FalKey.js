/* FalKey: the one Fal API key on this PC. It lives in a file outside the repo, never in an environment variable, and is
 * read fresh on every call (so pasting a new key needs no restart). Nothing here logs, returns or echoes the key.
 * A future Fal module (generation UI) should `import FalKey` and call `FalKey.read()`; there is exactly one key, in one place.
 * Detail: ext/remote/doc/remote-tools.md, "fal_usage". */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export default class FalKey {
	static FILE = path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"), "lew42", "servex", "fal.key");

	// the key text, or throws one readable line naming the file (never the key)
	static read(){
		let raw;
		try { raw = fs.readFileSync(FalKey.FILE, "utf8"); }
		catch (e){ throw new Error(e.code === "ENOENT" ? `No Fal key: the file ${FalKey.FILE} does not exist. Paste the key into it as the file's only content.` : `Could not read the Fal key file ${FalKey.FILE}: ${e.code ?? "error"}.`); }
		// Notepad may add a BOM and a trailing newline; tolerate quotes and a pasted "Key " prefix too
		const key = raw.replace(/^﻿/, "").trim().replace(/^key\s+/i, "").replace(/^["']|["']$/g, "").trim();
		if (!key) throw new Error(`The Fal key file ${FalKey.FILE} is empty. Paste the key into it as the file's only content.`);
		if (/\s/.test(key)) throw new Error(`The Fal key file ${FalKey.FILE} should hold one key and nothing else (found whitespace inside it).`);
		return key;
	}
}
