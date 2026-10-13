# Page layout: one 1920 wrapper per page (owner, 2026-10-13)

Every page Claude makes in Figma is laid out like a web page, not as frames scattered on the canvas.

- **One wrapper, 1920 wide.** The whole page sits in one auto-layout frame 1920 px wide that grows downward and scrolls with the mouse wheel. Use several 1920 wrappers, stacked or side by side, only when the content really splits. A design wider than 1920 (a 3440 mega mock-up, a 4400 video sheet) sits in its own wrapper beside it.
- **Above the fold first.** The top 1080 px holds what the page is: its title, a one-line gist, a Notes box (what is here, the verdict, anything waiting on the owner), and the most important specimen. Detail goes further down.
- **Auto layout everywhere.** No fixed-position stacks and nothing overlapping. Spacing shows the hierarchy: a heading sits closer to its own content than to the section before it, and related items are grouped in one frame.
- **The page is a component.** Turn each page's wrapper into a component named `Page · <page name>`. The `Index` page places an instance of every page component, grouped in sections. Right-click an instance and choose "Go to main component", and the index works as navigation.
- **Two exceptions Figma forces:**
  - A component can't contain another component's main. **Master components sit directly on the page canvas, top level** (owner, 2026-10-13): there Figma labels each one with its purple diamond and name, so it is obvious what is a master. Lay them out in a tidy row or grid beside the page component, not inside any frame. The page component shows instances of them.
  - A prototype only links to top-level frames. Screens that a prototype links to stay top-level, in a tidy row to the right of the wrapper, inside a Figma Section named `Prototype screens`.
- **Never delete.** Old `was · …` backups move into a `Backups` section at the far right.
- **Owner's pages** (Page 1–8, Color Schemes, Vector Design, Paragraph Design) are not touched.
- **The Index page** (`234:2003`, page 1 of the file) holds a scaled instance (400 wide, clipped to the top 520) of every `Page · …` component, grouped, each with a caption linked to the page. Rebuild it by re-running the same script whenever pages change; it's in the session transcript, and the session STATE links it. 38 previews rendered without trouble (2026-10-13).
