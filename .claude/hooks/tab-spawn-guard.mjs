/* TAB SPAWN GUARD (2026-11-01): a PreToolUse hook on the Agent tool.
 *
 * WHY. A VS Code sidebar tab (CLAUDE_CODE_ENTRYPOINT=claude-vscode) that spawns with Claude Code's own Agent tool makes
 * untracked agents: no session folder, no card, no interrupt, their cost folded into the tab. The owner has asked
 * "100 times" for tabs to spawn through Servex instead (Servex/agents/roles/vscode-mastermind.md). On 2026-11-01 a tab
 * spawned five Agent-tool masterminds anyway. So the rule is enforced here, not only written down.
 *
 * BLOCKS (exit 2) the Agent tool in a VS Code tab, except the read-only Explore and claude-code-guide types (quick
 * searches). SDK agents (Servex) and terminal sessions are untouched. FAILS OPEN on any error. */

let raw = "";
process.stdin.on("data", d => (raw += d)).on("end", () => {
	try {
		if (process.env.CLAUDE_CODE_ENTRYPOINT !== "claude-vscode") return process.exit(0);
		const type = String(JSON.parse(raw).tool_input?.subagent_type ?? "");
		if (/^(Explore|claude-code-guide)$/.test(type)) return process.exit(0);
		process.stderr.write("TAB SPAWN GUARD: a VS Code tab spawns agents through Servex, not the Agent tool (untracked: no session folder, no card, no interrupt). Use the Servex MCP tool spawn_agent with session_id = $CLAUDE_CODE_SESSION_ID and task {dir, brief}. Read Servex/agents/roles/vscode-mastermind.md.\n");
		process.exit(2);
	} catch {
		process.exit(0);
	}
});
