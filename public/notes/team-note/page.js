import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Nice work, everyone",
	label: "Team note",
	icon: "campaign",
	description: "Everything is merged and live. A note to the team.",

	content(){

		md("Everything is merged and live at [monorepo.lew42.workers.dev](https://monorepo.lew42.workers.dev).");

		md("I've been through every page each of you wrote. You each built your own framework and styles documentation from scratch — thank you, genuinely. It's good work and it shows.");

		md("## Go read each other's");

		md("It's one site now, so spend some time in someone else's directory. You solved a lot of the same problems in different ways, and the differences are the interesting part.");

		md(`- **[Alex](/alex/)** — Pages, subpages, and nesting.
- **[Arya](/arya/)** — First steps with the framework.
- **[Castin](/castin/)** — A tree you can walk — root to leaves.
- **[Edric](/edric/)** — Framework and style documentation.
- **[Michael](/michael/)** — Elements, layout, components, and the core classes.`);

		md("## Styling counts");

		md("Layout, appearance and styling matter more here than they might seem to — they're most of what makes any of this feel usable. I'm working through Figma designs now, and I'm hoping to land a major visual upgrade before long.");

		md("## Sit tight");

		md("No new tasks just yet. Hold off for now and I'll have more for you shortly. When they land: `git switch main` and `git pull` before you branch, and keep to [the branch naming convention](/notes/git-branch-names/).");

		md("## If you're bored");

		md(`The framework picked up a lot while you were building:

- **[Start](/framework/start/)** — three files and a working site. Click through the real project.
- **[FAQ](/framework/faq/)** — the questions you're about to have, answered code-first.
- **[Router](/framework/core/Router/)** — no-reload page transitions. Write an ordinary \`<a href>\` and it upgrades the click for you.
- **[Page](/framework/core/Page/)** — a titled, linkable, dormant unit of content. Importing one renders nothing, so pages can link to each other freely.
- **[Elements](/framework/styles/elements/)** and **[Layouts](/framework/styles/layouts/)** — every element the framework styles, and eight page layouts you can click into full size.`);

		md("Every example on those pages is live: you see the code, directly beneath it the thing that code rendered, and — one click further — **the HTML it actually produced.**");

		md("The old `Pager` tier is gone, by the way. An arrangement is a CSS class a page opts into now, so there's no fifth class to learn. If you built anything on it, the records are vendored beside the demos in `michael/pager/legacy/`.");
	}
});
