/* THE RELOAD HOLD — one lock any agent takes before a batch of writes, so
 * `LiveReload` queues every change quietly instead of reloading a tab after
 * every single file. `node Server/hold.mjs on "<who> — <what>"` takes it,
 * `node Server/hold.mjs off "<who>"` releases it, and `node Server/hold.mjs`
 * with no argument prints who holds it right now. No socket, no server
 * needed to run the CLI — it only ever touches one small JSON file.
 *
 * The lock file: `.reload-hold.json` at the REPO ROOT, one level above
 * `Server/` — deliberately OUTSIDE `public/`, so taking a hold is never
 * itself a "change" `watch.js` (Server/watch.js) has to filter back out.
 * It is git-ignored (.gitignore) because it only ever describes THIS
 * machine's running agents, right now — nothing worth committing.
 *
 * Shape on disk: `{ "holders": [ { who, what, since, until, pid } ] }`.
 * `holders` is a LIST — two agents can hold at once, same as two people
 * propping open the same door; reloads resume only once every holder has
 * let go. The file itself disappears the moment the list is empty (`off`
 * "removes it", per the brief) — so "does the file exist" already answers
 * "is anything held", which is what `Server/plugins/SocketServer/LiveReload.js`
 * polls for. A holder is `who` (a short slug — a task name is perfect) and
 * `what` (why, free text); `since`/`until` are epoch milliseconds, `pid` is
 * whatever process ran the CLI (informational only — a hold outlives the
 * short-lived CLI process that took it, on purpose).
 *
 * Self-expiry, so a hold can never stick: `until` defaults to 5 minutes
 * from `on`, renewable by calling `on` again with the same `who` (that
 * REPLACES the old entry, resetting the clock). `RELOAD_HOLD_TTL_MS` in the
 * environment overrides the default — the prove step in this task's
 * requirements.md uses a 5-second TTL to test expiry without a 5-minute
 * wait. `prune()` is the one function that actually EXPIRES a holder —
 * called by the server's poll loop, never by the CLI's own `status` read,
 * so a status check never races the server's own "who let it lapse" log
 * line by deleting the evidence first.
 *
 * The expiry is deliberate but was SILENT — an agent that went away and came
 * back believed it was still protected when it was not, and a real write
 * once went out unheld because of it. `.claude/hooks/hold-guard.mjs` is the
 * fix: it notices, on an agent's own next write, that a hold IT took has
 * since lapsed, and renews it — never touching this file's own expiry logic.
 * `public/framework/ai/2026-09-19/hold-guard/` has the story and the proof. */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const LOCK_PATH = path.join(__dirname, "..", ".reload-hold.json");

export const DEFAULT_TTL_MS = 5 * 60 * 1000;   // 5 minutes — the brief's own number
const EM_DASH = "—";                      // written as an escape, never typed literally

function ttl_ms(){
	const env = process.env.RELOAD_HOLD_TTL_MS;
	return env ? Number(env) : DEFAULT_TTL_MS;
}

// Raw read — never throws, never mutates. Missing or corrupt file reads as "free".
export function read(){
	try {
		const state = JSON.parse(fs.readFileSync(LOCK_PATH, "utf8"));
		if (!Array.isArray(state.holders)) state.holders = [];
		return state;
	} catch {
		return { holders: [] };
	}
}

function write(state){
	if (!state.holders.length) return clear();
	fs.writeFileSync(LOCK_PATH, JSON.stringify(state, null, 2));
}

// "off removes it" — an empty holder list means no file, not an empty one, so
// the server's poll (and any other reader) can tell "held" from "free" by
// existence alone, with nothing to parse.
export function clear(){
	try { fs.unlinkSync(LOCK_PATH); } catch {}
}

// Take (or renew) a hold. Renew: calling `on` again with the same `who`
// replaces that holder's entry — same name, fresh 5 minutes.
export function add(who, what = "", ttl = ttl_ms()){
	const state = read();
	const now = Date.now();
	state.holders = state.holders.filter(h => h.who !== who);
	state.holders.push({ who, what, since: now, until: now + ttl, pid: process.pid });
	write(state);
	return state;
}

// Release one holder. `who` omitted: release the only holder there is —
// if there is more than one, refuse (no-op) and say so, rather than guess
// which one the caller meant.
export function release(who){
	const state = read();
	const before = state.holders.length;

	if (who) {
		state.holders = state.holders.filter(h => h.who !== who);
	} else if (state.holders.length === 1) {
		state.holders = [];
	}
	// else: ambiguous with no `who` named — leave the list untouched.

	const removed = state.holders.length < before;
	write(state);
	return { removed, holders: state.holders };
}

// The AUTHORITATIVE expiry check — the server's poll loop calls this, never
// the CLI. Splits holders into still-alive and just-expired by `until`,
// writes the alive ones back (or clears the file) only when something
// actually expired, and returns both lists so the caller can log the lapse
// and force one flush.
export function prune(now = Date.now()){
	const state = read();
	const alive = [], expired = [];
	for (const h of state.holders) (h.until < now ? expired : alive).push(h);
	if (expired.length) write({ holders: alive });
	return { alive, expired };
}

// Read-only view for display (CLI `status`) — annotates without writing, so
// a status check can never race the server's own pruning and its lapse log.
export function peek(now = Date.now()){
	const { holders } = read();
	return holders.map(h => ({ ...h, expired: h.until < now }));
}

// ── CLI ─────────────────────────────────────────────────────────────────
// Only runs when this file is the process entry point — `import * as Hold
// from "./hold.mjs"` (LiveReload.js) never reaches any of this.
const is_main = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (is_main) cli();

function cli(){
	const [, , cmd, arg] = process.argv;

	if (cmd === "on") {
		if (!arg) {
			console.error(`usage: node Server/hold.mjs on "<who> ${EM_DASH} <what>"`);
			process.exit(1);
		}
		const sep = arg.indexOf(` ${EM_DASH} `);
		const who = (sep === -1 ? arg : arg.slice(0, sep)).trim();
		const what = (sep === -1 ? "" : arg.slice(sep + 3)).trim();
		const ttl = ttl_ms();
		const state = add(who, what, ttl);
		console.log(`hold ON: "${who}"${what ? ` ${EM_DASH} ${what}` : ""} — expires in ${Math.round(ttl / 1000)}s. Holders now: ${state.holders.length}.`);
	} else if (cmd === "off") {
		const { removed, holders } = release(arg);
		if (removed) console.log(`hold OFF: "${arg || "(the only holder)"}" released. Holders left: ${holders.length}${holders.length ? " — reload still queued" : " — reload will flush now"}.`);
		else console.log(`hold off: nothing removed (${holders.length} holder(s) left — name one with "off <who>").`);
	} else {
		print_status();
	}
}

function print_status(){
	const holders = peek();
	if (!holders.length) { console.log("reload-hold: free — no holders."); return; }

	console.log(`reload-hold: HELD by ${holders.length} holder(s):`);
	const now = Date.now();
	for (const h of holders) {
		const left = Math.round((h.until - now) / 1000);
		const state = h.expired ? "EXPIRED, awaiting the server's next flush" : `${left}s left`;
		console.log(`  - ${h.who}${h.what ? ` ${EM_DASH} ${h.what}` : ""} (pid ${h.pid}, ${state})`);
	}
}
