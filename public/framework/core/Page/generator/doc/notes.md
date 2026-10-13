# page.js — design notes

## Pages without filesystem (initialization overview)
Pages without the filesystem. A seed draws a spec string, the spec builds a REAL page tree under this url, and everything a real tree gets comes for free — the Router's walk, the `active-page` / `active-ancestor` contract, `page.columns()`, the crumb strip, the width words.

The mechanism is one line of `grow()`: `children:` already takes nested plain objects, and `add()` turns each into a `Page`. Nothing here plays app.

## The code tab's own log (initialize)
THE CODE TAB'S OWN LOG — one entry per position (`page.at`, JSON-stringified), so it survives every regrow (`grow()` throws the whole tree away and rebuilds it from the spec text — doc/decisions.md). `log_call()` appends, `route("code")` (tree.js) reads. Never cleared: it is a transcript of the session, not a cache.

## The spec → the children (grow)
The spec → the children. The one place the tree is replaced; `open()` and `type()` set `spec` first, and nothing else may.

## THE ADDRESS (hash method)
THE ADDRESS. `#7` is a seed; `#s=<encoded>` is a spec typed by hand, carried whole — a typed tree is not a number, so its text IS its address. Every url in this module asks here, so there is one answer.

## COPY THE ADDRESS (copy method)
COPY THE ADDRESS. The tree IS this module's whole artifact and there was no control that would hand it to you — `hash()` already builds the one string every link in this module carries; this is the one button that takes it. `navigator.clipboard.writeText` needs a permission a headless run has to be GRANTED first — the same trap ext/Panel's `Item.copy()` measured. The string is kept on the instance too (`this.copied`), so a prover with no permission can still read what the button WOULD have copied.

## THE ADDRESS, taken (column method controls section)
THE ADDRESS, taken. The tree is the module's whole artifact and there was no control that would hand you its url — see copy().

## The way IN (column method nav section)
The way IN. A page's view is built when it activates, so without these links the generated tree exists and nothing on screen can reach it. The label and the rules above/below are not decoration: three links floating between the proof line and the spec box did not read as a nav at all (ux recon 2026-08-27, #12).

## THE SPEC IS THE INPUT (column method spec box)
THE SPEC IS THE INPUT, not a readout — the parser has always taken a string, so the box you read it in is the box you write it in. On `change` (blur or Enter out of the field), the typed text becomes the tree. A textarea's value is not its textContent: `.text()` writes the DEFAULT value and is ignored once a human has typed. `el.value`, always.

## Unknown words hint (column method hint section)
A word `read()` (spec.js) does not know silently becomes `prose` — the right call for the draw path, the wrong one for a reader who cannot see why their `widget` line rendered a blank leaf. This line is the only thing that says so; nothing it reads may change what gets drawn.

## THE WAY OUT (column method export section)
THE WAY OUT — the tree you are reading, written to disk as real `page.js` files under `/imagine/generated/`. Here and not in the gallery because this is where the tree is: the box above is the spec, and this is the button that turns it into a module.

## SHOW SOMETHING (first method)
SHOW SOMETHING. A columns host with nothing open is one 22em column and a screen of grey — most of the viewport at 3440 (ux recon 2026-08-27, #3). The first root opens itself. ONCE per load, and the flag is the whole point: a page that re-opened every time it became active would make Back unusable — Back to `/generator/` would move you forward again on the same frame. Only when the generator itself is what landed. A deep url has its own column open already, and nothing here may steal it.

## THE LAW (draw method proof)
THE LAW, on the page rather than in a test: a seeded generator has to prove bit-identical output on unchanged inputs, so the spec is drawn a SECOND time and the two strings compared, every time this repaints. A TYPED spec has no seed to redraw from — its own text is the proof, and the line says so rather than lying.

## THE SPEC BOX OWN FEEDBACK (hint method)
THE SPEC BOX OWN FEEDBACK. read() (spec.js) already turns an unrecognised word into prose rather than throwing -- the right call for the draw path, and the wrong one for a reader with no way to see why a typo drew a blank leaf. unknown() (controls.js) re-parses the SAME text and changes nothing in it. Quiet, inline, never an alert -- a line that appears and disappears with what you are typing, not a dialog that stops you typing it.

## pick() — whole tree from gallery
A spec picked from the GALLERY — a whole tree arriving at once, so it opens its own first root the way a fresh load does. `type()` alone leaves you on the host looking at a nav and no column, which reads as nothing having happened.

## THE THIRD DOOR (swap method)
THE THIRD DOOR, and the one every control uses: change ONE line of the spec. A switch is a typed spec from then on — it is no longer what `gen(seed)` draws, and the proof line says so rather than claiming a seed it does not have. The seed is never touched, so `#7` still means one tree and the reproducibility law holds. Logged AFTER `type()` (which regrows), so `log_call()` reads the FRESH page at `at` — the one whose `.block`/`.opt`/`.width`/`.children` already reflect this very change — not the one `edit()` just replaced.

## THE CODE TAB'S TRANSCRIPT (log_call method)
THE CODE TAB'S TRANSCRIPT — one line, appended to `this.calls` at this position, every time a control fires. `width` is a field (`export.js`'s `width_line()`); a `block` or `opt` change is a `content()` body (`content_line()`) — the same two functions `export.js`'s own `module()` writes a whole page.js out of, so the code tab can never say something export would not.

