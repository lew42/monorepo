/* roles.js — the mapping role -> posture. `spawn_agent({role})` uses this to load
 * the right skill before the agent's first turn, and to pick sane defaults for a
 * caller who doesn't name them — a caller's own fields always win (Agents.spawn()).
 *
 * The six roles are ../../public/framework/ai/2026-09-22/tiers-design/doc/roles.md.
 * `role` here is the short word a caller passes (`minion`, `task-mastermind`); the
 * full id (`<role>-<name>`) is still built by Agents.name(). */
/* THE table: one row per role — the skill it loads, its id prefix, and its posture.
 * The owner's rule is "skill name = role = agent id". Where a role and its skill
 * differ, `alias` is the other word (or an array of them), and any of them is
 * accepted as a role. Renaming the skill dirs would touch a dozen callers, so the
 * mismatches are listed in doc/names.md.
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
	"task-mastermind":  { skills: ["sub-mastermind", "page"], prefix: "task-mastermind",  alias: "sub-mastermind", tier: "manager", model: model("manager"),  effort: "medium", permission_mode: "bypassPermissions" },
	mastermind:         { skill: "servex-mastermind", prefix: "mastermind",       tier: "architect", model: model("architect"), effort: "high", permission_mode: "acceptEdits" },
	assistant:          { skill: "every-prompt",     prefix: "assistant",        alias: "every-prompt",   tier: "fast", model: model("fast"),  effort: "low",  permission_mode: "acceptEdits" },
	/* ONE PAIR ON EVERY PAGE (recursive-pairs, 2026-09-25/28): a page-assistant, root page
	 * included, and a page-mastermind — the same two roles Layers.js now spawns for a card
	 * OR any other page, scoped to a directory given in the first message (doc/page-roles.md).
	 * `master-assistant`, `manager` and `card-assistant` are the pre-recursive-pairs words for
	 * these same two rows, kept as aliases so nothing that already says them breaks; write
	 * `page-assistant` / `page-mastermind` in anything new. The skill files themselves keep
	 * their old names (`every-prompt`, `sub-mastermind`) — see doc/names.md.
	 * A caller's own fields always win: Global.js still spawns `master-assistant` on the
	 * architect tier with its own system brief, and Layers.js the root page's assistant too. */
	"page-assistant":   { skill: "every-prompt",     prefix: "assistant",        alias: ["master-assistant", "card-assistant"], tier: "fast",    model: model("fast"),    effort: "low",    permission_mode: "bypassPermissions" },
	"page-mastermind":  { skills: ["sub-mastermind", "page"], prefix: "manager", alias: "manager",                              tier: "manager", model: model("manager"), effort: "medium", permission_mode: "bypassPermissions" },
	/* Woken per landing and per proposal by Server/clarity.mjs; fresh each time, one pass (.claude/skills/clarity/). */
	clarity:            { skill: "clarity",          prefix: "clarity",          tier: "fast",      model: model("fast"),      effort: "medium", permission_mode: "bypassPermissions" },
	"log-assistant":    { skill: "log-assistant",    prefix: "log-assistant",    tier: "fast",      model: model("fast"),       effort: "low",  permission_mode: "acceptEdits" }
};

/* A role word or one of its aliases -> the row's canonical role. `alias` is a
 * string or an array of strings, so several old words can point at one new row. */
export function canonical(word){
	if (ROLES[word]) return word;
	return Object.keys(ROLES).find(k => [].concat(ROLES[k].alias ?? []).includes(word));
}

const row = word => ROLES[canonical(word)];

/* The posture fields only — `skill`, `prefix` and `alias` are not spawn options. */
export function defaults(role){
	const { model, effort, permission_mode } = row(role) ?? {};
	return row(role) ? { model, effort, permission_mode } : {};
}

/* A role's skill list — `skills: [...]` when it carries more than one, else the
 * old singular `skill: "…"` wrapped in an array. Both forms read through this one
 * function, so a row written either way works. */
function skills_of(role){
	const found = row(role);
	return found?.skills ?? (found?.skill ? [found.skill] : []);
}

/* "a" / "a and b" / "a, b, and c" — plain-English joining for however many skills a role carries. */
function and_list(words){
	if (words.length < 2) return words.join("");
	if (words.length === 2) return `${words[0]} and ${words[1]}`;
	return `${words.slice(0, -1).join(", ")}, and ${words[words.length - 1]}`;
}

/* No option in the SDK's 0.3.280 `.d.ts` makes a MAIN session invoke a skill
 * before its first turn. `Options.skills` (sdk.d.ts:4330) only FILTERS which
 * discovered skills the model MAY choose to call; `AgentDefinition.skills`
 * (sdk.d.ts:67) preloads a skill's text, but only for a Task-tool SUBAGENT, not
 * the top-level `query()` session an Agents.Agent runs. So the load is the first
 * user message — the same words a person types to make Claude load one, naming
 * every skill the role carries. */
export function opening(role, prompt){
	const skills = skills_of(role);
	if (!skills.length) return prompt;
	const named = and_list(skills.map(s => `\`${s}\``));
	return `Load the ${named} skill${skills.length > 1 ? "s" : ""}, then: ${prompt}`;
}
