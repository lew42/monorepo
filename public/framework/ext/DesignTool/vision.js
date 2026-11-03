import { div, p, button, span } from "/app.js";
import { ask, available } from "../Ask/Ask.js";

/* The backup path, not the detector. The numbers decide what is broken; this
 * asks a model to look at a picture of it and say whether the verdict matches
 * what it sees — the one job vision is genuinely better at.
 *
 * ⚠ `ask()` MAY ONLY EVER BE REACHED FROM A CLICK HANDLER — never from a timer, an
 * observer, or a render. It is a paid model behind a screenshot ($0.03–0.17 a page),
 * and the layout screen re-measures on every resize by design: one `ask()` on that
 * path is a bill wired to a gesture. The owner, 2026-08-17, with three exclamation marks.
 * This file is the only thing in the module that calls it, and `run()` below is only
 * ever called from `on("click", …)`.
 *
 * ⚠ READ-ONLY, deliberately. `tools` is the only thing between a prompt typed
 * into a page and a write to this repo, and a second opinion has no business
 * editing anything. Do not widen this list to "make it more useful".
 * ⚠ Absent, not broken, off localhost — there is no dev server to spawn a turn. */
const TOOLS = "Read,Glob,Grep";

export default function vision(report, { selector = ".app", width } = {}){
	if (!available()) return;

	div.c("dt-vision flex v gap").append($out => {
		div.c("flex gap v-center wrap").append(() => {
			button("Ask Claude to look at it").on("click", ev => run(ev.target, $out, report, selector, width));
			span("Screenshots the element and asks whether the measurements match what it sees.").ac("muted");
		});
	});
}

async function run(button, $out, report, selector, width){
	button.disabled = true;
	button.textContent = "Looking…";

	const $reply = div.c("dt-reply");
	$out.append(() => $reply.ac("dt-reply"));

	try {
		const { text, cost_usd, duration_ms } = await ask(prompt(report), {
			model: "sonnet",
			tools: TOOLS,
			// ⚠ An absolute url. `report.url` is a pathname (the probe reads
			// `location.pathname`), and the shot runs in a fresh browser with no
			// origin to resolve it against.
			shot: {
				url: new URL(report.url, location.origin).href,
				selector, width: width ?? report.viewport?.w ?? 1280,
			},
			on: e => e.text && ($reply.el.textContent += e.text),
		});

		$reply.empty(() => {
			p(text);
			span(`${(duration_ms / 1000).toFixed(1)}s · $${(cost_usd ?? 0).toFixed(3)}`).ac("muted");
		});
	} catch (error){
		$reply.empty(() => p(`Could not ask — ${error.message}`).ac("muted"));
	} finally {
		button.disabled = false;
		button.textContent = "Ask again";
	}
}

// The findings go IN. An open-ended "what's wrong with this" produces a fresh
// opinion; the useful question is whether a specific measurement is real.
function prompt(report){
	const top = (report.leading ?? []).slice(0, 6)
		.map(i => `- ${i.sev} · ${i.rule} · ${i.sel} — ${i.detail}`).join("\n");

	const found = top
		? `and reported:\n\n${top}\n\nLooking only at the picture: which of those do you actually `
			+ `see, which are wrong, and is there anything visibly broken the list misses?`
		: `and found nothing. Looking only at the picture: is that right, or is something `
			+ `visibly broken that a geometric analyzer would have missed?`;

	return `This is a screenshot of ${report.url}. A numeric layout analyzer read it `
		+ `${found} Be specific and brief — three or four sentences. Do not read any files.`;
}
