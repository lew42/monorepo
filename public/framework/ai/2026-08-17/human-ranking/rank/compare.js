import { div, p, span, details, summary, md, ui } from "/app.js";

/* Mike's order against every candidate tier's ordering of the same pixels.
   Rank correlation only: a tier that refuses to discriminate scores well on MAE
   (a constant 72 beat both real tiers) and cannot score well here, which is the
   whole reason this view exists. */

/** Two-tailed critical |rho| for Spearman, n → [p=.05, p=.01]. Standard table. */
const CRITICAL = { 6: [.886, 1], 7: [.786, .929], 8: [.738, .881], 9: [.700, .833], 10: [.648, .794],
	11: [.618, .755], 12: [.587, .727], 13: [.560, .703], 14: [.538, .679], 15: [.521, .654],
	16: [.503, .635], 17: [.485, .615], 18: [.472, .600] };

const mean = a => a.reduce((s, n) => s + n, 0) / a.length;
const sd = a => Math.sqrt(mean(a.map(x => (x - mean(a)) ** 2)));

/** Ranks, best (highest value) first, ties sharing their average rank. */
export function ranks(values){
	const by = values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
	const out = new Array(values.length);

	for (let i = 0; i < by.length; ){
		let j = i;
		while (j + 1 < by.length && by[j + 1][0] === by[i][0]) j++;
		for (let k = i; k <= j; k++) out[by[k][1]] = (i + j) / 2 + 1;
		i = j + 1;
	}
	return out;
}

function pearson(a, b){
	const [ma, mb] = [mean(a), mean(b)];
	let num = 0, da = 0, db = 0;
	a.forEach((x, i) => { num += (x - ma) * (b[i] - mb); da += (x - ma) ** 2; db += (b[i] - mb) ** 2; });
	return da && db ? num / Math.sqrt(da * db) : null;
}

/** Spearman rho — Pearson over average ranks, so ties are handled properly. */
export const spearman = (a, b) => pearson(ranks(a), ranks(b));

const num = (n, d = 2) => n == null || n === false ? "—" : n.toFixed(d);
const signed = n => n == null ? "—" : (n >= 0 ? "+" : "") + n.toFixed(2);

function verdict(rho, n){
	const crit = CRITICAL[n];
	if (rho == null) return "no ordering to correlate";
	if (!crit) return `n=${n} is too small to test`;
	return Math.abs(rho) >= crit[1] ? "significant, p<.01"
		: Math.abs(rho) >= crit[0] ? "significant, p<.05"
		: "inside noise";
}

/** One row per tier: how it ranks these images against how Mike ranks them. */
export function agreement(tiers, rows, order){
	const mine = order.map((_, i) => order.length - i);
	const scored = key => order.map(h => rows.find(r => r.hash === h)[key]);

	return tiers.map(t => {
		const s = scored(t.key);
		const usable = s.every(v => Number.isFinite(v));
		const rho = usable ? spearman(mine, s) : null;
		return { ...t, rho, mean: usable && mean(s), sd: usable && sd(s),
			range: usable && `${Math.min(...s)}–${Math.max(...s)}`,
			miss: usable && worst(order, s, rows) };
	});
}

/** The image this tier disagrees with Mike about most — null when it barely does. */
function worst(order, scores, rows){
	const mine = order.map((_, i) => i + 1), theirs = ranks(scores);
	let at = 0;
	theirs.forEach((r, i) => { if (Math.abs(r - mine[i]) > Math.abs(theirs[at] - mine[at])) at = i; });
	return Math.abs(theirs[at] - mine[at]) < 2 ? null
		: { url: rows.find(r => r.hash === order[at]).url, mine: mine[at], theirs: theirs[at] };
}

export function table(tiers, rows, order){
	const n = order.length;
	const list = agreement(tiers, rows, order);

	ui.table.c("num", ["tier", "Spearman ρ vs Mike", "significance", "mean", "sd", "range"],
		[...list.map(t => [t.label, signed(t.rho), verdict(t.rho, n), num(t.mean, 1), num(t.sd), t.range || "—"]),
			["a constant 72 (control)", "—", "no ordering to correlate", "72.0", "0.00", "72–72"]]);

	p.c("muted", `n=${n}. ` + (CRITICAL[n]
		? `At this n, |ρ| must clear ${CRITICAL[n][0]} for p<.05 and ${CRITICAL[n][1]} for p<.01.`
		: "Too few placed to test significance yet."));

	md("**Read the `sd` column before the ρ column.** A tier whose spread is near zero cannot be "
		+ "wrong by much and cannot be right about anything either — the constant-72 control row is "
		+ "there so that failure mode has a name. ρ is the honest measure: it asks whether the tier "
		+ "puts the same images in the same *places* Mike does.");

	div.c("flex v gap", () => list.forEach(t => t.miss && p.c("muted",
		`${t.label} — worst miss: \`${t.miss.url}\` is Mike's #${t.miss.mine} and its #${t.miss.theirs}.`)));

	details.c("rank-notes", () => {
		summary("What each tier is, and where its numbers came from");
		list.forEach(t => md(`**${t.label}** — ${t.note} \`${t.source}\`, generated \`${t.generated_at ?? "unstated"}\`.`));
	});
}

/** Mike's order down the page, every tier's rank of the same image beside it. */
export function places(tiers, rows, order){
	const by_hash = h => rows.find(r => r.hash === h);
	const tier_ranks = tiers.map(t => ranks(order.map(h => by_hash(h)[t.key] ?? -Infinity)));

	ui.table.c("num", ["Mike", "page", ...tiers.map(t => t.label)],
		order.map((h, i) => ["#" + (i + 1), () => span.c("rank-url", by_hash(h).url),
			...tier_ranks.map(r => String(r[i]))]));
}
