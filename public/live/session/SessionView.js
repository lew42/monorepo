// SessionView — a lean, DOM-free fold of one session's session.jsonl into {tasks, children, totals}.
// Deliberately NOT core/Session (that class drags in Chat/Settings/View for a chat and settings UI
// this prototype never shows); this is the small fold the brief allows when the full replay is
// heavier than the page needs. Runs in node (the test) and the browser the same way.
export default class SessionView {

	// text -> {id, startAt (ms), lastAt (ISO string), tasks: [...], done, total, children}. Never throws on a bad line.
	static fold(text){
		const lines = String(text ?? "").split("\n").filter(Boolean).map(line => {
			try { return JSON.parse(line); } catch { return null; }
		}).filter(Boolean);

		let id = null, startAt = null, lastAt = null;
		const tasks = new Map();   // top-level task id -> task row, insertion order = first-seen order
		const children = [];       // {agent, at, task_dir} from {"spawned":{...}} lines

		for (const line of lines){
			if (line.ts) lastAt = line.ts;
			if (line.session){ id = line.session.id ?? id; startAt = line.session.at ?? startAt; continue; }
			if (line.assign){ id = id ?? line.assign.agent ?? null; const at = Date.parse(line.assign.requested_at ?? ""); startAt = startAt ?? (Number.isNaN(at) ? null : at); continue; }
			if (line.spawned){ children.push({ agent: line.spawned.agent ?? null, at: line.spawned.at ?? null, task_dir: line.spawned.task_dir ?? null }); continue; }
			if (line.tasks) SessionView.apply_tasks(tasks, line.tasks);
		}

		const list = [...tasks.values()];
		const stopped = list.filter(t => t.state === "stopped").length;
		const done = list.filter(t => t.state === "complete").length;
		return { id, startAt, lastAt, tasks: list, done, total: list.length - stopped, children };
	}

	// One task-list's worth of ops: {"add": {...}} makes a row; any other key is an existing (or lazily made) id's own ops.
	static apply_tasks(map, ops){
		for (const [key, val] of Object.entries(ops ?? {})){
			if (key === "add"){
				const id = val?.id;
				if (!id) continue;
				map.set(id, SessionView.new_task(id, val));
				continue;
			}
			let t = map.get(key);
			if (!t){ t = SessionView.new_task(key, { title: key }); map.set(key, t); }   // a subtask referenced before an explicit add
			SessionView.apply_ops(t, val);
		}
	}

	static new_task(id, fields){
		return { id, title: fields?.title ?? id, state: "idle", module: fields?.module ?? null, why: fields?.why ?? null,
			owner: null, outcome: null, evidence: null, waiting: null, log: [], subtasks: new Map() };
	}

	// One task's own ops line (a verb, a plain field, or a nested "tasks" for its subtasks).
	static apply_ops(t, ops){
		for (const [verb, arg] of Object.entries(ops ?? {})){
			switch (verb){
				case "start": case "resume": t.state = "running"; break;
				case "pause": t.state = "paused"; break;
				case "stop": t.state = "stopped"; t.why = arg?.why ?? t.why; break;
				case "wait": t.state = "waiting"; t.waiting = { on: arg?.on ?? null, what: arg?.what ?? null }; break;
				case "complete":
					t.state = "complete";
					if (arg?.outcome !== undefined) t.outcome = arg.outcome;
					if (arg?.evidence !== undefined) t.evidence = arg.evidence;
					break;
				case "log": t.log.push(typeof arg === "string" ? arg : arg?.msg ?? JSON.stringify(arg)); break;
				case "title": t.title = arg; break;
				case "owner": t.owner = arg; break;
				case "module": t.module = arg; break;
				case "tasks": SessionView.apply_tasks(t.subtasks, arg); break;
				default: break;   // now, priority, tags, …: not shown in this prototype
			}
		}
	}

	// The four groups the brief asks for; "stopped" (dropped) folds into "done" so nothing silently disappears.
	static GROUPS = [
		{ key: "working", label: "Working", states: ["running"] },
		{ key: "waiting", label: "Waiting on you", states: ["waiting"] },
		{ key: "open", label: "Open", states: ["idle", "paused"] },
		{ key: "done", label: "Done", states: ["complete", "stopped"] },
	];
	static grouped(tasks){
		return SessionView.GROUPS.map(g => ({ ...g, tasks: tasks.filter(t => g.states.includes(t.state)) }));
	}
}
