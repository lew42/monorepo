# Filters — chips that default to all, and why four of the five groups are empty today

A **facet** is one question you can ask of every page: *which section is it in?* *what kind of
page is it?* A **group** is that question drawn as a row of chips, one chip per answer, with
the number of pages behind each.

## The model, in three sentences

**Nothing selected means everything.** That is what "filters default to all" is, and writing it
this way means there is no "all" chip to keep in sync and no special case anywhere — `match()`
skips a group whose set is empty.

**Inside a group the chips are OR.** Framework *or* Imagine: you are widening.

**Between groups they are AND.** Framework *and* docs: you are narrowing. Those are the two
things people already expect from chips, and they are the whole of `Search.Filters.match()`.

## The five groups

| group | where a row's values come from |
|---|---|
| **Where** | the first segment of the url — every page has one |
| How you move | the page's `tags:`, the ones on the *navigation* axis |
| Its regions | the *shell* axis |
| Scrolling | the *scroll* axis |
| What it is | the *content-kind* axis |

The four axes are [the tag vocabulary](/imagine/design/vocabulary/)'s: 29 tags on 4 axes,
written to describe any site's structure. `core/Search/tags.js` carries the tag → axis map and
nothing else — core may not import a page module, and a second copy of 29 *definitions* would
be a second thing to keep true. When a tag is added to the vocabulary, add its one line there;
a tag with no line lands in an "Other tags" group rather than disappearing.

## Why they are empty, and why that is right

**No page on this site declares `tags:` yet.** A group with fewer than two options is not a
choice, so it is not drawn — which means *Where* is the only group you see today, and the four
axis groups appear **on their own** the moment pages start carrying tags. Nothing has to be
turned on and nothing here has to change.

That is deliberate: the layout pages being built alongside this will carry `tags:` as page
props, and the filters were asked for so they could filter them. Building the groups from the
corpus rather than from a hand-typed list is what makes that free.

## Adding a tag to a page

```js
export default new Page({
    meta: import.meta,
    title: "Two columns",
    tags: ["single-column", "docs"],   // any tag from the vocabulary
});
```

Nothing else. The chip appears in its axis's group with a count, and the page is findable by it.
