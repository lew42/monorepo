/* node Servex/agents/role-system.test.mjs — the role readme in the system prompt, and the role reminder against context
 * drift (the owner, 2026-10-23; public/framework/ai/doc/context-drift.md). Fake agents from Agent.prototype: no process. */
import assert from "node:assert";
import fs from "fs";
import os from "os";
import path from "path";

process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "servex-rolesys-"));
for (const k of ["SERVEX_ROLE_IN_SYSTEM", "SERVEX_ROLE_REMINDER", "SERVEX_REMIND_TOKENS"]) delete process.env[k];
const { Agents, REMIND_TOKENS } = await import("./Agents.js");
const { role_system, role_reminder, opening } = await import("./roles.js");

let n = 0;
const t = (ok, what) => { assert.ok(ok, what); n++; };

// roles.js
const minion_readme = fs.readFileSync(new URL("./roles/minion.md", import.meta.url), "utf8");
t(role_system("minion").includes('<role-readme path="Servex/agents/roles/minion.md">'), "role_system carries the role readme block");
t(role_system("minion").includes(minion_readme.match(/^# .+$/m)[0]), "…with the readme's own text");
t(role_system("task-mastermind").includes('<skill name="page">'), "…and the skills the row carries");
const short = opening("minion", "do X", { in_system: true });
t(short.length < 300 && /in your system prompt/.test(short) && short.endsWith("Now: do X"), "in_system: the first message only points at it");
t(opening("minion", "do X").includes("<role-readme"), "without in_system: the old inline opening");
const r = role_reminder("minion");
t(r.includes("Servex/agents/roles/minion.md") && /Top rules:/.test(r) && r.length <= 1600, "reminder: path, top rules, short");
t(!r.includes(minion_readme.slice(400, 800)), "reminder is not the whole readme");
t(/Your part of the build order: build/.test(r), "a bold lead ending in ':' carries its first sentence");
t(role_reminder("page-assistant") === null, "a role with no readme: no reminder");

function fake(over = {}){
	const events = [];
	const a = Object.create(Agents.Agent.prototype);
	Object.assign(a, { id: "minion-x", role: "minion", state: "working", turns: 1, context: 0, emit: e => events.push(e), ...over });
	return { a, events };
}

{ // the system prompt option
	const { a } = fake();
	const sp = a.role_prompt();
	t(sp.type === "preset" && sp.preset === "claude_code" && sp.append === role_system("minion"), "plain spawn: claude_code preset + append");
	t(fake({ system: "brief" }).a.role_prompt() === null, "a spec with its own system prompt keeps it");
	process.env.SERVEX_ROLE_IN_SYSTEM = "0";
	t(fake().a.role_prompt() === null, "SERVEX_ROLE_IN_SYSTEM=0: the old way");
	delete process.env.SERVEX_ROLE_IN_SYSTEM;
	t(fake({ role: "nonexistent-role" }).a.role_prompt() === null, "no role text: no system prompt option");
}
{ // reminders by token growth
	const { a, events } = fake({ last_usage: { input_tokens: 10, cache_read_input_tokens: 50000, output_tokens: 100 } });
	t(a.reminder_due() === null && JSON.stringify(a.remind_hook("PostToolUse")) === "{}", "50k: nothing");
	a.last_usage = { cache_read_input_tokens: REMIND_TOKENS + 5000 };
	const out = a.remind_hook("PostToolUse", { tool_name: "Read" });
	t(out.hookSpecificOutput?.hookEventName === "PostToolUse" && out.hookSpecificOutput.additionalContext === role_reminder("minion"), "past 100k: the reminder as PostToolUse additionalContext");
	t(events.some(e => e.type === "role_reminder" && e.why === "tokens" && e.context === REMIND_TOKENS + 5000), "logged role_reminder with the context");
	t(JSON.stringify(a.remind_hook("PostToolUse")) === "{}", "once per step");
	a.last_usage = { cache_read_input_tokens: 2 * REMIND_TOKENS + 6000 };
	t(a.remind_hook("UserPromptSubmit").hookSpecificOutput?.hookEventName === "UserPromptSubmit", "the next step: again, on a prompt");
	a.last_usage = { cache_read_input_tokens: 3 * REMIND_TOKENS + 9000 };
	t(JSON.stringify(a.remind_hook("PostToolUse", { agent_id: "sub-1" })) === "{}", "a subagent's tool call never carries it");
}
{ // after a compaction
	const { a, events } = fake({ last_usage: { cache_read_input_tokens: 300000 }, reminded_context: 300000 });
	a.boundary({ compact_metadata: { trigger: "manual", pre_tokens: 300000, post_tokens: 18000 } });
	t(a.context === 18000 && a.reminder_due(18000) === "compaction", "compact_boundary: due at once");
	const out = a.remind_hook("UserPromptSubmit");
	t(/Role reminder/.test(out.hookSpecificOutput?.additionalContext ?? ""), "the first prompt after it carries the reminder");
	t(events.some(e => e.type === "role_reminder" && e.why === "compaction"), "logged why=compaction");
	t(a.reminder_due(18000 + REMIND_TOKENS - 1) === null && a.reminder_due(18000 + REMIND_TOKENS) === "tokens", "token steps restart from the compacted size");
}
{ // hooks: merged with the spec's own and a fork's refusal; off switch
	const mine = async () => ({});
	const h = fake({ sdk: { hooks: { PostToolUse: [{ hooks: [mine] }] } } }).a.sdk_hooks();
	t(h.PostToolUse.length === 2 && h.PostToolUse[0].hooks[0] === mine && h.UserPromptSubmit.length === 1, "the spec's own hooks stay, reminder hooks added");
	const fork = fake({ one_shot: true, fork_tools: [] }).a.sdk_hooks();
	t(fork.PreToolUse?.length === 1 && !fork.UserPromptSubmit, "a fork: the refusal, no reminder");
	process.env.SERVEX_ROLE_REMINDER = "0";
	t(Object.keys(fake().a.sdk_hooks()).length === 0, "SERVEX_ROLE_REMINDER=0: no hooks");
	delete process.env.SERVEX_ROLE_REMINDER;
}
{ // the reminder tells the truth about where the role text is
	t(fake({ system: "brief" }).a.reminder_text() === null, "own system prompt: no reminder");
	process.env.SERVEX_ROLE_IN_SYSTEM = "0";
	const r = fake().a.reminder_text();
	t(r && !/in your system prompt/.test(r) && /Your full role text is at Servex/agents/roles/minion.md/.test(r), "off switch: the reminder names only the file");
	delete process.env.SERVEX_ROLE_IN_SYSTEM;
}
console.log(`role-system: ${n} checks passed`);
