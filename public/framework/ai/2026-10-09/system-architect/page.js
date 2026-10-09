import { AITask, md, div, h2 } from "/app.js";

/* System architect, 2026-10-09: the words an agent reads before its first edit, before / now / proposed,
   computed live from load-before.json, load-after.json and claude-md-proposal.md (never typed in). */
const url = f => new URL(f, import.meta.url);
const words = t => t.split(/\s+/).filter(Boolean).length;

export default new AITask({
	meta: import.meta,
	children: "oo-census",

	extra(){
		md("**Follow-up, same day:** [which function files to turn into classes first](oo-census/) (the OO census, ten conversions queued).");
		md("**A fresh agent reads about 10,000 words of rules before it does anything; a task mastermind about 18,000.** Many of those rules contradicted each other or described systems that are gone. The safe half is fixed; cutting CLAUDE.md is the big remaining win.");
		const $bars = div.c("flow");
		Promise.all([
			fetch(url("load-before.json")).then(r => r.json()),
			fetch(url("load-after.json")).then(r => r.json()),
			fetch(url("claude-md-proposal.md")).then(r => r.text()),
		]).then(([before, after, proposal]) => this.bars($bars, before, after, words(proposal)));

		h2("Top 10 changes, most friction removed for least risk first");
		md([
			"| # | Change | Where | Status |",
			"|---|---|---|---|",
			"| 1 | An old CLAUDE.md copy loaded as a second rulebook for every agent under `ai/` | `ai/CLAUDE.md` → `CLAUDE.copy.md` | done |",
			"| 2 | \"Never commit\" vs CLAUDE.md's \"commit every step\" | minion, mastermind | done |",
			"| 3 | Skill fixes sent to a retired agent (mastermind-servex) | minion, sub-mastermind → `system-architect` | done |",
			"| 4 | Skills teach `node server.js`, which a hook blocks | minion, mastermind, sub-mastermind | done |",
			"| 5 | Three different usage instructions → `usage-now.mjs` | new-task, finish-task, mastermind | done |",
			"| 6 | Six blocks repeated in 3–4 skills, mostly restating CLAUDE.md | 8 skills, ~2,600 words cut | done |",
			"| 7 | CLAUDE.md 3,758 → ~1,200 words, same rules | [claude-md-proposal.md](claude-md-proposal.md) | proposed |",
			"| 8 | Servex's `mastermind` role loads the retired architect skill | `Servex/agents/roles.js` | proposed |",
			"| 9 | Every task spawns a docs-check agent plus a reviewer | build order in sub-mastermind | proposed |",
			"| 10 | `syntax-guard` written but not wired; MEMORY.md 2,300 stale words | `settings.json`, owner's memory | proposed |",
		].join("\n"));
		md("Every finding, with the before and after text: [doc/findings.md](doc/findings.md). The skill that does this again: `.claude/skills/system-architect/SKILL.md`, with `measure.mjs` beside it.");
	},

	bars($box, before, after, proposedClaude){
		const claudeNow = after.claude.find(c => c.file === "CLAUDE.md").words;
		const cut = claudeNow - proposedClaude;
		const rows = Object.keys(before.profiles).map(k => ({
			name: k.replace(/ \(.*/, ""),
			before: before.profiles[k],
			now: after.profiles[k],
			proposed: after.profiles[k] - cut,
		}));
		const max = Math.max(...rows.map(r => r.before));
		$box.append(() => {
			for (const r of rows) {
				div.c("sa-row", () => {
					div.c("sa-name bold", r.name);
					for (const [label, n, tone] of [["before", r.before, "var(--ink)"], ["now", r.now, "var(--accent, #c60)"], ["proposed", r.proposed, "var(--good, #3a7)"]])
						div.c("flex v-center gap", () => {
							div.c("sa-label muted", label).style({ width: "6em" });
							div().style({ height: "0.9em", width: (n / max * 70).toFixed(1) + "%", background: tone, borderRadius: "3px" });
							div.c("sa-n", n.toLocaleString() + " words");
						});
				});
			}
		});
	},
});
