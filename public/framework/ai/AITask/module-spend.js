import { div, span, a, p } from "../../core/View/View.js";
import { build_row, ref_entry } from "../../ext/Mention/Mention.js";
import { money } from "./cost.js";

/* A day's spend in two currencies, and which modules it touched — read from
   `spend.json` (Server/DaySpend.mjs; `node Server/DaySpend.mjs <date>` writes it, a plain
   node script, never typed by hand — law 7). Lives beside `day.jsonl` in the day's own folder,
   same as every other per-day file this page already reads.

   ⚠ The SPA fallback answers every miss with index.html — content-type is the 404, same guard
   dashboard.js's own `json()` uses (copied here rather than exported, to keep that module's
   own export list from growing for one three-line helper). */
const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

export const slug = name => String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function load(date){
	return json(`/framework/ai/${date}/spend.json`);
}

/** The day's two totals — Claude $ (subscription usage, priced at API rates) and real $
    (OpenRouter or another API key actually charged) — then what each model cost. Silent only
    when the file truly doesn't exist yet; a day with real work but nothing tracked still says
    so, rather than vanishing. */
export function spend_summary(date){
	return div.c("ai-spend flex v gap", async $s => {
		const data = await load(date);
		$s.append(() => {
			if (!data) return void p.c("muted", "Spend not computed yet for this day — run node Server/DaySpend.mjs " + date + ".");
			if (!data.tasks.length) return void p.c("muted", "No tasks tracked this day.");
			div.c("flex gap wrap", () => {
				span(() => { span.c("muted", "Claude $ "); span(money(data.claude_usd)); });
				span(() => { span.c("muted", "real $ "); span(money(data.real_usd)); });
			}).style("--gap", "1.5em");
			if (data.by_model.length) div.c("flex gap wrap muted", () =>
				data.by_model.forEach(m => span(`${m.model} ${money(m.claude_usd + m.real_usd)}`)));
		});
	});
}

/** Every module touched this day, each a page-icon-item link into
    `/framework/ai/<date>/module/<slug>/` — the owner's own words: "the page little icon item
    ... a contextual wrapper for anything." `ref_entry` looks the module up as a real page
    (`core/Page` → `/framework/core/Page/`); a module with no page yet (`.claude`, `Server`)
    still gets a plain folder icon so the row never goes missing. */
export function module_list(date){
	return div.c("ai-modules flex v gap", async $m => {
		const data = await load(date);
		$m.append(() => {
			if (!data?.modules.length) return;
			data.modules.forEach(mod => {
				const entry = ref_entry("/framework/" + mod.module + "/") ?? { icon: "folder", name: mod.module, url: null };
				// `build_row` builds with `View.captor` nulled (Mention.js) and hands back the raw
				// element — appended here by hand, same idiom `core/Page/Page.class.js`'s own
				// reference-row uses for the same reason.
				div.c("flex gap v-center", $row => {
					$row.append(build_row(mod.module, entry));
					a(`${mod.tasks.length} task${mod.tasks.length === 1 ? "" : "s"} →`).ac("muted")
						.href(`/framework/ai/${date}/module/${slug(mod.module)}/`);
				});
			});
		});
	});
}

/** One module's own tasks for this day — the destination `module_list()` links to, and its
    own standalone url. */
export function module_detail(date, mod_slug){
	return div.c("ai-module-detail flex v gap", async $m => {
		const data = await load(date);
		const mod = data?.modules.find(m => slug(m.module) === mod_slug);
		$m.append(() => {
			if (!mod) return void p.c("muted", `Nothing recorded for this module on ${date}.`);
			mod.tasks.forEach(t => {
				const name = t.key.split("/").pop();
				div.c("flex v gap-s", $row => {
					$row.append(build_row(name, { icon: "receipt_long", url: `/framework/ai/${date}/${name}/` }));
					if (t.outcome) span.c("muted", t.outcome);
				});
			});
		});
	});
}