## show() — Rebuild, repaint, move
Rebuild, repaint, and move the url to the new address — landing back on the column you were reading, which is the difference between a control and a reset button. `place()` runs BEFORE `grow()`: the regrow throws every generated page away, so the Router is left pointing at one that no longer exists.

## WHERE THE READER IS (place method)
WHERE THE READER IS, as indices into the tree. Indices and not the url, because a generated page is named after its block word: switching a `list` to `tabs` renames it and everything under it, so the url you were on 404s while the column you were reading is still there, one word different. A position never moves. `kid?.at` is the filter: the permutation wall is a stable child with no place in the spec, so it is not in the count — and standing on it gives `[]`, the host.

## page_at() — Same indices resolved
The same indices, resolved to the PAGE they name in the tree that just replaced the old one — `resolve()` (a url) and `log_call()` (a live page to read) both want this, so it is one walk rather than two ways to get lost in the tree.

## THE HEADER'S GLOBALS (size method)
THE HEADER'S GLOBALS — tokens on the columns host, inherited by every column that names no width of its own. A token needs no specificity to win, which is the same move `.page-column-small` makes one level up (controls.js). Deliberately NOT in the address: `#7` has to keep meaning one TREE, and how wide you like your columns is not the tree. doc/decisions.md.

## THE COSTUME (look method)
THE COSTUME — `/imagine/vary/colstyles/`'s three looks, reached for from the page that can put any tree under them. A class on the columns HOST and nothing else: the generated tree is not touched, not regrown, and not renamed, so switching looks cannot move the reader or the spec. `finder` is the absence of a class, not a class — colstyles' own call. A default that writes rules is a default you have to keep in step with the base.

## WHAT THE URL DOES NOT CARRY (remember method)
WHAT THE URL DOES NOT CARRY. `#7` / `#s=…` is the TREE, and deliberately only the tree — how wide you like your columns is not the tree (doc/decisions.md). But a preference that resets every visit is a control nobody touches twice, so the split is: **the url carries the tree, the store carries the dressing** — `size`, `gap`, `look` — plus the last tree, for an arrival with no address at all.

`prefs()` is core's, keyed on this page's own url (`doc/method/prefs.md`), so there is no key to invent and nothing to configure. `patch()`, not `set()` — a second writer landed in the same key (`specs.js`'s `saved` list, wave 7). `set()` REPLACES the whole record, so switching `look` would have silently erased every saved spec on the very next write.

## THE WAY OUT (export method)
THE WAY OUT — this tree, as real `page.js` files under `/imagine/generated/`.

The whole of it is `export.js`; this is the seam, and it is deliberately three lines: read the name, write the files, print the answer. Nothing is regrown and the spec is not touched — an export is a READ of the tree you are looking at, so the seed, the address and the reproducibility line all come out unchanged.

`Page.slug()` decides what a directory may be called, not the field: a name is typed by a human and lands on a filesystem, and `../` is not a tree name.

## The url decides (land method)
The url decides what this page is, before anything renders: `#7` a seed, `#s=…` a spec typed by hand and sent to someone. Neither, and it is the default seed. It sets the state and stops — NOT `open()` / `type()`: this runs inside the constructor, where there are no controls to repaint and no Router to move. THE URL WINS. A link someone sent has to open what it says, so the remembered tree is read only when the address names none of one — the bare `/generator/` arrival, which is the only case "back where you left" is even a question.
