import * as app_ns from "/app.js";
import { Page, View, md, div, span, p, h2, h3, a, ul, li, ol, details, summary, table, thead, tbody, tr, th, td } from "/app.js";
import "/framework/ui/parts.js";
import "/framework/ui/badge/badge.js";
import "/framework/ui/panel/panel.js";
import "/framework/ui/accordion/accordion.js";
import "/framework/ux/Popover/Popover.js";

View.stylesheet(import.meta, "plan.css");

/* Both files are fetched once, at import, so content() stays synchronous. */
const json = name => fetch(new URL(name, import.meta.url)).then(r => r.json());
const [plan, catalog] = await Promise.all([json("plan.json"), json("../catalog/catalog.json")]);
const kinds = new Map(catalog.map(k => [k.name, k]));

/* A "before" is the catalog's own render snippet: its imports are loaded up front,
 * then the snippet runs with those names bound. An "after" runs with every /app.js name. */
const IMPORT = /import\s+(\{[^}]*\}|[\w$]+)\s+from\s+["']([^"']+)["'];?/g;
const modules = new Map([["/app.js", app_ns]]);
const wanted = new Set(catalog.flatMap(k => [...(k.render || "").matchAll(IMPORT)].map(m => m[2])));
await Promise.all([...wanted].filter(u => !modules.has(u)).map(u => import(u).then(ns => modules.set(u, ns), () => modules.set(u, null))));
await Promise.all([...new Set(catalog.flatMap(k => k.sheets || []))].map(href => new Promise(done => {
	const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
	link.onload = link.onerror = done;
	document.head.append(link);
})));

const APP = Object.keys(app_ns).filter(n => n !== "default" && /^[A-Za-z_$][\w$]*$/.test(n));
const run = (src, all) => {
	const names = all ? [...APP] : [], vals = names.map(n => app_ns[n]);
	let missing = "";
	const body = src.replace(IMPORT, (_, what, url) => {
		const ns = modules.get(url);
		if (!ns){ missing = url; return ""; }
		if (what.startsWith("{")) for (const n of what.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean)){ names.push(n); vals.push(ns[n]); }
		else { names.push(what); vals.push(ns.default); }
		return "";
	});
	if (missing) return `its module ${missing} did not load.`;
	try { new Function(...names, body)(...vals); return ""; }
	catch (e){ return e.message; }
};

/* One stage: a dashed box the sample is drawn into. `proposed` turns on the after-only
 * rules (the two new classes, a popover drawn in place). */
const stage = (src, proposed, fallback) => div.c("ux-content-plan-stage" + (proposed ? " ux-content-plan-proposed" : ""), () => {
	const err = src ? run(src, proposed) : fallback;
	if (err) p.c("ux-content-plan-undrawn", src ? `Not drawn here: ${err}` : err);
});

/* Where the first word sits inside the drawn box — the padding a reader actually sees. */
const inset = $stage => {
	const box = $stage.firstElementChild;
	if (!box || box.classList.contains("ux-content-plan-undrawn")) return "";
	const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 3 });
	const text = walk.nextNode();
	if (!text) return "";
	const r = document.createRange(); r.selectNodeContents(text);
	const t = r.getBoundingClientRect(), b = box.getBoundingClientRect();
	if (!b.width || t.left < b.left || t.top < b.top || t.bottom > b.bottom) return "";
	return `text ${Math.round(t.left - b.left)}px in, ${Math.round(t.top - b.top)}px down`;
};
const measure = (root, tries = 30) => {
	if (!root.isConnected || !root.getBoundingClientRect().width){ if (tries) requestAnimationFrame(() => measure(root, tries - 1)); return; }
	root.querySelectorAll(".ux-content-plan-side").forEach(side => {
		side.querySelector(".ux-content-plan-inset").textContent = inset(side.querySelector(".ux-content-plan-stage")) || " ";
	});
};

const RISK = { low: "low risk", med: "medium risk", high: "high risk" };
const risk = r => span.c(`ui-pill ux-content-plan-risk ux-content-plan-risk-${r}`, RISK[r]);
const pages = list => details.c("ux-content-plan-pages", () => {
	summary(`${list.length} ${list.length === 1 ? "page" : "pages"} to screenshot before and after`);
	ul(() => list.forEach(u => li(() => a(u).href(u))));
});

