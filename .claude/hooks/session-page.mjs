/* session-page.mjs — the SessionStart hook: tells a VS Code / CLI tab its own page.
 *
 * Claude Code hands this hook { session_id } on stdin; what it prints to stdout is added to the
 * session's context. A Servex-spawned agent gets the same line from Agents.whoami(); this is the
 * tab's copy, so both learn the path the same way. Decision: Servex/agents/doc/own-page.md. */
let raw = "";
process.stdin.on("data", d => raw += d).on("end", () => {
	try {
		const id = JSON.parse(raw).session_id;
		if (id) console.log(`[Your own page is /framework/ai/sessions/${id}/ — pass it as \`path\` to page_set, page_add, page_call and page_read to change what the owner sees there.]`);
	} catch {}
});
