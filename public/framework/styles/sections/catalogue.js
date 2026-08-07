import navbar from "./navbar.js";
import hero from "./hero.js";
import features from "./features.js";
import split from "./split.js";
import stats from "./stats.js";
import pricing from "./pricing.js";
import faq from "./faq.js";
import callout from "./callout.js";
import footer from "./footer.js";

/* The registry: one object, nine urls, and no directories.
 *
 * Every entry is a name, a label, an icon and a render function — which is
 * everything a gallery card needs AND everything `route()` needs to build a page
 * on demand. So the index draws itself from this and the router claims its
 * segments from this, and the two cannot disagree because there is one list.
 *
 * The alternative was nine folders holding four lines each. See page.js.
 */
export default {
	navbar:   { title: "Nav bar",   icon: "menu",             tone: "surface", render: navbar },
	hero:     { title: "Hero",      icon: "campaign",         tone: "dark",    render: hero },
	features: { title: "Features",  icon: "grid_view",        tone: "surface", render: features },
	split:    { title: "Split",     icon: "vertical_split",   tone: "wash",    render: split },
	stats:    { title: "Numbers",   icon: "insights",         tone: "prim",    render: stats },
	pricing:  { title: "Pricing",   icon: "sell",             tone: "wash",    render: pricing },
	faq:      { title: "FAQ",       icon: "help",             tone: "surface", render: faq },
	callout:  { title: "Call out",  icon: "bolt",             tone: "prim",    render: callout },
	footer:   { title: "Footer",    icon: "call_to_action",   tone: "dark",    render: footer },
};
