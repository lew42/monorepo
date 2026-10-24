/* SPAWN SESSION HOOK (2026-10-23): a PreToolUse hook on Servex's spawn_agent.
 *
 * WHY. A VS Code tab's MCP call carries no caller id, so Servex links a tab's spawn to the tab only when the call passes
 * `session_id` (Servex/agents/tools.js tab_parent). Tabs forget it: in session-e00f55c9, mastermind-system-architect-2 and -3
 * were spawned from the tab with no parent, so the session page could not list them as its children.
 *
 * WHAT. When the call names neither `parent` nor `session_id`, add `session_id` = this session's own id (the hook input has it).
 * A Servex agent's call is unaffected: Servex prefers `parent`, then its own caller id, over `session_id`.
 * Fails open: any error lets the call through unchanged. */
let raw = "";
process.stdin.on("data", d => raw += d).on("end", () => {
	try {
		const input = JSON.parse(raw), args = input.tool_input ?? {};
		if (!input.session_id || args.parent || args.session_id) return;
		process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow", updatedInput: { ...args, session_id: input.session_id } } }));
	} catch {}
});
