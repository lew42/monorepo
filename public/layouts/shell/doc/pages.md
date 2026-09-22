# Pages — what is real, what is dynamic, and how one page comes from another

The owner asked a set of questions about pages while this shell was being built. Here they
are, each with the answer we can give today, the alternative we did not take, and — where we
genuinely do not know yet — the words "still open".

## What is a real `page.js` on disk, and what is dynamic?

**A real page is a folder with a `page.js` in it, and the folder is the url.** `/layouts/shell/home/`
is a real page because `public/layouts/shell/home/page.js` exists. Three things come with
being real: an **address** somebody can link to, bookmark and send to a colleague; a **place in
the navigation**, because its parent names it in `children:`; and a **folder**, which is where
comments, decisions and notes about it would go if it ever has any.

**A dynamic page is one the code makes up the moment a url asks for it.** `/layouts/` does
exactly this: its `route(name)` reads one object out of `layouts.json` and hands back a page,
so twelve layouts cost one file instead of twelve — and the file and the page can never
disagree, because there is only one copy.

**The rule this lab uses.** If the thing has its own address that someone would link to,
bookmark or comment on, it is a real page on disk. If it is one row of a list, one variation,
or one state of a thing that already has an address, it is dynamic.

**The alternative:** make everything dynamic and keep one `page.js` at the root. Core already
supports it — `children:` may be a **function** core calls once and awaits, so a page whose
children live in a fetch needs no code of its own
([`data-children.md`](/framework/core/Page/doc/data-children/)), and `Page.from()` turns a
`page.json` into a real page tree. That would win for anything a person edits at runtime, and
lose the thing the file system gives you for free: a diff, a history, and a place to put notes.
**Still open:** whether pages should live in a database at all — a scout is reporting on it
([`sqlite-scout`](/framework/ai/2026-09-17/sqlite-scout/), [`pages-in-d1`](/framework/ai/2026-09-17/pages-in-d1/)).

## Is a button a page?

**No.** It has no url, nothing navigates to it, and nobody would leave a comment on it.
A button is a control, which means it is markup a method draws.

## Is a section a page?

**Only when it has its own url.** A section that you can link to, land on cold, and press Back
out of is a page; a section that only ever appears inside another page is markup. In this
shell every design has a bar, a hero, a wall and a footer, and **not one of them is a page** —
they are five methods on one drawer class, `Design.js`. Making them pages would have bought
four urls nobody wants and cost every design a folder.

## Can a page's methods render its parts?

**Yes, and it is the normal way.** `content()` is the one method core calls; everything else is
yours, and a method is the seam that lets a variation change one part without forking the file:

```js
draw(){ this.topbar(); this.hero(); this.middle(); this.band(); this.footer(); }

hero(){
    const hero = this.spec.hero;
    if (!hero) return;                         // a null band simply is not drawn
    return div.c("std-shell-band std-shell-hero bleed", $hero => { … });
}
```

⚠ **Name the method before you write it.** Core calls `assign()` → `naming()` → `declare()` →
`initialize()` inside its own constructor, and reads `card` `label` `icon` `description`
`classes` `width` `index` `leaf` `depth` off a page as **data**. A page method named `width()`
is read back as a CSS class (`page-w-` + a function); one named `naming()` replaces core's url
deriver and 404s the whole page. This lab's width method is called `size_rail()` for exactly
that reason.

## How does one page derive from another?

Three mechanisms were tested against the real core `Page` in a real browser before one was
picked. The probe is in the task log: [`shell-lab`](/framework/ai/2026-09-17/shell-lab/).

**What we build with: derive the CONFIG.** A design file exports a plain object and the child
imports that object, changes one key, and constructs a new page from the result:

```js
export const tallerHero = derive(home, { hero: { fold: "clamp(20rem, 62vh, 44rem)" } });

export default new Page(design(tallerHero, { meta: import.meta, title: "Taller hero", … }));
```

`new Page(…)` runs the whole constructor, so `declare()` runs, `children` is a **fresh Map**,
and `meta: import.meta` gives the child its own url, name and title. The parent's object is
never touched. **The one caveat:** the spread is shallow, so a change replaces a whole key
rather than pushing into one — `derive()` merges one level deep so that "one change" still
reads as one line.

**Alternative (a) — a subclass per design**, `class TallHero extends Home`. It works: the
constructor runs, the Map is fresh, the url is right. It **wins when the difference is
behaviour** rather than a value — a band that draws differently, not a band with a different
number in it — because a subclass is the only one of the three with real method seams. Its
cost: core builds a **plain `Page`** for every child declared as a POJO, so a subclass only
ever arrives via a real `page.js` file, and a design that differs by one number would still
need a class.

**Alternative (b) — `Object.create(parentPage)` plus `Object.assign(overrides)` on the
instance.** Refuted by measurement, and it is worth knowing why, because nothing throws.
`Object.create` does not run the constructor, so `declare()` never runs; `children` is read
through the prototype and **is the parent's own Map** — adding one child to the clone took the
parent from two children to three; and `url`, `name` and `title` stay the parent's, because
every field is truthy through the prototype and `naming()`'s `??=` can never re-derive them.
It would be fine for a throwaway clone that is never routed to and never declares children.

## How do imports flow?

Five sentences, and they are the whole answer.

1. A parent names its children **by name**, as words in `children:` — nothing crawls the file
   system, so a folder nobody names does not exist.
2. Core **dynamic-imports** a child's `page.js` when a url is routed to it, or when
   `load_all_children()` walks the subtree ahead of time; the parent never mentions the child's
   file.
3. A child **never imports its parent's page**, because a parent↔child import cycle breaks only
   on a deep reload and therefore passes every test you run before landing.
4. So for design inheritance the child imports the parent's **config — a plain object** — and
   never the parent's `Page` instance: an object has no url, no parent and no children, so
   importing it cannot make a cycle and cannot drag a subtree into memory.
5. That leaves exactly one direction: **imports flow down the file tree** (a design imports the
   spec above it), and `.parent` points **up** (core sets it when it adopts the child), so the
   tree exists twice and neither copy is an import.

Verified with a cold deep reload of the deepest design,
[`…/no-wall/dark-band/`](/layouts/shell/home/taller-hero/no-wall/dark-band/): it loads with an
empty console, and every ancestor's spec arrives with it.

## Still open

- **Real pages moving on disk when they are dragged.** A tree you can rearrange implies a
  folder that moves, and core's `move()` already re-addresses a whole subtree in memory — but
  production is static, so there is no server to move the folder. A later task.
- **Pages in a database.** See the scout reports linked above. Nothing is decided.
