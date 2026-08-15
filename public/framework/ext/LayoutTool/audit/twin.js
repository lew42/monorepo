import { div, p, span, button, code, iframe } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";

const QUEUE = "/framework/ext/LayoutTool/audit/accepted.css";

/* Before and after, side by side: the same url in two frames, the right one
 * carrying the proposed declarations as an injected stylesheet. Same-origin, so
 * the sheet goes straight into the frame's head — nothing is written to disk to
 * see the difference. */
export default function twin(report, width){
	const fixes = proposals(report);
	if (!fixes.length) return;

	div.c("lt-twin grid gap").append(() => {
		pane("Before", report.url, width, null);
		pane("After — with the proposal applied", report.url, width, fixes);
	});

	div.c("lt-fix flex v gap").append(() => {
		p("The whole of the difference between those two frames:");
		code(sheet(fixes)).ac("lt-decl");

		div.c("flex gap v-center wrap").append(() => {
			button("Accept into the review queue").on("click", ev => accept(report, fixes, ev.target));
			span("Appends to audit/accepted.css. Nothing loads that file — it is a patch to read, not a change to the site.")
				.ac("muted");
		});
	});
}

/* ⚠ The frame renders at the AUDIT width and is scaled down to fit the pane. A
 * `width: 100%` iframe would just be a narrower viewport — a different layout,
 * not a smaller picture of the one being reported. */
function pane(label, url, width, fixes){
	div.c("lt-pane flex v").append(() => {
		span(label).ac("lt-pane-head");

		div.c("lt-shot").append($shot => {
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
async function accept(report, fixes, button){
	const entry = `\n/* ${report.url} @ ${new Date().toISOString()} */\n${sheet(fixes)}\n`;

	try {
		const existing = await fetch(QUEUE).then(r => (r.ok ? r.text() : "")).catch(() => "");
		await Socket.singleton().async_rpc("write", QUEUE, (existing || HEAD) + entry);
		button.textContent = "Queued in accepted.css";
	} catch (error){
		button.textContent = `Could not write — ${error.message}`;
	}
}

const HEAD = `/* Accepted layout proposals, awaiting a human.
   NOTHING IMPORTS THIS FILE. It is a patch to read, apply by hand, and delete.
   Written by ext/LayoutTool/audit. */\n`;
