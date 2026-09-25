/* roles.js — the mapping role -> posture. `spawn_agent({role})` uses this to load
 * the right skill before the agent's first turn, and to pick sane defaults for a
 * caller who doesn't name them — a caller's own fields always win (Agents.spawn()).
 *
 * The six roles are ../../public/framework/ai/2026-09-22/tiers-design/doc/roles.md.
 * `role` here is the short word a caller passes (`minion`, `task-mastermind`); the
 * full id (`<role>-<name>`) is still built by Agents.name(). */
/* THE table: one row per role — the skill it loads, its id prefix, and its posture.
 * The owner's rule is "skill name = role = agent id". Where a role and its skill
 * differ, `alias` is the other word, and either is accepted as a role. Renaming the
 * skill dirs would touch a dozen callers, so the mismatches are listed in doc/names.md.
 * `prefix` is the id's first half (`<prefix>-<name>`, built by Agents.name()). */
import { model } from "./tiers.js";

/* `tier` is the row's size (tiers.js: fast, manager, architect, scan); its `model` is
 * DERIVED from the tier, so moving a tier to another model is one line in tiers.js.
 * ⚠ 2026-09-24: `mastermind` and `master-assistant` were Fable rows; the tier table has
 * no Fable tier, so they now run on the architect and fast tiers. */
export const ROLES = {
	minion:             { skill: "minion",           prefix: "minion",           tier: "fast",      model: model("fast"),       effort: "high", permission_mode: "acceptEdits" },
	/* bypassPermissions, not acceptEdits: this role's whole job is calling
	 * spawn_agent/send_to_agent/list_agents, and an MCP tool call needs the same
	 * approval a Bash command would under acceptEdits — approval nobody can give
	 * a non-interactive SDK session. Found 2026-09-22 (sub-mastermind-live run 1):
	 * a task mastermind spawned under the old default had both its spawn_agent
	 * calls refused, said so, and stopped — no files written, no wake to prove. */
	"task-mastermind":  { skill: "sub-mastermind",   prefix: "task-mastermind",  alias: "sub-mastermind", tier: "manager", model: model("manager"),  effort: "medium", permission_mode: "bypassPermissions" },
	mastermind:         { skill: "servex-mastermind", prefix: "mastermind",       tier: "architect", model: model("architect"), effort: "high", permission_mode: "acceptEdits" },
	assistant:          { skill: "every-prompt",     prefix: "assistant",        alias: "every-prompt",   tier: "fast", model: model("fast"),  effort: "low",  permission_mode: "acceptEdits" },
	"master-assistant": { skill: "master-assistant", prefix: "master-assistant", tier: "fast",      model: model("fast"), effort: "high", permission_mode: "plan" },
	/* The card layers (Layers.js): a card's manager loads sub-mastermind and is recycled for the
	 * card's whole life; a card's assistant brings its own system brief (card-assistant.md). */
	manager:            { skill: "sub-mastermind",   prefix: "manager",          tier: "manager",   model: model("manager"),   effort: "medium", permission_mode: "bypassPermissions" },
	"card-assistant":   { skill: null,                prefix: "assistant",        tier: "fast",      model: model("fast"),      effort: "low",    permission_mode: "bypassPermissions" },
	"log-assistant":    { skill: "log-assistant",    prefix: "log-assistant",    tier: "fast",      model: model("fast"),       effort: "low",  permission_mode: "acceptEdits" }
};

/* A role word or its alias -> the row's canonical role. */
export function canonical(word){
	if (ROLES[word]) return word;
	return Object.keys(ROLES).find(k => ROLES[k].alias === word);
}

const row = word => ROLES[canonical(word)];

/* The posture fields only — `skill`, `prefix` and `alias` are not spawn options. */
export function defaults(role){
	const { model, effort, permission_mode } = row(role) ?? {};
	return row(role) ? { model, effort, permission_mode } : {};
}

/* No option in the SDK's 0.3.280 `.d.ts` makes a MAIN session invoke a skill
 * before its first turn. `Options.skills` (sdk.d.ts:4330) only FILTERS which
 * discovered skills the model MAY choose to call; `AgentDefinition.skills`
 * (sdk.d.ts:67) preloads a skill's text, but only for a Task-tool SUBAGENT, not
 * the top-level `query()` session an Agents.Agent runs. So the load is the first
 * user message — the same words a person types to make Claude load one. */
export function opening(role, prompt){
	const skill = row(role)?.skill;
	return skill ? `Load the \`${skill}\` skill, then: ${prompt}` : prompt;
}
