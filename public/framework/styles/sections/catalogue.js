import navbar from "./navbar.js";
import hero from "./hero.js";
import logos from "./logos.js";
import features from "./features.js";
import split from "./split.js";
import stats from "./stats.js";
import testimonials from "./testimonials.js";
import pricing from "./pricing.js";
import faq from "./faq.js";
import team from "./team.js";
import changelog from "./changelog.js";
import contact from "./contact.js";
import signup from "./signup.js";
import callout from "./callout.js";
import footer from "./footer.js";

/* The registry: one object, fifteen urls, no directories. An entry is everything a
 * gallery card needs and everything `route()` needs, so the index and the router
 * cannot disagree. Why this is a registry where `layouts/` is `children`, and when
 * it should stop being one: readme.md §5.
 *
 * The order is the "whole page" demo's order, and no two neighbouring bands share
 * a tone — alternation is what makes the seams read. */
export default {
	navbar:       { title: "Nav bar",      icon: "menu",             tone: "surface", render: navbar },
	hero:         { title: "Hero",         icon: "campaign",         tone: "dark",    render: hero, card: "wide" },
	logos:        { title: "Logo wall",    icon: "domain",           tone: "wash",    render: logos },
	features:     { title: "Features",     icon: "grid_view",        tone: "surface", render: features },
	split:        { title: "Split",        icon: "vertical_split",   tone: "wash",    render: split },
	stats:        { title: "Numbers",      icon: "insights",         tone: "prim",    render: stats },
	testimonials: { title: "Testimonials", icon: "format_quote",     tone: "surface", render: testimonials },
	pricing:      { title: "Pricing",      icon: "sell",             tone: "wash",    render: pricing },
	faq:          { title: "FAQ",          icon: "help",             tone: "surface", render: faq },
	team:         { title: "Team",         icon: "groups",           tone: "wash",    render: team, card: "tall" },
	changelog:    { title: "Changelog",    icon: "history",          tone: "surface", render: changelog, card: "tall" },
	contact:      { title: "Contact",      icon: "forum",            tone: "wash",    render: contact },
	signup:       { title: "Sign up",      icon: "mail",             tone: "dark",    render: signup },
	callout:      { title: "Call out",     icon: "bolt",             tone: "prim",    render: callout },
	footer:       { title: "Footer",       icon: "call_to_action",   tone: "dark",    render: footer },
};
