import { div, h4, span, small, p } from "/app.js";

/* Placed by this folder's own page.jsonl (its last line, {"place": "demo.js"}) — proof
 * that a page.jsonl line alone, with no page.js and no other code, can turn an
 * extension on ({"ext": "Inbox"}) and feed it data ({"inbox": {…}} lines).
 *
 * This module's own load races Inbox's (both are dynamic imports, started within
 * the same synchronous page.jsonl replay) — `await page.ext_ready` first, so
 * Inbox.setup() has always finished collecting `page.inbox` before this reads it,
 * whichever import actually won the race. No DOM before that await: `box` is
 * already captured (the parameter itself), only drawing into it waits. */
export default async function demo(page, box){
	await Promise.all(page.ext_ready ?? []);

	const draw = () => box.empty(() => {
		const n = page.inbox?.length ?? 0;
		h4(`page.inbox — ${n} message${n === 1 ? "" : "s"}`);

		(page.inbox ?? []).forEach(m => div.c("card pad flex v gap-25", () => {
			div.c("flex gap-25 v-center", () => {
				span.c("muted", m.type);
				span(m.author);
				small.c("muted", m.at);
			});
			p(m.text);
		}));

		if (!n) p.c("muted", "No messages yet.");
	});

	draw();
	page.on("line", draw);
}
