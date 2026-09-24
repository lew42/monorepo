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
export const ROLES = {
	minion:             { skill: "minion",           prefix: "minion",           model: "claude-sonnet-5",  effort: "high", permission_mode: "acceptEdits" },
	/* bypassPermissions, not acceptEdits: this role's whole job is calling
	 * spawn_agent/send_to_agent/list_agents, and an MCP tool call needs the same
	 * approval a Bash command would under acceptEdits — approval nobody can give
	 * a non-interactive SDK session. Found 2026-09-22 (sub-mastermind-live run 1):
	 * a task mastermind spawned under the old default had both its spawn_agent
	 * calls refused, said so, and stopped — no files written, no wake to prove. */
	"task-mastermind":  { skill: "sub-mastermind",   prefix: "task-mastermind",  alias: "sub-mastermind", model: "claude-opus-5-5",  effort: "medium", permission_mode: "bypassPermissions" },
	mastermind:         { skill: "mastermind",       prefix: "mastermind",       model: "claude-fable-5-1", effort: "high", permission_mode: "acceptEdits" },
	assistant:          { skill: "every-prompt",     prefix: "assistant",        alias: "every-prompt",   model: "claude-sonnet-5",  effort: "low",  permission_mode: "acceptEdits" },
	"master-assistant": { skill: "master-assistant", prefix: "master-assistant", model: "claude-fable-5-1", effort: "high", permission_mode: "plan" },
	"log-assistant":    { skill: "log-assistant",    prefix: "log-assistant",    model: "claude-sonnet-5",  effort: "low",  permission_mode: "acceptEdits" }
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
