/* roles.js — the mapping role -> posture. `spawn_agent({role})` uses this to load
 * the right skill before the agent's first turn, and to pick sane defaults for a
 * caller who doesn't name them — a caller's own fields always win (Agents.spawn()).
 *
 * The six roles are ../../public/framework/ai/sessions/2026/09/22/tiers-design/tiers-design/doc/roles.md.
 * `role` here is the short word a caller passes (`minion`, `task-mastermind`); the
 * full id (`<role>-<name>`) is still built by Agents.name(). */
/* THE table: one row per role — its role readme and/or the skills it loads, its id prefix, and its posture.
 * `readme: "minion"` is the role's one switch (2026-10-22): Servex inlines Servex/agents/roles/minion.md
 * whole before the first turn (index: roles/readme.md); the old skill is now a pointer to that file.
 * The owner's rule is "skill name = role = agent id". Where a role and its skill
 * differ, `alias` is the other word (or an array of them), and any of them is
 * accepted as a role. Renaming the skill dirs would touch a dozen callers, so the
 * mismatches are listed in doc/names.md.
 * `prefix` is the id's first half (`<prefix>-<name>`, built by Agents.name()). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { model, provider } from "./tiers.js";
import Role from "../../public/framework/core/Role/Role.js";
import { capped_chain } from "./readme-chain.js";

/* `tier` is the row's size (tiers.js: fast, manager, architect, scan); its `model` is
 * DERIVED from the tier, so moving a tier to another model is one line in tiers.js.
 * ⚠ 2026-09-24: `mastermind` and `master-assistant` were Fable rows; the tier table has
 * no Fable tier, so they now run on the architect and fast tiers. */
/* COMPACTION POLICY (2026-10-16, doc/lifecycle.md, agents/doc/owner-2026-10-16-compaction.md): `compact_after` on a row
 * is {tokens}: once an IDLE agent's context passes `tokens`, Servex sends it ONE nudge (context size, cache warm/cold)
 * and the agent decides, answering with the `compact_self` tool; it never auto-compacts mid-flight. Age is no reason.
 * `null` = never (minions live 10-30 min). A row with no field uses the host default (SERVEX_NUDGE_TOKENS, 200k).
 * Everyone (but minions and the front desk) is auto-compacted at turn end only past the safety ceiling (400k) or memory.
 * `sleep` (the owner, 2026-10-23): an agent about to go dormant with more context than this compacts first, then sleeps,
 * so it wakes small. Default SERVEX_SLEEP_COMPACT_TOKENS (100k), never above half the window (Agent.sleep_compact). */
export const MASTERMIND_COMPACT = { tokens: 150000, sleep: 100000 };
export function compact_after(role){ const r = ROLES[canonical(role)]; return r && "compact_after" in r ? r.compact_after : undefined; }

