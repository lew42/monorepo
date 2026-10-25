#!/usr/bin/env node
// Server/FollowCost.mjs: what following a child's log costs a mastermind (the AI system mastermind, 2026-10-24, brief item 19).
// Reads Servex's own agent logs (logs/agent-<id>.jsonl). A follow delivery is an `agent_msg` from "servex-follow"; the turn it wakes
// is the next `turn_cost` line. Per follower: deliveries, tokens delivered (chars / 4), the lines by class, and the dollars of the
// wake-up turns (only turns woken by follow messages alone). Nothing is estimated except tokens.
//   node Server/FollowCost.mjs [--days 3] [--json] [--agent <id>]
// Classes of a forwarded line are Follow.kind's: state, pointer, watcher, other. Only state and pointer are worth a wake-up (Follow now forwards only those to a parent).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import Follow from "../Servex/Follow.js";

const home = () => process.env.SERVEX_HOME ?? path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"), "lew42", "servex");
const tokens = s => Math.ceil(String(s).length / 4);
const classify = line => Follow.kind(line);   // one definition of a state line: Servex/Follow.js

export function follow_cost(text, { since = 0 } = {}){
	const out = { deliveries: 0, tokens: 0, lines: { state: 0, pointer: 0, watcher: 0, other: 0 }, tokens_by: { state: 0, pointer: 0, watcher: 0, other: 0 }, wake_turns: 0, wake_usd: 0, kept_tokens: 0, kept_lines: 0, silent: 0 };
	let proc = 0, last = 0, pending = null;   // pending: { follow_only } for the messages since the last turn
	for (const raw of String(text).split("\n")){
		if (!raw.includes('"agent_msg"') && !raw.includes('"turn_cost"') && !raw.includes('"state":"started"') && !raw.includes('"type":"renew"')) continue;
		let j; try { j = JSON.parse(raw); } catch { continue; }
		if (j.type === "process" && j.state === "started"){ proc = 0; continue; }
		if (j.type === "renew"){ proc = last = 0; continue; }
		if (j.type === "agent_msg"){
			if (!(Date.parse(j.at) >= since)) { pending = pending ? { follow_only: false } : null; continue; }
			const mine = j.from === "servex-follow";
			pending = pending ? { follow_only: pending.follow_only && mine } : { follow_only: mine };
			if (!mine) continue;
			out.deliveries++;
			const before = out.kept_lines;
			out.tokens += tokens(j.text);
			for (const l of String(j.text).split("\n").slice(1)) {
				if (!l.startsWith("{")) continue;
				const c = classify(l);
				out.lines[c]++; out.tokens_by[c] += tokens(l);
				const kept = Follow.worth_waking([l]);   // what the parent is sent now
				if (kept.length){ out.kept_lines++; out.kept_tokens += tokens(kept[0]); }
			}
			if (out.kept_lines === before) out.silent++;   // nothing left after the filter: this delivery would not wake the parent
			continue;
		}
		if (!("turn_cost" in j)) continue;
		const total = Number.isFinite(j.sdk_total) ? j.sdk_total : proc + (Number(j.turn_cost) || 0);
		const cost = total >= last ? total - last : total;
		proc = last = total;
		if (pending?.follow_only){ out.wake_turns++; out.wake_usd += cost; }
		pending = null;
	}
	out.wake_usd = Math.round(out.wake_usd * 1e4) / 1e4;
	return out;
}

const main = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (main){
	const args = process.argv.slice(2);
	const arg = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
	const since = Date.now() - (Number(arg("--days")) || 3) * 864e5, only = arg("--agent");
	const dir = path.join(home(), "logs");
	const rows = [];
	for (const f of fs.readdirSync(dir)){
		const m = /^agent-(.+)\.jsonl$/.exec(f); if (!m || (only && m[1] !== only)) continue;
		let text; try { text = fs.readFileSync(path.join(dir, f), "utf8"); } catch { continue; }
		if (!text.includes('"from":"servex-follow"')) continue;
		const r = follow_cost(text, { since });
		if (r.deliveries) rows.push({ agent: m[1], ...r });
	}
	rows.sort((a, b) => b.wake_usd - a.wake_usd);
	const sum = k => rows.reduce((n, r) => n + r[k], 0);
	const lines = c => rows.reduce((n, r) => n + r.lines[c], 0), tok = c => rows.reduce((n, r) => n + r.tokens_by[c], 0);
	const total = { deliveries: sum("deliveries"), tokens: sum("tokens"), wake_turns: sum("wake_turns"), wake_usd: Math.round(sum("wake_usd") * 100) / 100, kept_lines: sum("kept_lines"), kept_tokens: sum("kept_tokens"), silent: sum("silent"),
		lines: Object.fromEntries(["state", "pointer", "watcher", "other"].map(c => [c, lines(c)])), tokens_by: Object.fromEntries(["state", "pointer", "watcher", "other"].map(c => [c, tok(c)])) };
	if (args.includes("--json")){ console.log(JSON.stringify({ since: new Date(since).toISOString(), total, rows }, null, 2)); process.exit(0); }
	console.log(`Following, last ${(Date.now() - since) / 864e5} days: ${total.deliveries} deliveries, ${total.tokens} tokens delivered, ${total.wake_turns} wake-up turns costing $${total.wake_usd}.`);
	console.log(`Lines forwarded: ${Object.entries(total.lines).map(([c, n]) => `${c} ${n} (${total.tokens_by[c]} tok)`).join(", ")}.`);
	console.log(`With Follow's filter ${total.silent} of the ${total.deliveries} deliveries send nothing (no wake-up) and a parent is sent ${total.kept_lines} of those lines, ${total.kept_tokens} tokens (${Math.round(100 * total.kept_tokens / Math.max(1, total.tokens))}% of what was delivered).`);
	for (const r of rows.slice(0, 12)) console.log(`  ${r.agent.padEnd(40)} ${String(r.deliveries).padStart(4)} deliveries  ${String(r.tokens).padStart(7)} tok  ${String(r.wake_turns).padStart(4)} wake turns  $${r.wake_usd.toFixed(2)}`);
}
