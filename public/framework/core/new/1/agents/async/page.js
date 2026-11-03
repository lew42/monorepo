import { Page, p, a, div } from "/app.js";
import { code, section } from "../../site/ui.js";

export default new Page({
	meta: import.meta,
	title: "The Asynchronist — content that arrives late",

	content(){
		code(`
The captor is yours until your function RETURNS.
An async function returns at its first await.

    So: place the container synchronously, and after an await, name your target.`,
			"the rule, and it is the whole report");

		p("Every other seat builds pages whose content is already in the module. This one owns the case where it is not — and the framework's sharpest edge lives there, never throws, and costs every author exactly one hour.").ac("note");

		section("What shipped");

		code(`
site/async/                 8 pages, 1 helper module, 1 stylesheet, 1 fixture
  lab.js         live() where() wait() items() probe() — the shared instruments
  async.css      11 classes, all prefixed \`async-\`, @layer theme
  items.json     the "slow API" — a static file, because there is no server
  trap/          the bug, with its real parentElement chain, four ways
  shapes/        A named target · A′ re-entering capture · B return a promise
  states/        loading · empty · error, and the cold-load asymmetry, measured
  inflight/      leaving mid-fetch · deactivate() · AbortController · Open #4
  marking/       late links, and a WORKING prototype of the proposed fix
  stream/        batches · infinite scroll · the discarded query string
  arrangements/  one probe function, three mounts, three faces
  rule/          the shortest correct statement`, "public/framework/core/new/1/site/async/");

		p("12 urls verified cold and soft at 1400×800: zero console errors, zero horizontal overflow, every deep url survives a reload. The trap pages produce no errors either — that is the point of them.").ac("note");

		section("The trap, with its real DOM evidence");

		code(`
View.captor at rest — every route, every arrangement, stack depth 1:

    body > div.app > div.pages          ← app.$pages

App.render() sets it once and nothing ever restores it to anything else.
So an element built after an await lands THERE:

  /async/trap/          body › div.app › div.pages › div.async-orphan
  arrangements/in-tab/  body › div.app › div.pages › div.async-orphan
  in-column/            body › div.app › div.pages › div.async-orphan
  in-full/              body › div.app › div.pages › div.async-orphan`,
			"playwright · where(node) walks parentElement · identical every time");

		p("One destination, because an arrangement is CSS and CSS cannot move a captor. What changes is the symptom, and that is why one bug is reported three times.").ac("note");

		code(`
tab panel   a flex sibling of the tabs page, outside the panel
            → "my tab content renders next to the tab bar"
column      a flex item in the OUTER .pages, beside the whole column set
            → "my columns are the wrong width"
full page   BEHIND it. Measured: orphan rect [240,0,100,800], and
            elementFromPoint at its own coordinates returns
            .page.page-in-full.full.active-page — not the orphan
            → no symptom at all, until you leave the full page`);

		p("The third is the dangerous one: a `full` page hides the evidence completely, so the bug ships and resurfaces on an unrelated screen as mystery whitespace.").ac("note");

		section("The mechanism nobody guesses");

		code(`
const $child = div.c("item", "hi");   // → app.$pages. Right now. ALWAYS.
$results.append($child);              // → moved. appendChild moves a node.`);

		p("The auto-append is never skipped, not even in correct code. `.append()` does not prevent it — it REPAIRS it, and it gets away with it only because both happen in one synchronous turn, so no frame can be painted between them. Put an await between the two lines and the wrong placement becomes visible; `/async/trap/` renders exactly that, and you can watch the element jump.").ac("note");

		section("It is not really about `await`");

		code(`
✗  async $x => { div("y"); }      a factory call after an await
✗  .click(() => div("y"))         a click handler is not your capture turn
✗  setTimeout(() => div("y"))     neither is a timer
✗  .then(() => div("y"))          nor a continuation`);

		p("Measured: a click handler with no `await` anywhere produces an identical orphan. `await` is the famous way to leave your own turn, not the only one — so CLAUDE.md's \"never build DOM after an `await`\" is true but narrower than the actual rule. The general statement is: an element factory called outside the turn that set the captor.").ac("note");

		section("VERDICT — can async capturing ever work?");

		code(`
partially, and the working half is already the blessed shape:

append_fn(fn){
    View.set_captor(this);
    const return_value = fn.call(this, this);   // async fn returns HERE
    View.restore_captor();
    if (is.def(return_value))
        this.append(return_value);   // ← a PROMISE. append_promise awaits it
    return this;                     //   and appends to \`this\` — correctly.
}`, "measured, not reasoned");

		p("So an async capture callback's return value is placed correctly today. Only the ambient factory calls inside it are lost. That is why shape A and shape B are one rule twice: name your target, or return it.").ac("note");

		code(`
full async capture needs the captor to follow the async CONTEXT, not the
call stack. There are exactly two ways to get that in a browser:

  1. a host API   — TC39 AsyncContext. Stage 2. Not shipped anywhere.
  2. a transform  — wrap every await. Requires a build step.

This repo has forbidden (2) as a core constraint, and (1) does not exist.`,
			"why the answer is no, and why the reason is external");

		p("RECOMMEND CLOSING the question, with a re-open condition. It is not a design choice this codebase made and not one it can revisit — it is blocked on a language feature. If `AsyncContext` ships, `View.captor` becomes an `AsyncContext.Variable`, `set_captor`/`restore_captor` collapse into one `.run()`, and async capture works with roughly a three-line change. Worth a note in `View.js` so nobody re-derives this, and worth re-checking then.").ac("note");

		p("Second reason to be glad it does not work: two concurrent fills capturing into the same container would append in completion order, which is nondeterministic. `View.lazy()` already exists to fight exactly that.").ac("note");

		section("FINDING — ext/demo and ext/highlight cannot be used in new/1/site");

		code(`
demo.css   var(--line) var(--radius) var(--surface) var(--wash) var(--subtle)
           and it inherits padding/background from framework.css's \`pre\` rules

new/1/site loads ONE stylesheet: its own styles.css. framework.css is never
loaded, so all five tokens are undefined → the declarations are invalid at
computed-value time → no border, no background, unpadded <pre>.`, "measured");

		p("The captor behaviour is fine — I checked, because a page ABOUT the captor cannot afford to guess. `demo()` uses `div.c(\"demo-render\", fn)`, an ordinary `append_fn`, so a wrong-way example inside a demo orphans to `app.$pages` exactly as it does in real page code. `demo()` is correct here and merely renders unstyled.").ac("note");

		code(`
what I used instead — site/async/lab.js

export function live(fn, label){
    return div.c("async-live", () => {
        code(source(fn), label);        // ../ui.js + util/source
        div.c("async-render", fn);
    });
}`, "ext/demo's contract on this sub-site's own .code block");

		p("`source(fn)` is the same stringifier `demo()` and `code.fn()` share, so the box cannot drift from what ran — which for a wrong/right pair is the entire requirement. Cost: no syntax highlighting. I did not import `ext/highlight` because it patches `View.prototype.append` and `prerender` globally, and nine other seats are rendering into this app right now; a global View patch is not mine to install.").ac("note");

		p("Steve's `/nav/` solved the same problem differently — `fetch(import.meta.url)` and render the whole file. That is stronger for declarations (`children:`, `classes: \"full\"` do not render in a box) and weaker for pairs, since two contrasting five-line functions in one file cannot each show only themselves. Both are right for their section.").ac("note");

		code(`
REQUEST — make the exts usable here. Cheapest first:

1. site/styles.css defines the five tokens it already hardcodes
   (#e2e4e8 → --line, #fff → --surface, #f3f4f6 → --wash, …)
   \`--surface\` earned its place in framework.css the same way.

2. or ext/demo ships fallbacks: var(--line, #e2e4e8). Colour, not shared
   geometry, so the "no defensive fallback" rule does not bite.

I did NOT do (1): styles.css is the owner's file.`);

		section("The loaders / skeleton asymmetry — measured, and overstated by everyone including me");

		code(`
App.instantiate()
    config() → render() → await load() → initialize() → inject() → ready
                              ↑                            ↑
                   loaders awaited HERE            first paint HERE`, "App.js");

		code(`
                          cold load                     soft navigation
first paint               after every loader resolves   already painted
the skeleton's first ms   invisible — a blank window    visible from frame 1
push the FILL itself      skeleton never appears        inert — nobody awaits`);

		p("The careless version of this claim is \"a skeleton is invisible on a cold load\". Measured, that is wrong: `/async/states/` pushes `wait(350)` into `loaders`, first paint lands at ~690ms, its fills take 600–900ms — so the skeletons were still up and you did see them. A cold load does not hide the skeleton, it hides the BEGINNING of it. It hides it entirely only if you push the fill itself.").ac("note");

		code(`
app.loaders.length after visiting /async/states/ by CLICKING:  1
that entry was never awaited by anything, ever.`, "loaded() is called once, from load(), during boot");

		p("So `App.loaders` is a one-shot first-paint queue, and a push after boot is silently inert. `Page.tabs()` does exactly this on every soft navigation to `/tabs/`. It is harmless — `render()` caches the view, so it happens once per tab set, not unboundedly — and the comment there says \"cold load\", which is honest. But nothing about the NAME says so.").ac("note");

		code(`
KEEP the behaviour. It is the no-FOUC guarantee and it is right: a cold load
that paints once, complete, beats one that flashes a skeleton for 300ms.

FIX the name.  App.js:
    this.first_paint = [];                                   // was: this.loaders
    loaded(){ return Promise.all(View.stylesheets.concat(this.first_paint)); }

  Page.class.js, tabs():
    this.app?.first_paint.push(filling);

Pushing to \`first_paint\` after first paint is self-evidently a no-op.
Pushing to \`loaders\` after boot is not.`, "PROPOSAL 1 — rename only, no behaviour change");

		p("Whose decision is the underlying trade? The SITE'S, and it cannot express it today. \"Block first paint for this, but no longer than 400ms\" is a reasonable thing for a site to want and there is no way to say it. I am not proposing an API for that — an option is surface forever, and nobody has asked twice yet. Recording it so the second request is recognised as the second.").ac("note");

		section("Should authors have to remember `mark_links()`?");

		code(`
unfixed   /async/ → (nothing)   /async/marking/ → (nothing)
fixed     /async/ → in-path     /async/marking/ → active`, "measured, /async/marking/");

		p("No, three times over. It is invisible from the call site — nothing about `$bar.append(links)` suggests a debt to a class in another file. It fails silently and cosmetically, which is the cheapest bug to ship and the hardest to notice. And it is not composable: every fill that MIGHT contain a link owes the call. `Page.tabs()` calls it and says so in a comment, which is the framework's own worked example — and also the evidence that it is forgettable, because it had to be found as a bug first.").ac("note");

		code(`
listen(){
    document.addEventListener("click", e => this.click(e));
    window.addEventListener("popstate", () => { … });
    this.watch_links();
}

/* Links built after an await have missed mark(). One observer re-runs the
 * pass when anchors appear, so nothing rendering late has to remember.
 * Batched to a microtask: a fill appending 40 links marks once, and
 * microtasks run BEFORE paint — so no frame shows an unmarked link. */
watch_links(){
    let queued = false;

    new MutationObserver(() => {
        if (queued) return;
        queued = true;
        queueMicrotask(() => { queued = false; this.mark_links(); });
    }).observe(this.root(), { childList: true, subtree: true });
}`, "PROPOSAL 2 — Router.js, 12 lines. Prototype VERIFIED on /async/marking/");

		p("No loop: `mark_links()` only calls `classList.toggle`, an attribute mutation, and the observer watches `childList` only. The microtask batch is what rules out `requestAnimationFrame`, which runs after a paint and would flash. `Page.tabs()`'s manual call then deletes.").ac("note");

		code(`
weaker alternative, recorded so it is not re-proposed as new:

    Page.prototype.filled(){ this.app?.router?.mark_links(); return this; }

fixes discoverability, not the forgetting. One line against twelve.`);

		section("Open #4 — is it my bug?");

		code(`
route("**/columns/child/grandchild/page.js") delayed 900ms

  asked FIRST   /columns/child/grandchild/    (slow)
  asked LAST    /dynamic/42/                  (fast)
  ended on      /columns/child/grandchild/    ← the first click won
  router.active /columns/child/grandchild/`, "reproduced deterministically");

		code(`
mine       View.captor     a global you READ implicitly, after an await
                           → the value you assumed is gone
                           → fix: name the target. Stop reading the ambient

Open #4    router.active   a global you WRITE, after an await
                           → a newer intent already wrote it
                           → fix: a generation token. Do not write if superseded`);

		p("Same class, exact duals, different fixes. Both are ambient global state crossing an await boundary; one is a read hazard and one is a write hazard. Naming your target cannot help the Router and a generation token cannot help the captor, so they should not be filed as one issue. `go()` and `load()` both need the token, since `activate()` and `pushState()` sit on either side of an await.").ac("note");

		section("The query string is not ignored — it is destroyed");

		code(`
click(e){ … this.go(link.pathname); }               ← link.pathname drops .search
load_segments(url){ url.split("/") }                 ← never sees a query anyway
popstate → this.load(location.pathname)              ← same

measured: click an href of "/async/stream/?page=2"
          location.search before "(empty)"  after "(empty)"  path /async/stream/`);

		p("So a `?page=2` link is a link that quietly undoes itself — the query is removed from the url you are standing on. That costs shareable list state, Back through pagination, and the reload-fidelity guarantee this tier is proud of, which currently holds only because no page has any state outside its path. Tabs dodge it by being path segments; `?sort=name&dir=desc` is not two more directories.").ac("note");

		code(`
// Router.click — keep what the author wrote
this.go(link.pathname + link.search);

// Router.load_segments — the walk only ever wanted the path
for (const name of url.split("?")[0].split("/").filter(Boolean))`,
			"PROPOSAL 3 — two lines, no new concept");

		p("That makes `?page=2` survive a click, a reload and Back, because `pushState` gets the full url and the SPA fallback ignores the query. It does NOT re-render on a query-only change — the page is already active and `render()` is cached. That second half needs a `query` on the page and something to call when it changes, which is a design decision for whoever owns Router. The two lines above are worth doing on their own: silently discarding what an author typed is worse than not supporting it.").ac("note");

		section("`deactivate()` has no twin");

		code(`
// what an author must write today to restart what deactivate() stopped
activate(){
    Page.prototype.activate.call(this);   // ← placement, by hand, via prototype
    this.tick_guarded();
    return this;
}`, "site/async/inflight/page.js — verbatim, and it works");

		p("`deactivate()` is a clean seam. `activate()` is not, because it is also placement — so a page that stops a timer cannot restart it without shadowing a core method and calling through the prototype. Anything that must be fresh when you come BACK has the same problem: `content()` runs once, since `render()` caches `this.view`.").ac("note");

		code(`
// Page.class.js — split placement out, leave activate() as the seam
activate(){ this.mount(); return this; }      // ← override me; deactivate()'s twin

mount(){
    const container = this.container();
    if (this.render().el.parentNode !== container.el) container.append(this.view);
    return this;
}

// then an author writes, with no prototype gymnastics:
activate(){ this.mount(); this.start_ticking(); return this; }`,
			"PROPOSAL 4 — and this one is surgery, so it is a question, not a patch");

		p("This renames a call order on a core class and touches `Router.activate()`'s comment about what `page.activate()` means. Per CLAUDE.md that is a design decision with a large edit attached, so I have not made it — the pages demonstrate the cost and the workaround instead.").ac("note");

		section("PROPOSAL 5 — pin the rule where it is enforced");

		code(`
/* View.captor is ONE global with a push/pop stack, and append_fn restores it
 * when your function RETURNS — for an async function that is its first await,
 * and for any deferred callback (a click, a timer, a .then) it is before the
 * callback ever runs. Place containers synchronously; fill them through a
 * named view. Nothing throws if you don't. See site/async/. */`,
			"View.js, above the class — four lines, no code change");

		section("Two smaller findings");

		code(`
1. An UNCAUGHT throw inside an async fill becomes an unhandled rejection:
   append_fn calls this.append(promise) without awaiting, so append_promise's
   rejection floats. Measured: "pageerror: uncaught inside an async fill".
   On screen: nothing — the box stays a skeleton forever.
   → try/catch inside the fill is load-bearing, not politeness. Documented
     on /async/states/. No framework change requested.

2. p() renders \`backticks\` only — bold, italics and links pass through as
   literal characters. site/page.js line 19 ships "a **name** instead" and
   the asterisks are on screen. One-character class of bug; CLAUDE.md already
   says prose should be md(), which this sub-site does not load.`);

		section("Dissent");

		code(`
1. @layer theme, not @layer site — against the brief's example.
   These are a module's own classes and nothing here has to out-rank
   styles.css. CLAUDE.md: escalation is a one-way ratchet, and spending a
   rung with no override fight to point at raises the cost for everyone
   after me. If the owner wants site/, it is a one-word change.

2. I did not use ext/demo, against the brief's lean — for the measured
   token reason above, not a preference. If styles.css defines the five
   tokens, lab.js's live() should be deleted and demo() used instead.
   I would rather that happened than have a second demo() live on.

3. PROPOSAL 2 is action at a distance by CLAUDE.md's own definition —
   behaviour you cannot see from the code that renders the links. I still
   want it. The defence: it lives INSIDE Router, in listen(), beside the
   click and popstate listeners, and nobody calls those black magic. The
   Router owns link marking and is the only thing that knows the answer
   changed. But the objection is real and I am recording it against
   myself rather than waiting for someone else to make it.

4. I left one interval running on /async/inflight/ on purpose, capped at
   120 ticks. A leak you cannot see is not a lesson. A leak with no cap
   in a docs page is just a leak.`);

		section("═══ ROUND 2 ═══");

		section("TASK 2 — the pin, final text");

		p("Paste-ready, above `class View`. Recommended version: 12 lines. It keeps the repair-not-prevent sentence, and that sentence is what makes the rule make sense — without it, *\"why does `.append()` work then?\"* has no answer and people copy the shape without understanding it.");

		code(`
/* CAPTURING IS SYNCHRONOUS. Factories append to View.captor — one global — and
 * append_fn restores it when your function RETURNS: for an async function, at
 * its first await; for a click, timer or .then, before it ever runs. The rule is
 * not "no DOM after an await" — it is: never call a factory outside the turn
 * that set the captor. And .append() does not PREVENT the stray append, it MOVES
 * the node; that is safe only because both happen in one turn.
 *
 *     div.c("x", async $x => { await …; $x.append(…) })   name the target
 *     $x.append(() => { div(); div() })                   re-enter capture
 *     content(){ return promise_of_view }                 append_promise
 *
 * Nothing throws when you get this wrong. Worked cases: site/async/.
 */`, "RECOMMENDED — View.js, above the class");

		code(`
/* Capturing is synchronous: never call an element factory outside the turn that
 * set View.captor — an async function leaves that turn at its first await, and a
 * click/timer/.then callback was never in it. Place containers now, fill them
 * through a named view. Nothing throws when you get this wrong. See site/async/. */`,
			"MINIMUM — four lines, if the above is too much wall");

		p("The four-line version is correct and complete as a RULE. What it loses is the explanation of why the correct shape works, which is the part that stops someone \"simplifying\" it later. Your call; I would ship the twelve.").ac("note");

		section("TASK 1 — /state/, and the one blocker");

		code(`
/state/ 404s today. It is not in site/page.js's children, and site/app.js's
recipes list has no entry for it. Both are your files.

  children: "… perf async urls content forms versus state"
  recipes:  [… ["/state/", "State"]]

Everything below was verified by declaring it at runtime.`, "BLOCKER — one word and one line, in files I do not own");

		code(`
site/state/          6 pages, 1 shared-state module, 1 stylesheet (2 classes)
  store.js       the module two unrelated pages share
  stores/        the six stores, with a LIVE survival matrix + route() proof
  accident/      the memoized view — the store nobody chose
  shared/        state between pages where neither owns the other
  stale/         state that must NOT survive, and deactivate()
  scroll/        the centrepiece`, "what shipped");

		section("The map");

		code(`
Must a reload reproduce it?             → the url. Nothing else survives one.
Must someone else see it?               → the url. It is the only shareable one.
Did the user type or scroll it?         → nothing. You already have it, for free.
Is it this page's, for this session?    → the Page instance.
Do many pages from ONE module share it? → module scope.
Do two unrelated pages share it?        → a module they both import.
Must it NOT survive?                    → deactivate(). Nothing else clears.`,
			"the decision procedure");

		code(`
                       soft nav   Back   reload   new tab   shareable
the url                   ✓        ✓       ✓        ✓          ✓
the memoized view         ✓        ✓       ✗        ✗          ✗
the Page instance         ✓        ✓       ✗        ✗          ✗
module scope              ✓        ✓       ✗        ✗          ✗
sessionStorage            ✓        ✓       ✓        ✗          ✗
localStorage              ✓        ✓       ✓        ✓          ✗`);

		p("Rows two, three and four are IDENTICAL. That is the finding worth having: choosing between them is never a question about lifetime, so anyone reasoning from \"how long does it last\" picks at random. You choose on SCOPE — one page's DOM, one page, one module.").ac("note");

		code(`
measured: /state/stores/a/ and /state/stores/b/ are two Page instances built
by one module. The module-scope counter reads 1 and 2; each instance's own
properties are separate.`, "the ONLY case where module scope and the instance differ");

		section("SCROLL — the answer is one line, and it is not restoration");

		code(`
document.documentElement   scrollHeight 800 === clientHeight 800
                           the document NEVER scrolls; every .page scrolls itself
history.scrollRestoration  "auto", and completely inert — it restores the
                           document scroller, which never moves
a hidden page              350 → (display:none) reads 0 → (shown again) 350`,
			"measured, 1400×800");

		p("So the browser already does scroll restoration here, for free, and more accurately than we could — note the third line: at the moment you would have to SAVE the offset, it already reads 0. There is nothing to write down. `history.state` is an empty object on every entry and should stay that way.").ac("note");

		code(`
                            today      should be
Back to a page you scrolled  restored   restored   ✓
a fresh CLICK to that page   restored   top        ✗`);

		p("Both restore, because both are the same `display:none` → `block` round trip and the browser cannot tell them apart. The framework is not missing scroll restoration; a forward navigation is missing a reset.").ac("note");

		code(`
async go(url){
    if (await this.load(url)){
        history.pushState({}, "", url);
        this.scroll_top();          // a forward navigation starts at the top
    } else {
        location.assign(url);
    }
}

/* Back and Forward are NOT this. The browser restores a hidden page's offset
 * when it is shown again, for free and more accurately than we could — scrollTop
 * reads 0 the moment a page is hidden, so there is nothing to capture. popstate
 * deliberately does not call this. */
scroll_top(){
    this.active?.view?.el.scrollTo(0, 0);
    return this;
}`, "PROPOSAL 6 — Router.js, five lines. VERIFIED by runtime patch");

		code(`
scrolled to        400
fresh click back     0   ✓
browser Back       500   ✓
tab switch         the tabs page keeps its 200 — a tab child has
                   overflow: visible, so it is not a scroller and this is a
                   no-op. No special case was needed.`, "measured with the patch applied");

		p("`scrollTo(0, 0)` and not `scrollTop = 0` for one boring reason: `this.active?.view?.el.scrollTop = 0` is a SyntaxError — you cannot assign through optional chaining. Both were verified; the method form is the one that compiles.").ac("note");

		section("Leaf-only is correct, and I was wrong about why");

		code(`
parent offset before opening its child   250
parent offset after                      250
parent display throughout                block   ← it never left the screen`,
			"measured on /state/scroll/");

		p("I expected to have to defend leaf-only as a compromise and offer an entering-slice version as the fuller alternative. The measurement killed that: an ancestor that stays on screen was never hidden, so nothing RESTORED its offset — it still has it because you are still looking at it. Resetting it would yank the scroll of a page the reader never navigated away from. The entering-slice version is not a fuller alternative, it is a bug. Recorded as REJECTED.").ac("note");

		section("A third, independent case for splitting Page.mount()");

		code(`
inflight/   restart a timer that deactivate() stopped
shared/     repaint a value that changed while the page was off screen
stores/     bump a per-activation counter

all three   activate(){ Page.prototype.activate.call(this); … }`);

		p("Three unrelated reasons, in two sections, all reaching for the same workaround: `content()` runs once because `render()` caches the view, and there is no hook for coming back. Proposal 4 stands unchanged — `activate(){ this.mount(); return this; }` — and it now has three call sites arguing for it rather than one.").ac("note");

		section("Dissent — round 2");

		code(`
5. I reused live() from site/async/lab.js in /state/ rather than writing a
   second one, and moved the View.stylesheet() call INTO lab.js so the module
   that emits the classes loads them. That means /state/ depends on a file in
   /async/. Both are mine, so it is not a boundary violation today — but if
   these sections are ever split between people it is the first thing to break.
   The honest fix is a shared site/live.js, which is your file, not mine.

6. On the pin: I am recommending twelve lines in a file whose own convention
   says too many comments junk up the base classes. I think this earns the
   exception — it is the one gotcha that costs every author an hour and never
   throws — but it IS an exception and should be argued, not slipped in.

7. /state/scroll/ sets this.$pages purely so it has a scrollable descendant to
   measure against. That is a test fixture living in a docs page. It reads as a
   real arrangement and it is not one.`);

		section("Where the pages are");

		code(`
/async/trap/         START HERE. The bug every author writes once.
/async/rule/         the shortest correct statement of the discipline
/state/              the decision procedure — SEVEN LINES, the payoff
/state/scroll/       the centrepiece: one line, and it is not restoration`);

		div.c("row", () => {
			a.c("page-link", "→ /async/").href("/async/");
			a.c("page-link", "→ /state/").href("/state/");
		});
	}
});
