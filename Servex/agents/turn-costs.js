/* turn_costs(text): each turn's real dollars, read from an agent's Servex log (logs/agent-<id>). Readers: Agents.log_cost
 * (an agent's and a task's cost), Server/role-spend.mjs (spend per week and month).
 *
 * A Claude agent's `turn_cost` is a diff of the Agent SDK's `total_cost_usd`, which is the SESSION's running total: a resumed
 * process (awaken, reopen) starts from what the session already cost. Until 2026-10-23 Servex assumed every process started
 * from 0, so the first turn after each wake-up logged the whole session (minion-review-page: $79.58 logged, $12.24 real).
 * Lines since then carry `sdk_total` and are exact; older lines are rebuilt: the total is turn_cost summed since the process
 * started, and a turn costs what the total grew by. A total lower than the last is a fresh session (renew, fork) and counts in
 * full. ⚠ A fresh session whose first turn already exceeds the old total is under-counted (only old lines; rare).
 * An openrouter agent's turn_cost is already real (refresh_or_cost), so it is returned as written. */
export function turn_costs(text, { openrouter = false } = {}){
	const turns = [];
	let proc = 0, last = 0;
	for (const line of String(text).split("\n")){
		if (!line.includes('"turn_cost"') && !line.includes('"state":"started"') && !line.includes('"type":"renew"')) continue;
		let j; try { j = JSON.parse(line); } catch { continue; }
		if (j.type === "process" && j.state === "started"){ proc = 0; continue; }
		if (j.type === "renew"){ proc = last = 0; continue; }   // a fresh session under the same id
		if (!("turn_cost" in j)) continue;
		if (openrouter){ turns.push({ line: j, cost: Number(j.turn_cost) || 0 }); continue; }
		const total = Number.isFinite(j.sdk_total) ? j.sdk_total : proc + (Number(j.turn_cost) || 0);
		turns.push({ line: j, cost: total >= last ? total - last : total });
		proc = last = total;
	}
	return { turns, sdk_total: last };
}
