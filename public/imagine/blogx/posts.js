/* The corpus every candidate in this lab renders. Fake in that nothing is published
   yet; believable because the titles are the posts the owner actually asked for — so
   what you judge is the real blog, not lorem.

   A post is data, never a Page. Eight candidates render the SAME eight posts, so the
   only variable on screen is the layout. Parts make a post multi-part; `series` is a
   post with parts, and `sections` is the one grouping the rails read.

   ⚠ No backticks inside the bodies: they are template literals. Prose says the name
     of a thing in italics rather than as code.

   `real: "<section>/<name>"` — four of these eight are mock-ups of posts that got
   written for real, at /blog/. It is the section+name pair /blog/posts.js addresses
   them by, not a full url: nobody here may import /blog/ (a round trip either way
   would be a circular import across two site sections), so the pairing is typed
   twice on purpose and Blog.article() builds the one link from it. */

export const sections = [
	{ name: "framework", title: "Framework", icon: "widgets",   blurb: "The page system, layout, and the words a page is built from." },
	{ name: "tools",     title: "Tools",     icon: "handyman",  blurb: "Panels, playgrounds, and the things built on top of them." },
	{ name: "ai",        title: "Working with AI", icon: "smart_toy", blurb: "The dashboard, the browser bridge, and the skills that drive them." },
];

const part = (title, dek, body) => ({ title, dek, body, name: slug(title) });

