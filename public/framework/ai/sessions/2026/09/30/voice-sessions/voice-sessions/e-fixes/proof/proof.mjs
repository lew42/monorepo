// Proof for voice-fixes: Sessions.js against a STUB agents host. No real agents, no network,
// every file under a scratch repo. Run: node --import ./register.mjs proof.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WT = "C:/Code/lew42/worktrees/voice-fixes";
const FAKE = path.join(HERE, "fakerepo");
fs.rmSync(FAKE, { recursive: true, force: true });
for (const d of ["public/framework/ext/Session", "public/framework/ext/Chat", "Servex/agents"]) fs.mkdirSync(path.join(FAKE, d), { recursive: true });
process.env.SERVEX_HOME = path.join(HERE, "servex-home");
fs.mkdirSync(process.env.SERVEX_HOME, { recursive: true });
const { default: Sessions } = await import(pathToFileURL(path.join(WT, "Servex/agents/Sessions.js")).href);

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// A stub host: spawn() returns a fake agent; send() answers after `reply_ms` through agents.watch().
function stub_host(reply_ms = 100){
	const agents = { live: new Map(), n: 0, spawned: [], watch(){},
		spawn(spec){ const a = { id: spec.id ?? `${spec.role}-${++this.n}`, role: spec.role, state: "idle", session_id: "sid-" + this.n, spec };
			this.live.set(a.id, a); this.spawned.push(spec); return a; },
		send(id, text){ const a = this.live.get(id); a.state = "working";
			setTimeout(() => { a.state = "idle"; this.watch({ type: "result", text: `${a.role} heard: ${text.slice(0, 40)}` }, a); }, reply_ms); },
		stop(id){ const a = this.live.get(id); if (a) a.state = "stopped"; } };
	return { agents, projects: [{ name: "monorepo", port: 8481, dir: FAKE }, { name: "other", port: 9000, dir: "C:/elsewhere" }] };
}
const lines = file => fs.readFileSync(path.join(FAKE, "public", file), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const log_of = dir => { try { return fs.readFileSync(path.join(FAKE, dir, "ai/log.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } };

// ── item 4 + 9: a pre-existing session with no log.jsonl line, whose last line is the owner's ──
const pre = { id: "v-old1", home: "/framework/ext/Session/", file: "/framework/ext/Session/ai/v-old1.jsonl", at: "2026-09-29T10:00:00.000-05:00",
	last_at: new Date(Date.now() - 10 * 60000).toISOString(), host: "10.0.0.135:8481", path: "/framework/ext/Session/", visited: ["/framework/ext/Session/", "/framework/ext/Chat/"], backing: {} };
const sfile = path.join(HERE, "sessions.json");
fs.writeFileSync(sfile, JSON.stringify({ "v-old1": pre }));
fs.mkdirSync(path.join(FAKE, "public/framework/ext/Session/ai"), { recursive: true });
fs.writeFileSync(path.join(FAKE, "public", pre.file), JSON.stringify({ session: { id: "v-old1" } }) + "\n"
	+ JSON.stringify({ chat: { at: "2026-09-29T10:00:01.000-05:00", from: { kind: "owner" }, text: "are you there?" } }) + "\n");

const host = stub_host();
const S = new Sessions({ repo: FAKE, file: sfile, servex: host, quiet_ms: 200, idle_ms: 60000 });
S.install();
check("4 backfill: one started line per folder of an old session", log_of("public/framework/ext/Session").some(l => l.session?.id === "v-old1") && log_of("public/framework/ext/Chat").some(l => l.session?.id === "v-old1"));
S.backfill();
check("4 backfill is idempotent and append-only", log_of("public/framework/ext/Session").filter(l => l.session?.id === "v-old1").length === 1);
const sys = lines(pre.file).filter(l => l.chat?.from?.kind === "system");
check("9 an unanswered owner line gets one Servex line on install", sys.length === 1 && /Say it again/.test(sys[0].chat.text), sys[0]?.chat.text);
S.unanswered();
check("9 ... and only once", lines(pre.file).filter(l => l.chat?.from?.kind === "system").length === 1);

// ── item 8: project, not host ──
check("8 project_of: phone ip:port -> monorepo", S.project_of("10.0.0.135:8481") === "monorepo");
check("8 project_of: monorepo.localhost -> monorepo", S.project_of("monorepo.localhost") === "monorepo");
check("8 project_of: other port -> other", S.project_of("10.0.0.135:9000") === "other");
const pc = S.recent({ page: "/framework/ext/Session/", host: "monorepo.localhost" });
check("8 the PC sees the phone's session (resume check uses the same list)", pc.some(r => r.session === "v-old1"));
check("8 another site never sees it", !S.recent({ page: "/framework/ext/Session/", host: "other.localhost" }).length);
const again = S.create({ path: "/framework/ext/Session/", host: "monorepo.localhost" });
check("8+4 /new from the PC within the hour resumes the phone's old session", again.resumed && again.session === "v-old1");

// ── item 6: repo folders ──
const dl = S.dir_log({ dir: "Servex/agents", line: { decision: { text: "t", file: "/x.jsonl" } } });
check("6 dir_log accepts a repo folder", dl.ok && log_of("Servex/agents").length === 1, dl.file);
check("6 dir_log still accepts a site path", S.dir_log({ dir: "/framework/ext/Chat/", line: { decision: { text: "t", file: "/x.jsonl" } } }).ok);
let threw = false; try { S.dir_log({ dir: "../outside", line: { decision: { text: "t", file: "/x" } } }); } catch { threw = true; }
check("6 a folder outside the repo is refused", threw);

// ── item 12: a refinement without re ──
threw = false; try { S.line({ session: "v-old1", text: "clean words", level: "clean" }); } catch { threw = true; }
check("12 session_line refuses a level with no re", threw);

// ── item 4 (floor): the fast reply is held while speaking ──
const made = S.create({ path: "/framework/ext/Chat/", host: "10.0.0.135:8481" });
const fresh = made.resumed ? null : made;
const sid = made.session;
const fast_lines = () => lines(S.map[sid].file).filter(l => l.chat?.from?.id === "fast");
S.say({ session: sid, path: "/framework/ext/Chat/", text: "so the first thing is", via: "voice", floor: "speaking", cues: { pauses: [], speaking_ms: 900 } });
await sleep(400);
const owner = lines(S.map[sid].file).filter(l => l.chat?.from?.kind === "owner").pop();
check("4 floor + cues are stored on the owner's line", owner?.chat.floor === "speaking" && owner.chat.cues?.speaking_ms === 900);
check("4 while speaking: the fast reply is held, no line", fast_lines().length === 0, `held=${S.held.has(sid)}`);
check("4 while speaking: the smart gap keeps restarting", !lines(S.map[sid].file).some(l => l.chat?.from?.id === "smart"));
const t0 = Date.now();
const fl = S.floor({ session: sid, floor: "done" });
const dt = Date.now() - t0;
check("4 /floor done releases the held fast reply at once", fl.released && fast_lines().length === 1, `${dt} ms`);
await sleep(600);
check("4 after done: the smart one answers too", lines(S.map[sid].file).some(l => l.chat?.from?.id === "smart"));
S.say({ session: sid, path: "/framework/ext/Chat/", text: "a say with no floor" });
await sleep(250);
check("4 a say with no floor is not held", fast_lines().length === 2);

// ── item 11: ended, with the title, in every folder, on a room() stop ──
S.summarize({ session: sid, title: "Floor test", summary: "one line" });
S.nav({ session: sid, from: "/framework/ext/Chat/", to: "/framework/ext/Session/" });
S.sleep(S.map[sid], `room for someone`);
const ended = ["public/framework/ext/Chat", "public/framework/ext/Session"].map(d => log_of(d).filter(l => l.session?.id === sid && l.session.event === "ended"));
check("11 a room() stop writes ended in every folder, with the title", ended.every(e => e.length === 1 && e[0].session.title === "Floor test"));

// ── item 2: the sweep spares a pair that is mid-turn ──
const S2 = S.map[sid];
S2.fast = null; S2.smart = null;
S.say({ session: sid, path: "/framework/ext/Session/", text: "wake" });
await sleep(20);
S2.last_at = new Date(Date.now() - 10 * 60000).toISOString();
host.agents.live.get(S2.smart ?? S2.fast).state = "working";
S.sweep();
check("2 the idle sweep skips a pair with a working agent", S.awake(S2, "fast") || S.awake(S2, "smart"));

// ── the files stay append-only ──
check("append-only: the session file only grew (line 1 is still the session line)", lines(S.map[sid].file)[0].session?.id === sid);

clearInterval(S.sweeper);
fs.writeFileSync(path.join(HERE, "proof.json"), JSON.stringify(results, null, 2));
console.log(`${results.filter(r => r.ok).length}/${results.length} pass`);
process.exit(0);