export default new Page({
	meta: import.meta,
	title: "Card plan",
	description: "75 kinds of box become 36: the plan.",
	icon: "call_merge",

	content(){
		const kind_plan = new Map(plan.kinds.map(k => [k.name, k]));

		p.c("ux-content-plan-lede", "The catalog found 75 kinds of box. Most are the same few jobs drawn again with different padding. This is the plan to shrink them to eight, drawn live. Nothing on the site changes until a merge below is carried out.");

		div.c("ux-content-plan-nums", () => {
			[[plan.from.kinds, plan.to.kinds, "kinds of box"], [plan.from.padding_rules, plan.to.padding_rules, "padding rules"]]
				.forEach(([from, to, label]) => div.c("ux-content-plan-num", () => {
					span.c("ux-content-plan-big", `${from} → ${to}`);
					span(label);
				}));
			p.c("ux-content-plan-sum muted", `${plan.to.merged} kinds merge into ${plan.to.targets} targets, ${plan.to.kept} widgets keep their own shape, ${plan.to.dropped} are dropped. The padding rules left: ${plan.to.rules.join(", ")}.`);
		});

		h2("The eight targets");
		div.c("ux-content-plan-wall wide", () => plan.targets.forEach(t => div.c("card ux-content-plan-target", () => {
			stage(t.draw, true);
			h3(t.name);
			p(t.job);
			div.c("flex wrap gap-25", () => { span.c("ui-pill", `padding: ${t.padding}`); span.c("ui-pill", `bleed: ${t.bleed}`); });
		})));

		details.c("ux-content-plan-rest", () => {
			summary(`The ${plan.to.kept} kinds that keep their own shape, and the ${plan.to.dropped} that are dropped`);
			ul(() => plan.kinds.filter(k => k.keep).forEach(k => li(() => { span.c("h4", k.name); span(` — ${k.keep}`); })));
			ul(() => plan.kinds.filter(k => k.drop).forEach(k => li(() => { span.c("h4", k.name); span(` — dropped: ${k.drop}`); })));
		});

		h2("Each merge, before and after");
		p.c("muted", "Left is the kind as the site draws it today, from its real classes. Right is the same content in the target. The line under each says where its first word sits, measured live.");
		const $merges = div.c("ux-content-plan-merges wide", () => plan.order.forEach(o => {
			const m = plan.merges.find(x => x.id === o.merge);
			div.c("ux-content-plan-merge", () => {
				div.c("ux-content-plan-merge-head", () => {
					h3(`${o.step}. ${m.title}`);
					div.c("flex wrap gap-25 v-center", () => { risk(m.risk); span.c("ui-pill ui-badge outline", `${m.files.length} files`); span.c("ui-pill ui-badge outline", `${m.pages.length} pages`); span.c("ui-pill ui-badge outline", `into ${m.into}`); });
					p.c("muted", m.risk_why + (m.also ? ` Also: ${m.also}` : "") + (m.reach ? ` Reach: ${m.reach}` : ""));
					if (m.visible_change) p(m.visible_change);
				});
				m.kinds.forEach(name => {
					const k = kinds.get(name), kp = kind_plan.get(name);
					if (!kp.after) return;
					div.c("ux-content-plan-pair", () => {
						p.c("ux-content-plan-pair-name", () => { span.c("h4", name); span.c("muted", kp.drop ? `  dropped — ${kp.drop}` : `  → ${kp.into}${kp.note ? ` — ${kp.note}` : ""}`); });
						div.c("ux-content-plan-side", () => {
							span.c("ux-content-plan-label muted", "before");
							stage(k.render, false, "The catalog has no drawing of it: its styles load only on its own page.");
							span.c("ux-content-plan-inset muted", " ");
						}).attr("data-kind", name).attr("data-side", "before");
						div.c("ux-content-plan-side", () => {
							span.c("ux-content-plan-label muted", kp.drop ? "after (plain words)" : `after (${kp.into})`);
							stage(kp.after, true);
							span.c("ux-content-plan-inset muted", " ");
						}).attr("data-kind", name).attr("data-side", "after");
					});
				});
			});
		}));
		requestAnimationFrame(() => measure($merges.el));

		h2("The spacing table");
		p.c("muted", "One line per target: how much room it keeps around its content, whether it may reach the screen edge, and why.");
		div.c("wide ux-content-plan-table", () => table(() => {
			thead(() => tr(() => ["Target", "Padding", "Bleed", "The rule"].forEach(h => th(h))));
			tbody(() => plan.targets.forEach(t => tr(() => {
				td.c("h4", t.name);
				td(() => { span(t.padding); if (t.padding_value) span.c("muted", ` ${t.padding_value}`); });
				td(t.bleed);
				td(t.rule);
			})));
		}));
		p.c("muted", `Three classes do not exist yet: ${plan.targets.flatMap(t => t.new_classes || []).join("; ")}. Their rules are drawn on this page only, from plan.css.`);

		h2("The migration order");
		p.c("muted", "Least risky first. Each step names the pages to screenshot before the edit and again after it.");
		ol.c("ux-content-plan-order", () => plan.order.forEach(o => li(() => {
			div.c("flex wrap gap-25 v-center", () => { span.c("h4", o.title); risk(o.risk); });
			pages(o.screenshot);
		})));

		md.details(import.meta, "readme.md", "Readme");
	},
});
