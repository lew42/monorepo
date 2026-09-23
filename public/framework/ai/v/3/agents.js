import { div, button, pre } from "/app.js";

/**
 * THE AGENTS STRIP (board-from-events, 2026-09-22, phase-2 item 5) — every live
 * Servex-hosted Claude session, one small row each, pushed the moment it happens
 * over Servex's own `GET /api/stream` (never polled — a token arrives as the
 * agent thinks it). Servex is a SEPARATE process (127.0.0.1:8090 by default,
 * `?servex=<url>` overrides it for a proof run against a dead port) that may not
 * be running at all: nothing here throws, warns or calls `console.error` when it
 * isn't — the strip is only built once `GET /agents` (the registry) actually
 * answers, so a failed fetch just leaves the row empty and the rest of the board
 * loads exactly as it always has.
 *
 * `on_landed(card)` fires once, the moment a `minion` or `task-mastermind` agent
 * emits its final `result` (state `stopped`) — see page.js's own call site for
 * why turning that into a board card happens here, in the browser, rather than
 * Servex appending to `board.jsonl` itself (this task's own `decision` line).
 */
export function agents_strip($host, on_landed) {
	const base = new URLSearchParams(location.search).get("servex") || "http://127.0.0.1:8090";
	const rows = new Map(), $btns = new Map();
	let $rows, $feed, open_id = null, membership = null, idle_open = false;

	fetch(`${base}/agents`).then(r => (r.ok ? r.json() : null)).catch(() => null).then(list => {
		if (!Array.isArray(list)) return;   // Servex not answering — the strip stays absent
		$host.empty(() => {
			$rows = div.c("v3-agents-rows flex wrap gap-25");
			$feed = pre.c("v3-agents-feed");
			$feed.el.hidden = true;
		});
		list.forEach(row => rows.set(row.id, row));
		paint();
		listen();
	});

	/* IDLE AGENTS ARE NOT A LIST (board-declutter, 2026-09-22) — the owner saw
	   five idle proof agents spelled out by name across a whole row of the
	   board's chrome: "minion-alpha-writer - minion - idle, minion-beta-writer
	   - minion - idle, .etc..." An agent that is idle has nothing to tell you,
	   so it does not get a chip: only agents that are actually WORKING do, and
	   the idle ones collapse into one "3 idle" chip at the end of the same
	   line. Click that chip and they expand in place, exactly as they were —
	   nothing is deleted, it is just folded. With nothing working and nothing
	   idle, the whole strip is absent.

	   ⚠ Rebuilds the row list ONLY when who is shown actually changes — a busy
	   agent emits a `delta` per token, which repaints every OTHER row's state
	   too (`listen()` below merges the whole card on every event), and a full
	   `$rows.empty()` on each one was measured to make a row un-clickable: a
	   headless click landed mid-rebuild and timed out waiting for an element
	   that kept getting torn down and replaced underneath it. Existing rows
	   are now updated in place; only a real join/leave rebuilds the list. */
	function paint() {
		if (!$rows) return;
		const live = [...rows.values()].filter(r => r.state !== "stopped");
		const working = live.filter(r => r.state !== "idle");
		const idle = live.filter(r => r.state === "idle");
		// An idle agent whose transcript is open stays on screen whatever the
		// fold says — closing the fold under an open feed would leave the feed
		// with nothing naming whose it is.
		const shown = idle_open ? live : working.concat(idle.filter(r => r.id === open_id));
		$host.el.hidden = !live.length && open_id == null;
		const key = shown.map(r => r.id).sort().join(",") + "|" + idle.length + "|" + idle_open;
		if (key !== membership) {
			membership = key;
			$btns.clear();
			$rows.empty(() => {
				shown.forEach(r => $btns.set(r.id, row_button(r)));
				if (idle.length && !idle_open) button.c("v3-agents-idle").attr("type", "button")
					.attr("title", "Agents that are registered but not working right now — click to see them")
					.text(`${idle.length} idle`)
					.click(() => { idle_open = true; membership = null; paint(); });
				else if (idle.length) button.c("v3-agents-idle on").attr("type", "button")
					.text("hide idle")
					.click(() => { idle_open = false; membership = null; paint(); });
			});
		} else {
			shown.forEach(r => label($btns.get(r.id), r));
		}
	}

	function row_button(r) {
		const $b = button.c("v3-agents-row").attr("type", "button").click(() => toggle(r.id));
		label($b, r);
		return $b;
	}

	function label($b, r) {
		if (!$b) return;
		$b.text(`${r.id} · ${r.role ?? "agent"} · ${r.state}` + (r.turns != null ? ` · ${r.turns}t` : ""));
		$b.el.classList.toggle("on", r.id === open_id);
	}

	/* Click a row: open its transcript (its last 50 logged events, then every
	   further event live) or close it back up. */
	async function toggle(id) {
		$btns.get(open_id)?.el.classList.remove("on");
		open_id = open_id === id ? null : id;
		$btns.get(open_id)?.el.classList.add("on");
		$feed.el.hidden = open_id == null;
		$feed.empty();
		if (open_id == null) return;
		const events = await fetch(`${base}/log/agent-${id}?n=50`).then(r => (r.ok ? r.json() : [])).catch(() => []);
		events.forEach(feed_line);
	}

	/* One event, one line — `delta` joins the sentence already there instead of
	   starting a new one, the same rule Servex's own dashboard uses. */
	function feed_line(e) {
		if (e.type === "delta") $feed.el.append(e.text);
		else if (e.type === "transcript" || e.type === "subagent") $feed.el.append(e.text + "\n");
		else if (e.type === "tool") $feed.el.append(`· ${e.name} ${e.input ?? ""}\n`);
		else if (e.type === "agent_msg") $feed.el.append(`[${e.from ?? "host"}] ${e.text}\n`);
		else if (e.type === "result") $feed.el.append(`— turn ${e.turns ?? "?"} · $${(e.cost ?? 0).toFixed(4)}\n`);
		else if (e.type === "error") $feed.el.append(`! ${e.text}\n`);
	}

	function listen() {
		let source;
		try { source = new EventSource(`${base}/api/stream`); }
		catch { return; }
		source.addEventListener("agent", msg => {
			let event;
			try { event = JSON.parse(msg.data); } catch { return; }
			if (event.card) { rows.set(event.card.id, event.card); paint(); }
			if (event.agent === open_id) feed_line(event);
			if (event.type === "result" && event.card?.state === "stopped"
				&& ["minion", "task-mastermind"].includes(event.card.role)) land(event.agent);
		});
		source.onerror = () => {};   // Servex restarting or gone — EventSource retries on its own
	}

	/* The landed agent's own last spoken turn becomes a board card — see the
	   fold's own rule (log-model/fold.js, events.md): newest wins, and a
	   transcript is read forward, not folded, so this simply takes the last one
	   the agent actually said. */
	async function land(id) {
		const events = await fetch(`${base}/log/agent-${id}?n=200`).then(r => (r.ok ? r.json() : [])).catch(() => []);
		const last = [...events].reverse().find(e => e.type === "transcript" || e.type === "subagent");
		on_landed?.({
			id: `agent-${id}`, author: id, title: id, status: "done",
			text: last?.text ?? "(no transcript)",
			at: events.at(-1)?.at ?? new Date().toISOString(),
			updated_at: events.at(-1)?.at ?? new Date().toISOString()
		});
	}
}

export default agents_strip;
