// Round 4 step 3c: the owner's asks, deduplicated, clustered by Haiku in chunks, then merged. -> %TEMP%/pw/asks-<N>d.json
// node asks.mjs prep|chunks|merge [days=30]   prep = script only (builds the ask list and prints its size)
import fs from "node:fs"; import path from "node:path"; import { haiku, json, spent } from "./haiku.mjs";
const [step, d] = process.argv.slice(2), days = +d || 30, T = path.join(process.env.TEMP, "pw");
const F = n => path.join(T, `${n}-${days}d.json`);
if (step === "prep") {
	const ALL = JSON.parse(fs.readFileSync(F("prompts"), "utf8")), seen = new Set(), asks = [];
	for (const p of ALL) {
		const m = p.t.match(/^\[from: owner[^\]]*\]\s*(?:\[on ([^\]]*?)(?: at (\d{4}-[\d\-T:.+]+))?\])?\s*([\s\S]*)$/); if (!m) continue;
		const text = m[3].replace(/\(the owner has stopped[^)]*\)/gi, "").replace(/\s+/g, " ").trim(); if (text.length < 25) continue;
		const key = m[2] || text.slice(0, 80); if (seen.has(key)) continue; seen.add(key);   // a dictation forwarded into several sessions is ONE ask: key = its own timestamp
		asks.push({ id: asks.length + 1, at: m[2] || p.at, sid: p.sid, page: m[1] || "", text: text.length > 380 ? text.slice(0, 250) + " … " + text.slice(-120) : text });
	}
	asks.sort((a, b) => a.at.localeCompare(b.at)); asks.forEach((a, i) => a.id = i + 1);
	fs.writeFileSync(F("asks"), JSON.stringify(asks)); const ch = asks.reduce((n, a) => n + a.text.length, 0);
	console.log(JSON.stringify({ promptsIn: ALL.length, uniqueOwnerAsks: asks.length, chars: ch, estTokens: Math.round(ch / 2.9), estHaikuInputUsd: +(ch / 2.9 / 1e6).toFixed(2) }));
}
if (step === "chunks") {
	const asks = JSON.parse(fs.readFileSync(F("asks"), "utf8")), SYS = `You read numbered messages that one person dictated to AI coding agents over several weeks. Find the requests, complaints and bugs that come up MORE THAN ONCE in different messages (the same thing asked again, or "still broken", "again", "I said before"). Skip one-offs and generic style rules.
Reply with ONE JSON array and nothing else: [{"topic":"short plain label of the concrete thing, e.g. 'chat shows duplicate bubbles'","ids":[message numbers that mention it]}]. At most 30 topics, only those with 2 or more ids. Be concrete: a topic names the thing and the wish or bug.`;
	const chunks = []; let cur = [], n = 0; for (const a of asks) { const line = `[${a.id}] ${a.at.slice(5, 10)} ${a.text}\n`; if (n + line.length > 130000) { chunks.push(cur); cur = []; n = 0; } cur.push(line); n += line.length; } chunks.push(cur);
	const out = []; for (const [i, c] of chunks.entries()) { const r = haiku(SYS, c.join(""), { cap: 1.5 }); let t; try { t = json(r.text); } catch { t = []; console.log("unparsed chunk", i, r.text.slice(0, 200)); } out.push(...t.map(x => ({ ...x, chunk: i }))); console.log(`chunk ${i + 1}/${chunks.length}: ${c.length} asks, ${t.length} topics, $${r.usd.toFixed(3)}, total $${spent()}`); }
	fs.writeFileSync(F("topics"), JSON.stringify(out));
}
if (step === "merge") {
	const tops = JSON.parse(fs.readFileSync(F("topics"), "utf8")), SYS = `You get a numbered list of topic labels (with how many messages each had) produced from separate chunks of the same corpus. Many are the same thing worded differently. Group the ones that are the SAME concrete request or bug.
Reply with ONE JSON array and nothing else: [{"topic":"best short plain label","members":[input numbers],"grep":["3 distinct lowercase words that code or commits about it would contain"]}]. Every input number appears in exactly one group.`;
	const r = haiku(SYS, tops.map((t, i) => `[${i + 1}] (${t.ids.length}) ${t.topic}`).join("\n"), { cap: 1.5 }); const groups = json(r.text);
	const asks = new Map(JSON.parse(fs.readFileSync(F("asks"), "utf8")).map(a => [a.id, a]));
	const out = groups.map(g => { const ids = [...new Set(g.members.flatMap(m => tops[m - 1]?.ids || []))].filter(id => asks.has(id)); const as = ids.map(id => asks.get(id)).sort((a, b) => a.at.localeCompare(b.at));
		return { topic: g.topic, grep: g.grep, asked: ids.length, days: new Set(as.map(a => a.at.slice(0, 10))).size, sessions: new Set(as.map(a => a.sid)).size, first: as[0]?.at, last: as.at(-1)?.at, ids, asks: as.map(a => ({ id: a.id, at: a.at.slice(0, 16), sid: a.sid, text: a.text.slice(0, 160) })) }; }).filter(g => g.asked >= 2).sort((a, b) => b.days - a.days || b.asked - a.asked);
	fs.writeFileSync(F("clusters"), JSON.stringify(out)); console.log(`merged ${tops.length} topics -> ${out.length} clusters, $${r.usd.toFixed(3)}, total $${spent()}`);
	for (const g of out.slice(0, 30)) console.log(String(g.asked).padStart(3), String(g.days).padStart(2) + "d", g.first.slice(5, 10), g.last.slice(5, 10), g.topic);
}