export const ROLES = {
	/* bypassPermissions (2026-10-02): a minion builds with Bash, node and the servex/site MCP
	 * tools, and under acceptEdits every one of those is refused with nobody to approve — the
	 * minion only finds out when its first call fails (minion-framework-home lost a turn this way;
	 * the CLI-launcher version of the same bug is 2026-09-19's). Same reasoning as task-mastermind below. */
	minion:             { readme: "minion",           prefix: "minion",           tier: "scan",      model: model("scan"),       effort: "low", permission_mode: "bypassPermissions", compact_after: null },
	/* bypassPermissions, not acceptEdits: this role's whole job is calling
	 * spawn_agent/send_to_agent/list_agents, and an MCP tool call needs the same
	 * approval a Bash command would under acceptEdits — approval nobody can give
	 * a non-interactive SDK session. Found 2026-09-22 (sub-mastermind-live run 1):
	 * a task mastermind spawned under the old default had both its spawn_agent
	 * calls refused, said so, and stopped — no files written, no wake to prove. */
	/* THE CORE PAGE MASTERMIND (the owner, 2026-10-24): a defined, repeatable subject mastermind for the page system (core/Page, Item, Router, ext/JSONL). Its role text reaches the system prompt, so it survives compaction. Ids mastermind-page, mastermind-page-2. */
	"core-page-mastermind": { readme: "core-page-mastermind", prefix: "mastermind-page", tier: "architect", model: model("architect"), effort: "high", permission_mode: "bypassPermissions", compact_after: MASTERMIND_COMPACT },
	/* mastermind: bypassPermissions too (2026-10-12, asks #6): it calls spawn_agent/page tools and edits, and nobody can approve a prompt overnight. */
	/* ONE mastermind role, spawned at a PATH (the owner, 2026-10-25; roles/mastermind.md "Spawned at a path"). `ai-system-mastermind` and
	 * `servex-mastermind` are only words for it: ALIAS_PATHS gives them a default path. The old singleton and its renewal are gone. */
	mastermind:         { readme: "mastermind", prefix: "mastermind",       alias: ["ai-system-mastermind", "servex-mastermind", "task-mastermind", "sub-mastermind"], tier: "architect", model: model("architect"), effort: "high", permission_mode: "bypassPermissions", compact_after: MASTERMIND_COMPACT },
	/* The fast assistant (every-prompt) is retired for voice as of 2026-10-17 (`voice-assistant` below); its skill files stay on disk and this row stays for the callers that still name it. */
	assistant:          { retired: "voice-assistant", skill: "every-prompt",     prefix: "assistant",        alias: "every-prompt",   tier: "fast", model: model("fast"),  effort: "low",  permission_mode: "acceptEdits" },
	/* ONE PAIR ON EVERY PAGE (recursive-pairs, 2026-09-25/28): a page-assistant, root page
	 * included, and a page-mastermind — the same two roles Layers.js now spawns for a card
	 * OR any other page, scoped to a directory given in the first message (doc/page-roles.md).
	 * `manager` and `card-assistant` are the pre-recursive-pairs words for these same two rows,
	 * kept as aliases so nothing that already says them breaks; write `page-assistant` /
	 * `page-mastermind` in anything new. The skill files themselves keep their old names
	 * (`every-prompt`, `sub-mastermind`) — see doc/names.md.
	 * `master-assistant` is its OWN row below, not an alias here: it is a different agent (the
	 * root page's own assistant, Opus, plan mode), and folding it into this fast/bypass row
	 * quietly loosened a plain `spawn_agent({role: "master-assistant"})`'s posture for any
	 * caller that isn't Global.js (fresh-eyes review, finding 5). Global.js still spawns
	 * `master-assistant` with its own fields, which always win over this table either way. */
	"page-assistant":   { skill: "every-prompt",     prefix: "assistant",        alias: "card-assistant", tier: "fast",    model: model("fast"),    effort: "low",    permission_mode: "bypassPermissions" },
	/* "manager" is a retired WORD as of 2026-09-29 (the owner, voice session, 6:40 PM) — this row
	 * is what it named. Say "page-mastermind", or the row it is meant to become,
	 * "directory mastermind" (not a roles.js row yet — no tool spawns one fresh from a
	 * directory's readme chain today). Names only, no behaviour change here:
	 * doc/names.md, /framework/ai/sessions/2026/09/22/tiers-design/tiers-design/doc/roles.md. */
	"page-mastermind":  { readme: "mastermind", skills: ["page"], prefix: "manager", alias: "manager",                              tier: "manager", model: model("manager"), effort: "medium", permission_mode: "bypassPermissions" },
	/* The root page's own assistant (Servex/agents/Global.js `master()`, master-assistant.md).
	 * Its own row, not folded into page-assistant: architect tier and `plan`, unchanged from
	 * before recursive-pairs. A caller's own fields (Global.js's) still win over this table.
	 * "master assistant" is a retired WORD as of 2026-09-29 — its "decide, then spawn the right
	 * mastermind" job now belongs to a voice session's `session-smart` row, below. This row
	 * (the code) is unchanged; only the word is retired. doc/names.md has the detail. */
	"master-assistant": { skill: "master-assistant", prefix: "master-assistant", tier: "architect", model: model("architect"), effort: "high", permission_mode: "plan", compact_after: MASTERMIND_COMPACT },
	/* Woken per landing and per proposal by Server/clarity.mjs; fresh each time, one pass (.claude/skills/clarity/). */
	clarity:            { readme: "clarity",          prefix: "clarity",          tier: "manager", model: model("manager"),      effort: "medium", permission_mode: "bypassPermissions" },
	/* ONE PAIR PER VOICE SESSION (Sessions.js, ai/sessions/2026/09/30/voice-sessions/voice-sessions): spawned by code with
	 * their own briefs (session-fast.md, session-smart.md), which win over these rows. No skill.
	 * Tiers: `session-fast` is `fast`, `session-smart` is `voice_smart` (tiers.js).
	 * `session-smart` shares the "files for the next agent, cards for the owner" write discipline
	 * with `task-mastermind` (both `every-prompt` and `sub-mastermind` carry it), but never its
	 * judging-against-the-owner's-sentence or landing parts — it spawns a task mastermind to do
	 * those instead of doing them itself. Detail: tiers-design/doc/roles.md. */
	/* RETIRED 2026-10-17 (the owner: "drop the fast assistant for now"; plan: public/framework/ux/Dictate/doc/voice-assistant.md):
	 * `voice-assistant` below takes this seat. The row stays, unchanged, because Sessions.js still spawns it by name until
	 * the Sessions brief lands (voice-assistant-plan/sessions-brief.md); `retired` names the row that replaces it. */
	"session-fast":     { retired: "voice-assistant", prefix: "session-fast",     tier: "fast",      model: model("fast"),       effort: "low",    permission_mode: "bypassPermissions" },
	/* THE VOICE ASSISTANT (2026-10-17, ux/Dictate/doc/voice-assistant.md): one plain assistant per voice session, the fast seat.
	 * Per sentence it writes ONE placement, {"place":{re, to, where, edit}}, into the session file with the item tool. */
	"voice-assistant":  { skill: "voice-assistant",  prefix: "voice-assistant",  tier: "fast",      model: model("fast"),       effort: "low",    permission_mode: "bypassPermissions" },
	"session-smart":    { prefix: "session-smart",    tier: "voice_smart", model: model("voice_smart"), /* Sonnet via tiers.js (the owner, 2026-10-25: Opus 5.5 for one night, then back to Sonnet for pace): the owner dictates to it directly and it acts. Sessions.claude_model drops to Sonnet only while the week is over pace. "Mastermind permissions" = permission_mode bypassPermissions + the full Claude Code tool preset + Servex's MCP door (spawn, item, owner_note). */ effort: "medium", permission_mode: "bypassPermissions" },
	/* A FRESH mastermind for one folder (Servex/agents/directory.js, `ask_directory`): the task
	 * mastermind's posture, opened with the folder's plain files as its first message. Spawned by
	 * code with `system` set, so this row's skills are inlined by directory.js, not by `opening()`
	 * below. Replaces the retired per-page "manager" for technical questions. doc/directory.md. */
	"directory-mastermind": { readme: "mastermind", skills: ["page"], prefix: "directory-mastermind", tier: "manager", model: model("manager"), effort: "medium", permission_mode: "plan" },
	/* Skill-usage audit 2026-10-12: these three were never told to load a skill (2 of 518 loaded one on their own);
	 * a role row is what makes Servex prefix "Load the X skill". Callers' own model/effort/permissions still win. */
	reviewer:           { readme: "reviewer",           prefix: "reviewer",         tier: "manager", model: model("manager"),      effort: "medium", permission_mode: "bypassPermissions" },
	checker:            { readme: "reviewer",           prefix: "checker",          tier: "manager", model: model("manager"),      effort: "medium", permission_mode: "bypassPermissions" },
	voter:              { skill: "research",         prefix: "voter",            tier: "manager", model: model("manager"),      effort: "medium", permission_mode: "bypassPermissions" },
	"log-assistant":    { skill: "log-assistant",    prefix: "log-assistant",    tier: "fast",      model: model("fast"),       effort: "low",  permission_mode: "acceptEdits" }
};

