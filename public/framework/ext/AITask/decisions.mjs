#!/usr/bin/env node
/**
 * CLOSING THE LOOP — an Improve is a defect in the rule that produced it.
 *
 *   node public/framework/ext/AITask/decisions.mjs list
 *   node public/framework/ext/AITask/decisions.mjs file
 *   node public/framework/ext/AITask/decisions.mjs file --dry
 *
 * A decision line names the `rule` that produced it (`layout#spacing`). When
 * the owner presses **Improve** on that decision, the Decisions tab appends a
 * `verdict` line to the task's own log. This walks every task log, finds the
 * improve verdicts nobody has filed yet, and writes one dated line into that
 * skill's own `improvements.md`:
 *
 *   2026-09-17 · layout#spacing · the owner said: two rungs, not five ·
 *   decision 2026-09-17/spacing-census/spacing-ladder
 *
 * Then it appends `{"verdict": {"id": …, "filed": "<date>"}}` back to the same
 * log, which merges by id, so the same note can never be filed twice.
 *
 * WHY A CLI AND NOT THE BUTTON. The browser cannot append to `.claude/` — the
 * dev socket's `rpc:append` resolves every path under `public/` and refuses
 * everything else, deliberately, and widening it is how this server's one RCE
 * happened. So the press writes where the browser is allowed to write (the task
 * log), and this runs at harvest, where the writer already has the filesystem.
 *
 * The mastermind runs it. It is safe to run twice: filing is idempotent.
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/* The repo root, from this file's own location — four levels up from
   public/framework/ext/AITask/. ⚠ On Windows a file: URL's pathname is
   "/C:/…", so the leading slash comes off, the same way importance.mjs does it. */
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const REPO = path.resolve(HERE, "../../../..");

const HELP = `decisions — file the owner's Improve notes back into the skills that caused them.

  node public/framework/ext/AITask/decisions.mjs <command> [--flag value]

  list              every unfiled improve verdict, with the rule it belongs to
  file              write each one into its skill's improvements.md, then mark it filed
  file --dry        say exactly what would be written, and write nothing

  --root <dir>      where the task dirs live   (default: public/framework/ai)
  --skills <dir>    where the skills live      (default: .claude/skills)

An improve verdict whose decision names no rule is left alone: not every choice
comes from a skill, and a note with nowhere to go is not a defect in anything.`;

/** --key value, --key=value, and a bare --flag (true). The parser entry.mjs uses. */
function flags(argv){
	const out = {};
	for (let i = 0; i < argv.length; i++){
		if (!argv[i].startsWith("--")) continue;
		const [key, inline] = argv[i].slice(2).split(/=(.*)/s);
		out[key] = inline ?? (argv[i + 1]?.startsWith("--") ? true : argv[++i] ?? true);
	}
	return out;
}

/** Every `<date>/<slug>/task.jsonl` under the tasks root. Two levels, never a walk. */
export function logs(root){
	if (!fs.existsSync(root)) return [];
	return fs.readdirSync(root, { withFileTypes: true })
		.filter(d => d.isDirectory())
		.flatMap(day => fs.readdirSync(path.join(root, day.name), { withFileTypes: true })
			.filter(d => d.isDirectory())
			.map(task => ({ task: `${day.name}/${task.name}`, file: path.join(root, day.name, task.name, "task.jsonl") })))
		.filter(row => fs.existsSync(row.file));
}

/**
 * One task log's decisions and verdicts, merged by id exactly as `TaskJSONL`
 * merges them in the browser — the same file read the same way in both places.
 * A torn line loses that line, never the log.
 */
export function read(file){
	const decisions = new Map();
	const verdicts = new Map();

	fs.readFileSync(file, "utf8").split("\n").forEach(line => {
		if (!line.trim()) return;
		let entry;
		try { entry = JSON.parse(line); } catch { return; }
		for (const [verb, value] of Object.entries(entry)){
			const into = verb === "decision" ? decisions : verb === "verdict" ? verdicts : null;
			if (!into || !value?.id) continue;
			into.set(value.id, Object.assign(into.get(value.id) ?? {}, value));
		}
	});

	return { decisions, verdicts };
}

