/* `node Server/collab.mjs <taskdir> [--mock]`
 * Runs one collaboration: a spec at `<taskdir>/collab.json` names a question, a kind (research |
 * design) and a list of members. Each member is one Servex agent that lives for the whole run.
 * Phases run strictly in order — every member finishes a phase before the next phase starts — but
 * the members WITHIN a phase run in parallel. Every step appends one line to `<taskdir>/collab.jsonl`
 * (the contract both this runner and the live page share: `collab-format.md` beside this doc).
 *
 * research: facts (the simple, foundational truths, together) -> brief (answer + rough web search,
 * sources listed) -> read-peers (read 1-2 peers' briefs) -> revise (rewrite your own) -> vote.
 * design: facts -> names (class, properties, methods+args) -> vote (on names) -> implement
 * (everyone builds the WINNING names) -> cross-review (read peers' code) -> vote (on implementations).
 *
 * 2026-09-28 (collab-format.md "facts first, disputes, and abstaining"): `facts` always runs
 * first — every member lists simple, foundational truths ("always X", "never Y") with a
 * certainty (settled/likely/open); the runner merges them by normalized text into one canonical
 * list. `open` facts are named in the NEXT phase's prompt as what to dig into. Any member, in
 * any LATER phase, may drop `<its dir>/dispute.json` to challenge a fact — a disputed `settled`
 * fact drops to `likely`. A vote may also be `{"abstain": true}` instead of a pick: a member who
 * has no opinion says so explicitly, rather than being silently read as "didn't vote".
 *
 * Members are Servex agents, spawned with `role: "minion"` — a worker may only spawn a minion or a
 * helper (`spawn_agent` refuses `role: "member"`, proven live before writing this). One `spawn_agent`
 * per member (phase 1), then `send_to_agent` + `wait_for_agent` for every later phase, `stop_agent`
 * at the end — always, even on error, so a run never leaves an agent running.
 *
 * Cost: `wait_for_agent`'s answer carries a `cost` field, but it is CUMULATIVE for that agent's whole
 * life, so a phase's own cost is this wait's cost minus the member's cost after the previous phase
 * (proven with a one-line Haiku probe before writing this: first turn cost 0.0427685, same after
 * stop — a single number that only grows).
 *
 * `--mock`: no Servex calls at all — canned files and votes, so the phases, the tally rules and the
 * page reading collab.jsonl can all be proven for $0.
 *
 * A `decision` line's `counts` always lists every option, zero included — never only the ones that
 * got a vote (Added 14:25). With `target: {module, class}` in `collab.json`, the design names phase
 * also asks for a sidecar `<n>-names.json`; once the names vote is decided, one `named` line per
 * class/property/method of the WINNING set goes to `public/framework/ai/collab/decisions.jsonl`.
 *
 * Every Node spawn sets `windowsHide: true` (matches the rest of Server/, even though this file's
 * only child process is `git rev-parse`, used once to find the repo root). Never throws: a member
 * that errors is logged `status: "error"` and the run carries on without it. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const MCP = "http://127.0.0.1:8090/mcp";
const DEFAULT_TIMEOUT_S = 600; // 10 minutes per member per phase

// 2026-09-28: a `facts` phase always runs first — the members list the simple, foundational
// truths together before any drafting starts, so `open` ones can steer where the digging goes
// (collab-format.md's new "facts first" section).
const DEFAULT_PHASES = {
	research: [{ n: 1, kind: "facts" }, { n: 2, kind: "brief" }, { n: 3, kind: "read-peers" }, { n: 4, kind: "revise" }, { n: 5, kind: "vote" }],
	design: [{ n: 1, kind: "facts" }, { n: 2, kind: "names" }, { n: 3, kind: "vote" }, { n: 4, kind: "implement" }, { n: 5, kind: "cross-review" }, { n: 6, kind: "vote" }],
};

const now = () => { const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`; };
function appendJSON(file, obj) {
	let lead = ""; try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.appendFileSync(file, lead + JSON.stringify(obj) + "\n");
}
const rel = (root, p) => path.relative(root, p).replaceAll("\\", "/");

async function mcp(name, args, ms = 30000) {
	const r = await fetch(MCP, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }), signal: AbortSignal.timeout(ms) });
	const j = await r.json();
	const text = j.result?.content?.[0]?.text ?? j.error?.message ?? "";
	try { return JSON.parse(text); } catch { return { raw: text }; }
}

// 1-2 peers, round-robin after this member, never itself.
function peersFor(ids, i) {
	const count = Math.min(2, ids.length - 1);
	const out = [];
	for (let k = 1; k <= count; k++) out.push(ids[(i + k) % ids.length]);
	return out;
}

const fileFor = (taskDir, id, phase) => path.join(taskDir, "collab", id, `${phase.n}-${phase.kind}.${phase.kind === "vote" || phase.kind === "facts" ? "json" : "md"}`);
const disputeFileFor = (taskDir, id) => path.join(taskDir, "collab", id, "dispute.json");
// The runner's own canonical facts list, written once the `facts` phase has merged (real bug,
// found running a real collab — real-run-2 — not by review: a member disputing a fact had no
// way to know the REAL id to name, so it invented one that matched nothing and its dispute
// silently did nothing). `header()` points every later phase's prompt at this file.
const factsFileFor = taskDir => path.join(taskDir, "collab", "facts.json");
// Added 14:25: with collab.json's `target`, the names phase also asks for a sidecar names.json.
const namesJsonFor = (taskDir, id, phase) => path.join(taskDir, "collab", id, `${phase.n}-names.json`);

// Everything every prompt repeats: the question, the context, the member's own write-only dir.
// `mentionDispute`: false only for the `facts` phase's own prompt — before that phase has run,
// there are no canonical fact ids yet for a member to reference in a dispute (review finding 3:
// harmless either way, since `checkDisputes` silently no-ops on an unknown id, but the line is
// premature there and every OTHER phase does have facts to point at).
function header(spec, root, taskDir, member, mentionDispute = true) {
	const ctx = (spec.context || []).map(f => rel(root, path.join(root, f)));
	const dir = rel(root, path.join(taskDir, "collab", member.id));
	return `You are "${member.id}", one member of a collaboration. Repo root: ${root.replaceAll("\\", "/")}.\n`
		+ `Question: ${spec.question}\n`
		+(ctx.length ? `Context to read first: ${ctx.join(", ")}\n` : "")
		+ `Write ONLY inside your own directory, ${dir}/ — never anywhere else, and never write to `
		+ `collab.jsonl yourself: the runner is its only writer, and a stray line from you corrupts `
		+ `the whole run's log for every reader.\n`
		+ (mentionDispute ? `If a fact looks wrong, write one line to ${rel(root, disputeFileFor(taskDir, member.id))}: {"fact": "<fact id>", "why": "<one line>"} — the current facts, WITH THE REAL IDS TO USE, are listed in ${rel(root, factsFileFor(taskDir))}.\n` : "")
		+ `\n`;
}

// `openFacts`: the texts of every `open` fact once the `facts` phase has merged and run —
// `[]` before then. Only `brief`/`names` (the phase right after `facts`) surface it, per
// collab-format.md: "Open facts to dig into: <text> (<text>)…".
function promptFor(spec, root, taskDir, member, phase, ids, lastContentPhase, namesWinner, openFacts) {
	const h = header(spec, root, taskDir, member, phase.kind !== "facts");
	const out = rel(root, fileFor(taskDir, member.id, phase));
	const peers = peersFor(ids, ids.indexOf(member.id)).map(p => rel(root, fileFor(taskDir, p, lastContentPhase)));
	const openLine = (openFacts && openFacts.length) ? `Open facts to dig into: ${openFacts.map(t => `(${t})`).join(" ")}\n` : "";
	switch (phase.kind) {
		case "facts":
			return h + `List simple, foundational truths about this question: "always X", "never Y", "one A per B", "before X, do Y". Write "never"/"always" only for what actually breaks; anything else is "likely". Write ${out} as JSON: an array of {"id": "<your own short id>", "text": "<the fact>", "certainty": "settled" | "likely" | "open"}.`;
		case "brief":
			return h + openLine + `Answer the question with a rough web search (WebSearch/WebFetch) — a few searches, not exhaustive. Write ${out}: your answer, then a short "Sources" list of the pages you used.`;
		case "read-peers":
			return h + `Read these peers' briefs: ${peers.join(", ")}. Write ${out}: one or two plain sentences per peer on what they found that you missed, or "nothing new" if so.`;
		case "revise":
			return h + `Using what you read from peers, rewrite your own answer. Write ${out}: the improved answer.`;
		case "names":
			return h + openLine + `Propose an object-oriented design for this: the class name, its properties, its methods and each method's arguments — no implementation yet. Write ${out}.`
				+ (spec.target ? ` Also write ${rel(root, namesJsonFor(taskDir, member.id, phase))} as JSON, matching your prose exactly: {"class": "<class name>", "properties": ["<name>", ...], "methods": [{"name": "<name>", "args": ["<arg>", ...]}, ...]}.` : "");
		case "implement":
			return h + (namesWinner ? `The group voted on names; the winner is ${namesWinner.id}'s proposal:\n\n${namesWinner.text}\n\nImplement exactly these names (JS).` : `Implement your own names proposal (JS).`) + ` Write ${out} as a fenced code block plus one sentence on any judgment call you made.`;
		case "cross-review":
			return h + `Read these peers' implementations: ${peers.join(", ")}. Write ${out}: for each, is it functionally the same as yours? What is better about it, if anything?`;
		case "vote": {
			const candidates = ids.filter(id => id !== member.id);
			const files = candidates.map(id => rel(root, fileFor(taskDir, id, lastContentPhase)));
			return h + `Read the ${lastContentPhase.kind} files of: ${candidates.map((id, i) => `${id} (${files[i]})`).join(", ")}. Pick the one you think is best — never yourself. Write ${out} as JSON: {"pick": "<member id>", "caveat": "<the one improvement you would make, or empty string if none>"}. If you have no opinion, write {"abstain": true} instead — a member weighs in only where something looks false, misleading or easy to get wrong.`;
		}
	}
}

// counts, winner, and which tie-break rule fired.
function tallyVotes(votes, costs) {
	const counts = {};
	for (const v of votes) counts[v.pick] = (counts[v.pick] || 0) + 1;
	const max = Math.max(0, ...Object.values(counts));
	let tied = Object.keys(counts).filter(id => counts[id] === max);
	let rule = "most votes";
	if (tied.length > 1) {
		const free = id => votes.filter(v => v.pick === id && !(v.caveat || "").trim()).length;
		const fmax = Math.max(...tied.map(free));
		const tied2 = tied.filter(id => free(id) === fmax);
		rule = "tie: more caveat-free votes";
		if (tied2.length > 1) { tied2.sort((a, b) => (costs[a] ?? 0) - (costs[b] ?? 0)); rule = "tie: cheaper member"; tied = [tied2[0]]; }
		else tied = tied2;
	}
	return { counts, winner: tied[0], rule };
}

function mockContent(phase, member) {
	if (phase.kind === "vote") return null; // votes are computed separately below
	return `# ${member.id} — phase ${phase.n} (${phase.kind})\n\nMock content, no agent ran.\n`;
}

// Deterministic canned facts for `--mock`: every member lists roughly the same three. Merging
// requires EVERY member who listed a fact to call it settled before the fact itself is settled
// (mergeFacts, below), so: f1 is settled by all three members and merges to `settled`; f2 is
// called settled by only ONE member (index 1) and likely by the other two, so it merges to
// `likely` — one dissenter is enough to keep a fact off `settled`; f3 is called open by all
// three and merges to `open` (feeds the next phase's "open facts to dig into" line). `index` is
// the member's position in `ids`, just so the mock isn't three byte-identical files.
function mockFacts(member, index) {
	return [
		{ id: "f1", text: "Read a member's own context file before writing its own answer.", certainty: "settled" },
		{ id: "f2", text: "A member never votes for itself.", certainty: index === 1 ? "settled" : "likely" },
		{ id: "f3", text: "Whether cost per phase is comparable across differently-priced models", certainty: "open" },
	];
}

// Deliverable 2: merge every active member's own `<n>-facts.json` by normalized text
// (case/whitespace-insensitive) into one canonical list. Settled only if EVERY member who
// listed a fact called it settled; open if ANY member called it open; likely otherwise.
const normFact = t => String(t || "").trim().toLowerCase().replace(/\s+/g, " ");
// The canonical id is a short slug of the fact's own TEXT, not a member's own `id` field —
// members don't coordinate ids with each other, so two members' ids for the same fact could
// disagree or collide. (Deliverable 2: "your call, document it in a comment.")
function factSlug(text, used) {
	let s = String(text || "fact").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "fact";
	let id = s, n = 2;
	while (used.has(id)) id = `${s}-${n++}`;
	used.add(id);
	return id;
}
function mergeFacts(taskDir, ids, phase, errored) {
	const groups = new Map();
	for (const id of ids) {
		if (errored.has(id)) continue;
		let arr;
		try { arr = JSON.parse(fs.readFileSync(fileFor(taskDir, id, phase), "utf8")); } catch { continue; }
		if (!Array.isArray(arr)) continue;
		for (const f of arr) {
			if (!f?.text) continue;
			const key = normFact(f.text);
			const g = groups.get(key) ?? groups.set(key, { text: String(f.text).trim(), certainties: [] }).get(key);
			g.certainties.push(f.certainty === "settled" || f.certainty === "open" ? f.certainty : "likely");
		}
	}
	const used = new Set();
	return [...groups.values()].map(g => ({
		id: factSlug(g.text, used),
		text: g.text,
		certainty: g.certainties.some(c => c === "open") ? "open" : g.certainties.every(c => c === "settled") ? "settled" : "likely",
		// Filled in by `checkDisputes` as the run goes — kept on the SAME object main() holds
		// in `factsState.byId`/`.list`, so `tally.md`'s own "## Facts" section can read every
		// fact's disputes back at the end without re-reading `collab.jsonl` (review finding 1).
		disputes: [],
	}));
}

// Deliverable 3: any member may drop `<dir>/dispute.json` in any phase after `facts`. Called
// after EVERY phase (not just `facts`) — collab-format.md's "simplest is fine": just re-read
// every active member's dir each time, and consume (delete) the file once read so the same
// dispute is never logged twice. A disputed `settled` fact drops to `likely`, written as a
// fresh `fact` line (same id, later line wins — Collab.js's on_fact upserts, same rule as
// `decision`); an `open` fact is never touched by a dispute (already the least certain there is).
function checkDisputes(taskJsonl, taskDir, ids, errored, factsById) {
	for (const id of ids) {
		if (errored.has(id)) continue;
		const f = disputeFileFor(taskDir, id);
		let d;
		// A malformed dispute.json is deleted too, not just an ENOENT (the common case,
		// nothing to delete either way) — otherwise a member's typo keeps failing to parse
		// and never gets a second chance to write a good one (review finding 4).
		try { d = JSON.parse(fs.readFileSync(f, "utf8")); } catch { try { fs.unlinkSync(f); } catch {} continue; }
		if (d?.fact && d?.why) {
			appendJSON(taskJsonl, { dispute: { at: now(), fact: d.fact, member: id, why: d.why } });
			const fact = factsById.get(d.fact);
			if (fact) {
				// Every dispute is kept, even one that doesn't move the certainty (Collab.js's
				// own on_dispute does the same) — so `tally.md` can list WHY a fact was
				// questioned, not just whether it survived settled.
				fact.disputes.push({ member: id, why: d.why });
				if (fact.certainty === "settled") {
					fact.certainty = "likely";
					appendJSON(taskJsonl, { fact: { at: now(), id: fact.id, text: fact.text, certainty: "likely" } });
				}
			}
		}
		try { fs.unlinkSync(f); } catch {}
	}
}

/* Added 14:15 (collab-format.md): every vote phase is one decision — written "open" (itemizing the
 * previous phase's outputs as options), then rewritten "decided" (same id, later line wins) — plus
 * a scoreboard line per option in a shared, append-only file, so a model that never wins can be
 * spotted and (with `auto_retire`) swapped out automatically. */