/* The rows as Role objects (core/Role): the same data, one object per row. */
export const ROLE_LIST = Role.from_rows(ROLES);

/* A role word or one of its aliases -> the row's canonical role. `alias` is a
 * string or an array of strings, so several old words can point at one new row. */
export function canonical(word){
	if (ROLES[word]) return word;
	return Object.keys(ROLES).find(k => [].concat(ROLES[k].alias ?? []).includes(word));
}

const row = word => ROLES[canonical(word)];

/* Alias words that carry a default PATH (the owner, 2026-10-25): spawning `ai-system-mastermind` is spawning `mastermind` at
 * public/framework/ai. A caller's own `path` wins. */
export const ALIAS_PATHS = { "ai-system-mastermind": "public/framework/ai", "servex-mastermind": "public/framework/ai" };
export function alias_path(word){ return ALIAS_PATHS[word] ?? null; }

/* The posture fields only — `skill`, `prefix` and `alias` are not spawn options.
 * `provider` is DERIVED from the row's `tier` here (review.md finding 5: tiers.js's
 * `provider` export had no caller — moving a tier to OpenRouter did nothing by
 * itself, only the slash rule on its `model` happened to carry it), so a tier
 * moved to `provider: "openrouter"` in tiers.js now actually takes effect. */
export function defaults(role){
	const { model, effort, permission_mode, tier } = row(role) ?? {};
	return row(role) ? { model, effort, permission_mode, provider: provider(tier) } : {};
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
export function opening(role, prompt, { in_system = false } = {}){
	const parts = parts_of(role);
	if (!parts.length) return prompt;
	/* THE ROLE TEXT IN THE SYSTEM PROMPT (the owner, 2026-10-23; public/framework/ai/doc/context-drift.md): when Agents
	 * passes role_system() as the preset's `append`, the first message only points at it. /compact summarizes the first
	 * message; it keeps the system prompt. */
	if (in_system && parts.every(p => p.text !== null))
		return `[Servex put ${and_list(parts.map(p => p.label))} in your system prompt, so it survives compaction; don't call the Skill tool for it.]\n\nNow: ${prompt}`;
	/* 2026-10-12 (Servex/doc/skills.md): the text itself rides in the first message, so loading
	 * is node's job, not the model's choice. A missing file falls back to the old "Load the" request. */
	if (parts.some(p => p.text === null)) return `Load ${and_list(parts.map(p => p.label))}, then: ${prompt}`;
	const blocks = parts.map(p => p.block).join("\n\n");
	return `[Servex loaded ${and_list(parts.map(p => p.label))} for you; the text is below, so don't call the Skill tool for it.]\n\n${blocks}\n\nNow: ${prompt}`;
}

/* The role text for the system prompt (the claude_code preset's `append`): the role readme and each skill the row
 * carries, the same blocks opening() used to put in the first message. Null when the role has none, or a file is
 * missing (then opening()'s "Load …" fallback still applies). */
export function role_system(role, { path: dir } = {}){
	const parts = parts_of(role);
	if (parts.some(p => p.text === null)) return null;
	const head = parts.length ? `# Your role (Servex)\n\nYou are a Servex agent in the role \`${canonical(role)}\`. Your role text follows. It is part of your system prompt, so it survives compaction.\n\n${parts.map(p => p.block).join("\n\n")}` : "";
	return [head, dir ? path_parts(dir).block : ""].filter(Boolean).join("\n\n") || null;
}

/* SPAWNED AT A PATH (the owner, 2026-10-25; roles/mastermind.md "Spawned at a path"). `dir` is a repo path (Agents.spawn resolves a
 * site path with directory.js dir_of first). The system prompt gets, after the role text: <path-readmes> (the readme chain from the
 * repo root down to dir, each headed by its repo path, under first_prompt's size cap) and <path-mastermind> (dir/mastermind.md, else
 * dir/ai/mastermind.md, when one exists). Returns {path, files: [{file, kind, text}], missing: [why], mastermind: file|null, block}. */
export function path_parts(dir){
	const rel = String(dir).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
	const { kept, dropped } = capped_chain(rel);
	const files = kept.map(r => ({ file: r.path, kind: "readme", text: r.text }));
	const missing = dropped.map(r => `${r.path} (over the size cap)`);
	if (!kept.length && !dropped.length) missing.push(`no readme from the repo root down to ${rel}`);
	let mm = null;
	for (const file of [`${rel}/mastermind.md`, `${rel}/ai/mastermind.md`]){
		let text; try { text = fs.readFileSync(path.join(REPO, file), "utf8").replace(/^<!--[\s\S]*?-->\r?\n/, "").trim(); } catch { continue; }
		mm = { file, kind: "mastermind", text }; files.push(mm); break;
	}
	const blocks = [];
	if (kept.length) blocks.push(`<path-readmes path="${rel}">\n${kept.map(r => `=== ${r.path} ===\n${r.text}`).join("\n\n")}\n</path-readmes>`);
	if (mm) blocks.push(`<path-mastermind file="${mm.file}">\n${mm.text}\n</path-mastermind>`);
	return { path: rel, files, missing, mastermind: mm?.file ?? null, block: blocks.join("\n\n") };
}

/* Servex's check at spawn: every file path_parts lists must really be inside the final system-prompt text (`append`, null when the
 * role text could not be built). Returns {path, files: [file], mastermind, missing: [name or why], ok}. */
export function path_check(append, dir){
	const pp = path_parts(dir);
	const absent = append ? pp.files.filter(f => !append.includes(f.text)).map(f => f.file) : pp.files.map(f => f.file);
	const missing = [...pp.missing, ...absent];
	return { path: pp.path, files: pp.files.map(f => f.file), mastermind: pp.mastermind, missing, ok: !!append && !missing.length };
}

/* The first-message line that tells the agent what Servex loaded for its path (and, when something is missing, what to read itself). */
export function path_note(check){
	const where = check.mastermind ? `; mastermind file: ${check.mastermind}` : "; no mastermind.md there";
	if (check.ok) return `[Servex put ${check.files.length} file${check.files.length === 1 ? "" : "s"} for your path \`${check.path}\` in your system prompt (${check.files.join(", ")}${where}); they survive compaction, so don't re-read them.]`;
	return `[WARNING: Servex could NOT load everything for your path \`${check.path}\`. Not in your system prompt: ${check.missing.join("; ")}. Read those yourself before you start. Loaded: ${check.files.filter(f => !check.missing.includes(f)).join(", ") || "none"}${where}.]`;
}

/* THE ROLE REMINDER (context drift, the owner 2026-10-23): a few lines, never the whole readme. The readme's title, the
 * bold lead of each top paragraph (the role readmes put their top rules there), its section headings, and the path to
 * re-read. Computed from the file, so editing the readme edits the reminder. Null when the role has no readme. */
export function role_reminder(role){
	const r = row(role);
	const text = r?.readme ? role_readme(r.readme) : null;
	if (!text) return null;
	const file = `Servex/agents/roles/${r.readme}.md`;
	const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? r.readme;
	/* A bold lead that ends in ":" ("**Your part of the build order:** build, test, fix.") carries its first sentence. */
	const rules = [...text.matchAll(/^\*\*(.+?)\*\*[ \t]*([^\n]*)/gm)]
		.map(m => /:$/.test(m[1].trim()) ? `${m[1].trim()} ${(m[2].match(/^.*?[.!?](\s|$)/)?.[0] ?? m[2]).trim().slice(0, 160)}` : m[1].trim())
		.slice(0, 6);
	const heads = [...text.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].replace(/\s*\(.*?\)\s*$/, "").trim()).slice(0, 12);
	const skills = skills_of(role);
	const lines = [`[Role reminder from Servex: you are \`${canonical(role)}\` (${title.slice(0, 120)}). Your full role text is in your system prompt and at ${file}; re-read it before your next decision if you are unsure.]`];
	if (rules.length) lines.push("Top rules:", ...rules.map(x => `- ${x}`));
	if (heads.length) lines.push(`Sections: ${heads.join(" · ")}`);
	if (skills.length) lines.push(`Skills you carry: ${skills.join(", ")}`);
	return lines.join("\n").slice(0, 1600);
}

