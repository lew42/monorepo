/* Listed — which Servex tools an agent SEES in tools/list. Every other tool is still registered, still answers
 * tools/call by name, and is reached through the one dispatcher, `call({tool, args})`.
 *
 * Why (the owner, 2026-11-19, asked many times since 2026-09-25): "one item tool that can do anything ... I don't know why there's
 * 107 tools. That's all injected into the descriptions on each prompt." Every listed tool's schema rides in the caller's context;
 * an unlisted one costs one name in `call`'s description. History and numbers: public/framework/ai/doc/tool-collapse.md.
 *
 *   Listed.local(caller, role)   names for the local door (/mcp?as=<id>), by the caller's role
 *   Listed.remote()              names for the claude.ai connector (/mcp/remote)
 *   Listed.all()                 true when SERVEX_LIST_ALL=1: the old behaviour, everything listed (the one-line rollback)
 *
 * Changing a set needs a Servex restart (the list is read on each tools/list, but clients cache it per connection).
 * The rule for adding a name: it carries a large share of calls for that role, or a small model cannot start without it. */
export default class Listed {

	/* Every local caller: Servex SDK agents (`?as=<id>`) and VS Code / CLI tabs (no `as`). `item` is served in-process to SDK
	 * agents as mcp__local__item (Agents.js door()), so its HTTP twin is hidden from them there, and listed here for tabs. */
	static BASE = ["item", "call", "send_to_agent", "spawn_agent", "list_agents", "stop_agent", "close_task", "wake_me", "log"];

	/* A few roles carry one or two tools of their own: the ones their skill text tells them to call every turn. A small model
	 * (the Haiku voice seats) should not have to find its main verb through `call`. */
	static ROLE = {
		"single-voice-assistant": ["say", "nothing", "retract_say"],
		"voice-assistant": ["nothing"],
		"session-smart": ["session_line", "session_summary"],
		"voice-mastermind": ["session_line", "session_summary"],
	};

	/* The claude.ai connector: a cloud agent with no files of its own, so it keeps the file tools it calls most. Its own
	 * voice tools (cloud_voice_log) are listed by RemoteMCP itself. */
	static REMOTE = ["item", "call", "updates", "send_to_agent", "spawn_agent", "list_agents", "shell", "read_file", "figma"];

	static all(){ return process.env.SERVEX_LIST_ALL === "1"; }

	/* The role of a caller id. `role` (from the agents registry) wins; a voice seat's id names its role
	 * (`single-voice-assistant-<session>`, `session-smart-<session>`), so the id is the fallback. */
	static role_of(caller, role){
		if (role && Listed.ROLE[role]) return role;
		return Object.keys(Listed.ROLE).find(r => String(caller ?? "").startsWith(r + "-")) ?? role ?? null;
	}

	static local(caller = null, role = null){
		return [...Listed.BASE, ...(Listed.ROLE[Listed.role_of(caller, role)] ?? [])];
	}

	static remote(){ return [...Listed.REMOTE]; }
}
