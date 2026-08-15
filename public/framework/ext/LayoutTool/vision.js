import { div, p, button, span } from "/app.js";
import { ask, available } from "../Ask/Ask.js";

/* The backup path, not the detector. The numbers decide what is broken; this
 * asks a model to look at a picture of it and say whether the verdict matches
 * what it sees — the one job vision is genuinely better at.
 *
 * ⚠ READ-ONLY, deliberately. `tools` is the only thing between a prompt typed
 * into a page and a write to this repo, and a second opinion has no business
 * editing anything. Do not widen this list to "make it more useful".
 * ⚠ Absent, not broken, off localhost — there is no dev server to spawn a turn. */
const TOOLS = "Read,Glob,Grep";

export default function vision(report, { selector = ".app", width } = {}){
	if (!available()) return;

	div.c("lt-vision flex v gap").append($out => {
		div.c("flex gap v-center wrap").append(() => {
			button("Ask Claude to look at it").on("click", ev => run(ev.target, $out, report, selector, width));
			span("Screenshots the element and asks whether the measurements match what it sees.").ac("muted");
		});
	});
}

async function run(button, $out, report, selector, width){
	button.disabled = true;
	button.textContent = "Looking…";

	const $reply = div.c("lt-reply");
	$out.append(() => $reply.ac("lt-reply"));

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

	return `This is a screenshot of ${report.url}. A numeric layout analyzer scored it `
		+ `${report.grade} ${report.score}/100 ${found} Be specific and brief — three or four `
		+ `sentences. Do not read any files.`;
}
