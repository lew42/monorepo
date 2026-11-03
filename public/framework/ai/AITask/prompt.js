import { pre } from "../../core/View/View.js";
import { fold, clip } from "./message.js";

/* The harness wraps what the user typed in tag blocks — slash-command echoes,
 * system reminders, task notifications. Pull those out; what remains is prose. */
const TAG = /<(local-command-caveat|local-command-stdout|local-command-stderr|command-name|command-message|command-args|system-reminder|task-notification|ide_selection|ide_opened_file)>\s*([\s\S]*?)\s*<\/\1>/g;

export function parse(l){
	const c = l.message.content;
	const text = typeof c === "string" ? c : c.filter(b => b.type === "text").map(b => b.text).join("\n\n");
	const parts = [];
	const prose = text.replace(TAG, (_, tag, body) => (parts.push([tag, body]), "")).trim();
	return { prose, parts };
}

export function command(parts){
	const get = tag => parts.find(p => p[0] === tag)?.[1];
	const name = get("command-name");
	return name && (name + " " + (get("command-args") ?? "")).trim();
}

/** Nothing typed, nothing run — a caveat or stdout echo standing alone. */
export function trivial(l){
	const { prose, parts } = parse(l);
	return !prose && !command(parts);
}

/** The prompt's harness blocks — reminders, notifications, stdout — as fold bars. */
export function harness(parts){
	parts.forEach(([tag, body]) => {
		if (tag === "local-command-caveat" || tag.startsWith("command-")) return;
		body && fold(tag, () => pre.c("ai-result", clip(body)));
	});
}
