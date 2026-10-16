// Round 4 step 1: token size of every real session, before and after stripping.   node sizes.mjs [days=3]
// Prints the distribution (not one example) and writes %TEMP%/pw/digests-<days>d.json for the reconcile step.
import fs from "node:fs"; import path from "node:path";
import { AISessionDigest as D } from "../../../../../../../AISession/AISessionDigest.mjs";
const days = +process.argv[2] || 3, t0 = Date.now(), ds = D.all(days);
const col = f => ds.map(f), pct = (n, tot) => Math.round(100 * n / tot) + "%", over = (a, n) => a.filter(x => x > n).length;
const sz = ds.map(d => d.sizes()), raw = sz.map(s => s.raw), content = sz.map(s => s.content), stripped = sz.map(s => s.stripped), owner = sz.map(s => s.owner_only);
const sum = a => a.reduce((x, y) => x + y, 0);
const out = { window: `last ${days} days`, sessions: ds.length, secs: (Date.now() - t0) / 1000,
	"tokens, raw file": D.quantiles(raw), "tokens, content blocks only": D.quantiles(content), "tokens, stripped (owner + assistant text)": D.quantiles(stripped), "tokens, owner words only": D.quantiles(owner),
	"sessions over 100k tokens": { raw: over(raw, 1e5), content: over(content, 1e5), stripped: over(stripped, 1e5) },
	"sessions over 30k tokens": { raw: over(raw, 3e4), content: over(content, 3e4), stripped: over(stripped, 3e4) },
	"total tokens (all sessions)": { raw: sum(raw), content: sum(content), stripped: sum(stripped) },
	"stripped is x% of raw": pct(sum(stripped), sum(raw)), "stripped is x% of content": pct(sum(stripped), sum(content)),
	"where the content goes (chars)": Object.fromEntries(Object.keys(ds[0].chars).map(k => [k, pct(sum(ds.map(d => d.chars[k])), sum(ds.map(d => sum(Object.values(d.chars)))))])) };
fs.mkdirSync(path.join(process.env.TEMP, "pw"), { recursive: true });
fs.writeFileSync(path.join(process.env.TEMP, "pw", `digests-${days}d.json`), JSON.stringify(ds));
console.log(JSON.stringify(out, null, 1));