const scoreboardPath = root => path.join(root, "public/framework/ai/collab/scoreboard.jsonl");
const collabRelId = (root, taskDir) => path.relative(path.join(root, "public/framework/ai"), taskDir).replaceAll("\\", "/");
function readScoreboard(root) {
	try { return fs.readFileSync(scoreboardPath(root), "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l).score; } catch { return null; } }).filter(Boolean); }
	catch { return []; }
}
// per model: decisions entered, wins, cost, from non-overrule score lines only.
function scoreAgg(root) {
	const agg = {};
	for (const r of readScoreboard(root)) { if (r.overrule) continue; const m = agg[r.model] ||= { decisions: 0, wins: 0, cost: 0 }; m.decisions++; if (r.won) m.wins++; m.cost += r.cost || 0; }
	return agg;
}
// >=5 decisions, win rate under 15%, cost/decision above the median of models with >=5 decisions.
function retiredModels(root) {
	const agg = scoreAgg(root);
	const withN = Object.entries(agg).filter(([, v]) => v.decisions >= 5);
	if (!withN.length) return { retired: new Set(), agg };
	const perDecision = withN.map(([, v]) => v.cost / v.decisions).sort((a, b) => a - b);
	const median = perDecision[Math.floor(perDecision.length / 2)];
	return { retired: new Set(withN.filter(([, v]) => v.wins / v.decisions < 0.15 && v.cost / v.decisions > median).map(([m]) => m)), agg };
}
// itemize the last content phase's outputs as Decision options (ux/Content shape: key, say, caveat).
function decisionOptions(root, taskDir, ids, errored, lastContentPhase) {
	return ids.filter(id => !errored.has(id)).map(id => {
		const f = fileFor(taskDir, id, lastContentPhase);
		let say = id;
		try { const line = (fs.readFileSync(f, "utf8").split(/\r?\n/).find(l => l.trim()) || "").trim().slice(0, 140); say = `${id}: ${line}`; } catch {}
		return { key: id, say, caveat: "", file: rel(root, f) };
	});
}
function decisionConfig(spec, phase, isNamesVote) {
	const cfg = (spec.decisions || []).find(d => d.phase === phase.n) || {};
	return { ask: cfg.ask || (isNamesVote ? "Which names set wins?" : `Which ${spec.kind === "design" ? "implementation" : "draft"} wins?`), package: cfg.package !== undefined ? cfg.package : isNamesVote, parent: cfg.parent || null };
}
function runnerUp(counts, winner) {
	const rest = Object.entries(counts).filter(([id]) => id !== winner).sort((a, b) => b[1] - a[1]);
	return rest.length ? rest[0][0] : null;
}

/* Added 14:25 (collab-format.md): a design `collab.json` may carry `target: {module, class}`. The
 * names phase then also asks for `<n>-names.json`; once the names vote (a package decision) is
 * decided, one `named` line per class/property/method of the WINNING set goes to the shared,
 * append-only `public/framework/ai/collab/decisions.jsonl`, so ext/Doc can link a ⋯ after any name
 * it finds there without an AI having to remember to wire the link. A missing or malformed
 * names.json is logged and skipped — never thrown. */
const decisionsPath = root => path.join(root, "public/framework/ai/collab/decisions.jsonl");
// `decPath` is the shared file on a real run, or a copy inside the run's own taskdir under
// `--mock` (deliverable 1c) — appendNamed never knows or cares which.
function appendNamed(decPath, target, data, collab, decisionId) {
	if (!target?.module || !data?.class) throw new Error("names.json has no class, or collab.json's target has no module");
	const rows = [{ kind: "class", member: data.class }, ...(data.properties || []).map(p => ({ kind: "property", member: p })), ...(data.methods || []).map(m => ({ kind: "method", member: m?.name }))];
	for (const r of rows) if (r.member) appendJSON(decPath, { named: { at: now(), module: target.module, class: data.class, member: r.member, kind: r.kind, collab, decision: decisionId } });
}

/* `spawn_agent` can come back `{"id": null, "queued": true, "reason": "only … MB free…"}`
 * when the host is low on memory (Servex's own admission gate, Global.js) — that is a
 * WAIT, never an error. The queued agent's id is deterministic (`Agents.name()`:
 * `${role}-${name}`, lowercased), so poll `list_agents` for that id up to the phase
 * timeout rather than treating "no id yet" as a failure. */
async function spawnMember(name, model, prompt, root, timeoutS) {
	const spawned = await mcp("spawn_agent", { role: "minion", name, model, prompt, effort: "low", permission_mode: "bypassPermissions", cwd: root });
	if (spawned.id) return spawned.id;
	if (!spawned.queued) throw new Error(spawned.why || spawned.raw || "spawn_agent gave no id");
	const expected = `minion-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const deadline = Date.now() + timeoutS * 1000;
	while (Date.now() < deadline) {
		await new Promise(res => setTimeout(res, 5000));
		const list = await mcp("list_agents", {}, 15000);
		const row = (list.agents ?? (Array.isArray(list) ? list : [])).find(a => a.id === expected);
		if (row && row.state && row.state !== "queued" && row.state !== "gone") return row.id;
	}
	throw new Error(`spawn_agent: "${name}" still queued after ${timeoutS}s (${spawned.reason || "no memory"})`);
}

async function runPhase(spec, root, taskDir, taskJsonl, members, phase, ids, lastContentPhase, namesWinner, agents, memberCost, errored, mock, timeoutS, openFacts, factsState) {
	appendJSON(taskJsonl, { phase: { at: now(), n: phase.n, kind: phase.kind, status: "start" } });
	const active = members.filter(m => !errored.has(m.id));
	const results = await Promise.all(active.map(async member => {
		const file = fileFor(taskDir, member.id, phase);
		fs.mkdirSync(path.dirname(file), { recursive: true });
		if (mock) {
			if (phase.kind === "vote") {
				const candidates = ids.filter(id => id !== member.id && !errored.has(id));
				// Proof deliverable: exactly one member abstains, on the first vote phase a mock
				// run reaches — so `--mock` always demonstrates `{"abstain": true}` for $0.
				if (!factsState.abstainUsed && candidates.length) {
					factsState.abstainUsed = true;
					fs.writeFileSync(file, JSON.stringify({ abstain: true }));
				} else {
					const pick = candidates[(ids.indexOf(member.id) + 1) % candidates.length] || candidates[0];
					fs.writeFileSync(file, JSON.stringify({ pick, caveat: "mock: no real caveat" }));
				}
			} else if (phase.kind === "facts") {
				fs.writeFileSync(file, JSON.stringify(mockFacts(member, ids.indexOf(member.id))));
			} else {
				fs.writeFileSync(file, mockContent(phase, member));
				if (phase.kind === "names" && spec.target) fs.writeFileSync(namesJsonFor(taskDir, member.id, phase), JSON.stringify({ class: spec.target.class, properties: ["value"], methods: [{ name: "get", args: [] }] }));
				// Proof deliverable: the first phase after `facts`, one member disputes the
				// settled fact — so `--mock` always demonstrates a settled→likely drop for $0.
				if (!factsState.disputeUsed && ids.indexOf(member.id) === 0) {
					const settled = factsState.list.find(f => f.certainty === "settled");
					if (settled) {
						factsState.disputeUsed = true;
						fs.writeFileSync(disputeFileFor(taskDir, member.id), JSON.stringify({ fact: settled.id, why: "mock: worth a second look" }));
					}
				}
			}
			return { id: member.id, status: "done", file: rel(root, file), cost: 0, agent: "mock" };
		}
		try {
			const prompt = promptFor(spec, root, taskDir, member, phase, ids, lastContentPhase, namesWinner, openFacts);
			if (!agents[member.id]) {
				agents[member.id] = await spawnMember(`collab-${spec.id}-${member.id}`, member.model, prompt, root, timeoutS);
			} else {
				await mcp("send_to_agent", { id: agents[member.id], text: prompt });
			}
			const waited = await mcp("wait_for_agent", { id: agents[member.id], timeout_s: timeoutS }, (timeoutS + 10) * 1000);
			let cum = waited.cost ?? memberCost[member.id] ?? 0;
			// Deliverable 1d, found live 2026-09-28: `wait_for_agent` can return before the
			// turn's own cost has landed in Servex's registry (a real vote came back costed
			// $0) — one short re-check against `list_agents` before trusting a flat number.
			if (fs.existsSync(file) && cum <= (memberCost[member.id] ?? 0)) {
				await new Promise(res => setTimeout(res, 2000));
				try {
					const list = await mcp("list_agents", {}, 15000);
					const row = (list.agents ?? (Array.isArray(list) ? list : [])).find(a => a.id === agents[member.id]);
					if (row && typeof row.cost === "number" && row.cost > cum) cum = row.cost;
				} catch {}
			}
			const phaseCost = Math.max(0, cum - (memberCost[member.id] ?? 0));
			memberCost[member.id] = cum;
			if (waited.timed_out) { errored.add(member.id); return { id: member.id, status: "error", why: "timed out", cost: phaseCost, agent: agents[member.id] }; }
			if (!fs.existsSync(file)) { errored.add(member.id); return { id: member.id, status: "error", why: "no file written", cost: phaseCost, agent: agents[member.id] }; }
			return { id: member.id, status: "done", file: rel(root, file), cost: phaseCost, agent: agents[member.id] };
		} catch (e) {
			errored.add(member.id);
			return { id: member.id, status: "error", why: String(e?.message || e).slice(0, 200), cost: 0, agent: agents[member.id] || null };
		}
	}));
	for (const r of results) appendJSON(taskJsonl, { member: { at: now(), id: r.id, phase: phase.n, status: r.status, ...(r.why ? { why: r.why } : {}), ...(r.file ? { file: r.file } : {}), cost: r.cost, agent: r.agent } });
	const phaseCost = results.reduce((s, r) => s + r.cost, 0);
	appendJSON(taskJsonl, { phase: { at: now(), n: phase.n, kind: phase.kind, status: "done", cost: Number(phaseCost.toFixed(6)) } });

	if (phase.kind === "vote") {
		// Deliverable 1f, found live 2026-09-28: haiku-c's vote file existed on disk even
		// though the runner had already marked it errored on an EARLIER phase (so it never
		// ran this one) — a 1-1 tie was announced as a 1-0 win. The vote file on disk is
		// the ground truth, checked for every spec member, not just the ones this phase
		// actually ran. No file (never ran, or never wrote one) = abstained, not silently
		// dropped, and a vote where fewer than half the members voted is flagged `thin`.
		// Deliverable 4: an EXPLICIT `{"abstain": true}` file is a member who weighed in and
		// chose not to pick — it lands in the same `abstained` bucket as "no file"/"invalid
		// pick" (below), so the tally's count keeps working exactly as before, but it ALSO
		// gets its own `vote` line (`abstain: true`, no `pick`) so the log shows it was a real,
		// deliberate answer, not silence. "No file" / "picked self or someone invalid" still
		// abstain the same as ever, just without that extra line.
		const votes = [], abstained = [];
		for (const id of ids) {
			try {
				const v = JSON.parse(fs.readFileSync(fileFor(taskDir, id, phase), "utf8"));
				if (v.abstain === true) { abstained.push(id); appendJSON(taskJsonl, { vote: { at: now(), phase: phase.n, member: id, abstain: true } }); }
				else if (v.pick && v.pick !== id) { votes.push({ member: id, pick: v.pick, caveat: v.caveat || "" }); appendJSON(taskJsonl, { vote: { at: now(), phase: phase.n, member: id, pick: v.pick, caveat: v.caveat || "" } }); }
				else abstained.push(id);
			} catch { abstained.push(id); }
		}
		const t = tallyVotes(votes, memberCost);
		const thin = votes.length < ids.length / 2;
		appendJSON(taskJsonl, { tally: { at: now(), phase: phase.n, counts: t.counts, winner: t.winner, caveats: votes.map(v => v.caveat).filter(Boolean), rule: t.rule, abstained, thin } });
		return { results, vote: { votes, abstained, thin, ...t } };
	}

	// Deliverable 2: once every active member's own facts are in, merge them into one
	// canonical list and append one `fact` line per merged fact.
	if (phase.kind === "facts") {
		const merged = mergeFacts(taskDir, ids, phase, errored);
		for (const f of merged) appendJSON(taskJsonl, { fact: { at: now(), id: f.id, text: f.text, certainty: f.certainty } });
		return { results, facts: merged };
	}
	return { results };
}

// `node Server/collab.mjs --score <taskdir>`: turn owner `{"chose":…}` overrules into overrule
// score lines, once each (checked against the scoreboard's own `overrule` rows).
function scoreOverrules(root, taskDir) {
	const spec = JSON.parse(fs.readFileSync(path.join(taskDir, "collab.json"), "utf8"));
	const modelOf = Object.fromEntries(spec.members.map(m => [m.id, m.model]));
	const rows = fs.readFileSync(path.join(taskDir, "collab.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	const decisions = {}; for (const l of rows) if (l.decision?.status === "decided") decisions[l.decision.id] = l.decision;
	const already = new Set(readScoreboard(root).filter(s => s.overrule).map(s => s.decision));
	const collab = collabRelId(root, taskDir);
	let n = 0;
	for (const l of rows) {
		if (!l.chose || already.has(l.chose.decision)) continue;
		const d = decisions[l.chose.decision];
		const picked = d?.options?.find(o => o.say === l.chose.option);
		if (!d || !picked || picked.key === d.chosen) continue; // not a real overrule
		for (const [member, won] of [[picked.key, true], [d.chosen, false]])
			appendJSON(scoreboardPath(root), { score: { at: now(), collab, decision: d.id, member, model: modelOf[member], votes: d.counts?.[member] || 0, won, cost: 0, overrule: true } });
		n++;
	}
	console.log(`collab.mjs --score: ${n} overrule(s) scored for ${collab}`);
}

async function main() {
	const argv = process.argv.slice(2);
	const root0 = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd: process.cwd(), encoding: "utf8", windowsHide: true }).stdout.trim() || process.cwd();
	if (argv[0] === "--score") { scoreOverrules(root0, path.resolve(argv[1])); return; }
	const mock = argv.includes("--mock");
	const taskDirArg = argv.find(a => !a.startsWith("--"));
	if (!taskDirArg) { console.error("usage: node Server/collab.mjs <taskdir> [--mock] | node Server/collab.mjs --score <taskdir>"); process.exit(1); }
	const taskDir = path.resolve(taskDirArg);
	const root = root0;
	const spec = JSON.parse(fs.readFileSync(path.join(taskDir, "collab.json"), "utf8"));
	spec.id = spec.id || path.basename(taskDir);
	const members = spec.members;
	const ids = members.map(m => m.id);
	const phases = spec.phases || DEFAULT_PHASES[spec.kind];
	if (!phases) { console.error(`unknown kind "${spec.kind}" and no phases given`); process.exit(1); }
	const timeoutS = spec.timeout_s || DEFAULT_TIMEOUT_S;

	// warn on (and, if asked, swap out) a model the scoreboard says is retired
	const { retired, agg } = retiredModels(root);
	for (const m of members) {
		if (!retired.has(m.model)) continue;
		console.warn(`collab.mjs: model "${m.model}" is retired (low win rate, above-median cost) — member ${m.id}`);
		if (spec.auto_retire) {
			const alt = Object.entries(agg).filter(([mo]) => !retired.has(mo)).sort((a, b) => a[1].cost / a[1].decisions - b[1].cost / b[1].decisions)[0];
			if (alt) { console.warn(`collab.mjs: auto_retire swapped ${m.id}: ${m.model} -> ${alt[0]}`); m.model = alt[0]; }
		}
	}

	fs.mkdirSync(path.join(taskDir, "collab"), { recursive: true });
	// Deliverable 1c: `--mock` writes NOTHING to the shared scoreboard/decisions files —
	// its own copies live inside its own taskdir, so a $0 test run never skews the real
	// model scoreboard or puts a ⋯ link on a class that doesn't exist.
	const sbPath = mock ? path.join(taskDir, "collab", "scoreboard.jsonl") : scoreboardPath(root);
	const decPath = mock ? path.join(taskDir, "collab", "decisions.jsonl") : decisionsPath(root);
	fs.mkdirSync(path.dirname(sbPath), { recursive: true });
	fs.mkdirSync(path.dirname(decPath), { recursive: true });
	const taskJsonl = path.join(taskDir, "collab.jsonl");
	appendJSON(taskJsonl, { collab: { at: now(), id: spec.id, question: spec.question, kind: spec.kind, members, phases } });

	const agents = {}, memberCost = {}, errored = new Set(), costByPhase = {};
	let lastContentPhase = phases[0], namesWinner = null, finalVote = null, decisionN = 0, failReason = null;
	// `facts` phase 2026-09-28: `openFacts` (the open facts' own text) feeds the very next
	// phase's prompt; `factsState` carries the canonical facts (keyed by id, for dispute
	// look-up) and the two "do this once" flags `--mock` uses to prove abstain/dispute for $0.
	let openFacts = [];
	const factsState = { list: [], byId: new Map(), abstainUsed: false, disputeUsed: false };
	try {
		for (const phase of phases) {
			// Deliverable 1b: never march on with nobody left to run a phase.
			if (!members.some(m => !errored.has(m.id))) { failReason = `every member had already errored before phase ${phase.n} (${phase.kind})`; break; }
			let decisionId = null, options = null, isNamesVote = false;
			if (phase.kind === "vote") {
				isNamesVote = lastContentPhase.kind === "names";
				const cfg = decisionConfig(spec, phase, isNamesVote);
				decisionId = `d-${++decisionN}`;
				options = decisionOptions(root, taskDir, ids, errored, lastContentPhase);
				appendJSON(taskJsonl, { decision: { at: now(), id: decisionId, phase: phase.n, parent: cfg.parent, ask: cfg.ask, package: cfg.package, options, status: "open" } });
			}
			const votedOnPhase = lastContentPhase; // the phase whose files this vote (if any) is about
			const r = await runPhase(spec, root, taskDir, taskJsonl, members, phase, ids, lastContentPhase, namesWinner, agents, memberCost, errored, mock, timeoutS, openFacts, factsState);
			costByPhase[phase.n] = Object.fromEntries(r.results.map(x => [x.id, x.cost]));
			// Deliverable 1b: every member of THIS phase erroring is a stop, not a shrug —
			// a vote phase where nobody produced anything is not a vote, it is a failure.
			if (!r.results.some(x => x.status === "done")) { failReason = `every member errored in phase ${phase.n} (${phase.kind})`; break; }
			if (phase.kind === "facts" && r.facts) {
				factsState.list = r.facts;
				for (const f of r.facts) factsState.byId.set(f.id, f);
				openFacts = r.facts.filter(f => f.certainty === "open").map(f => f.text);
				// Real bug, found running a real collab (real-run-2), not by review: with
				// nowhere to LOOK UP a fact's real id, a real member (sonnet-z) invented one
				// for its dispute and it matched nothing, so the dispute logged but never
				// actually moved the fact. Written BEFORE any later phase's prompt goes out —
				// this is the very next line after the facts phase's own runPhase() returns.
				fs.writeFileSync(factsFileFor(taskDir), JSON.stringify(r.facts.map(f => ({ id: f.id, text: f.text, certainty: f.certainty })), null, 2));
			}
			// Deliverable 3: any member's dispute.json from THIS phase, checked after every
			// phase — not just `facts` — per collab-format.md.
			checkDisputes(taskJsonl, taskDir, ids, errored, factsState.byId);
			if (phase.kind !== "vote" && phase.kind !== "facts") lastContentPhase = phase;
			if (phase.kind === "vote") {
				finalVote = r.vote;
				const t = r.vote;
				// Added 14:25: every option keeps its count, zero included — never only the ones that got a vote.
				const counts = Object.fromEntries(options.map(o => [o.key, t.counts[o.key] || 0]));
				const up = runnerUp(counts, t.winner);
				appendJSON(taskJsonl, { decision: { at: now(), id: decisionId, phase: phase.n, status: "decided", counts, chosen: t.winner, runner_up: up, caveats: t.votes.map(v => v.caveat).filter(Boolean), tie_rule: t.rule === "most votes" ? null : t.rule, abstained: t.abstained, thin: t.thin } });
				const phaseCosts = costByPhase[votedOnPhase.n] || {};
				for (const opt of options) appendJSON(sbPath, { score: { at: now(), collab: collabRelId(root, taskDir), decision: decisionId, member: opt.key, model: (members.find(m => m.id === opt.key) || {}).model, votes: counts[opt.key], won: opt.key === t.winner, cost: phaseCosts[opt.key] || 0 } });
				// design's first vote (on names) feeds the winning proposal into "implement", and (with a
				// `target`) indexes the winning names into the shared decisions.jsonl.
				if (isNamesVote && t.winner) {
					try { namesWinner = { id: t.winner, text: fs.readFileSync(fileFor(taskDir, t.winner, votedOnPhase), "utf8") }; } catch {}
					if (spec.target) {
						try { appendNamed(decPath, spec.target, JSON.parse(fs.readFileSync(namesJsonFor(taskDir, t.winner, votedOnPhase), "utf8")), collabRelId(root, taskDir), decisionId); }
						catch (e) { console.warn(`collab.mjs: no usable names.json from winner "${t.winner}" — ${String(e?.message || e).slice(0, 150)}; no decisions.jsonl lines written`); }
					}
				}
			}
		}
	} finally {
		if (!mock) for (const id of Object.values(agents)) { try { await mcp("stop_agent", { id }, 20000); } catch {} }
	}

	// Deliverable 1b: a failed run writes its own `winner` line (status "failed") and exits
	// non-zero — never a normal tally.md pretending the run reached a real conclusion.
	if (failReason) {
		appendJSON(taskJsonl, { winner: { at: now(), pick: null, status: "failed", why: failReason } });
		fs.writeFileSync(path.join(taskDir, "collab", "tally.md"), `# ${spec.question}\n\n**Run failed:** ${failReason}\n`);
		console.error(`collab.mjs: ${spec.kind} "${spec.id}" — FAILED: ${failReason}`);
		process.exitCode = 1;
		return;
	}

	const runCost = Object.values(memberCost).reduce((s, c) => s + c, 0);
	const winnerId = finalVote?.winner;
	// Deliverable 1g: the winner's FILE is its own artifact, never a phase where it wrote
	// about someone else's — "cross-review" and "read-peers" are commentary on peers, not a
	// draft of the member's own. Skip those; the artifact phases in order are brief/names
	// (research/design's first output) and implement (design's own code).
	const REVIEW_KINDS = ["read-peers", "cross-review"];
	const artifactPhases = phases.filter(p => p.kind !== "vote" && !REVIEW_KINDS.includes(p.kind));
	const winnerPhase = artifactPhases.at(-1) ?? phases.filter(p => p.kind !== "vote").at(-1);
	const winnerFile = winnerId ? rel(root, fileFor(taskDir, winnerId, winnerPhase)) : null;
	if (finalVote) appendJSON(taskJsonl, { winner: { at: now(), pick: winnerId, file: winnerFile, caveats: finalVote.votes.map(v => v.caveat).filter(Boolean), cost: Number(runCost.toFixed(6)) } });

	// Review finding 1: the mastermind reads `tally.md`, not the live page — facts and their
	// disputes need to show up here too, not only in `view.js`'s draw. Each fact's own
	// `disputes[]` was collected in place as the run went (`checkDisputes`, above), on the
	// SAME objects `factsState.list` still holds, so no re-read of `collab.jsonl` is needed.
	const factsLines = factsState.list.length
		? ["", "## Facts", ...factsState.list.flatMap(f => [
			`- **${f.certainty}** ${f.text}`,
			...f.disputes.map(d => `  - disputed by ${d.member}: ${d.why}`),
		])]
		: [];
	// "Abstained" covers two different reasons (collab-format.md "Added 14:50"): an explicit
	// `{"abstain": true}` file (a real, deliberate non-pick) and no file / an invalid pick
	// (never weighed in at all) — the count in the heading is every reason together; a reader
	// wanting the split reads the phase's own `vote` lines.
	const abstainedLines = finalVote?.abstained?.length
		? ["", `## Abstained (${finalVote.abstained.length})`, ...finalVote.abstained.map(id => `- ${id}`)]
		: [];
	const md = [
		`# ${spec.question}`,
		"",
		`**Winner:** ${winnerId || "(no vote reached)"}${winnerFile ? ` — \`${winnerFile}\`` : ""}`,
		`**Rule:** ${finalVote?.rule || "n/a"}`,
		finalVote?.thin ? "**⚠ thin: fewer than half the members voted**" : null,
		`**Run cost:** $${runCost.toFixed(4)}`,
		...factsLines,
		"", "## Votes",
		...(finalVote ? Object.entries(finalVote.counts).map(([id, n]) => `- ${id}: ${n} vote(s), $${(memberCost[id] || 0).toFixed(4)}`) : ["(none)"]),
		...abstainedLines,
		"", "## Caveats",
		...(finalVote?.votes.filter(v => v.caveat).map(v => `- ${v.member}: ${v.caveat}`) || ["(none)"]),
	].filter(l => l !== null).join("\n") + "\n";
	fs.writeFileSync(path.join(taskDir, "collab", "tally.md"), md);
	console.log(`collab.mjs: ${spec.kind} "${spec.id}" — winner ${winnerId || "none"}, $${runCost.toFixed(4)}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });
