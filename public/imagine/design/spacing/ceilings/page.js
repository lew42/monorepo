import { Page, md, h2, p, figure, figcaption, img } from "/app.js";

const here = new URL(".", import.meta.url).pathname;

/* Container: a plain column of /imagine/'s row, same as the study it sits under.
   Size: `full` — nine crops in a row need the whole column. Own layout: `md()` prose,
   one table, a 3×3 crop grid. Regions: none. Preview: the default card.

   Never an edit to `--pad-default`/`--gap-default` — the owner fixed those 2026-09-01.
   Every number and crop here comes from a `<style>` Playwright injects into a scratch
   tab on a private server; `framework.css` was never touched. */

const REALMS = ["cms", "paging", "stream"];
const CANDIDATES = [
	{ key: "current", label: "current", mult: "1×", gap: "23.67px", note: "cms and stream fit the fold already; paging is long enough to scroll no matter what — none of the three changes what's visible above 1440px." },
	{ key: "1.5x", label: "1.5× the current", mult: "1.5×", gap: "35.52px", note: "clearly more air around the wall (cms grows 24px, stream 27px), and still nothing new crosses the fold on any of the three." },
	{ key: "2x", label: "2× the current", mult: "2×", gap: "47.36px", note: "roomiest of the three — cms grows 48px, stream 62px — and paging (already 4,689px tall) still scrolls the same amount past the fold either way." },
];

const crop = (realm, key) => figure.c("flex v gap").style({ margin: 0, gap: "0.3em" }).append(() => {
	img().attr("src", here + "shots/" + realm + "-" + key + ".jpg").attr("alt", `/imagine/${realm}/ under the ${key} ceiling`)
		.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" });
	figcaption(`/imagine/${realm}/`).style({ fontSize: "0.8em", color: "var(--subtle)" });
});

export default new Page({
	meta: import.meta,
	title: "Ceilings",
	description: "Three candidate spacing ceilings, shot on cms, paging and stream at 3440 — a token override on a scratch tab, never a framework.css edit. The owner picks.",
	icon: "vertical_align_top",
	width: "full",

	content(){
		md("**What this is.** The [spacing study](" + "/imagine/design/spacing/" + ") found thirteen `/imagine/` realms grow their vertical spacing only 1.20× while the screen grows 2.69× (1280 → 3440), because they share the root's `--pad-default`/`--gap-default` clamps — numbers the owner set on 2026-09-01 and this page does **not** touch. Instead, three candidate ceilings for those same clamps were injected as a `<style>` tag into a private-server tab (never `framework.css`) and shot on three realms at 3440: **cms** (barely grows at all — see the [cms fix](" + "/imagine/cms/" + ")), **paging** (a long, many-card page), and **stream** (short, one wall). The owner picks one, none, or a fourth number.");

		p.c("muted", "Raising just the clamp's ceiling (the literal max) turned out to be a no-op here — at 3440 the clamp's middle (`0.4em + 0.5vw`) already lands under today's `1.6em` cap, so widening only the cap changes nothing (confirmed live before shooting anything). The three candidates below instead scale the whole clamp — floor, middle and ceiling together, ×1 / ×1.5 / ×2 — which is what actually moves a number at 3440.");

		h2("The nine crops");
		CANDIDATES.forEach(c => {
			md.c("muted", `**${c.label}** (${c.mult} the clamp) — median gap beside the wall **${c.gap}**. ${c.note}`);
			figure.c("grid auto").style({ "--column": "18em", margin: "0 0 1.5em" }).append(() => REALMS.forEach(r => crop(r, c.key)));
		});

		h2("The medians");
		md.c("muted", "The median distance between a previews wall and its neighbour, across all three realms — the *other* sibling gaps on these pages (paragraph → heading, card → card row) come from `--flow`, a different token this page never touches, and hold flat at 13–32px in all three shots.");
		md("| candidate | scale | median gap beside the wall |\n|---|---|---|\n" +
			CANDIDATES.map(c => `| ${c.label} | ${c.mult} | ${c.gap} |`).join("\n"));

		md("Nothing here is a change — every number is a scratch override, measured and thrown away. The [previews-wall fix](" + "/framework/core/Page/" + ") is the one that already landed; this is the next lever, for the owner to pull or not.");
	},
});
