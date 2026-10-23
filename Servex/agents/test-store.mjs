/* Import this FIRST in any test that spawns through the real Agents class (a bare `import "./test-store.mjs";`
 * before every other import, or at the top of the file for dynamic imports).
 *
 * Why: Agents.spawn() with no `task: false` files a folder under the session store,
 * ai/sessions/<day>/spawned/<id>/. Run as a test, that put fake agents (minion-x, minion-dead, task-mastermind-z...)
 * into the real store, 36 folders by 2026-10-22.
 *
 * What: points the store's root at a scratch dir. LEDGER_ROOT is the switch Server/TaskDirs.mjs already honours
 * (it also sets DatedFiles.ROOT). Set before Agents.js loads, which it is, because imports run in order.
 * Exports: STORE (the scratch root), spawned_in_real_store() (today's folder names in the real store), clean(). */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const REAL = path.resolve(import.meta.dirname, "../..");
export const STORE = process.env.LEDGER_ROOT || fs.mkdtempSync(path.join(os.tmpdir(), "test-store-"));
process.env.LEDGER_ROOT = STORE;

/** Names under the REAL <repo>/public/framework/ai/sessions/<today>/spawned/ (what a leaking test would add to). */
export const spawned_in_real_store = () => {
	const d = new Date(), p = n => String(n).padStart(2, "0");
	const f = path.join(REAL, "public/framework/ai/sessions", String(d.getFullYear()), p(d.getMonth() + 1), p(d.getDate()), "spawned");
	return fs.existsSync(f) ? fs.readdirSync(f) : [];
};
export const clean = () => fs.rmSync(STORE, { recursive: true, force: true });
