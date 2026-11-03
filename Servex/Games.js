import { execFile } from "child_process";
import Events from "../Server/Events.js";
import { stamp } from "./home.js";

/* GAMES — close one only when the PC is idle AND RAM is tight (process-monitor,
 * 2026-09-30, ask 4). The owner's exact rule: "close StarCraft (and similar)
 * ONLY when the PC has been idle (no keyboard or mouse) for more than 30
 * minutes AND RAM is tight. Never while they are playing. Log every close."
 *
 * Every minute this checks three things, all through Processes.js's own
 * snapshot (no PowerShell of its own):
 *   - `idle_s`   seconds since any keyboard/mouse input (GetLastInputInfo,
 *                read by the process monitor's one long-lived hidden
 *                PowerShell loop — see Processes.js's `PS` script)
 *   - `free_mb`  free RAM right now
 *   - a listed game actually running (`SERVEX_GAMES`, comma list; default
 *     StarCraft and the Battle.net launcher)
 *
 * `decide()` is the whole rule, exported and pure — no Servex, no PowerShell,
 * no clock — so the proof can check "idle 29 min: no", "8 GB free: no", "no
 * game running: no" without starting anything.
 *
 * Closing is graceful first (`CloseMainWindow`), and only ends the process by
 * force (`taskkill /PID`, never by name) if it is STILL alive 60 seconds
 * later — always the exact pid just read, never a fresh lookup by name, so a
 * player who relaunches in that window is never touched. */
export default class Games extends Events {

	initialize(){
		this.names ??= (process.env.SERVEX_GAMES
			? process.env.SERVEX_GAMES.split(",").map(s => s.trim()).filter(Boolean)
			: ["StarCraft.exe", "SC2.exe", "SC2_x64.exe", "Battle.net.exe"]);
		this.idle_min ??= Number(process.env.SERVEX_GAME_IDLE_MIN) || 30;
		this.tight_mb ??= Number(process.env.SERVEX_TIGHT_MB) || 6144;
		this.closing ??= process.env.SERVEX_CLOSE_GAMES !== "0";   // 0 only logs what it would do
		this.every ??= Number(process.env.SERVEX_GAMES_EVERY_MS) || 60000;
		this.closed = [];          // the last 50 closes (or would-closes), newest last
		this.pending = new Map();  // pid -> the 60 s "is it still alive" timer, so one game is never double-closed
	}

	start(){
		this.timer = setInterval(() => this.tick(), this.every);
		this.timer.unref?.();
		return this;
	}

	stop(){
		clearInterval(this.timer);
		for (const t of this.pending.values()) clearTimeout(t);
		this.pending.clear();
	}

	log(entry){ return this.servex?.log?.append("processes", entry).catch(() => {}); }

	/* The games actually running right now, read from the process monitor's own
	 * snapshot (Processes.js keeps the raw list in `this.procs`; no process
	 * query of our own). */
	running(){
		const procs = this.servex?.procmon?.procs;   // Processes.js's instance; Servex.js names it `procmon`
		if (!procs) return [];
		const lower = this.names.map(n => n.toLowerCase());
		const out = [];
		for (const p of procs.values()) if (p.name && lower.includes(p.name.toLowerCase())) out.push({ pid: p.pid, name: p.name });
		return out;
	}

	tick(){
		const proc = this.servex?.procmon, now = proc?.now;
		if (!now || typeof now.idle_s !== "number") return;   // no sample yet, or this Servex's build has no GetLastInputInfo read
		const running = this.running().filter(g => !this.pending.has(g.pid));
		const game = decide({ idle_min: now.idle_s / 60, free_mb: now.free_mb, running },
			{ idle_min: this.idle_min, tight_mb: this.tight_mb });
		if (game) this.close(game, { idle_min: Math.round(now.idle_s / 60), free_mb: now.free_mb });
	}

	async close(game, { idle_min, free_mb }){
		if (!this.closing){
			this.record({ type: "game-closed", at: stamp(), name: game.name, pid: game.pid, idle_min, free_mb, graceful: null, would: true });
			return;
		}
		await ps(`(Get-Process -Id ${game.pid} -ErrorAction SilentlyContinue).CloseMainWindow()`);
		const timer = setTimeout(async () => {
			this.pending.delete(game.pid);
			const alive = this.servex?.procmon?.procs?.has(game.pid);
			if (alive) await kill(game.pid);
			this.record({ type: "game-closed", at: stamp(), name: game.name, pid: game.pid, idle_min, free_mb, graceful: !alive });
		}, 60000);
		timer.unref?.();
		this.pending.set(game.pid, timer);
	}

	record(entry){
		this.closed.push(entry);
		if (this.closed.length > 50) this.closed.shift();
		this.log(entry);
		this.emit("closed", entry);
	}

	summary(){ return { closed: this.closed.slice(-20) }; }

	line(){
		if (!this.closed.length) return "";
		const last = this.closed[this.closed.length - 1];
		return `Games: ${this.closed.length} closed since start, latest ${last.name} (idle ${last.idle_min} min, ${last.free_mb} MB free).`;
	}
}

/* The whole rule, pure: ALL three must hold, or nothing closes. `config.idle_min`
 * is the THRESHOLD (default 30); `state.idle_min` is how long the PC actually has
 * been idle. Returns the first running game to close, or null. */
export function decide({ idle_min, free_mb, running } = {}, { idle_min: threshold_min = 30, tight_mb = 6144 } = {}){
	if (!running?.length) return null;
	if (!(idle_min > threshold_min)) return null;
	if (!(free_mb < tight_mb)) return null;
	return running[0];
}

function ps(command){
	return new Promise(resolve => execFile("powershell.exe",
		["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", command],
		{ windowsHide: true }, () => resolve()));
}

function kill(pid){
	return new Promise(resolve => execFile("taskkill", ["/PID", String(pid), "/F"], { windowsHide: true }, () => resolve()));
}
