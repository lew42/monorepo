import { Page, md, div, h3, p } from "/app.js";
import { iconCard, section, outline } from "./Structure.js";

// Real words: the owner's harness brief (ai/2026-09-28/harness-research/owner-words.md), drawn.
const harness = [
	{ title: "Models", items: [{ name: "OpenRouter", icon: "hub", weight: 3 }, { name: "Direct providers", icon: "cloud", weight: 2 }, { name: "Cost per call", icon: "payments", weight: 2 }] },
	{ title: "Context", items: [{ name: "CLAUDE.md", icon: "description", weight: 2 }, { name: "Skills on demand", icon: "school", weight: 3 }, { name: "MCP tools", icon: "extension", weight: 2 }, { name: "Auto-compact", icon: "compress", weight: 1 }] },
	{ title: "Sessions", items: [{ name: "Session ids", icon: "fingerprint", weight: 2 }, { name: "Resume", icon: "history", weight: 3 }, { name: "Fork", icon: "call_split", weight: 1 }] },
	{ title: "Safety", items: [{ name: "Worktrees", icon: "account_tree", weight: 2 }, { name: "Own dev server", icon: "dns", weight: 1 }, { name: "Node over bash", icon: "terminal", weight: 2 }] },
];

const box = (title, fn) => div.c("flex v gap-50", () => { h3(title); fn(); });

export default new Page({
	meta: import.meta,
	title: "Structure",
	description: "Icon cards, sections and outlines: words drawn as a picture.",
	icon: "account_tree",

	content(){
		p("Content is structure first: a few named things per section, sections nested like an outline. Every block makes one choice: a background (and so padding), or neither. The pieces are the icon card, the section and the outline.");

		div.c("ux-content-wall wide", () => {
			box("Icon card, three weights", () => div.c("ux-content-icards", () => {
				iconCard({ name: "Heavy", icon: "bolt", weight: 3 });
				iconCard({ name: "Normal", icon: "bolt", weight: 2 });
				iconCard({ name: "Light", icon: "bolt", weight: 1 });
			}));
			box("Background, or not", () => div.c("flex v gap", () => {
				section({ title: "With a background: padded", bg: true, items: [{ name: "Plan", icon: "map" }, { name: "Build", icon: "construction" }, { name: "Review", icon: "rate_review" }] });
				section({ title: "Without: no padding, sits on the margin", items: [{ name: "Plan", icon: "map" }, { name: "Build", icon: "construction" }, { name: "Review", icon: "rate_review" }] });
			}));
			box("A section of 3 on a background = labelled navigation", () => section({ title: "Servex", bg: true, items: [
				{ name: "Servers", icon: "dns", href: "#" }, { name: "Agents", icon: "smart_toy", href: "#" }, { name: "Cards", icon: "dashboard", href: "#" }] }));
			box("A section of 3–5, heaviest first", () => section({ title: "Research", items: [
				{ name: "Sources", icon: "menu_book", weight: 1 }, { name: "Question", icon: "help", weight: 3 },
				{ name: "Claims", icon: "fact_check", weight: 2 }, { name: "Verdict", icon: "gavel", weight: 3 }, { name: "Skeptic", icon: "psychology_alt", weight: 1 }] }));
			box("Outline: a list is a card with no background", () => outline([
				{ name: "Page", icon: "article", children: [
					{ name: "Sections", children: ["3–5 per page", "each titled"] },
					{ name: "Items", children: ["3–5 per section", "named, with an icon"] },
					{ name: "Detail", children: ["one click down"] }] }]));
		});

		md("## A real one: the harness research, drawn");
		div.c("ux-content-wall wide", () => harness.forEach(s => section({ ...s, bg: true })));
		div.c("ux-content-wall wide", () => {
			box("The same topic as an outline", () => outline([
				{ name: "Build our own harness", icon: "construction", children: [
					{ name: "Models", children: ["OpenRouter first", "direct providers where it lacks parity"] },
					{ name: "Context", children: ["CLAUDE.md always", "skills on demand", "auto-compact"] },
					{ name: "Sessions", children: ["ids", "resume days later", "fork"] },
					{ name: "Safety", children: ["worktree + own server", "node wraps bash"] }] }]));
			box("Which piece when", () => div.c("flow").append(md.file(import.meta, "doc/guide.md", { h1: false })));
			box("Proposal: page weight, and a page with no wrapper", () => div.c("flow").append(md.file(import.meta, "doc/weight.md", { h1: false })));
		});

		md.details(import.meta, "readme.md", "Readme");
	},
});
