import { Page, p } from "/app.js";
import { code, section } from "../../site/ui.js";

/* The Chrome Wright's report. The pages this argues from are live at
 * /chrome/ — eight patterns, each showing the code that produced it. */
export default new Page({
	meta: import.meta,
	title: "Chrome Wright — report",

	content(){
		this.round_two();

		code(`
function child_label(parent, name){
    return parent.labels?.[name] ?? name.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase());
}

function nav(root, here){
    const section = here.chain()[1];              // [root, section, …me] — the one I'm inside

    return div.c("chrome-nav", () => {
        a.c("chrome-brand", root.title).href(root.url);

        root.children.forEach((child, name) => {
            a.c("chrome-nav-link", child_label(root, name)).href(root.url + name + "/");

            if (child && child === section)
                child.children.forEach((_, sub) =>
                    a.c("chrome-nav-link chrome-nav-sub", child_label(child, sub))
                        .href(child.url + sub + "/"));
        });
    });
}`, "Open #6, answered — site/chrome/chrome.js");

		p("Live at `/chrome/sidebar/`, against this site's real tree, with real links the real `mark_links()` pass lights up. It imports nothing.").ac("note");

		section("Verdict: yes, and it needs nothing from the framework");

		p("The hand-typed nav's comment says a derived one `would have to import every one of them to read their titles`. True — and the wrong requirement. A nav does not need titles. It needs `labels`.").ac("note");

		code(`
title    belongs to a PAGE      arrives with the import       may not exist yet
label    belongs to the LIST    the parent already has it     always exists`);

		p("A title is also the wrong string even when you have it: `which` pages are imported depends on the url you arrived at, so a nav built from titles reads differently per entry point. That is the bug `tabs()` already refused, and a sidebar is on screen far longer than a tab bar. So the rule is deterministic instead — a declared label, else the name made readable — and it is identical from every entry point, forever.").ac("note");

		code(`
labels: { dynamic: "route()", marks: "Active state", focus: "Focus & inert" }`, "inert data on the parent — Page never reads it, and needs no change to accept it");

		p("`Page`'s constructor is assign-based, so `labels` passes through as inert data exactly like `col` and `classes` do. The prototype in `/chrome/sidebar/` is running today with a **zero-line diff** to the framework.").ac("note");

		section("Measured");

		code(`
derived vs hand-typed, live from app.nav + app.recipes + app.root.children
              (19 sections when this was written; 27 by round two — the table
               on /chrome/sidebar/ recounts itself, so it cannot go stale)
    11 of 27  labels correct from the NAME alone
     8 of 27  a human's editorial choice — nav→"Primitives", a11y→"Access",
              perf→"Cost", urls→"URL design", dynamic→"route()"
     8 of 27  sections the hand-typed sidebar has simply not been told about
    27 of 27  with labels declared, still zero imports

module fetches, counted per navigation (page.js requests)
    /                    1     the root
    /chrome/             2     root + chrome
    /chrome/<any>/       3     root + chrome + leaf
                               — identical with and without the derived nav`);

		p("The eight undecidable ones are the whole argument for declaring: they are not derivations anyone could have got right, they are decisions. `a11y → Access` cannot be computed from `a11y`.").ac("note");

		section("Request 1 — Page.child_label(name) · ACCEPTED, copy-ready in child_label.md");

		code(`
+  /* What a link to my child \`name\` should SAY, before that child is imported.
+   * Deterministic: the same from every entry point, so a nav cannot read
+   * differently depending on which url you arrived at. */
+  child_label(name){
+      return this.labels?.[name] ?? name.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase());
+  }

   previews(){
       return div.c("page-previews", () => this.children.forEach((page, name) =>
-          page ? page.preview() : a.c("page-preview", name).href(this.url + name + "/")));
+          page ? page.preview() : a.c("page-preview", this.child_label(name)).href(this.url + name + "/")));
   }`, "Page.class.js — one new method, one changed line");

		p("The reason is visible on `/chrome/` right now: the preview cards say `marks` and `focus` while the nav beside them says `Active state` and `Focus & inert`. Same children, two labels, one screen. `child_label()` gives every un-imported link one place to ask.").ac("note");

		p("The name pairs with the method beside it: `child(name)` gets the page, `child_label(name)` gets what to call it **without** getting it. `label` alone was rejected — it reads as this page's own label, and `log_label()` is the precedent for spending a scoping prefix when the bare word is contested.").ac("note");

		section("Request 2 — Router tells the app a navigation happened · APPLIED");

		code(`
   activate(page){
       …
       this.active = page;
       this.mark();
       document.title = page.title ?? document.title;
+      this.app.navigated?.(page);
   }`, "Router.js — one line, optional, App need not define it");

		p("I want this more than Request 1. Four patterns need it and none of them can be written without it:").ac("note");

		code(`
crumbs      the trail is a function of the leaf; nothing tells it the leaf moved
prev/next   same
drawer      a drawer that stays open after you pick something closes twice —
            and CSS has no selector for "a navigation happened"
focus       move the keyboard into the new page, announce its name — the whole
            of client-side-routing accessibility, and it is chrome's job because
            chrome is the only thing that outlives both pages`);

		p("It works today without the line, and the workaround is why I am asking:").ac("note");

		code(`
// site/app.js — override mark() through the Router's assign-based config
router: {
    mark(){
        Router.prototype.mark.call(this);
        this.app.navigated(this.active);
    },
},`, "the version that needs no framework change");

		p("`Router.prototype.mark.call(this)` is a super call written by hand because there is no subclass. It works, and no one reading `site/app.js` would guess why it is there. One duck-typed line in `Router.activate()` — the same shape as `page.activate?.()` — replaces it.").ac("note");

		section("Request 3 — say out loud that mark_links() clears");

		code(`
this.root().querySelectorAll("a[href]").forEach(link => {
    link.classList.toggle("active",  …);      // toggle, not add
    link.classList.toggle("in-path", …);      // every anchor in $app, every navigation
});`);

		p("Any widget holding its own link state under those two names is silently wiped the next time you click anything. `ChromeShell` marks with `.chrome-active` / `.chrome-in-path` for exactly this reason, and hit it as a real bug first. Not asking for a code change — asking for one sentence in the readme, because the failure is invisible: nothing throws, the classes just quietly go away.").ac("note");

		section("Requests to site/styles.css · ALL THREE FIXED");

		code(`
1.  pre > code
    styles.css styles \`code\` for the INLINE case: background, padding, .9em.
    A highlighted block is <pre><code>, and an inline box spanning ten lines
    breaks into ten fragments, each painting its own background and padding.
    Every code block on every seat's page is striped until someone adds:

        pre > code { background: none; padding: 0; font-size: inherit; }

2.  the five tokens ext/ expects
    ext/demo and ext/highlight consume framework.css's --line, --surface,
    --wash, --subtle, --radius. This sub-site loads styles.css instead, where
    they have no values — so \`border: 1px solid var(--line)\` computes to NO
    BORDER. Every demo box is invisible until each seat supplies them:

        --line: #e2e4e8;  --surface: #fff;  --wash: #f3f4f6;
        --subtle: #6b7280;  --radius: .45rem;

3.  the site's own chrome does not respond to width
    .sidebar is flex: 0 0 15rem, fixed. At 500px that is 48% of the window and
    the page column is 260px. /chrome/drawer/ is the fix, measured and running.

All three are in styles.css now — :root for the tokens, a flat "pre > code"
rule, and .sidebar dropping to 9rem under 700px. My local copies of the first
two are DELETED rather than kept in step: two sources of truth for one value is
what the token existed to prevent.`, "three, in order of how many people they bite");

		section("The eight patterns");

		code(`
                     reach for it when                    it costs
sidebar    /chrome/sidebar/
                     the tree is the navigation           a label per child
                                                          whose name lies
crumbs     /chrome/crumbs/
                     pages nest more than two deep        depth 6 wraps, scrolls
                                                          or collapses — pick
topbar     /chrome/topbar/
                     siblings matter as much as depth     nothing at depth 1;
                                                          N siblings is N wide
prev/next  /chrome/siblings/
                     the section is a sequence            siblings only — no
                                                          wrap to the next section
drawer     /chrome/drawer/
                     the nav costs more than it earns     one global id, plus
                     below ~40em                          one line of JS to close
palette    /chrome/palette/
                     the tree is wider than a sidebar     names only: no titles,
                                                          no content, no route()
marks      /chrome/marks/
                     always — it is already running       nothing. two classes
                                                          and one pass
focus      /chrome/focus/
                     always, and nobody does              three lines, and it
                                                          needs Request 2`);

		section("Measured at three widths");

		code(`
9 routes × 1400 / 900 / 500 = 27 combinations
    horizontal overflow    none          scrollWidth <= clientWidth everywhere
    console errors         none
    modules per route      2 or 3        exactly the chain, never more

drawer, container width 500px
    burger visible, drawer off-canvas at x=122.5 (translateX(-100%))
    burger click     -> x=298.5, scrim visible
    nav link click   -> checkbox false, x=122.5, site url UNCHANGED
    scrim click      -> checkbox false

marks, one pass, three consumers
    /chrome/marks/   3 anchors (nav + crumb + tile)   all "active"
    /chrome/         1 anchor  (crumb)                "in-path"
    /                1 anchor  (crumb)                neither — the pass
                                                       excludes "/" by rule
    late-render gap  a link built after the pass: "chrome-tile"
                     after app.router.mark_links():   "chrome-tile active"

focus, probed rather than asserted
    cover, no inert  reachable — the keyboard is in chrome nobody can see
    cover + inert    refused

active state after a click and after a reload of the same url: identical`);

		section("Names I invented");

		code(`
child_label(parent, name)   what a link should say before the import
nav(root, here)             the two-level derived sidebar
crumbs(page, max)           chain() as a trail, optionally collapsed
topbar(page)                the leaf and its siblings
prev_next(page) / up(p)     the sequence, and the way out of a dead end
jump_list(root)             every name reachable without an import

ChromeShell                 a miniature App+Router: a viewport on a page
  chrome(shell)             built ONCE, in render()
  navigated(shell)          derived chrome, rebuilt per navigation
  $region                   where the chrome wants $pages, if not flat
  .chrome-active            the shell's own marks — it may not borrow the
  .chrome-in-path           real ones, see Request 3

widths($stage)              1400 / 900 / 500 as max-width caps on a box
show_source(fn)             String(fn), highlighted — keeps the signature
.chrome-stage               a container-query box standing in for a viewport`);

		p("`navigated` is deliberately the name Request 2 asks Router for: the demo harness and the proposal cannot drift apart if they are the same word.").ac("note");

		section("Dissent");

		code(`
1. previews() should NOT change for resolved children.
   Fully deterministic previews would mean discarding a real title we already
   have. A card is per-page and transient; a nav is persistent and builds
   spatial memory. Same tree, different chrome, different rule — and that
   difference is the finding, not a wart to sand off.

2. Grouping is a missing tree node, not a nav feature.
   The hand-typed nav has a "recipes" heading. A derived nav is flat and cannot
   invent it. That is correct: if six sections belong together, the honest fix
   is a page they are all children of. I would not add "sections" to a nav.

3. A page must never register a global key handler.
   A page's DOM stays in $pages after you leave it — only a class takes it off
   screen — so a page-registered ⌘K fires from three pages away. That is why
   /chrome/palette/ ships no hotkey. Chrome may own one, because chrome is
   built once and never leaves. Confirmed the hard way: a Playwright locator
   found the hidden ancestor page's nav before the visible one's.

4. full covering the chrome (Open #3) is the site's bug and should stay so.
   The framework never knew the page was "full" — that is a class the site
   invented. But nothing currently sets inert, so today the keyboard walks
   into a nav nobody can see. Measured on /chrome/focus/. One line in the
   site's navigated() closes it — which is Request 2 again.

5. No readme.md in site/chrome/.
   This page IS the design record; a second copy beside the pages would be
   the drift I spent eight pages arguing against.`);

		section("Files");

		code(`
site/chrome/chrome.js       the demo kit: child_label, nav, crumbs, topbar,
                            prev_next, up, jump_list, widths, show_source,
                            ChromeShell, sample()
site/chrome/chrome.css      one stylesheet, @layer site, every class prefixed
site/chrome/page.js         the index: the claim, and the built-once proof
site/chrome/{sidebar,crumbs,topbar,siblings,drawer,palette,marks,focus}/page.js

site/kit/kit.js             THE SHIPPABLE ONE — chrome() · shell() · update()
site/kit/kit.css            what a site adopting the kit downloads
site/kit/page.js + page.css the adoption page, live at /kit/

agents/chrome/page.js       this
agents/chrome/child_label.md  copy-ready text for Page.class.js

Untouched: site/app.js, site/styles.css, site/ui.js, site/index.html, App.js,
Page.class.js, Router.js, site/page.js, every other seat's directory.`);
	},

	/* ── round two ────────────────────────────────────────────────────────
	 * Three tasks: build the shippable kit, hand over child_label(), and settle
	 * the ordering with the a11y seat. All three measured on the live site. */
	round_two(){
		section("Round two — the kit, the handover, and the a11y collision");

		code(`
import { chrome } from "./kit/kit.js";

export default window.app = new App(chrome({ brand: "new/1", home: "Home" }),
                                    { socket: Socket.singleton() });`, "site/app.js, adopting site/kit/ — live at /kit/");

		p("`chrome()` returns `{ render, navigated }` — App's two seams as a plain assign-object, so adopting the whole thing is one argument to a constructor that already takes `...args`, and overriding one piece is one key after the spread. There is no `nav` array anywhere.").ac("note");

		code(`
sidebar      app.root.children + labels        27 sections, 0 imports
crumbs       page.chain()                      all loaded by construction
prev/next    parent.children, declared order   the ordering guarantee, spent
drawer       one checkbox + :has(), ≤700px     one line of JS to close it
skip link    first tabbable thing there is     <main id> + tabindex="-1"
focus        navigated(), never on first paint three attributes and .focus()`, "everything derived, nothing hand-typed");

		section("Measured against the real tree");

		code(`
/kit/ cold load        1 module for the page · 0 for the chrome
top-level links        27, built ONCE — same DOM node after every navigation
sub-list rebuilds      1 per section crossed, 0 while inside one section
driven walk /          → /columns/ 1 module → /chrome/ 1 more (the real tree,
                         lazily imported exactly as a click would)
1400 / 900 / 500       no horizontal overflow, no console errors
500px                  burger display:block, drawer off-canvas, scrim closes it`);

		section("One bug, found by building it twice");

		code(`
/kit/ renders two shells. Both had id="kit-drawer" and id="kit-content", so
    the driven shell's burger toggled the LIVE shell's drawer
    the driven shell's skip link jumped to the LIVE shell's <main>

<label for> is the only way to reach a checkbox that is not its ancestor, and
an id is a global name. shell() numbers them now: kit-drawer-1, kit-drawer-2.`, "measured: burger clicked, checked stayed false");

		p("This is the cost `/chrome/drawer/` wrote down as a hypothetical — *an id is a global name, and a component that needs one is not freely reusable* — arriving for real the first time a second shell existed. A demo page that renders the thing twice is worth more than one that renders it once.").ac("note");

		section("The hand-typed nav has already drifted");

		code(`
27 sections in app.root.children
    11   the derived label and the hand-typed one agree
     8   editorial — nav→"Primitives", a11y→"Access", perf→"Cost", urls→"URL design"
     8   IN THE TREE AND NOT IN THE SIDEBAR AT ALL
         compose · council · start · state · kit · mutation · sitemap · budget`, "live at /chrome/sidebar/, computed from app.nav + app.recipes");

		p("That last row was `0` when I wrote the first report. The council kept adding seats and the second list fell behind — which is the whole argument, arriving on its own while nobody was looking. A derived nav cannot fall behind, because there is no second list.").ac("note");

		section("Task 3 — one navigated() serves both seats");

		code(`
cold load of /kit/, navigated() installed before the first activate
    ["/kit/"]                       it FIRES on arrival
    ["/kit/", "/columns/"]          …and on the click, identically

what is already true when it runs
    links_already_marked  true      mark() ran first
    leaf_display          "block"   so focus() lands — before mark() it would
                                    silently do nothing and throw nothing
    leaf_has_active_page  true
    focusable             false     Page.render() sets no tabindex — the gap
    arguments.length      1`, "measured");

		p("`Yes — one hook serves both, and the a11y seat's focus move belongs inside the site's `navigated()`, not as a second framework line.` Master Mike put the call after `mark()`, which is the one placement that matters: it is what makes `focus()` land at all.").ac("note");

		code(`
navigated(page){
    1  derived chrome      crumbs · prev/next · the nav's open section
    2  mark_links()        REQUIRED, and it must be after 1
    3  transient chrome    close the drawer
    4  focus + announce    last
}`, "the order, specified");

		code(`
2 is required        leaf crumb WITH mark_links()  "kit-crumb active"
                                          WITHOUT  "kit-crumb"
                     everything step 1 builds is built AFTER mark()'s pass, so
                     step 2 is the only thing that ever marks it

4 is defensive       focus on a crumb, then rebuild the trail → activeElement BODY
                     focus-last puts it back; focus-first moved it out of the way
                     already. BOTH orders end correct — so I will not overclaim.

3 is why 4 matters   a transform drawer does NOT steal focus (measured: focus
                     stays on the link). A display:none or visibility:hidden one
                     WOULD — and the a11y seat is proposing exactly that for
                     .full. The day that lands, 4-last stops being defensive.`, "measured, not asserted");

		section("Request 4 — navigated(page, from)");

		code(`
-  this.app.navigated?.(page);
+  this.app.navigated?.(page, from);`, "Router.activate() — `from` is already computed on line 1 of the method");

		p("Both seats need to tell the first paint from a navigation, and neither can: the a11y seat's own request was guarded by `if (from.length)`, and my kit counts `kit_navigations` to get the same answer. Two independent re-derivations of a value the method has already computed and thrown away. `from` also answers `where did I come from`, which is the other thing derived chrome asks.").ac("note");

		section("Which of my four patterns got simpler");

		code(`
                     before navigated()                       after
crumbs               a call in every page's content(), and    1 call site
                     then it is inside $pages, scrolling
                     with the content — no longer chrome
prev/next            9 call sites in site/chrome/ alone —     1 call site
                     one per page, which is what I shipped
                     in round one and is the evidence
drawer close         IMPOSSIBLE per-page                      1 line
focus / announce     IMPOSSIBLE per-page                      1 call site`);

		code(`
down  /chrome/ → /chrome/sidebar/    activate /chrome/sidebar/
                                     navigated /chrome/sidebar/
up    /chrome/sidebar/ → /chrome/    navigated /chrome/
                                     ← no page.activate() at all`, "measured — why the last two were impossible");

		p("Going up, `to.slice(shared)` is empty, so no page hook of any kind runs. A page CAN know it re-entered the chain — `activate()` is exactly that signal, and `/kit/` uses it to repair its demo's link marks — but only when it is entering. Navigating up enters nothing, and that is the case both seats needed.").ac("note");

		section("Where the a11y seat and I differ");

		code(`
agree   the hook belongs in Router.activate(), after mark()
agree   focus must not move on the first paint
agree   full covering the chrome is the site's bug, and it is measured now

differ  WHERE the focus move lives
        a11y  page.view.el.focus() as a framework line in Router.activate()
        me    inside the site's navigated(), which the framework already calls

        A framework line cannot be turned off, retargeted, or ordered against
        the site's own chrome — and the site is the only tier that knows there
        IS chrome. The kit does it in four lines and the framework stays out.

differ  three attributes on the page view
        a11y  Page.render() sets tabindex/role/aria-label — I now agree, and
              measured "focusable: false" is why. Their version also covers a
              tab default (rendered, never activated) which mine cannot see.
              The kit sets them itself today; those three lines delete
              themselves when Page.render() does it.`);
	},
});
