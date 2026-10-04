FRAMEWORK PRIMER (read this first — it's everything you need, nothing is hidden behind a skill or a tool call):

- This is a no-build site. Every page is a `page.js` file; import helpers from `/app.js`, never a bundler path.
- A page looks like this: `new Page({ meta: import.meta, title: "...", description: "...", content(){ /* build the page here */ } })`.
- Elements are JS functions, never HTML strings: `div(...)`, `p(...)`, `h1(...)`–`h6(...)`, `span(...)`, `a(...)`, `ul(...)`, `li(...)`.
- Classes: `div.c("my-class", ...)` — the first argument is a string of one or more classes; the rest of the arguments are its content, same as calling `div(...)` directly.
- Children/nesting: pass a function as an argument — everything created inside that function becomes a child of the element it was passed to. Example: `div.c("box", () => { p("hello"); })` makes a `<div class="box"><p>hello</p></div>`.
- Text: pass a string argument. Only `p()` and `h1()`–`h6()` turn a backtick-wrapped word into a `<code>` span — so `` p("a `short` word") `` renders the word `short` as code.
- Other attributes (like `href` or a `data-*` attribute): call `.attr(name, value)` on the element, chained after `.c(...)`. Example: `a.c("link", "Read more").attr("href", "/report")`.

Now the actual task:

Rebuild this HTML as a View-helper tree, inside the `.rung0-output` box in this folder's `page.js` (the empty callback is already started for you — fill it in, don't replace the file). Same tags, same classes, same attributes, same text, same nesting as the HTML below. Never a raw HTML string or `innerHTML`.

```html
<div class="card highlight" data-kind="demo">
  <h2 class="card-title">Weekly Report</h2>
  <p>Here is a <code>short</code> summary of this week's progress.</p>
  <ul class="card-list">
    <li class="item">Shipped the login page</li>
    <li class="item done">Fixed the flaky test</li>
  </ul>
  <a class="card-link" href="/report">Read more</a>
</div>
```
