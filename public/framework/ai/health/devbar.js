import { span, a } from "../../core/View/View.js";
import { HealthLog, today_url, latest_by_url } from "./log.js";

/* THE PAGE-HEALTH READOUT — one line for the dev bar, the same shape as
   DevBar/hold.js beside it: a span that is `hidden` and says nothing when
   there is nothing to say (every checked page clean, or nothing checked
   yet), and otherwise the one number that matters — how many pages are
   broken right now — linking to /framework/ai/health/ for the rest.
   ⚠ NOT WIRED IN — DevBar/** is outside this task's fence. Left as a plain
   function of the same shape hold() already has, so DevBar.js needs exactly
   one line to add it: see this module's own doc comment at the bottom, and
   the landing report for the literal line + where it goes. */
export default function health_devbar(){
	const $line = a.c("dev-health").href("/framework/ai/health/");
	$line.el.hidden = true;

	let log = null;

	function render(){
		if (!log?.loaded){ $line.el.hidden = true; return; }
		const rows = latest_by_url(log);
		const broken = rows.filter(r => r.verb === "error").length;
		const warned = rows.filter(r => r.verb === "warning").length;

		if (!broken && !warned){ $line.el.hidden = true; return; }

		$line.el.hidden = false;
		$line.text(broken ? `page health: ${broken} broken${warned ? ` +${warned} warn` : ""}` : `page health: ${warned} warn`);
	}

	log = new HealthLog({ url: today_url() });
	log.live(render).then(render);

	return $line;
}

/* Wiring (one line, for whoever owns DevBar.js):
 *
 *   import health_devbar from "../../ai/health/devbar.js";
 *   … and one call, beside hold() in DevBar.js's own head-line row: health_devbar()
 *
 * See this task's landing report for the exact line and where DevBar.js
 * builds that row today. */
