import { div, p, span, button, code, iframe } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";

const QUEUE = "/framework/ext/DesignTool/audit/accepted.css";

/* Before and after, side by side: the same url in two frames, the right one
 * carrying the proposed declarations as an injected stylesheet. Same-origin, so
 * the sheet goes straight into the frame's head — nothing is written to disk to
 * see the difference.
 *
 * Options: { queue: "/path/to/accepted.css", verdicts: "/path/to/verdicts.jsonl" }
 * — queue overrides the QUEUE default; verdicts appends a training-signal line on
 * accept or reject. */
export default function twin(report, width, opts = {}){
	const fixes = proposals(report);
	if (!fixes.length) return;

	const queue = opts.queue ?? QUEUE;
	const verdicts = opts.verdicts ?? null;

	div.c("dt-twin grid gap").append(() => {
		pane("Before", report.url, width, null);
		pane("After — with the proposal applied", report.url, width, fixes);
	});

	div.c("dt-fix flex v gap").append(() => {
		p("The whole of the difference between those two frames:");
		code(sheet(fixes)).ac("dt-decl");

		div.c("flex gap v-center wrap").append(() => {
			button("Accept into the review queue").on("click", ev => accept(report, fixes, ev.target, queue, verdicts, "accepted"));
			button("Reject").on("click", ev => record_verdict(report, fixes, ev.target, verdicts, "rejected"));
			span("Accept appends to accepted.css (human review queue, not live). Reject logs the verdict only.")
				.ac("muted");
		});
	});
}

/* ⚠ The frame renders at the AUDIT width and is scaled down to fit the pane. A
 * `width: 100%` iframe would just be a narrower viewport — a different layout,
 * not a smaller picture of the one being reported. */
function pane(label, url, width, fixes){
	div.c("dt-pane flex v").append(() => {
		span(label).ac("dt-pane-head");

		div.c("dt-shot").append($shot => {
			const $frame = iframe().attr("data-layout-ignore", "").attr("src", url)
				.style({ width: `${width}px`, height: "900px", transformOrigin: "top left" });

			// ⚠ Measured on every resize, not once on load. Taken once, the two
			// panes read their widths at different moments — the grid had only
			// settled for one of them — and the pair rendered at different scales,
			// which is the one thing a before/after must never do.
			const fit = () => {
				const scale = Math.min(1, $shot.el.clientWidth / width);
				$frame.style({ transform: `scale(${scale})` });
				$shot.style({ height: `${Math.round(900 * scale)}px` });
			};

			$frame.on("load", () => { if (fixes) inject($frame.el.contentDocument, fixes); fit(); });
			new ResizeObserver(fit).observe($shot.el);
		});
	});
}

function inject(doc, fixes){
	if (!doc) return;
	const style = doc.createElement("style");
	style.textContent = sheet(fixes);
	doc.head.append(style);
}

// One declaration per distinct selector — the same fix proposed by twelve cards
// is one line, not twelve.
function proposals(report){
	const seen = new Map();

	for (const i of report.issues ?? []){
		if (!i.fix || seen.has(i.fix.sel)) continue;
		seen.set(i.fix.sel, { ...i.fix, rule: i.rule, why: i.detail });
	}

	return [...seen.values()].slice(0, 5);
}

const sheet = fixes => fixes
	.map(f => `/* ${f.rule} — ${f.why} */\n${f.sel} { ${f.decl}; }`)
	.join("\n\n");

/* ⚠ The RPC WRITES, it does not append — so the queue is read back and re-sent
 * whole. Two audits accepted in the same second would still race; the file is a
 * human's review queue, not a datastore. */
async function accept(report, fixes, button, queue, verdicts, verdict){
	const entry = `\n/* ${report.url} @ ${new Date().toISOString()} */\n${sheet(fixes)}\n`;

	try {
		const existing = await fetch(queue).then(r => (r.ok ? r.text() : "")).catch(() => "");
		await Socket.singleton().async_rpc("write", queue, (existing || HEAD) + entry);
		button.textContent = "Queued in accepted.css";
	} catch (error){
		button.textContent = `Could not write — ${error.message}`;
		return;
	}

	await record_verdict(report, fixes, null, verdicts, verdict);
}

async function record_verdict(report, fixes, button, verdicts, verdict){
	if (!verdicts) return;
	const at = new Date().toISOString();
	const lines = fixes.map(f => JSON.stringify({ at, url: report.url, sel: f.sel, decl: f.decl, what: f.rule, verdict }));
	try {
		const existing = await fetch(verdicts).then(r => (r.ok ? r.text() : "")).catch(() => "");
		await Socket.singleton().async_rpc("write", verdicts, existing + lines.join("\n") + "\n");
		if (button) button.textContent = verdict === "rejected" ? "Rejected" : "Verdict logged";
	} catch (error){
		if (button) button.textContent = `Could not write — ${error.message}`;
	}
}

const HEAD = `/* Accepted layout proposals, awaiting a human.
   NOTHING IMPORTS THIS FILE. It is a patch to read, apply by hand, and delete.
   Written by ext/DesignTool/audit. */\n`;
