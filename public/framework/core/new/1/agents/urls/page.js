import { Page } from "/app.js";
import { section, code } from "../../site/ui.js";
import { md, claim, visit } from "../../site/urls/ui.js";

export default new Page({
	meta: import.meta,
	title: "Cartographer — url design",

	content(){

		md(`**The schema below did not exist as a document.** It is the most durable thing in this report; everything after it is a consequence.`);

		section("1 · The schema, as rules");

		md(`
| # | rule | enforced by |
|---|---|---|
| 1 | **A page url always ends in \`/\`.** There is no second shape in this tier. | \`Page.naming()\` |
| 2 | **A segment is a \`children\` key**, matched exactly and case-sensitively. | \`Page.child()\` |
| 3 | **The filesystem is the router**: \`/a/b/\` ↔ \`/a/b/page.js\`, one expression each way. | \`Page.child()\` + \`Page.load()\` |
| 4 | **Only a declared name reaches the network.** \`route()\` claims everything else and structurally cannot shadow a file. | \`Page.child()\` |
| 5 | **The page's url is canonical, not the one you typed.** | *not enforced — see P2* |
`);

		claim(() => {
			const module_url = url => url + "page.js";                  // /a/b/  ->  /a/b/page.js
			const page_url = meta => new URL(".", meta.url).pathname;   // …and exactly back
		}, null, "One branch, both directions. Verified by construction, not by reading: /urls/schema/ builds a real Page per row and prints what `naming()` derived.");

		md(`**Rule 1 is load-bearing three times over, not once.** \`url + "page.js"\` is only valid concatenation with the slash; \`link_clicked\`'s \`/\\.\\w+$/\` can only reject a *final* dotted segment, so the slash is what keeps \`/docs/v1.2/\` clickable; and the dev server 404s the same pattern. Drop the slash and all three fail together.

**This tier has exactly one url shape**, which the older \`core/Page\` does not — its \`/docs/x.page.js\` → \`/docs/x\` form is why \`Page.module_url()\` needs a branch and \`naming()\` does not. Worth keeping.`);

		section("2 · Findings, ranked by likelihood × damage");

		md(`
| # | finding | measured | likelihood | damage |
|---|---|---|---|---|
| 1 | **A click drops \`?query\` and \`#hash\`.** \`click()\` passes \`link.pathname\` only. | \`?filter=red\` → \`""\` after one click | high | high |
| 2 | **Non-canonical urls stick in the address bar.** \`/tabs\`, \`/tabs//\` all resolve and all remain. One page, four urls. | address bar kept all four | high | medium |
| 3 | **A segment is never decoded.** A *declared* child named \`hello world\` is unreachable: the Map key is decoded, the segment is not. | \`child("hello%20world")\` → miss | high | medium |
| 4 | **\`initialize()\` runs before adoption.** An inline page has no url yet, so children added there get \`undefinedkid/\` — silently. Every \`route()\` page is in this position. | \`kid_url: "undefinedkid/"\` | high | high |
| 5 | **A deep link to \`#section\` never scrolls.** The browser looks for the target while the page is still a name. | \`scrollTop\` 0 of 1461 | medium | medium |
| 6 | **A child named \`view\` / \`regions\` / \`$pages\` breaks the page — on a cold load only.** \`alias()\`'s guard is blind to properties assigned after construction. Works on a click, blank on a reload. | \`TypeError\` in \`activate()\` / \`container()\` | medium | high |
| 7 | **A non-canonical href is marked wrong.** \`/urls/sla\` gets \`.in-path\`; \`/urls/slash//\` gets **nothing**. \`startsWith\` has no segment boundary. | measured, all three | medium | low |
| 8 | **Repeated \`go()\` to the current url stacks history.** Clicking the tab you are on costs a Back press. | 3 clicks → 3 entries | medium | low |
| 9 | **A dotted final segment with no slash is unreachable by click** and 404s in dev. \`/docs/v1.2\` — but \`/docs/v1.2/\` is fine everywhere. | both confirmed | medium | medium |
| 10 | **An href starting with \`//\` leaves the site.** \`//tabs//\` parses as \`http://tabs//\` — a different origin, so it is never intercepted. | \`origin: "http://tabs"\` | low | high |
| 11 | **A 404 leaves \`document.title\` stale.** | title stayed \`new/1\` | low | low |
| 12 | **Root page + a child named \`parent\` → \`chain()\` walks forever.** Only reachable on a page with no parent. | walk depth unbounded | very low | total |
`);

		md(`**Verified safe, and worth knowing:** \`constructor\`, \`__proto__\`, \`render\`, \`url\`, \`children\` and \`route\` as segments are all refused correctly — \`children\` is a \`Map\`, so **there is no prototype-pollution path**. \`%3Cscript%3E\` renders as text everywhere (\`title\`, \`h1\`, \`href\` all take the string path). A 300-character segment is fine. A 404 is fully recoverable — \`router.go()\` still works afterwards.`).ac("note");

		section("3 · The static contract — dev and production agree");

		md(`
| url | dev | production | |
|---|---|---|---|
| any canonical page url | 200 \`index.html\` | 200 \`index.html\` | agree |
| \`/urls/nope/page.js\` (a missing module) | 404 | 200 \`index.html\` | **differ, and handled** |
| \`/docs/v1.2\` (dotted, no slash) | **404** | 200 \`index.html\` | differ — dev is stricter |
`);

		md(`Row 2 is the after-deploy bug class, and it is already closed by four words in one regex:`);

		claim(Page.missing, null, "Dev says *failed to fetch*; production says *expected a JavaScript module, got MIME type text/html*. Both are in the pattern, so a missing page is a missing page in both. Without the last two alternatives, every production 404 would have been reported as **a syntax error in a file that does not exist**.");

		md(`**Case sensitivity cannot bite, and that is structural rather than lucky.** Windows is case-insensitive and Cloudflare is not, so \`/COLUMNS/page.js\` is 200 in dev — but a segment only reaches \`import()\` after \`children.get(name)\` returned \`null\`, and \`Map.get\` is case-sensitive. The string handed to the network is always one an author typed. **"Only declared names hit the network" turns out to be a deployment guarantee as well as a performance one**, and it is the single most valuable property of \`child()\`'s three slots.

The two things that would break it: deriving a module path from a url segment without a Map lookup first, and putting an \`index.html\` inside any page directory — Cloudflare's \`html_handling\` would serve it and the SPA fallback would never run. There is currently exactly one per site root.`).ac("note");

		section("4 · Position — where non-path state belongs");

		md(`**The path owns identity. The query owns the lens. The Router carries the query and never reads it.**

The test is not *"is this state?"* — everything is state. It is:

> **Is this a different document, or the same document viewed differently?**`);

		md(`
| | | |
|---|---|---|
| sorted, filtered, a row expanded | same document | **query** |
| \`/guide/\` in French, \`/api/\` at v2 | a different document | **path** |
| page 2 of an archive | different posts — a different document | **path**, via \`route()\` |
| page 2 of a filtered table | a scroll position with ambitions | **query** |
`);

		md(`**Why a lens must never be a segment:** \`child()\` resolves segments into Pages, and a filter is not a Page. It would gain a chain entry (breadcrumbs reading *Products › colour › red*), a marking lie (\`.in-path\` marks \`/products/\` as an **ancestor of its own filter**), a combinatorial \`children\` map, and a third url for one screen the moment \`previews()\` links to the bare page.

**And the Router should not re-render on a query change.** \`activate()\` diffs two chains; a query-only change produces identical chains and nothing is entered or left. That is correct, and it should stay correct — a Router that re-activated on a query change would be interpreting a string it has no business reading. The page that owns the lens owns the re-render, with \`replaceState\`, because a filter is not a destination.

**One thing the Router does owe: the query itself.** A page cannot read \`location.search\` at render time — \`go()\` loads *before* it pushes, so mid-navigation the bar still shows the url being left. This is the same trap \`mark_links()\` already documents when it takes \`here\` from \`this.active.url\`. One assignment closes it: \`this.search = to.search\`, carried, never read.`);

		section("5 · Position — redirects, reconsidered from scratch");

		md(`**The readme's removal was right, and \`redirect()\` should not come back in that form.** The case it existed for is gone: \`/tabs/\` renders its first tab in its own panel and that tab's href *is* \`/tabs/\`. A mechanism whose only customer has since been solved a better way is not a mechanism. It also cost a return-type change on \`load()\` and a second entry point, and neither was ever about routing — both were paying for one layout's convenience.

**What survives the removal is a different need: a page was renamed and the old url is in someone's bookmarks.** That is unsolved, and \`route()\` is not sufficient for it — \`route()\` gives an *alias*, two live urls serving one screen, which is the same failure as \`/tabs\` and \`/tabs/\`. A framework whose conviction is *the url IS the state, entirely and exclusively* is claiming an injective encoding, and two urls for one state breaks it. **So the framework should support redirect, not alias.**`);

		md(`
| the removed \`redirect()\` | \`aliases\` |
|---|---|
| \`load()\` returned a page instead of a boolean | no signature changes |
| \`Router.enter()\` — a second entry point | no new method |
| lived in \`Router\` | lives in \`Page\`, next to \`children\` |
| existed for one layout's default tab | exists for a renamed page |
| the redirect **was** the mechanism | the redirect **falls out of** P2 |
`);

		md(`That last row is the one that matters. \`aliases\` alone is an alias. It becomes a redirect only because \`go()\` pushes \`this.active.url\` — a fix designed independently, for trailing slashes. **Two one-line changes aimed at different problems composing into a third feature neither asked for is the sign the shape is right.** Measured: \`/urls/alias/intro/\` renders Start, the bar reads \`/urls/alias/start/\`, and Back lands on \`/urls/alias/\` — the aliased url leaves no history entry of its own.

**Deliberately out of scope: a cross-tree short link** (\`/x/\` → \`/a/deep/path/\`). It needs a url rather than a name, and letting \`child()\` return a page from elsewhere in the tree breaks \`parent\`, breaks \`chain()\`, and breaks the sentence *"the url is mine plus the name I'm giving it"*. A short link is a one-line page that calls \`router.go(target)\`; if that costing a history entry ever becomes a real complaint, **that** is the argument for \`go(url, "replace")\`, and not before.`);

		section("6 · Requested changes, each with its exact diff");

		md(`
| | change | file | status |
|---|---|---|---|
| **P5** | seven class fields on \`Page\` | \`Page.class.js\` | **APPLIED** |
| **P6** | adopt in the constructor | \`Page.class.js\` \`add()\` | **APPLIED** |
| **R1** | carry \`search\` and \`hash\` | \`Router.js\` \`click()\`, \`go()\`, \`load()\` | accepted, held one round |
| **R2** | push the page's url, not the one asked for | \`Router.js\` \`go()\` | accepted, held one round |
| **R3** | scroll to the hash after render | \`Router.js\` \`load()\` + a method | accepted, held one round |
| **R4** | re-mark links when links appear | \`Router.js\` \`listen()\` + a method | **async seat's**, adopted |
| **R5** | one navigation wins | \`Router.js\` + one field | merged from async's Open #4 |
| **P3** | \`aliases\` | \`Page.class.js\` \`child()\` | accepted, gated on R2 |
`);

		md(`**R1–R5 are now one reconciled diff**, merging this seat's proposals with the async seat's — copy-ready, with both seats' failing cases as its test set and the four disagreements recorded: \`agents/urls/router.md\`. All five are prototyped in \`site/urls/proposals.js\` and measured; the regression is 16 routes across nine other seats' sections, **0 differing**.`).ac("note");

		code(`
P5  Page.class.js — seven class fields, no initialisers, no behaviour change

      export class Page {
      +     view;          // built once by render()
      +     regions;       // named child -> container, written by tabs()
      +     $pages;        // this page claims the subtree below it
      +     loading;       // load_all_children()'s promise
      +     default_tab;   // the first tabs() set owns this page's url
      +     parent;        // assigned by add(), the one place
      +     app;           // assigned on the walk, in child()

    alias()'s existing guard becomes complete. Fixes findings 6 and 12.`, "P5 — the strongest of the six");

		code(`
P6  Page.class.js — add()

    - const page = child instanceof Page ? child
    -     : new Page(is.fn(child) || typeof child === "string" ? { content: child } : child);
    - page.assign({ name, parent: this, app: this.app }).naming();
    + const adopt = { name, parent: this, app: this.app };
    + const page = child instanceof Page ? child.assign(adopt)
    +     : new Page(is.fn(child) || typeof child === "string" ? { content: child } : child, adopt);
    + page.naming();

    The constructor already takes ...args and lets later ones win — the same
    shape as new Router(this.router, { app: this }). Fixes finding 4 for the
    options form at any depth. The "new Page(...)" form stays broken and should:
    you constructed it before anything adopted it, so there was no url to have.`, "P6");

		code(`
P2  Router.js — go()

    - if (await this.load(url)){
    -     history.pushState({}, "", url);
    + if (!await this.load(to.pathname + to.hash)) return location.assign(url);
    +
    + const next = this.active.url + to.search + to.hash;
    + if (next !== location.pathname + location.search + location.hash)
    +     history.pushState({}, "", next);

    …and in load(), for the cold load, which never passes through go():

    + const first = !this.active;          // nothing activated yet IS "the browser did this one"
    + if (first) history.replaceState({}, "", this.active.url + this.search + hash);

    No second entry point: "!this.active" is what "first" means. Fixes 2, 7, 8.`, "P2");

		code(`
P1  Router.js — click(), go(), load()

    - this.go(link.pathname);
    + this.go(link.pathname + link.search + link.hash);

      go():  const to = new URL(url, location.origin);   // parse once, here
      load(): + this.search = first ? location.search : to.search;   // carried, never read

    load_segments() keeps taking a pathname; it has never wanted anything else.`, "P1");

		code(`
P4  Router.js — load(), plus one method

    + this.app.ready.then(() => this.scroll_to_hash(hash));

    + scroll_to_hash(hash){
    +     if (!hash) return;
    +     this.root().querySelector("#" + CSS.escape(hash.slice(1)))?.scrollIntoView({ block: "start" });
    + }

      listen(): this.load(location.pathname + location.hash)   // so popstate takes the same path

    app.ready is the only correct moment: $app is still detached while load()
    runs, and scrollIntoView on a detached node does nothing.`, "P4");

		code(`
P3  Page.class.js — child(), first line

    async child(name){
    +     name = this.aliases?.[name] ?? name;   // a name that used to be mine
          const known = this.children.get(name);

    …and the optional property, next to children:

      aliases: { intro: "start", "getting-started": "start" }

    ONE substitution, deliberately not recursive: { a: "b", b: "a" } resolves a
    to b and stops. A cycle is unrepresentable rather than guarded against.`, "P3");

		section("7 · Dissent, and what I did not propose");

		md(`
| | |
|---|---|
| **The removal of \`redirect()\` and \`Router.enter()\` was right.** | Recorded as agreement, not grudging acceptance. \`aliases\` is not a restoration: different customer, different file, no signature change, and the redirect behaviour is emergent rather than built. |
| **The Router must not re-render on a query change.** | Tempting and wrong. It would be the Router interpreting a string, which is exactly the line the readme drew. |
| **Do not decode url segments.** | \`decodeURIComponent\` in \`child()\` would make the Map key and the module path disagree, and a malformed \`%\` throws. The fix is a rule — *a \`children\` key is a url segment, so write it url-safe* — not a call. |
| **Do not fix \`.in-path\`'s segment boundary.** | Every href the framework builds comes from \`page.url\` and is already canonical. Fixing the comparison would hide the real bug, which is a hand-typed href in \`site/app.js\`'s nav array. |
| **Do not add a check for protocol-relative hrefs.** | Nothing in the framework produces one. It is a hazard to document, not code to write. |
| **No cross-tree short links.** | See §5. \`go(url, "replace")\` is the honest shape if it is ever really wanted, and nobody has wanted it yet. |
| **\`container()\` is action at a distance** — and out of my scope, but it is the one thing that made the dimension findings hard to reason about. | The readme already knows. |
`);

		section("8 · Dimensions — the rule");

		md(`**A dimension prefix (\`/en/…\`, \`/v1/…\`) is free when the content comes from data, and expensive when it comes from files.**

Free, because \`naming()\` derives \`parent.url + name + "/"\` and every link method builds from \`this.url\` — so **every link inside a prefixed subtree self-prefixes with no code at all**. Four prefixes and eight leaf urls cost one object literal and one nested \`route()\` under \`/urls/dimension/\`.

Expensive, because a declared child imports \`this.url + name + "/page.js"\` and \`this.url\` is prefixed — so \`/en/guide/\` looks for \`/en/guide/page.js\`. **File-backed children cannot be shared across prefixes**, and the tree multiplies once per dimension value. Also: switching dimension is string surgery on \`location.pathname\`, the one place a view must read the browser; and the prefix joins the chain, so breadcrumbs read *English › guide* and \`.in-path\` marks \`/en/\` as a section it is not.

**Verdict: prefix-first for locale and version** — both are genuinely different documents by the §4 test, and it is what readers and crawlers expect — **but put the dimension last (\`/guide/fr/\`) the moment the pages are file-backed.** One directory, shared content, and switching is a suffix swap. \`route()\` on a root-level page is the right mechanism for a dimension and the only one that scales; the cost is that nothing warns you the first time a page under that prefix wants a \`page.js\`.`);

		section("9 · Evidence");

		md(`41 urls, each cold-loaded, reloaded and diffed at 1400×800. **Zero console errors** on every url except the two deliberate 404s; **no horizontal overflow** anywhere; **every reload reproduced its click** byte-for-byte in address bar, title, resolved page and marking.`);

		md(`
| | before | after |
|---|---|---|
| \`/urls/slash\` → address bar | \`/urls/slash\` | \`/urls/slash/\` |
| \`/urls/slash//\` → address bar | \`/urls/slash//\` | \`/urls/slash/\` |
| \`/urls/alias/intro/\` → bar, title | \`/urls/alias/intro/\`, Start | \`/urls/alias/start/\`, Start |
| Back from an aliased url | — | lands on \`/urls/alias/\`, skipping it |
| \`/urls/hash/long/#bottom\` cold → \`scrollTop\` | 0 | **1461** |
| click \`?colour=red\` → \`location.search\` | \`""\` | \`?colour=red\` |
| 3 × \`go()\` to the current url → history | +3 | **+1** |
| \`/urls/ugly/view\` \`/regions\` \`/$pages\` cold | \`TypeError\`, blank | resolve |
| \`add()\` in \`initialize()\`, options form | \`undefinedkid/\` | \`/host/a/kid/\` |
`);

		section("10 · Site-wide, from the crawler");

		md(`\`/sitemap/\` walks \`app.root\`, renders every page detached, and resolves every anchor through **the router's own \`load_segments\`** rather than a copy of it. Run on a click, never on render — reaching every url means importing every url, and that is exactly the laziness this tier exists to keep.`);

		md(`
| | |
|---|---|
| pages reached by walking declarations | **379** |
| sections | **27** · deepest url **7** segments |
| anchors checked | **1912** |
| pages whose \`render()\` threw | **2** |
| names declared with no \`page.js\` | **4** |
| **non-canonical *derived* urls** | **0** — \`naming()\` cannot produce one |
| pages claiming unbounded urls with \`route()\` | **33** — the size of the unknown |
`);

		md(`**Two genuine bugs in other seats' work**, neither of which was visible from the page that owns it: \`/council/patterns/\` throws \`this.lead is not a function\` and renders the Page Load Error view; and \`/budget/\` was declared in the root's \`children\` and linked from four sections while having no directory behind it. Both found by rendering everything at once — the librarian seat's point, applied to urls.

Broken links rank **chrome 42, deep 8, urls 5, budget 1, patterns 1**, with 20 sections clean. Three of those clusters are specimens rather than defects and are named as such on \`/sitemap/links/\`, because a report that cannot separate intent from error is 50 numbers nobody trusts. The largest real cluster is a mock sidebar linking \`/guide/\`, \`/api/\` and \`/changelog/\` — a legitimate way to demo chrome, and indistinguishable from a typo to every reader and every crawler.`).ac("note");

		section("11 · The section");

		visit(["/urls/", "/urls/schema/", "/urls/slash/", "/urls/alias/", "/urls/query/",
			"/urls/hash/", "/urls/dimension/", "/urls/ugly/", "/urls/static/",
			"/sitemap/", "/sitemap/links/", "/sitemap/canonical/", "/sitemap/rule-one/"]);

		md(`
| artifact | what it is |
|---|---|
| \`agents/urls/schema.md\` | the five rules as a standalone document — **read before adding your first page** |
| \`agents/urls/router.md\` | the reconciled R1–R5 diff, copy-ready, with the disagreements recorded |
| \`/sitemap/\` | the derived map, the link checker, the canonical audit, and rule 1 proved three times |
`);

		md(`Every page shows the code that produced it, and the url that code claims sits directly underneath as a live link — so the marking rules are demonstrated on the exact urls being discussed. \`code.fn()\` throughout, because a code example written as a string can drift from the url beside it and a function cannot; \`ui.js\`'s plain \`code()\` only for proposed diffs, which by definition are not live. Where a method is being discussed it is passed **as the live function object** — \`claim(Page.prototype.alias)\` — so the page cannot show something the class does not do.`).ac("note");
	},
});
