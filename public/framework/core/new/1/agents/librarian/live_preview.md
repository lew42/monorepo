# `live_preview()` — a preview that shows the page instead of naming it

A proposal for `Page.class.js`, ready to paste. **Not speculative:** this is the
code running at `/library/`, lifted onto `Page`. Nineteen cards, twenty
documents, zero broken frames, zero console errors, measured at 1400×800.

---

## 1. The code

`Page.class.js` imports one more element factory:

```js
import { div, h1, a, iframe, is } from "../../View/View.js";
```

A module-scope helper, above the class:

```js
/* The card: a link with the page running inside it, instead of its title.
 *
 * A free function because it needs only a url and a label — which is exactly
 * why a live preview can exist for a child that has not been imported, and
 * exactly why it is not a method on the thing it shows.
 */
function live_card(url, title){
	return a.c("page-preview", () => {
		iframe.c("page-frame").attr("src", url).attr("loading", "lazy").attr("title", title);
		div(title);
	}).href(url);
}
```

Two methods, directly beside `preview()` and `previews()`:

```js
	/* preview() NAMES the page. This one SHOWS it — same card, same url, with
	 * the document running inside.
	 *
	 * It imports nothing, and that is the whole reason it can sit beside
	 * previews() rather than replace it. previews() cannot read a child's title
	 * without importing the child, so an unresolved card reads "api" rather
	 * than "API reference" — the documented cost. A frame does not need the
	 * import: an <iframe src> wants a url, a declared NAME already gives us
	 * one, and the framed document resolves its own title inside itself.
	 *
	 * So the label under the card is still the name — laziness is preserved
	 * EXACTLY — but the card is no longer only a name, because the page is
	 * visible in it. The cost does not disappear; it stops mattering.
	 *
	 * Synchronous, like everything else here: the browser fetches the frame, so
	 * the capture system is never involved and there is nothing to upgrade
	 * later. The cost is a document per card — see the readme.
	 */
	live_preview(){ return live_card(this.url, this.title ?? this.name); }

	/* previews(), live. Same three states, same declared order, same laziness —
	 * an unresolved child is still only a name, but a name is a url, and a url
	 * is all a frame needs. So unlike previews(), both branches produce a
	 * complete card.
	 */
	live_previews(){
		return div.c("page-previews", () => this.children.forEach((page, name) =>
			page ? page.live_preview() : live_card(this.url + name + "/", name)));
	}
```

And the stylesheet — in `Page.css` for the real framework, in `site/styles.css`
for `new/1`:

```css
/* The width is BEHAVIOUR, not a look: `zoom` reflows, so a frame left to size
   itself computes its layout against the card and re-flows the design instead
   of shrinking it. Measured: three flex children at 117 layout px without it,
   467 with. The three numbers are a matched set — a site overriding one should
   expect to override all three. */
.page-frame { display: block; border: 0; width: 1400px; height: 800px; zoom: .23; }

/* A card is a picture you click THROUGH. Without this the iframe swallows the
   click and the card's own href never fires — and a stray click would drive the
   framed app instead of navigating. */
.page-preview .page-frame { pointer-events: none; }
```

---

## 2. Why a second method and not an option on `previews()`

**Verdict: a separate method. `previews()` is untouched.**

`previews({ live: true })` was the obvious alternative and is the wrong call,
for four reasons that stack:

1. **CLAUDE.md is hostile to options, and correctly.** *"Resist adding options,
   flags, or hooks to the base: an option is API surface forever."* This is that,
   exactly.
2. **The cost is categorically different, so it must be visible by name.**
   `previews()` renders N anchors and imports nothing — it is free. The live one
   costs N documents and N app boots. A flag that multiplies the cost of a call
   by a browser document each is the last thing that should hide inside a truthy
   argument. `live_previews()` reads the difference at the call site;
   `previews({ live: true })` buries it.
3. **`previews()` currently takes no arguments at all.** Adding a first parameter
   to a zero-arg method is a larger change than adding a method: every reader
   now has to check whether any given call passes something.
4. **The framework already set this precedent.** `link()` and `preview()` are
   two methods that both produce an `<a href>` to the same url with the same
   text. Nobody made that an option. A third card shape is the same addition.

