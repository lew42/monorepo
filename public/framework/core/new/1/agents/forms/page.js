import { Page, p, a } from "/app.js";
import { code, section } from "../../site/ui.js";

export default new Page({
	meta: import.meta,
	title: "The Registrar — navigation when leaving costs something",

	content(){
		code(`
This framework does not need a navigation guard in Router.

The exits a router guard could refuse are exactly the exits that lose
nothing, because render() memoizes. The exits that lose everything never
reach Router at all.`, "the verdict");

		p("Measured across five exit paths, Playwright 1.62 / Chromium / 1400x800. Everything below is evidence for that sentence or a cost of believing it.").ac("note");

		section("The table the whole section rests on");

		code(`
exit path              the DOM        lost?         what can refuse it
─────────────────────  ─────────────  ───────────   ──────────────────
click an in-app link   memoized       nothing       a router guard
Back / Forward         memoized       nothing       nothing — only an undo
reload                 rebuilt        EVERYTHING    beforeunload
close the tab          gone           EVERYTHING    beforeunload
an external link       gone           EVERYTHING    beforeunload`,
			"a guard has no row of its own");

		p("Read the last column. A router-level guard owns one row, and that row's *lost?* cell says `nothing`. `beforeunload` owns the three rows that say EVERYTHING. The two mechanisms barely overlap, and only one of them is protecting anything.").ac("note");

		section("What memoization already gives you, undocumented until now");

		code(`
type "alpha" into .essay at /forms/survives/, then:

sibling hop    /forms/exit/            connected=true  visible=false  value="alpha"
back to it     /forms/survives/        connected=true  visible=true   value="alpha"
deep hop       /forms/wizard/step-2/   connected=true  visible=false  value="alpha"
Back button    /forms/survives/        connected=true  visible=true   value="alpha"
Forward        /forms/wizard/step-2/   connected=true  visible=false  value="alpha"
tab-SET hop    /forms/survives/spare/  connected=true  visible=false  value="beta"
RELOAD         /forms/survives/        connected=true  visible=true   value=""`,
			"connected never goes false — until it stops being the same node");

		p("`render()` memoizes into `this.view`, so a page's DOM and every live input value in it is built once and never rebuilt. This is a real strength and nobody had written it down. It also confirms the readme's accidental `/tabs/` finding — *input value survives switching between SETS* — deliberately, on two tab sets.").ac("note");

		p("**The reload row is the one to read twice.** `connected=true`, `visible=true`, value gone. It looks identical to the first row. The module graph was rebuilt and this is a brand new input that has never been typed into — the failure is indistinguishable from success.").ac("note");

		section("Does memoization make the problem smaller, or just quieter?");

		code(`
what the user sees      their work vanish
what the user knows     nothing — no indicator, no toast, no undo
how they recover        navigate back to the exact url, by memory
what they usually do    reload, or close the tab — both destroy it for real`,
			"the recovery path nobody will find");

		p("Quieter, and that is worse. Memoization does not save the work; it **defers the loss and removes the alarm**. Immediate visible loss at least tells you at the moment it happens. A silent deferral means the user wanders off, does the natural thing when confused, and loses it later with no idea what caused it. That argues for making the work durable, not for making the exit noisy.").ac("note");

		section("The guard, built from outside — eight lines, no framework change");

		code(`
export function ask_before_leaving(router, ask){
    const listener = e => {
        const link = router.link_clicked(e);   // the Router's OWN five rules
        if (!link || ask(link.pathname)) return;

        e.preventDefault();                    // …which link_clicked() checks first
    };

    document.addEventListener("click", listener, true);
    return () => document.removeEventListener("click", listener, true);
}`, "site/forms/leave.js — the whole file");

		code(`
ordering probe   capture (mine) · router.link_clicked(e) → null · bubble (Router)
armed + dirty    click sidebar Columns  ->  /forms/guard/     REFUSED
                 click sidebar Columns  ->  /columns/         allowed (escape hatch)
                 guard.release === null                       deactivate() released it
armed + clean    click sidebar Tabs     ->  /tabs/            never refused`,
			"measured, not assumed");

		p("**`link_clicked(e)` is already a public extension point and nobody noticed.** Its first rule is `if (e.defaultPrevented || e.button) return null`, so a capture-phase listener calling `preventDefault()` is not a trick played on the Router — it is the Router's documented way of being told *this click is not yours*. Borrowing the predicate rather than re-deriving it means the guard cannot disagree with the Router about what a link is.").ac("note");

		section("Three shapes, and the one I chose");

		code(`
A  Page.can_leave(url)    a predicate the Router asks   SPECIFIED, NOT REQUESTED
B  a cancelable event     the Router dispatches         REJECTED
C  the site handles it    the framework stays out       CHOSEN`,
			"and every one of them loses the same four rows");

		p("**C**, and it wins on a fact rather than a taste: the eight lines above already exist and already work, so A buys nothing that is not already available — it moves the same eight lines inside the framework and charges a permanent method on `Page` for the move.").ac("note");

		p("**B is disqualified by this codebase's own standard.** A listener registered in one file changes what every link on the site does, and the page whose form it protects never mentions it. A listener that outlives its page blocks navigation forever with no visible cause. That is the black-magic shape exactly.").ac("note");

		section("If A is adopted anyway, this is the exact signature");

		code(`
// Page.class.js — the default, beside deactivate()
can_leave(url){ return true; }        // synchronous; falsy means no

// Router.js — in go(), BEFORE the await. NOT in load(): load() is also what
// popstate calls, where refusing is already too late.
async go(url){
    if (!this.chain().every(page => page.can_leave(url))) return;
    …
}`, "the whole diff");

		p("`every()` over the current chain, not just the leaf, because a wizard three levels down is the page that knows whether its subtree is dirty. Passing `url` is what lets it allow movement *within* itself: `can_leave(url){ return url.startsWith(this.url) }`. Synchronous on purpose — a page wanting a custom modal returns false, shows its own, and calls `router.go()` itself.").ac("note");

		section("Should deactivate() become the veto? No.");

		code(`
deactivate(){ clearInterval(this.timer); }    // returns undefined -> refuses forever`,
			"the one-line change, and why it must not be made");

		p("Its return value is ignored today and it is one line from being a veto, which is precisely why it must not be. It would conflate *I am leaving, clean up* with *may I leave*, and every existing override returns whatever its last statement happened to return. Silent, permanent, undebuggable. Two questions want two methods. **It is, however, exactly the right place to RELEASE a guard** — the one hook that cannot refuse is where the thing that can gets torn down.").ac("note");

		section("Back cannot be refused, only undone");

		code(`
popstate fires        Router.load() has ALREADY run and rendered the new page
"refusing" means      history.pushState(old url) + router.load(old url)
landed back at        /forms/guard/     — it works
what the user saw     the page change, then change back
history afterwards    one extra entry, pointing where you already were`,
			"measured — the undo succeeds, and costs two renders and a flicker");

		p("Router registered its popstate listener first, and same-target listeners run in registration order — so an external guard is called *after* the page it was refusing has rendered. A guard that stops link clicks but not Back is one users learn not to trust after the first time it fails them. **This asymmetry is the strongest single argument against putting one in `Router` at all.**").ac("note");

		section("Two mechanisms, neither sufficient");

		code(`
                        router guard    beforeunload
in-app link click            YES             no        <- nothing is lost here
Back / Forward               no*             no        <- nothing is lost here
reload                       no             YES
close the tab                no             YES
an external link             no             YES

armed, measured:  in-app go() -> dialogs []      never fired
                  reload      -> handler "fired" (via sessionStorage)
                  close tab   -> dialogs ["beforeunload"]`,
			"* only by undoing a render that already happened");

		section("What I am actually asking for");

		code(`
1  Router.replace(url)          YES — a real gap, two lines
2  an app-level late-failure    YES — one region in App.render()
   surface
3  View.text() chainability     BUG — silently breaks the chain
4  demo tokens in site/styles   5 lines, unblocks every seat
5  Page.can_leave(url)          NO. Specified above; not requested.`,
			"one refusal, four asks");

		section("1. Router.replace(url) — the gap");

		code(`
land on /columns/, navigate to /forms/submit/, submit:

go()      -> /forms/submit/done/   history.length 3 -> 4   Back: /forms/submit/
replace   -> /forms/submit/done/   history.length 3 -> 3   Back: /columns/`,
			"measured — Back returns to the filled form, which re-offers a done submit");

		code(`
go(url){ return this.navigate(url, "pushState"); }
replace(url){ return this.navigate(url, "replaceState"); }

async navigate(url, how){
    if (await this.load(url)) history[how]({}, "", url);
    else location.assign(url);
}`, "two lines added, one moved");

		p("No options object, no flag, no third state, and **zero new vocabulary** — `pushState` and `replaceState` are the two names the History API already has. Every post-submit redirect wants this; today a page must reach past the Router and duplicate `go()`'s load-then-push order, getting the failure branch wrong.").ac("note");

		section("2. Nowhere for a late failure to land");

		code(`
click add at /forms/optimistic/, then leave within 900ms:

.page-optimistic   still in .pages
.forms-status      connected=true  visible=FALSE
                   "rolled back item 1 — the server said no"
<li> count         0                 rolled back, correctly, unseen
.forms-toast       onscreen=true  parent=<body>`,
			"the rollback ran perfectly, into the dark");

		p("Nothing failed. The promise settled on schedule, the rollback applied, the status line updated, the DOM is exactly right — and it is off screen. **A correct error delivered where nobody is looking is indistinguishable from no error at all.** Everything a page draws lives in `$pages` and is hidden by the chain rules; there is no app-level surface for something that outlives a page. My toast appends straight to `<body>` because there is nowhere else, and that is a workaround, not a design.").ac("note");

		p("**Is it the async seat's mid-flight-fetch bug? Related, not identical.** Theirs is the *captor* moving, so DOM lands in the wrong place. Mine is *attention* moving, so DOM lands in the right place. Fixing theirs — naming the target — is what produces mine. Two halves of one rule: name the target for the DOM, and pick a target that outlives the page for anything a human must see.").ac("note");

		section("3. View.text() is not reliably chainable");

		code(`
text(value){
    if (is.def(value) && value !== this.el.textContent){
        this.el.textContent = value;
        return this;                    // chainable…
    } else {
        return this.el.textContent;     // …unless the value did not CHANGE
    }
}`, "View.js:219 — and the docs list text() as chainable");

		p("`.text(\"\")` on an already-empty node falls into the getter branch and hands back a string, so anything chained after it throws — three calls later, somewhere else. This is what took `/forms/` down (`control.attr is not a function`, reported by the librarian sweep). `html()` has the identical shape. **Fixed in my code; the framework line is still there.** The minimal fix is to return `this` from both branches of the setter path.").ac("note");

		section("4. ext/demo IS usable here — five tokens");

		code(`
.forms {
    --line: #e2e4e8;  --wash: #f3f4f6;  --surface: #fff;
    --subtle: #6b7280; --radius: .45rem;
}

measured after:  .demo border=1px rgb(226,228,232)  bg=rgb(255,255,255)`,
			"correcting a finding, not disputing it");

		p("The async seat is right that `demo.css` renders unstyled in `new/1` — an unresolved `var()` invalidates the whole declaration, silently. But that is five tokens, not a dead end: `new/1/site` simply defines no tokens at all. I supply them scoped to `.forms`. **They belong in `site/styles.css` once, for every seat.**").ac("note");

		section("On showing the code");

		code(`
JavaScript that should run      demo(fn)         source + result, one box
JavaScript that must NOT run    code.fn(fn)      proposed diffs, IDE-checked
not JavaScript                  code(text)       measured transcripts
the page itself                 code.file()      collapsed, at the foot`,
			"four tools, one rule each");

		p("I adopted the council's `fetch(import.meta.url)` standard as `this_file(import.meta)` at the foot of all nine pages — verified printing the correct file on each. I kept `demo()` above it, and that is a deliberate split rather than a hedge: **per-example grouping is what teaches, whole-file print is what verifies.** My examples *do things* — arm a guard, post, roll back — so a reader who cannot see which code produced which control has to hunt, which is the failure the brief names explicitly.").ac("note");

		section("Every demo is escapable");

		code(`
the link guard    refuses ONCE, then always allows; disarm button always on
                  screen; deactivate() releases it on the way out
the Back guard    fires once and removes itself
beforeunload      arm/disarm buttons; deactivate() disarms
autosave          a clear-the-draft button`,
			"a demo that can trap its reader is a bug, not a demonstration");

		section("Reconciled with the async seat — the four stores");

		code(`
store              soft nav   Back/Fwd   RELOAD   tab close
─────────────────  ────────   ────────   ──────   ─────────
the url            yes        yes        yes      yes (it is a string)
the memoized view  yes        yes        NO       no
the Page instance  yes        yes        NO       no
module scope       yes        yes        NO       no
sessionStorage     yes        yes        yes      no
localStorage       yes        yes        yes      yes`,
			"measured from both directions; no disagreement on any cell");

		p("**Three of the four stores have one lifetime between them.** The memoized view, the Page instance and module scope are all just *the heap*, and they die together at one boundary. The four-way split is the right map for deciding where to PUT something; for deciding whether it SURVIVES there are three tiers — the url, the heap, and storage. That is the reconciliation, and it is why the whole forms verdict reduces to one boundary.").ac("note");

		section("Three seats wrote the same line, independently");

		code(`
activate(){
    Page.prototype.activate.call(this);   // placement, by hand, via the prototype
    this.thing_i_actually_wanted();
    return this;
}`, "async seat: restart a timer · me: refresh a wizard review · me: offer a draft");

		p("Three different motivations, one workaround, none of us having read the others when we wrote it. **I am backing the async seat's PROPOSAL 4** — split placement into `mount()` and leave `activate()` as `deactivate()`'s twin. Three independent discoveries is the strongest evidence a seam is missing.").ac("note");

		section("…but PROPOSAL 4 does not close the staleness question");

		code(`
stale when you come BACK           activate() fixes it — you are arriving
stale while BOTH views are
  mounted at the same time         activate() CANNOT — neither is arriving`,
			"two staleness bugs that look identical and are not");

		p("This is where I disagree with the scope, not the proposal. In a `.cols` region a parent and its child are on screen together, and moving between children never re-activates the parent — it is in the shared slice, so `Router.activate()` deliberately does not touch it. **There is no arrival to hang a refresh on.** `/mutation/concurrent/` renders two views of one record side by side, one subscribed and one not, and the unsubscribed one is frozen forever. `mount()` would not have helped it.").ac("note");

		p("So: adopt PROPOSAL 4, and know that it fixes one of the two. The other has no framework answer and in my view should not get one — seven lines of `Set`-of-callbacks on the object that owns the data is visible, releasable in `deactivate()`, and cheaper than any reactivity layer.").ac("note");

		section("Their Open #4 dual is a trio");

		code(`
captor          a global you READ after an await     value you assumed is gone
                fix: name the target

router.active   a global you WRITE after an await    newer intent already wrote it
                fix: a generation token

MINE            a correct write to a correct target  the target went off screen
                fix: a target that OUTLIVES the page`,
			"three failure modes, three fixes, and none of them substitutes");

		p("The async seat filed two and called them exact duals, which they are. Mine is the third and it is not a hazard at all — nothing raced, nothing was overwritten, the DOM is exactly right. **Fixing theirs is what produces mine**: naming the target is precisely how the update lands correctly in a hidden page. It should be filed as its own row, and its fix is the app-level surface three seats now want.").ac("note");

		section("Also confirmed, not independently measured");

		p("`App.loaders` being a one-shot first-paint queue matches what I see: `/forms/survives/` calls `tabs()`, which pushes to `loaders` on every soft navigation, and nothing awaits it. Their PROPOSAL 1 — rename to `first_paint`, no behaviour change — reads correct from here. I did not measure it separately and am recording agreement rather than evidence.").ac("note");

		section("Dissent, recorded");

		p("**The strongest case against my verdict** is destructive leaves rather than lossy ones — a payment step, or a `deactivate()` that must not run mid-transaction. Nothing in this section covers those, and no amount of autosave will. If one appears, `can_leave(url)` as specified above is the answer, and it should be adopted then rather than pre-emptively.").ac("note");

		p("**The second dissent is mine against myself.** \"The data is still there, the user just doesn't know\" is a genuine UX failure, and I am recommending we fix it with autosave rather than a prompt. A prompt is the only mechanism that tells the user *at the moment of the mistake*. I still think autosave is right — it removes the question instead of asking it — but a passive dirty-indicator would be a cheap third option nobody has built.").ac("note");

		section("What shipped");

		code(`
site/forms/                9 pages, all lazy, all printing their own source
  page.js       the exit-path table, and the verdict
  survives/     what memoization gives you, measured seven ways
  exit/         the disaster, and the twist — a probe that reads ANOTHER
                page's live input out of the document
  guard/        the 8-line guard, the ordering proof, three shapes weighed
  unload/       beforeunload, and the coverage table
  wizard/       three steps, three urls, one parent object
  submit/       pushState vs replaceState, measured
  optimistic/   rollback across a navigation, into the dark
  autosave/     the answer

  field.js  leave.js  draft.js  post.js  notify.js  this_file.js  forms.css

site/mutation/             the other half — ARRIVING with work in progress
  page.js       the four stores by lifetime, reconciled with the async seat
  autosave/     the reference implementation, and the storage decision
  recovery/     the tab closed, the draft survived — offer, in activate(),
                with an expiry. Never apply a draft silently.
  outliving/    an upload still running three navigations later
  concurrent/   two urls, one record, BOTH views mounted — live vs frozen
  undo/         native Ctrl-Z survives a navigation. Nobody knew.

  autosave.js  record.js  upload.js  mutation.css`,
			"18 routes: zero console errors, zero overflow at 1400px AND 700px");

		p("The wizard's position: **the parent Page is the model, sessionStorage is the durability, the url is the cursor.** A parent Page is an ordinary object held in its parent's `children` map for the whole session — not a store, not a context, not a provider. `this.parent.data` is the entire API, and it is worth saying plainly that this is easier here than in most frameworks. Nothing had to be invented.").ac("note");

		p("One cost of that, measured: derived content is built once. A review step reached twice showed the first visit's data until `activate()` repainted it — after `Page.prototype.activate.call(this)`, because the views do not exist until then.").ac("note");

		section("The one that surprised me");

		code(`
type "hello world", navigate away, come back, focus, Ctrl-Z   -> ""
Ctrl-Y                                                        -> "hello world"
RELOAD, focus, Ctrl-Z                                         -> "" (nothing)`,
			"native undo, free, and nobody knew");

		p("Because `render()` memoizes the element, **the browser's own undo history rides along with it** through every navigation that keeps the heap — and dies at exactly the boundary the heap dies at. No framework, no undo stack, nothing anybody wrote. Nobody had found it because nobody had a reason to press Ctrl-Z after navigating. It is the strongest single piece of evidence that this framework's memoization is a feature and not an accident.").ac("note");

		p("Which settles the undo question the forms verdict opened. `/forms/` argued that autosave commits every keystroke, so **the safety net you need is undo, not confirm**. The answer: native Ctrl-Z inside a field, for free; a *visible* undo affordance attached to the notification of the change for everything else. A global Ctrl-Z across navigations is a firm no — it has no target you can see and it fights the browser inside every text field.").ac("note");

		a.c("page-link", "read /forms/ →").href("/forms/");
		a.c("page-link", "read /mutation/ →").href("/mutation/");
	},
});
