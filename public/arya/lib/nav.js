// Plain data, no imports, no side effects.
// The sidebar, the breadcrumbs, and the "what's in here" card lists all read from this.

const sections = [
	{
		title: "Start",
		pages: [
			{ path: "/arya/", title: "Start here", blurb: "Five minutes from zero to a page on screen." },
		]
	},
	{
		title: "Framework",
		pages: [
			{ path: "/arya/framework/", title: "Overview", blurb: "The whole framework is two classes and one rule." },
			{ path: "/arya/framework/view/", title: "class View", blurb: "One element, chainable. Every tag function returns one." },
			{ path: "/arya/framework/app/", title: "class App", blurb: "Boots the site, finds your page, loads your styles." },
			{ path: "/arya/framework/page/", title: "class Page", blurb: "A page you can import without rendering it. Plus a working router." },
		]
	},
	{
		title: "Styles",
		pages: [
			{ path: "/arya/styles/", title: "Overview", blurb: "What framework.css gives you before you write any CSS." },
			{ path: "/arya/styles/html/", title: "HTML", blurb: "Headings, text, lists, tables, code." },
			{ path: "/arya/styles/forms/", title: "Forms", blurb: "Inputs, selects, buttons, fieldsets." },
			{ path: "/arya/styles/flex/", title: "Flex", blurb: "flex, gap, v, auto, three, split." },
			{ path: "/arya/styles/grid/", title: "Grid", blurb: "grid auto and grid three, no media queries." },
			{ path: "/arya/styles/build/", title: "Build something", blurb: "A full landing page, framework.css only." },
		]
	},
	{
		title: "Notes",
		pages: [
			{ path: "/arya/notes/", title: "Suggestions", blurb: "Rough edges I hit, and what I'd change." },
		]
	}
];

// flat lookup, so any page can find its own or a sibling's title/blurb by path
export const pages = sections.flatMap(section => section.pages);

export function find(path) {
	return pages.find(page => page.path === path);
}

export function children(path) {
	return pages.filter(page => page.path !== path && page.path.startsWith(path));
}

export default sections;
