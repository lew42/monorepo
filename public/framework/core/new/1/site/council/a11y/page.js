import { Page } from "/app.js";
import report from "/framework/core/new/1/agents/a11y/page.js";

/* A seat's report, given a url inside the site.
 *
 * The report lives in agents/a11y/ — beside the seat's scratch, which is where a
 * design record belongs. But `meta: import.meta` derives a url from where a file
 * SITS, and agents/ is not under the site root, so nothing could link to it.
 * This wrapper lends it mine.
 *
 * .call(report), NOT .call(this). Rebinding to the wrapper looked safer — a page
 * reaching for tabs() would write regions onto an object the Router never heard
 * of — but reports define their own helpers on themselves, and `this.lead(…)`
 * threw the moment one did. A report is a self-contained document; let it be its
 * own receiver. Found by the sitemap crawl, which is the only thing that renders
 * every page at once.
 */
export default new Page({
	meta: import.meta,
	title: report.title,
	content(){ return report.content.call(report); },
});