/**
 * Every improve the owner still stands behind, unfiled, whose decision names a
 * rule.
 *
 * ⚠ ONLY THE NEWEST VERDICT ON A DECISION COUNTS. The log is append-only, so an
 *   Improve the owner later replaced with an Approve is still sitting in the
 *   file — filing it would put a complaint they withdrew into a skill. Newest
 *   wins, which is the rule `/layouts/browse/` and `/imagine/importance/`
 *   already follow for the same reason.
 */
export function pending(root){
	const rows = [];

	for (const { task, file } of logs(root)){
		const { decisions, verdicts } = read(file);

		// Insertion order is file order, so the last one wins per decision.
		const newest = new Map();
		for (const verdict of verdicts.values()) newest.set(verdict.decision, verdict);

		for (const verdict of newest.values()){
			if (verdict.say !== "improve" || verdict.filed) continue;
			const decision = decisions.get(verdict.decision);
			if (!decision?.rule) continue;
			rows.push({ task, file, verdict, decision });
		}
	}

	return rows;
}

/* Today, where this is running — `toISOString()` would silently move it to UTC,
   and after 7pm here that is already tomorrow's date on the line. */
const today = () => {
	const n = new Date();
	const pad = v => String(v).padStart(2, "0");
	return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

/* `layout#spacing` → `.claude/skills/layout/improvements.md`. The section after
   the `#` is not a file, it is which part of the skill is being accused, so it
   stays in the line's text. */
const improvements = (skills, rule) =>
	path.join(skills, String(rule).split("#")[0], "improvements.md");

/** The one line a filing writes. One line, because that is what a reader scans. */
export const line = ({ task, verdict, decision }) =>
	`- ${verdict.at.slice(0, 10)} · ${decision.rule} · the owner said: ${verdict.note} · decision ${task}/${decision.id}`;

export function file_all(root, skills, dry){
	const rows = pending(root);
	if (!rows.length) return "nothing to file — every improve the owner has pressed is already in its skill.";

	const out = [];

	for (const row of rows){
		const target = improvements(skills, row.decision.rule);
		if (!fs.existsSync(target)){
			out.push(`SKIPPED  ${row.decision.rule} — no ${path.relative(REPO, target)}; the rule names a skill that has no improvements file.`);
			continue;
		}

		out.push(`${dry ? "WOULD WRITE" : "wrote"}  ${path.relative(REPO, target)}\n  ${line(row)}`);
		if (dry) continue;

		// ⚠ Append, never rewrite: another agent may be appending to the same
		//   improvements.md right now, and "a" interleaves between lines.
		fs.appendFileSync(target, line(row) + "\n", "utf8");
		fs.appendFileSync(row.file,
			JSON.stringify({ verdict: { id: row.verdict.id, filed: today() } }) + "\n", "utf8");
	}

	return out.join("\n");
}

export function run(argv){
	const [command] = argv;
	if (!command || ["--help", "-h", "help"].includes(command)) return HELP;

	const f = flags(argv.slice(1));
	const root = path.resolve(REPO, String(f.root ?? "public/framework/ai"));
	const skills = path.resolve(REPO, String(f.skills ?? ".claude/skills"));

	if (command === "list"){
		const rows = pending(root);
		return rows.length
			? rows.map(r => `${r.decision.rule}\n  ${r.verdict.note}\n  ${r.task}/${r.decision.id} — ${r.decision.about}`).join("\n\n")
			: "no unfiled improve verdict names a rule.";
	}

	if (command === "file") return file_all(root, skills, f.dry === true || f.dry === "true");

	throw new Error(`"${command}" is not a command — try: list, file`);
}

/* Only when run as the program — importing this must not execute anything. */
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url){
	try { console.log(run(process.argv.slice(2))); }
	catch (e){ console.error(String(e.message || e)); process.exit(1); }
}
