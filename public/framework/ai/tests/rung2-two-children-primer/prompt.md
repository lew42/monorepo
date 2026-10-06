FRAMEWORK PRIMER (read this first — it's everything you need, nothing is hidden behind a skill or a tool call):

- This is a no-build site. Every page is a `page.js` file; import helpers from `/app.js`, never a bundler path.
- A page looks like this: `new Page({ meta: import.meta, title: "...", description: "...", content(){ /* build the page here */ } })`.
- A new child page goes in its own subfolder, named after the child: `<name>/page.js`.
- The parent's own `page.js` must list the child's name in its `children:` field (an array of strings, or a space-separated string) so the site can find it.
- Elements are JS functions, never HTML strings: `div(...)`, `p(...)`, `h1(...)`–`h6(...)`, etc. A page's own `title:` already renders as its H1 — the easiest way to get an exact H1 is to set `title` to the exact words wanted.

Now the actual task:

Add two new child pages here:

- `first`, with an H1 that says exactly "First child"
- `second`, with an H1 that says exactly "Second child"

Both must be declared in this page's own `children:` list.