Recorded so it is not re-litigated: the argument *for* an option is that it
keeps one name and one code path, and `previews()` already branches internally.
Rejected — the branch it would add is about **cost**, not shape, and cost is the
thing a reader most needs to see without opening the method.

### On the name

- `frame()` / `frames()` — rejected. `frames` collides with `window.frames`, and
  I already shipped a `framed()` that read as both a predicate and a past
  participle. That was the mistake; do not repeat its family.
- `thumb()` / `thumbnail()` — rejected. A thumbnail is an image. The entire
  point is that this is not one.
- `preview_live()` — the adjective belongs in front.
- **`live_preview()` / `live_previews()`** — says what differs, first, and pairs
  with `preview()` / `previews()` on sight.

---

## 3. Failure modes

All measured except where noted.

| when | what happens |
|---|---|
| **the url has no page** | the framed app renders its own *Page Load Error*, chrome intact, inside a correctly-sized card. Measured: card 346×220, `href` intact, one console 404. Visible, contained, and a bug report about the link. |
| **cross-origin** | cannot arise from `live_preview()` — it takes no url, only `this.url`. A caller hand-building a card with a foreign `src` gets a frame it cannot read; nothing in `Page` ever touches `contentDocument`. |
| **javascript off** | the app does not boot at all, framed or not — measured, `<body>` is just the module tag. The card is a plain `<a href>` with a text label, so **navigation survives and only the picture is lost**. |
| **fifty at once** | fifty documents. Nothing blocks paint — cards are placed synchronously and only their contents are late — but this is precisely why `live_previews()` must not be the default. |
| **a card of its own ancestor** | frames a document that frames another, with no floor. **The framework cannot detect this** and should not try: one level of framing is legitimate (an app in a harness), so refusing to frame while framed would be the framework deciding a site's policy. A gallery guards itself with `window.self !== window.top`; `/library/` does, and it is measured at zero frames when framed. |

---

## 4. The cost line, for the readme

```
live_preview()   One <iframe>, one document, one app boot per card.

                 Measured, 1400x800, warm cache, localhost:
                   19 cards            -> 20 documents
                   first card in DOM   -> 347 ms
                   network idle        -> 2.2 s
                   frames broken       -> 0

                 Modules are shared and HTTP-cached after the first card, so
                 the cost is the DOCUMENT, not the JavaScript.

                 `loading="lazy"` defers reliably only while a card sits inside
                 a hidden ancestor — measured: a gallery that is not the active
                 page loads 1 document, not 20. On an open page the browser
                 loads nearly all of them, so the real control is CURATION:
                 promote one live card per kind and link the rest. That took
                 /library/ from 50 documents to 20 with no machinery.
```

The honest one-sentence version for prose: **a live preview is a document, and a
page full of them is a page full of documents — which is affordable when you
choose what to promote, and not otherwise.**

---

## 5. Verified against the real class

The bodies above were patched onto the real `Page.prototype` in the browser and
run on `/tabs/`, which is the perfect subject: `tabs()` imports only its first
child, so its `children` map holds a genuine mix.

```
child_states   overview=Page  api=null  guide=null  state=Page  notes=Page  standalone=Page
                              ^^^^^^^^  ^^^^^^^^^^ never imported

cards          href                 label       frame renders
               /tabs/overview/      Overview    page-overview active-page default
               /tabs/api/           api         page-api      active-page
               /tabs/guide/         guide       page-guide    active-page
               /tabs/state/         state       page-state    active-page default
               /tabs/notes/         notes       page-notes    active-page
               /tabs/standalone/    standalone  page-standalone active-page

live_preview() on the page itself -> href /tabs/, label "Tabs"

console errors 0
```

Read the `api` and `guide` rows together: the **label is still the declared
name**, because the parent never imported them and still has not — and the
**frame rendered the real page anyway**. That is the entire argument, measured
rather than asserted. Both branches of `live_previews()` produce a complete
card, which `previews()` cannot claim.

---

## 6. What this does not change

`preview()`, `previews()`, `link()` and the synchronous rule are all untouched.
`previews()` remains the default and remains free; a site opts into cost by
typing a longer name. No existing page renders differently.
