/* THE ONE-SCREEN GLOBAL BRIEF — what every long-lived agent starts with: who is
 * working on what (the claims list), who is running, and today's focus line.
 * Built by code, never by a model; at most 25 lines; never throws. */

const WORKERS = /^(minion|fork|job|helper)/;
let focus = null;

/* `servex.log.tail` is async and the brief is not, so the last focus is kept
 * here: Global sets it at boot and whenever `set_focus` writes one. */
export function remember_focus(text){ focus = text ? String(text) : null; }

export function brief(servex){
	const out = ["# Servex right now"];
	try {
		const claims = (servex?.claims?.list?.() ?? []).filter(c => !c.stale);
		out.push("Being worked on:");
		for (const c of claims.slice(0, 6)) out.push(`- ${c.topic}: ${c.agent} on ${c.card ?? "no card"}`);
		if (claims.length > 6) out.push(`- and ${claims.length - 6} more (list_claims)`);
		if (!claims.length) out.push("- nothing claimed");

		const running = [...(servex?.agents?.live?.values?.() ?? [])]
			.filter(a => a.state !== "stopped" && !WORKERS.test(a.role ?? "") && !WORKERS.test(a.id ?? ""));
		out.push("Running now:");
		for (const a of running.slice(0, 12)) out.push(`- ${a.id}: ${a.state}`);
		if (running.length > 12) out.push(`- and ${running.length - 12} more`);
		if (!running.length) out.push("- nothing");

		out.push("Today's focus:", focus ? `- ${focus.split("\n")[0].slice(0, 200)}` : "- none set");
	} catch {}
	return out.slice(0, 25).join("\n");
}

export default brief;
