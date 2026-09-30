// Written by ai/2026-09-30/page-audit/classify.mjs --emit. Re-run it; don't edit by hand.
export default {
	"at": "2026-09-30",
	"crawled": 1500,
	"errors": 120,
	"skipped": 201,
	"layouts": [
		{
			"id": "standard",
			"name": "Standard page",
			"count": 468,
			"defined_in": "core/Page/Page.class.js · app.js",
			"api": "the default",
			"page_js": null,
			"examples": [
				{
					"url": "/castin/",
					"title": "castin"
				},
				{
					"url": "/alex/",
					"title": "alex"
				},
				{
					"url": "/websites/",
					"title": "Websites"
				},
				{
					"url": "/arya/",
					"title": "Start here"
				}
			],
			"shot": "shots/standard.jpg"
		},
		{
			"id": "doc",
			"name": "Doc page (top tabs)",
			"count": 280,
			"defined_in": "ext/Doc/Doc.js",
			"api": "new Doc({…})",
			"page_js": 74,
			"examples": [
				{
					"url": "/framework/audio/",
					"title": "audio"
				},
				{
					"url": "/framework/ext/DesignTool/",
					"title": "DesignTool"
				},
				{
					"url": "/framework/core/Page/",
					"title": "Page"
				},
				{
					"url": "/framework/ext/Timeline/",
					"title": "Timeline"
				}
			],
			"shot": "shots/doc.jpg"
		},
		{
			"id": "ai2",
			"name": "AI 2 shell",
			"count": 218,
			"defined_in": "ai2/page.js (its own shell)",
			"api": "none: one page",
			"page_js": 1,
			"examples": [
				{
					"url": "/framework/ai2/",
					"title": "(394) AI 2"
				},
				{
					"url": "/framework/ai2/2026/09/29/audio-a-library-of-audio-parts-transcrip/",
					"title": "(396) AI 2"
				},
				{
					"url": "/framework/ai2/2026/09/29/from-dictation-to-a-brief-with-nothing-l/",
					"title": "(400) AI 2"
				},
				{
					"url": "/framework/ai2/2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom/",
					"title": "(396) AI 2"
				}
			],
			"shot": "shots/ai2.jpg"
		},
		{
			"id": "columns",
			"name": "Column pages",
			"count": 163,
			"defined_in": "core/Page/Page.class.js (columns)",
			"api": "this.columns({…})",
			"page_js": 42,
			"examples": [
				{
					"url": "/imagine/",
					"title": "Imagine"
				},
				{
					"url": "/layouts/tag/2-column-flex/",
					"title": "2 column flex"
				},
				{
					"url": "/layouts/tag/1-column/",
					"title": "1 column"
				},
				{
					"url": "/layouts/tag/1-column-flex/",
					"title": "1 column flex"
				}
			],
			"shot": "shots/columns.jpg"
		},
		{
			"id": "browse",
			"name": "Browse (filter rail + wall)",
			"count": 100,
			"defined_in": "ext/catalog/browse.js",
			"api": "this.browse(bands, …)",
			"page_js": 6,
			"examples": [
				{
					"url": "/framework/core/Layout/",
					"title": "Layout"
				},
				{
					"url": "/framework/styles/layouts/",
					"title": "Layouts"
				},
				{
					"url": "/layouts/browse/",
					"title": "Browse"
				},
				{
					"url": "/layouts/browse/approved-rail-content/",
					"title": "1 · Rail + content"
				}
			],
			"shot": "shots/browse.jpg"
		},
		{
			"id": "wall",
			"name": "Card wall (previews)",
			"count": 68,
			"defined_in": "core/Page/Page.class.js (previews) · ext/demo (demo.tree)",
			"api": "this.previews() · demo.tree()",
			"page_js": 50,
			"examples": [
				{
					"url": "/framework/",
					"title": "Framework"
				},
				{
					"url": "/web/",
					"title": "Web"
				},
				{
					"url": "/michael/",
					"title": "Michael"
				},
				{
					"url": "/layouts/",
					"title": "Layouts"
				}
			],
			"shot": "shots/wall.jpg"
		},
		{
			"id": "catalog",
			"name": "Catalog (card rail + routed page)",
			"count": 33,
			"defined_in": "ext/catalog/catalog.js",
			"api": "this.catalog()",
			"page_js": 25,
			"examples": [
				{
					"url": "/framework/styles/sections/",
					"title": "Sections"
				},
				{
					"url": "/framework/styles/sections/md/readme/",
					"title": "Sections — a layout with real content in it; fifteen bands that compose into a whole page, for anyone assembling a page from parts"
				},
				{
					"url": "/framework/styles/layouts/wire/",
					"title": "Wireframes"
				},
				{
					"url": "/framework/styles/layouts/400/",
					"title": "400"
				}
			],
			"shot": "shots/catalog.jpg"
		},
		{
			"id": "custom",
			"name": "Custom (own shell)",
			"count": 21,
			"defined_in": "the page itself",
			"api": "none: hand-built",
			"page_js": null,
			"examples": [
				{
					"url": "/",
					"title": "lew42"
				},
				{
					"url": "/fly/",
					"title": "Fly — lew42"
				},
				{
					"url": "/resume/",
					"title": "Résumé"
				},
				{
					"url": "/layouts/shell/",
					"title": "Shell"
				}
			],
			"shot": "shots/custom.jpg"
		},
		{
			"id": "blog",
			"name": "Blog post shell",
			"count": 17,
			"defined_in": "public/blog/ (Post)",
			"api": "new Post({meta})",
			"page_js": null,
			"examples": [
				{
					"url": "/blog/",
					"title": "Blog"
				},
				{
					"url": "/blog/ai/playwright/",
					"title": "Playwright: a browser you can write to"
				},
				{
					"url": "/blog/framework/hello-lew42/",
					"title": "Hello, lew42"
				},
				{
					"url": "/blog/framework/how-this-blog-works/",
					"title": "How this blog works"
				}
			],
			"shot": "shots/blog.jpg"
		},
		{
			"id": "switcher",
			"name": "Inner left nav (switcher)",
			"count": 9,
			"defined_in": "ext/tabs/switcher.js",
			"api": "this.switcher(names, {skin})",
			"page_js": 2,
			"examples": [
				{
					"url": "/framework/servex/fs/",
					"title": "fs"
				},
				{
					"url": "/framework/core/Page/fs/Page.class.js/",
					"title": "Page.class.js"
				},
				{
					"url": "/framework/core/Page/fs/Log.js/",
					"title": "Log.js"
				},
				{
					"url": "/framework/core/Page/fs/Markdown.js/",
					"title": "Markdown.js"
				}
			],
			"shot": "shots/switcher.jpg"
		},
		{
			"id": "sources",
			"name": "Sources (file tree)",
			"count": 3,
			"defined_in": "framework/sources/",
			"api": "its own page",
			"page_js": null,
			"examples": [
				{
					"url": "/framework/sources/claude-agent-sdk/",
					"title": "claude-agent-sdk"
				},
				{
					"url": "/framework/sources/openrouter/",
					"title": "openrouter"
				},
				{
					"url": "/framework/sources/opencode/",
					"title": "opencode"
				}
			],
			"shot": "shots/sources.jpg"
		}
	],
	"priority": [
		{
			"url": "/",
			"title": "lew42",
			"layout": "custom",
			"links_in": 1468,
			"tier": "Site menu"
		},
		{
			"url": "/framework/",
			"title": "Framework",
			"layout": "wall",
			"links_in": 1441,
			"tier": "Site menu"
		},
		{
			"url": "/web/",
			"title": "Web",
			"layout": "wall",
			"links_in": 1386,
			"tier": "Site menu"
		},
		{
			"url": "/imagine/",
			"title": "Imagine",
			"layout": "columns",
			"links_in": 1384,
			"tier": "Site menu"
		},
		{
			"url": "/castin/",
			"title": "castin",
			"layout": "standard",
			"links_in": 1383,
			"tier": "Site menu"
		},
		{
			"url": "/blog/",
			"title": "Blog",
			"layout": "blog",
			"links_in": 1378,
			"tier": "Site menu"
		},
		{
			"url": "/fly/",
			"title": "Fly — lew42",
			"layout": "custom",
			"links_in": 1378,
			"tier": "Site menu"
		},
		{
			"url": "/blog/ai/playwright/",
			"title": "Playwright: a browser you can write to",
			"layout": "blog",
			"links_in": 1378,
			"tier": "Site menu"
		},
		{
			"url": "/alex/",
			"title": "alex",
			"layout": "standard",
			"links_in": 1378,
			"tier": "Site menu"
		},
		{
			"url": "/michael/",
			"title": "Michael",
			"layout": "wall",
			"links_in": 1378,
			"tier": "Site menu"
		},
		{
			"url": "/layouts/",
			"title": "Layouts",
			"layout": "wall",
			"links_in": 1377,
			"tier": "Site menu"
		},
		{
			"url": "/notes/",
			"title": "Notes",
			"layout": "wall",
			"links_in": 1377,
			"tier": "Site menu"
		},
		{
			"url": "/websites/",
			"title": "Websites",
			"layout": "standard",
			"links_in": 1377,
			"tier": "Site menu"
		},
		{
			"url": "/resume/",
			"title": "Résumé",
			"layout": "custom",
			"links_in": 1377,
			"tier": "Site menu"
		},
		{
			"url": "/blog/framework/hello-lew42/",
			"title": "Hello, lew42",
			"layout": "blog",
			"links_in": 1377,
			"tier": "Site menu"
		},
		{
			"url": "/blog/framework/how-this-blog-works/",
			"title": "How this blog works",
			"layout": "blog",
			"links_in": 1377,
			"tier": "Site menu"
		},
		{
			"url": "/arya/",
			"title": "Start here",
			"layout": "standard",
			"links_in": 1377,
			"tier": "Site menu"
		},
		{
			"url": "/edric/",
			"title": "edric",
			"layout": "standard",
			"links_in": 1377,
			"tier": "Site menu"
		},
		{
			"url": "/framework/audio/",
			"title": "audio",
			"layout": "doc",
			"links_in": 876,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ai/",
			"title": "AI",
			"layout": "standard",
			"links_in": 843,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/DesignTool/",
			"title": "DesignTool",
			"layout": "doc",
			"links_in": 841,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/Page/",
			"title": "Page",
			"layout": "doc",
			"links_in": 839,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/styles/sections/",
			"title": "Sections",
			"layout": "catalog",
			"links_in": 836,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/Timeline/",
			"title": "Timeline",
			"layout": "doc",
			"links_in": 836,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/start/",
			"title": "Start",
			"layout": "standard",
			"links_in": 832,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/Layout/",
			"title": "Layout",
			"layout": "browse",
			"links_in": 830,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/Router/",
			"title": "Router",
			"layout": "doc",
			"links_in": 829,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/",
			"title": "Core",
			"layout": "wall",
			"links_in": 828,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/Panel/",
			"title": "Panel",
			"layout": "doc",
			"links_in": 826,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/research/",
			"title": "Research",
			"layout": "standard",
			"links_in": 825,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/audio/MicStream/",
			"title": "MicStream",
			"layout": "doc",
			"links_in": 823,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/audio/MicPicker/",
			"title": "MicPicker",
			"layout": "doc",
			"links_in": 823,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/audio/Transcriber/",
			"title": "Transcriber",
			"layout": "doc",
			"links_in": 823,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/audio/PushToTalk/",
			"title": "PushToTalk",
			"layout": "doc",
			"links_in": 823,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/audio/Recorder/",
			"title": "Recorder",
			"layout": "doc",
			"links_in": 823,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/audio/mic-to-text/",
			"title": "Mic → Whisper → text",
			"layout": "doc",
			"links_in": 823,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/demo/",
			"title": "Demo",
			"layout": "doc",
			"links_in": 823,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/Saver/",
			"title": "Saver",
			"layout": "doc",
			"links_in": 821,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/Research/",
			"title": "Research",
			"layout": "doc",
			"links_in": 821,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/styles/",
			"title": "Styles",
			"layout": "wall",
			"links_in": 820,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/servex/",
			"title": "Servex",
			"layout": "doc",
			"links_in": 820,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/audio/LevelMeter/",
			"title": "LevelMeter",
			"layout": "doc",
			"links_in": 820,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/faq/",
			"title": "FAQ",
			"layout": "standard",
			"links_in": 819,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/View/",
			"title": "View",
			"layout": "doc",
			"links_in": 819,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/App/",
			"title": "App",
			"layout": "doc",
			"links_in": 819,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/Sidebar/",
			"title": "Sidebar",
			"layout": "doc",
			"links_in": 819,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/Item/",
			"title": "Item",
			"layout": "doc",
			"links_in": 819,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/styles/elements/",
			"title": "Elements",
			"layout": "wall",
			"links_in": 819,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/tabs/",
			"title": "Tabs",
			"layout": "doc",
			"links_in": 819,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/Doc/",
			"title": "Doc",
			"layout": "doc",
			"links_in": 819,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/versus/",
			"title": "Versus",
			"layout": "standard",
			"links_in": 818,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/markdown/",
			"title": "Markdown",
			"layout": "doc",
			"links_in": 818,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/Draggable/",
			"title": "Draggable",
			"layout": "doc",
			"links_in": 818,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/JSONL/",
			"title": "JSONL",
			"layout": "doc",
			"links_in": 818,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ui/",
			"title": "UI",
			"layout": "doc",
			"links_in": 817,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/List/",
			"title": "List",
			"layout": "doc",
			"links_in": 817,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/ext/",
			"title": "Ext",
			"layout": "wall",
			"links_in": 816,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/dev/",
			"title": "Dev",
			"layout": "wall",
			"links_in": 816,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/core/Search/",
			"title": "Search",
			"layout": "doc",
			"links_in": 816,
			"tier": "Framework sidebar"
		},
		{
			"url": "/framework/styles/rules/",
			"title": "Rules",
			"layout": "wall",
			"links_in": 816,
			"tier": "Framework sidebar"
		}
	]
};