/* The row's role readme (if it names one), then each of its skills: {name, label, text, block}. */
function parts_of(role){
	const r = row(role), out = [];
	if (r?.readme) {
		const file = `Servex/agents/roles/${r.readme}.md`, text = role_readme(r.readme);
		out.push({ name: `roles/${r.readme}`, label: `your role readme \`${file}\``, text, block: `<role-readme path="${file}">\n${text}\n</role-readme>` });
	}
	for (const s of skills_of(role)) {
		const text = skill_text(s);
		out.push({ name: s, label: `the \`${s}\` skill`, text, block: `<skill name="${s}">\n${text}\n</skill>` });
	}
	return out;
}

/* What a role gets inlined (empty when the fallback applies) — Agents logs this as `skills_injected`. */
export function injected(role){
	const parts = parts_of(role);
	return parts.every(p => p.text !== null) ? parts.map(p => p.name) : [];
}

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const SKILLS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.claude/skills");
export const ROLES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "roles");

/* The repo path of a role's readme (`Servex/agents/roles/<readme>.md`), or null when the role has none. A spawn records this path,
 * never the text (a Session entry's spawn.role_readme, open_task's line 1). */
export function role_readme_path(role){
	const r = row(role);
	return r?.readme && fs.existsSync(path.join(ROLES_DIR, `${r.readme}.md`)) ? `Servex/agents/roles/${r.readme}.md` : null;
}

/* A role readme's text without its leading move comment, or null. */
export function role_readme(name){
	try { return fs.readFileSync(path.join(ROLES_DIR, `${name}.md`), "utf8").replace(/^<!--[\s\S]*?-->\r?\n/, "").trim(); }
	catch { return null; }
}

/* SKILL.md without its frontmatter, or null when the skill has no file. A skill that is now a
 * pointer ("Read `Servex/agents/roles/<role>.md` …") returns that role readme instead. */
export function skill_text(name){
	let body;
	try { body = fs.readFileSync(path.join(SKILLS_DIR, name, "SKILL.md"), "utf8").replace(/^---[\s\S]*?\n---\r?\n/, "").trim(); }
	catch { return null; }
	const to = body.match(/^Read `Servex\/agents\/roles\/([\w-]+)\.md`/)?.[1];
	return to ? role_readme(to) ?? body : body;
}
