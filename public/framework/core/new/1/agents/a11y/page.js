import { Page, p } from "/app.js";
import { code, section } from "../../site/ui.js";

/* The Advocate's report — eighth seat, new/1 navigation council.
 *
 * Round 1: ten findings, ranked, with transcripts. Round 2: built on the
 * navigated() hook round 1 argued for, swept all 24 sections, and answered the
 * ordering question the chrome seat was asked independently.
 *
 * Nine pages of working demonstration live at /a11y/, plus a live auditor at
 * /a11y/audit/ that runs this report's own sweep against whatever is on screen.
 */
export default new Page({
	meta: import.meta,
	title: "Access — the register",

	content(){

		code(`
LANDED
  Router.activate()  this.app.navigated?.(page)      focus, announce, chrome
  site/styles.css    :has() → sidebar visibility     Open #3 closed
  site/styles.css    .nav-heading #9aa1ab → #5c636d  2.37:1 → 4.6:1
  site/styles.css    pre > code reset · the 5 ext tokens, shared with two seats
  site/a11y/         nine pages + a live auditor, running on the hook

STILL OPEN — exact diffs below
  1  Page.render()      tabindex/role/aria-label       the landmark half
  2  site/app.js        one navigated(), stated order  two seats now collide
  3  site/app.js        <main>, <nav>, a skip link     22 stops to content
  4  site/styles.css    --subtle #6b7280 → #5c636d     3-5 fails × 24 sections
  5  site/styles.css    .hint #8b919b → #5c636d        2.88:1 — you asked
  6  site/ui.js         code() wraps                   41 unnamed tab stops
  7  Router.load()      announce loading / not found
  8  App.error()        focus and name the error page`, "status");

		section("TASK 1 — built on navigated(), and Back is fixed");

		code(`
                              BEFORE                    NOW
──────────────────────────────────────────────────────────────────────────
cold load /                   body                      body        ← correct
click sidebar → /a11y/        a.nav-link "Access"       div.page "Access"
click → /a11y/focus/          a.page-preview            div.page "Focus after…"
Back (popstate)               body                      div.page "Access"
Forward (popstate)            body                      div.page "Focus after…"
tab switch → aria             a.tab "aria"              div.page "The APG pattern"
tab switch → verdict          a.tab "verdict"           div.page "Verdict"
Back out of a tab             body                      div.page "The APG pattern"
deep hop → /a11y/headings/    a.page-preview            div.page "Headings and…"
back up via sidebar           a.nav-link                div.page "Access"
Enter on a focused link       a.nav-link "Access"       div.page "Access"
  next Tab from there         link 2 of 21              a.page-preview "focus"

every NOW row is role=region with an aria-label. zero console errors.`, "measured — document.activeElement, every kind of navigation");

		p("**Back is the row that matters.** It was left deliberately broken for one round because no page hook could reach it — `shared 2`, `to.slice(2) = []`, navigating up enters nothing. `navigated()` fires there, so one line fixed what nine `activate()` overrides could not.").ac("note");

		code(`
export function navigated(page){
    if (!page.url?.startsWith("/a11y/")) return;   // ← the one line the canonical version drops

    page.chain().forEach(name_page);               // name every page that is on screen
    announce_route(page);                          // deliberately silent — see below
    queueMicrotask(() => focus_page(page));        // last, whatever else is in the chain
}`, "site/a11y/ui.js — the whole of it");

		code(`
export function focus_page(page){
    if (page.view?.el.isConnected) page.view.el.focus();
    return page;
}`, "the first-paint guard, and it needs no state");

		p("`navigated()` fires on boot too, but during boot `App.inject()` has not run and `$app` is still detached — so `isConnected` is false exactly once. That is not a flag in disguise: `focus()` on a detached element genuinely does nothing, so the guard is the real precondition and the behaviour we want falls out of it. Round 1's `from.length` would also have worked; this one is available to the *site*, which `from` is not.").ac("note");

		p("**Scoped to `/a11y/` on purpose.** A focus move is the most disruptive thing you can land under six seats who are mid-flight and cannot see the file. Measured to confirm the scope holds: `/columns/` → `/columns/child/` still leaves focus on `a.page-preview`, untouched. Dropping that one line is the whole difference between what runs and what request 2 asks for.").ac("note");

		section("The harder half — what it announces is NOTHING");

		code(`
THREE CHANNELS, ONE ANNOUNCEMENT

document.title = "Columns"      silent. Screen readers do not announce the
                                title on a soft navigation — that is the whole
                                reason this problem exists. It is for the tab,
                                history and bookmarks, and should keep being
                                set for exactly those.

focus → div.page[role=region]   "Columns, region"          ← THE announcement,
                                and it moves the user's cursor to the words

a live region saying the title  "Columns"                  ← the same word,
                                a second time`, "measured on /columns/ — the two strings are character-identical");

		p("So the rule is not *announce the page*; it is **announce only what focus cannot say**. Double-announcement is then avoided **by construction rather than by a guard** — the two channels never describe the same event, so there is no condition to get wrong and nothing to keep in sync. Measured after a real navigation: announcer `\"\"`, title `\"Focus after navigation\"`, focused region name `\"Focus after navigation\"`.").ac("note");

		p("**The rule to write down: a live region and a focus move are alternatives, not a pair.** A site that wants the region to speak on every navigation has to stop moving focus. Shipping both is the commonest way SPA announcements end up stuttering, and it is easy to reach precisely because each half is correct on its own.").ac("note");

		p("Which leaves the region for the two events with nowhere to put focus — a load still in flight, and a load that failed. Both still need requests 7 and 8; neither can come from `navigated()`, because `navigated()` only fires on success.").ac("note");

		section("TASK 3 — one navigated(), and the order is not free");

		code(`
                                       activeElement after the navigation
──────────────────────────────────────────────────────────────────────────
chrome closes drawer, then focus       div.page "Skip links"     PASS
focus, then chrome closes drawer       div.page "Skip links"     PASS (microtask)
focus SYNCHRONOUSLY, then chrome       button "menu"             FAIL

The drawer returns focus to its trigger when it closes — the standard
accessible-dialog behaviour, and what /chrome/drawer/ does. Rows 2 and 3
are the same order; the only difference is the microtask.`, "measured — a controlled flip");

		p("**One `navigated()` serves both, and ordering matters.** Not as a preference — row 3 is a regression a user would report as *\"it keeps putting me back on the menu button.\"*").ac("note");

		code(`
navigated(page){
    this.chrome(page);            // crumbs, prev/next, close the drawer — ALL DOM mutation
    this.router.mark_links();     // the links chrome just built missed mark()'s pass
    this.announce_route(page);    // silent on success; see above
    this.focus_page(page);        // LAST. Always last.
}`, "site/app.js — the canonical version, request 2");

		code(`
a crumb link built INSIDE navigated(), after mark() had already run

  { "before": "(no classes)", "after": "active" }
                 ↑ missed the pass      ↑ after this.router.mark_links()`, "measured — why line 2 exists");

		p("**Why focus is last:** it is the only step whose result a later step can destroy, and DOM mutation destroys it two different ways — a container emptied while it holds `document.activeElement` drops focus to `body`, and a widget that restores focus on close takes it somewhere else entirely. Nothing after focus, ever.").ac("note");

		p("**Why chrome is first:** it is pure DOM mutation with no focus consequences of its own, and its rebuilt links need the marking pass that already ran inside `mark()`. That is the chrome seat's Request 3 in a different costume — `mark_links()` uses `toggle`, so it both sets and clears, and anything built after it is simply unmarked.").ac("note");

		p("**A chained `navigated` cannot fix this and should not ship.** My section chains, because it must not clobber the chrome seat — but chaining means whichever module imported last runs last, and import order depends on the url you happened to arrive at. The section defends itself with a `queueMicrotask`, which is row 2 above working; a microtask is a fine local guard and a bad global contract. One method in `site/app.js`, four named calls, order visible on the page.").ac("note");

		p("**One disagreement with the chrome seat, already arbitrated.** Their Dissent #4 proposes closing Open #3 with `inert` from inside `navigated()`. It is closed by one `:has()` rule instead — no JS, no state, nothing to unset. That item should come **out** of chrome's `navigated()`: one less thing in the hook, and one less thing that can run after focus.").ac("note");

		section("TASK 2 — the sweep, 24 sections ranked");

		code(`
section        urls  contrast  pre-stops  small  noname  landmarks  h-skip
─────────────────────────────────────────────────────────────────────────
/versus/         4       6        12        3      0        0         0
/content/        4       5         7        3      0        0         0
/chrome/         4       8         0        1      0        0         0
/patterns/       4       3         0        2      5        0         0
/forms/          4       4         4        3      1        0         0
/deep/           4       4         0        3      0        0         0
/nav/            4       3         4        1      0        0         0
/motion/         4       4         0        0      0        0         2
/start/          4       3         5        0      0        0         0
/state/          4       3         0        0      2        0         0
/tabs/           4       3         0        1      1        0         0
/compound/       4       3         4        0      0        0         0
/compose/        4       3         4        0      0        0         0
/a11y/           4       4         0        0      0        2         0
/urls/           4       2         0        3      0        0         0
/council/        4       4         0        0      0        0         0
/library/        4       3         1        0      0        0         0
/ · /replace/ · /columns/ · /dynamic/ · /perf/ · /async/ · /full/
                 4      2-3        0        0      0        0         0

zero console errors · zero horizontal overflow at 1400px AND at 400px, on
every one of the 24 sections. /forms/ renders — its owner fixed it.`, "measured — section root + up to 3 child urls each, Chromium 1400×800");

		p("**Read that table for the outliers only.** The baseline of 2–3 contrast failures is not the seats — it is the same three shared rules appearing on every page, which is findings 4 and 5, not twenty-four findings.").ac("note");

		section("Root cause 1 — one colour pair, 24 sections");

		code(`
                    on #fff    on #f3f4f6 (the code chip / the sidebar)
#6b7280  --subtle    4.83:1        4.39:1   ← FAILS, needs 4.5
#8b919b  .hint       3.17:1        2.88:1   ← FAILS badly
#5c636d              6.07:1        5.51:1   ← passes both

what inherits it:  .note · .code-label · p.demo-note (via --subtle)
                   and any inline \`code\` inside them — code paints its own
                   #f3f4f6 background while inheriting the parent's grey`, "measured");

		p("`#6b7280` is fine on white and fails on the code chip, which is why it looks fine and measures broken. Every section shows it because every section has a `.code-label` and an inline `code` inside a `.note`.").ac("note");

		code(`
:root { --subtle: #5c636d; }        /* was #6b7280 — 4.39:1 → 5.51:1 */
.note        { color: #5c636d; }
.code-label  { color: #5c636d; }
.hint        { color: #5c636d; }    /* was #8b919b — 2.88:1 → 5.51:1 */`, "site/styles.css — four values, clearing 3-5 failures in all 24 sections");

		p("**`.hint` is the value you asked for: `#5c636d`.** The same grey you already chose for `.nav-heading`, so the sidebar has one grey rather than two, at 5.51:1 against its own background. `--subtle` is the bigger win — one token, and it reaches `ext/demo`'s captions too.").ac("note");

		section("Root cause 2 — 41 unnamed tab stops");

		code(`
scrollable <pre>, across each section's sampled urls
  /versus/ 12 · /content/ 7 · /start/ 5 · /nav/ 4 · /compound/ 4
  /compose/ 4 · /forms/ 4 · /library/ 1                    TOTAL 41
  /a11y/ 0                                     ← the wrap rule, measured

A horizontally scrollable box is keyboard-operable in Chrome, so it is a
tab stop. With no role and no name it is announced as its entire listing.`, "measured");

		code(`
.code pre { white-space: pre-wrap; overflow-x: visible; word-break: break-word; }`, "site/ui.js's code() — one rule, and it also satisfies SC 1.4.10 Reflow");

		p("Two ways out: name the stop (`tabindex=\"0\"` + `role=\"region\"` + a label), or delete it. Deleting is cheaper, and wrapping is what Reflow wants anyway. `/a11y/` has done this since round 1 and measures 0.").ac("note");

		section("Root cause 3 — 22 tab stops to the content, still");

		code(`
                    sidebar links   first content stop   obscured
/                        21               22               0
/versus/                 21               22               0
/chrome/                 21               22               0
/a11y/                   21               22               0
/full/                   21                1               0   ← the :has() rule
/full/left/deeper/       21                1               0   ← was 22, 20 obscured

landmarks: 0 in 23 of 24 sections. No <main>, no <nav>, anywhere.`, "measured");

		p("**Open #3 is closed and measures closed** — `/full/left/deeper/` went from 22 stops with 20 obscured to 1 stop with 0. The sidebar has grown to 21 links since round 1, so the general case got worse while the special case got fixed. Request 3 is the remaining half: one anchor and two better tags.").ac("note");

		section("Per-section — the ones that are actually yours");

		code(`
/chrome/    .chrome-crumb-sep  "›"   1.91:1   and NOT aria-hidden
            .chrome-crumb-gap  "…"   1.91:1   and NOT aria-hidden
            .chrome-shell-url        2.61:1   11px
            .chrome-stamp            2.98:1   11.5px
            td.none            "≠"   1.91:1   ← carries meaning, not decorative
            ⌂ home link        8×26px         ← needs 24 wide

            The two crumb glyphs want aria-hidden="true" — which makes them
            decorative (exempt from contrast) AND stops a screen reader
            saying "greater-than" between every crumb. One attribute, two
            findings. "≠" is the opposite case: it IS the content of that
            cell, so it needs a real colour or a text equivalent.

/patterns/  5 controls with no accessible name, 2 targets 13×19
/versus/    3 links 14px tall (a.code-path), 12 scrollable pre
/content/   div.order-end 2.61:1, 7 scrollable pre
/deep/      3 "Run" buttons at 40×21 — 3px under
/forms/     3 buttons ~21px tall, 1 nameless control
/urls/      3 links at 22px — 2px under
/state/     2 nameless controls
/tabs/      1 nameless control, 1 target 177×21
/motion/    2 heading-level skips`, "measured — everything the shared rules do not explain");

		p("Nothing here is fatal and most of it is a padding value. The two I would fix first are `/patterns/`'s five nameless controls — a control nobody can name is a control nobody can use, SC 4.1.2 — and `/chrome/`'s `≠` at 1.91:1, the only case where unreadable text is carrying the meaning of the cell.").ac("note");

		section("Still open — exact diffs");

		code(`
render(){
    if (this.view) return this.view;

    this.view = div.c("page", () => { … })
        .attr("tabindex", "-1")                 // ← ADD
        .attr("role", "region")                 // ← ADD
        .attr("aria-label", this.title)         // ← ADD
        .ac(this.name && "page-" + this.name)
        .ac(this.col)
        .ac(this.classes);

    return this.view;
}`, "1 — Page.class.js");

		p("`navigated()` names `page.chain()`, which is every page in the chain and no page outside it. It cannot name the one page **visible without ever being in a chain**: a tab set's default, which `tabs()` renders with `.render()` and never activates. Measured — `/a11y/tabs/` exposes 1 region where the framework version exposes 3. `render()` is the one place every visible page passes through.").ac("note");

		code(`
this.$app = div.c("app", () => {
    a.c("skip-link visually-hidden on-focus", "Skip to content").href("#content");

    this.$sidebar = el.c("nav", "sidebar", () => { … }).attr("aria-label", "Sections");

    this.$pages = el.c("main", "pages").attr("id", "content").attr("tabindex", "-1");
});`, "3 — site/app.js");

		p("`tabindex=\"-1\"` on the target is the half everyone forgets: a fragment link moves the *sequential focus starting point*, not focus. Measured — without it `activeElement` stays `body`; with it, focus lands and the next Tab is in the content. `Router.link_clicked()` already leaves same-page hash links alone, so no framework change is needed.").ac("note");

		code(`
async load(url){
    const slow = setTimeout(() => this.app.announce("Loading…"), 150);   // ← ADD
    const page = await this.load_segments(url);
    clearTimeout(slow);                                                  // ← ADD

    if (page) this.activate(page);
    this.app.announce(page ? "" : "Nothing found at " + url);            // ← ADD
    return !!page;
}`, "7 — Router.js, with App.inject() owning the region and App.announce(text) writing it");

		p("Measured with a 1400ms stall: `\"\"` at 98ms, `\"Loading…\"` at 415ms, `\"\"` at 2011ms on arrival; a fast navigation never fires the timer. The region must be built in `inject()`, **not** `render()` — `site/app.js` passes its own `render()` to the constructor and `assign()` makes that an own property that shadows the prototype, so the first version of this patch silently did nothing.").ac("note");

		p("Finding 8: a failed navigation ends in `location.assign(url)` — a real page load — so nothing said before it survives. Measured: the message is written, and 200ms later the document holding it is gone. `App.error()` should build its view with the same three attributes and focus it.").ac("note");

		section("Settled, and worth not re-litigating");

		code(`
tabs stay links          six properties (url, Back, reload, new tab, pre-JS,
                         announced-as-openable) destroyed for screen reader
                         users only, to gain a keyboard convention the focus
                         fix gives you free. The purist's real point about
                         magnifier users is recorded, not dismissed.

three <h1> at depth      computing level from chain().length makes the same
                         page read differently per entry point — the third
                         appearance of that failure mode this council.
                         Landmarks carry the depth, and cannot drift, because
                         a hidden page is display:none.

aria-current="page"      yes, one line in mark_links(). "location" for
                         .in-path: NO — three links each announcing "current
                         location" is three answers to a one-answer question.

inert under full         the site's job, and NOT with inert. Closed with one
                         :has() rule. Note for the next one: :has() may not be
                         NESTED inside :has(), and one invalid selector in a
                         list drops the whole rule, silently.`, "verdicts");

		section("What I would not change");

		code(`
plain <a href> everywhere, upgraded by one delegated click listener
    still the single best accessibility decision in this codebase.

mark_links() as the ONE marking pass
    why aria-current is a one-line request and not a survey — and why chrome
    rebuilding links must re-run it rather than mark its own.

hidden pages are display:none
    out of the tab order AND the accessibility tree, with nothing to
    remember. The landmark list stays honest for free.

navigated() duck-typed, after mark(), taking the page
    exactly the right shape: the framework says what happened, the site
    decides what it means, and neither tier learned the other's vocabulary.`);

		section("Verified");

		code(`
9 routes cold-load · 0 console errors · 0 horizontal overflow at 1400 and 400
focus lands on a named region after click, Enter, tab switch, deep hop, Back
  and Forward — 11 of 11 navigation kinds
cold load leaves focus on body, correctly
scope holds: /columns/ still untouched
0 unnamed scroller stops in /a11y/ (site: 41)
reduced motion honoured — transition-duration 1e-05s under emulation
focus ring 3px solid · .press 6.44:1 · every control ≥ 24×24
24 sections swept, root + 3 children each

Playwright 1.62.1 global · Chromium · dev socket stubbed, because six seats
were editing public/ during the run and LiveReload reloads the document out
from under a measurement.`, "how");

		p("The live auditor at `/a11y/audit/` runs this report's own sweep against whatever page you are on, so a seat fixing their section can watch the count go down instead of asking me.").ac("note");
	},
});
