# The best of each kind

One site per category — the one that handles its layout best at all four widths — then the
three arrangements the corpus argues for and the three it argues against. Each verdict was
written looking at that site's own shots at 3440 and at 400, asking the same two questions:
*what does it do with an ultrawide screen that the others waste*, and *what does it do on a
phone that the others break*.

---

<div class="site-best-verdict">

## Documentation — Wikipedia

[![Wikipedia's CSS article at 1920](/websites/site/wikipedia-css/1920.jpg)](/websites/wikipedia-css/)

At 3440 the whole three-column page stops at 1596px and centres, so the contents rail, the
article and the appearance panel all stay exactly where the eye left them and the extra
1800 pixels become quiet margin — where the [Kubernetes docs](/websites/kubernetes-docs-home/)
let their middle column run past 2200px and strand a right-hand rail holding two links at
the far edge of the screen. At 400 the contents rail folds into one button in the top bar
and everything else stacks in reading order, so nothing is lost — where the
[Python docs](/websites/python-docs-index/) slide their sidebar off the left edge instead,
and the [Rust book](/websites/rust-book-intro/) leaves a 1200px empty gap between its
sidebar and its text on a big screen.

[The record and all five shots →](/websites/wikipedia-css/)

</div>

---

<div class="site-best-verdict">

## Marketing — Stripe

[![Stripe's homepage at 1920](/websites/site/stripe/1920.jpg)](/websites/stripe/)

At 3440 the coloured bands run edge to edge and the words inside them stop at about 1232px,
so a wider screen buys more colour rather than a longer line — where
[Webflow](/websites/webflow-home/) lets the content itself run the full 3440 with no cap at
all, and [Apple](/websites/apple-home/) waits until 2560px before it centres anything. At
400 the product bento steps down three cards, then two, then one, and the nav collapses to
a hamburger at 940 — every piece is still on the page, just restacked.

[The record and all five shots →](/websites/stripe/)

</div>

---

<div class="site-best-verdict">

## News — The New York Times

[![The New York Times front page at 1920](/websites/site/nytimes-home/1920.jpg)](/websites/nytimes-home/)

At 3440 the masthead, the story-plus-rail split and the footer all sit inside a 1200px
centred measure that is already reached at 1280, so a laptop and an ultrawide show the same
paper — where the [BBC](/websites/bbc-news-home/) lets its featured band and its four-card
row stretch to the full 3440 and the headlines lose their measure entirely. At 400 the
split becomes one column with the main story first, so the most important thing on the page
is still the first thing you see; only the subscription promo above the masthead ever
bleeds.

[The record and all five shots →](/websites/nytimes-home/)

</div>

---

<div class="site-best-verdict">

## Blog — Josh Comeau

[![Josh Comeau's blog at 1920](/websites/site/josh-comeau-blog/1920.jpg)](/websites/josh-comeau-blog/)

At 3440 the sky illustration bleeds edge to edge while the 627px article and its 313px
sidebar hold as a fixed pair in the middle, so a big screen buys a bigger picture and the
same reading column — where [A List Apart](/websites/alistapart-home/) and
[Overreacted](/websites/overreacted-blog/) can only widen their margins, and
[Hacker News](/websites/hacker-news-home/) lets a line of text run to nearly 3000px. At 400
the sidebar's category list and top-ten list move to the bottom of the page, after every
article, rather than disappearing — the phone loses their position, not their content.

[The record and all five shots →](/websites/josh-comeau-blog/)

</div>

---

<div class="site-best-verdict">

## App — GitHub

[![GitHub's vscode repository at 1920](/websites/site/github-vscode-repo/1920.jpg)](/websites/github-vscode-repo/)

At 3440 the black product bar bleeds while the 838px file list and the About panel beside it
hold their size and centre together, so the repository looks the same on a laptop and on an
ultrawide — where [Grafana](/websites/grafana-play-home/) pins a 319px rail and makes the
pane beside it do all the growing, and Hacker News simply stretches. At 400 the About panel
moves under the file list, the file list itself truncates to ten rows behind a "View all
files" link, and the product menu goes behind a hamburger — the page gets shorter as well as
narrower, which is the move most of this corpus does not make.

[The record and all five shots →](/websites/github-vscode-repo/)

</div>

---

<div class="site-best-verdict">

## Shop — Allbirds

[![Allbirds' homepage at 1920](/websites/site/allbirds-home/1920.jpg)](/websites/allbirds-home/)

At 3440 the hero is a two-image landscape split running the full width, so the widest screen
buys more photography rather than more margin — where [Nike](/websites/nike-home/)'s
ten-track mosaic stops growing at 1678px and the [Amazon](/websites/amazon-kindle-product/)
product page's split could not even be confirmed above 1280. At 400 that hero recomposes
into a single tall portrait photo carrying the same headline and the same two buttons: a
different picture, not a crop, which is the one thing a phone shopper actually needs.

[The record and all five shots →](/websites/allbirds-home/)

</div>

---

<div class="site-best-verdict">

## Design system — Shopify Polaris

[![Shopify Polaris references at 1920](/websites/site/shopify-polaris-home/1920.jpg)](/websites/shopify-polaris-home/)

At 3440 the docs nav is a full 284px labelled list and the article beside it holds exactly
810px and centres in the room that is left, so a wide screen buys navigation instead of a
wider line — where [GOV.UK](/websites/gov-uk-home/) pins the entire page at 960px and
[USWDS](/websites/uswds-home/) caps at 1400 and stops. At 400 the nav becomes an off-canvas
drawer behind a menu icon and the cards stack one per row; the third state — a 56px
icon-only rail at 1280 — is a move nobody else in this corpus makes, and it is why this is
the best responsive story in the whole corpus.

[The record and all five shots →](/websites/shopify-polaris-home/)

</div>

---

<div class="site-best-verdict">

## Gallery find — CcType

[![CcType's Timeline specimen at 1920](/websites/site/cctype-foundry/1920.jpg)](/websites/cctype-foundry/)

At 3440 the type itself scales with the window, so the biggest line on the specimen is
genuinely bigger on an ultrawide instead of the page just growing margins — where
[Designmill](/websites/designmill-home/)'s 50/50 hero leaves most of a 3440 screen as empty
cream, and [Mocean](/websites/mocean-home/) and [Waabi](/websites/waabi-home/) show a
viewport-height hero and nothing else at any width at all. At 400 it stays one column and
the header drops to a menu button, and the largest lines are clipped by the viewport on
purpose — a specimen is meant to be cropped, which is the one caveat here: a reader who does
not know that reads the clipping as breakage.

[The record and all five shots →](/websites/cctype-foundry/)

</div>

---

## Three layouts to copy

**[`2-sidebar`](/layouts/2-sidebar/) — when one column is the content and the other supports
it.** It is the most common whole-page arrangement in the corpus (13 of 47 at 1920) and it
has the most predictable ending anywhere in the data: all 13 become `1-flow` at 400, with no
exceptions to remember. Navigation, filters, metadata, an author box — if the second column
is not itself content, this is the shape with the most evidence behind it.

**[`1-centered`](/layouts/1-centered/) — when the page is mostly words.** Eight pages use it
at 1920, eleven sections use it inside a page, and `max-width` — the tag for a page that
stops growing and centres the leftover — is on 31 of the 47 sites, which makes it the single
most common *behaviour* in the corpus even where it is not the page's id. It also needs no second act: all eight go straight to `1-flow`, because a column
that already has a ceiling only has to lose its margins.

**[`n-wall`](/layouts/n-wall/) — when you have a pile of similar things.** It names a column
*width* and lets the room decide how many fit, which makes it the only arrangement here that
responds without a single breakpoint written anywhere. It appears twelve times as a section
and never as a whole page, which is the honest way to read it: it is what you put *inside* a
page, not what you build a page out of.

## Three to avoid

**[`4-1`](/layouts/4-1/), the mosaic nobody could name.** Two sites in 47 use it, and neither
can show it responding: [Nike](/websites/nike-home/)'s never collapses at all — at 400 it is
still two tiles across, with a wordmark split over the seam between them — and
[IKEA](/websites/ikea-home/)'s could not be caught mid-collapse at any width we shot. A
layout the standard cannot name and the corpus cannot show working on a phone is not one to
copy.

**[`1-flow`](/layouts/1-flow/) as a whole-page desktop layout.** Only three sites do this at
1920, and [Hacker News](/websites/hacker-news-home/) at 3440 is why: its table takes 85% of
the window with no cap, so a comment thread runs to nearly 3000px and a line of text becomes
impossible to come back to. `1-flow` is the right answer at 400 — 37 of 47 sites end there —
and the wrong one at 1920 unless something else is capping the line.

**[`3-holy-grail`](/layouts/3-holy-grail/) without a ceiling on the middle.** Seven sites use
it, and six of the seven throw *both* rails away at 400 — you build three columns and ship
one. [Kubernetes](/websites/kubernetes-docs-home/) shows the other end of the same problem:
fluid rails, a middle column past 2200px, and a right-hand rail holding two links at the
edge of a 3440 screen. [Wikipedia](/websites/wikipedia-css/) is the version that works, and
the only difference is that the whole three-column group is capped at 1596px and centred.

---

Every count on this page is a count you can re-run — the bars, the transitions and the tag
totals are all on [the patterns page](/websites/patterns/), computed from
[`site/index.json`](/websites/site/index.json) each time it renders. How that page is built,
and the two traps it walked into, is in [its readme](/websites/patterns/readme.md).

## About the categories

The corpus used to spell the documentation category three ways — `documentation`, `docs`
and `reference` — which made the same kind of page look like three kinds. They are now one
word, `documentation`, carried by 8 sites, and the six sites filed under `gallery-find` (where
the scout found them, never what they were) were re-read into `marketing` and `shop`. The
vocabulary and the rule behind it: [`doc/tags.md`](/websites/doc/tags.md).