function slug(title){ return String(title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

export const posts = [
	{
		name: "layout-generators",
		title: "The layout generator",
		dek: "A machine that draws a thousand page layouts, and a rubric that tells you which eleven are worth keeping.",
		section: "framework",
		date: "2026-08-26",
		read: 9,
		lead: true,
		real: "systems/layout-generators",
		body: `A generator is only as good as the thing that grades it. Ours draws layouts from a seeded random walk over the same width words a real page uses — so every candidate it produces is a page you could ship, not a picture of one.

The interesting half is the grader. Eleven weighted ideal ranges: measure, column count, dead space, rhythm, the distance from a title to the thing it names. The generator searches against that score, which means the rubric is the design, and the generator is just a fast way to ask it questions.`,
		parts: [
			part("Why generate at all", "Hand-drawn layouts converge on the same three shapes.",
`Left alone, a person draws the layout they drew last time. Six labs in this repo shipped variations of one centred column before anybody noticed, because each one was reasonable on its own.

A generator has no taste and therefore no habits. It will happily propose a 5:2:1 slice with the navigation on the right, and the only reason to reject it is a reason you can write down. That is the whole value: it forces the rubric to exist.`),
			part("The seeds", "A layout is a number. Change the number, redraw the page.",
`Every candidate is a seed plus the rules in force at the time. Store the seed and the layout is reproducible; change a rule and every stored seed redraws differently, which is exactly what you want when the rules are what you are editing.

The trap is thinking the seed is the design. It is not. The seed is a question, and the rules are the answer — so a seed collection that survives a rule change was never testing the rule.`),
			part("Eleven ideal ranges", "The grader, in full.",
`Measure between 34 and 40em. Between two and six columns of content at 1920. Dead space under a fifth of the viewport. A title no more than one step of rhythm from the thing it names. Each range is weighted, the weights sum to one, and the score is a single number between zero and one.

None of the eleven is controversial on its own. Together they reject about ninety-four percent of what the generator draws, which is the number that made the whole exercise worth doing.`),
			part("What it found", "Three shapes nobody would have drawn.",
`The strongest three all put navigation in a region that never scrolls, and all three spend the extra width of a wide monitor on a second reading column rather than on a wider first one.

That is a finding a person could have reasoned their way to. Nobody did, in six months of drawing pages by hand.`),
		],
	},

	{
		name: "panel-playground",
		title: "Panel and Playground",
		dek: "One is a swiss army knife with twelve gestures. The other is the same idea with the gestures taken away.",
		section: "tools",
		date: "2026-08-22",
		read: 7,
		real: "systems/panel-playground",
		body: `Panel came first: drag to split, drag to size, drag to reorder, twelve gestures in all, every one of them discoverable and none of them obvious.

Playground is the answer to the question Panel raised — how little can you take away and still have the thing be useful. The data is the CSS. You edit a value, the layout moves. There is no gesture to learn because there is no gesture.`,
		parts: [
			part("Twelve gestures", "What a panel can do, and what that costs.",
`Split, size, reorder, collapse, duplicate, promote, detach, tab, stack, hug, fill, reset. Each one earned its place by being asked for, and each one added a rule that the other eleven had to keep working around.

The cost is not the code. The cost is that a person opening the thing for the first time cannot see what it does.`),
			part("Data is the CSS", "The simpler machine.",
`Playground holds a tree of plain objects whose keys are CSS properties. The render is one pass with no interpretation. There is nothing between what you typed and what you see, which means there is nothing to explain.

It does less. It is used more.`),
			part("When each wins", "The verdict.",
`Panel wins when the arrangement is the work — a dashboard someone lives in all day, where the twelfth gesture is worth the eleven you had to learn first.

Playground wins everywhere else, which turns out to be almost everywhere.`),
		],
	},

	{
		name: "ai-dashboard",
		title: "The AI dashboard",
		dek: "Append-only logs, a live socket, and a board that shows what every agent is doing right now.",
		section: "ai",
		date: "2026-08-19",
		read: 6,
		real: "ai/dashboard",
		body: `Every task opens a directory and an append-only log before its first edit. The board reads those logs, and because they are append-only it can stream them over a socket without ever reloading a page.

The interesting constraint is that nothing crawls. A task appears on the board because its directory exists, and a page appears in the site because its parent names it. Both rules are the same rule, and both were learned the hard way.`,
	},

	{
		name: "mcp-playwright-skills",
		title: "MCP, Playwright, and skills",
		dek: "Three ways to give a model hands, and the one rule that keeps all three honest.",
		section: "ai",
		date: "2026-08-17",
		read: 8,
		real: "ai/claude-tooling",
		body: `An MCP server lets a model read the live DOM of a page you are looking at. Headless Playwright lets it open its own browser and take a picture. A skill is a paragraph of instructions that loads only when it is relevant.

The rule that keeps all three honest: never let the model drive the browser window a person is using. Everything else is a preference.`,
	},

	{
		name: "column-pages",
		title: "Column pages",
		dek: "A page whose subtree is a row. One call, and every child opens to the right of its parent.",
		section: "framework",
		date: "2026-08-27",
		read: 5,
		body: `The tree is real. What flattens it is one CSS declaration on every descendant, which deletes their boxes from layout without touching the DOM. Peers on screen, a tree in the file system.

Six width words decide what a column is worth: a rail, a hug, the default reading measure, a wide grid, the leftover, or the whole row. Every one of them is a token, so a page that needs a seventh retunes a number instead of asking for a word.`,
	},

	{
		name: "no-build",
		title: "No build step",
		dek: "Native modules, real URLs, and what you give up to keep them.",
		section: "framework",
		date: "2026-08-14",
		read: 6,
		body: `Every import in this site is a real file at a real URL. There is no bundler, no transpile, and no watch process between the editor and the browser. Save the file, reload, see it.

What you give up: npm packages that assume a bundler, JSX, and the ability to pretend a circular import is fine. All three turn out to be things worth giving up.`,
	},

	{
		name: "the-framework",
		title: "What this framework is",
		dek: "Assign-based objects, pages that are dormant until placed, and a reading list.",
		section: "framework",
		date: "2026-08-30",
		read: 10,
		body: `A page is an object with a title, some children, and a method that draws its content. It is dormant until something places it, which is why a page can be declared at module scope and cost nothing.

Everything else in the framework is that idea repeated: a view is an object that owns an element, a router is an object that walks a chain of pages, a theme is a stylesheet. There is no configuration layer anywhere, because every seam is a method you can override.`,
	},

	{
		name: "browser-bridge",
		title: "The browser bridge",
		dek: "A button in the page that runs one turn of a model in the terminal, and hands the answer back.",
		section: "ai",
		date: "2026-08-18",
		read: 4,
		body: `The page posts a prompt to the dev server. The dev server runs one headless turn and streams the result back over the same socket the live reload uses. The turn is bound to the tab that asked, so two tabs cannot cross their answers.

It is forty lines and it changes how the site is built, which is the ratio you hope for.`,
	},
];

export const lead = posts.find(post => post.lead) ?? posts[0];
export const rest = posts.filter(post => post !== lead);
export const series = posts.filter(post => post.parts);
export const find = name => posts.find(post => post.name === name);
export const of_section = name => posts.filter(post => post.section === name);
export const section_of = name => sections.find(s => s.name === name);

// "2026-08-26" → "26 Aug" — a date on a card is a rank, not a record.
export const when = date => {
	const [, m, d] = date.split("-");
	return Number(d) + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(m) - 1];
};
