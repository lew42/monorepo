import { div, span, a, small } from "/app.js";

/* Draws one Role: its properties, and the agents now in it. Used by the roles page and by a session's page. */
export default class RoleView {
	static FIELDS = [
		["tier", r => r.tier], ["model", r => r.model], ["effort", r => r.effort], ["permission", r => r.permission_mode],
		["readme", r => r.readme], ["skills", r => r.skills.join(", ")], ["id prefix", r => r.prefix],
		["alias", r => [].concat(r.alias ?? []).join(", ")],
		["compact after", r => r.compact_after === null ? "never" : r.compact_after ? `${r.compact_after.tokens / 1000}k tokens (sleep ${r.compact_after.sleep / 1000}k)` : ""],
		["singleton", r => r.singleton ? "yes: one id" : ""],
		["renew", r => r.renew ? `after ${r.renew.hours} h or ${r.renew.tokens / 1000}k tokens` : ""],
		["retired", r => r.retired ? `replaced by ${r.retired}` : ""],
	];

	static usd = n => typeof n === "number" ? "$" + n.toFixed(2) : "—";

	/** The role's name over a grid of its properties (empty ones left out), then its live agents. `agents` may be omitted. */
	static draw(role, agents, { link = true } = {}){
		div.c("surface pad flow", () => {
			div.c("flex gap-50 wrap v-center", () => {
				if (link) a.c("h4", role.name).attr("href", `/framework/servex/roles/#${role.name}`);
				else span.c("h4", role.name);
				if (role.is_retired) small.c("muted", "retired");
			});
			div.c("role-props").style({ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.25em 1em" }).append(() => {
				for (const [label, get] of RoleView.FIELDS){
					const v = get(role);
					if (!v) continue;
					small.c("muted", label);
					span(String(v));
				}
			});
			if (agents) RoleView.instances(role, agents);
		}).attr("id", role.name);
	}

	static instances(role, agents){
		const live = role.instances(agents);
		small.c("muted", live.length ? `Live now (${live.length}):` : "No agents in this role right now.");
		for (const ag of live) div.c("flex gap-50 wrap", () => {
			a.c("", ag.id).attr("href", `/framework/ai/sessions/${ag.session_id ?? ag.id}/`);
			small.c("muted", `${ag.state ?? "?"} · ${RoleView.usd(ag.cost)}`);
		});
	}
}
