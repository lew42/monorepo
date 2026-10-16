// Round 4 step 2: per-session cost, three ways. The digest re-counts the transcript's own usage fields (main file + subagent files, one count per message.id).
// It is set against (a) the live snapshot (AISessionIndex: usd, tokens), (b) the Servex registry's `cost` (the SDK's own total_cost_usd for spawned agents),
// (c) the older audit pass (AISessionAudit.cost_of_session). Prints where they agree, where they do not, and the biggest gaps.   node reconcile.mjs [days=3]
import fs from "node:fs"; import path from "node:path";
import { AISessionDigest as D } from "../../../../../../../AISession/AISessionDigest.mjs";
import { cost_of_session } from "../../../../../../../AISession/AISessionAudit.mjs";
const days = +process.argv[2] || 3, AI = path.resolve(import.meta.dirname, "../../../../../../..");
const ds = D.all(days);
const snaps = new Map();
for (const mo of ["09", "10"]) { const root = path.join(AI, "sessions", "2026", mo); for (const dd of fs.existsSync(root) ? fs.readdirSync(root) : []) { const f = path.join(root, dd, "index.json"); if (!fs.existsSync(f)) continue; try { for (const s of JSON.parse(fs.readFileSync(f, "utf8")).snapshots || []) snaps.set(s.id, s); } catch {} } }
const reg = new Map(); try { const j = JSON.parse(fs.readFileSync(path.join(process.env.LOCALAPPDATA, "lew42/servex/registry.json"), "utf8")); for (const r of Array.isArray(j) ? j : Object.values(j)) if (r.session_id && r.cost != null) reg.set(r.session_id, r); } catch {}
const r2 = n => Math.round(n * 100) / 100, pct = (n, d) => d ? Math.round(1000 * n / d) / 10 : null;
const rows = ds.map(d => { const a = cost_of_session(d.id), s = snaps.get(d.id), g = reg.get(d.id), tok = d.tokens(), tk = tok, all = tok.input + tok.output + tok.cache_read + tok.cache_write;
	return { id: d.id, agent: d.agent || (reg.get(d.id)?.name), model: Object.keys(d.models)[0], digest: d.usd(), audit: a?.total_usd ?? null, snap: s?.usd ?? null, snap_src: s?.usd_source, snap_tree: s?.tree_usd ?? null, reg: g ? +g.cost : null, reg_model: g?.model,
		tok_digest: all, tk, tok_snap: s?.tokens ?? null, subfiles: d.usage.subfiles, usd_sub: d.usage.sub.usd }; });
const near = (a, b) => Math.abs(a - b) <= Math.max(0.02, 0.02 * Math.max(a, b));
const cmp = (key) => { const have = rows.filter(r => r[key] != null), eq = have.filter(r => near(r.digest, r[key])), diff = have.filter(r => !near(r.digest, r[key]));
	return { compared: have.length, agree: eq.length, differ: diff.length, "sum digest": r2(have.reduce((n, r) => n + r.digest, 0)), ["sum " + key]: r2(have.reduce((n, r) => n + r[key], 0)),
		worst: diff.map(r => ({ id: r.id.slice(0, 8), agent: r.agent, digest: r2(r.digest), [key]: r2(r[key]), delta: r2(r[key] - r.digest), model: r.model, subs: r.subfiles })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 8) }; };
const missing = rows.filter(r => r.snap == null && r.digest > 0.05);
const tk = rows.filter(r => r.tok_snap != null && r.tok_digest), tkr = tk.map(r => r.tok_snap / r.tok_digest).sort((a, b) => a - b);
const out = { window: `last ${days} days`, sessions: rows.length, "with digest cost > 0": rows.filter(r => r.digest > 0).length,
	"digest vs audit (older pass, same rule, own parser)": cmp("audit"), "digest vs snapshot usd": cmp("snap"), "digest vs registry cost (SDK billed, spawned agents only)": cmp("reg"),
	"snapshot missing for a session that cost > $0.05": { n: missing.length, usd: r2(missing.reduce((n, r) => n + r.digest, 0)) },
	"snapshot tokens / digest tokens (is it the same total?)": { n: tk.length, p10: tkr[Math.floor(tkr.length * .1)], p50: tkr[Math.floor(tkr.length * .5)], p90: tkr[Math.floor(tkr.length * .9)] },
	"usd_source of snapshots": Object.fromEntries([...new Set(rows.map(r => r.snap_src))].map(k => [String(k), rows.filter(r => r.snap_src === k).length])) };
fs.writeFileSync(path.join(process.env.TEMP, "pw", `reconcile-${days}d.json`), JSON.stringify(rows));
console.log(JSON.stringify(out, null, 1));
