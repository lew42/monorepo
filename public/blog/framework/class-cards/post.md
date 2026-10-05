A note, dictated on 5 October, about two things the docs should do better. Nothing here is built yet; it's the direction.

## Every class gets a card

When you open a class's page, the first thing should be its **shape**, not a demo:

- the class's icon and its name, written the way the code writes it: `class Page extends Item`;
- its dependencies, the way the file lists its imports;
- its main properties, most structural first, each one saying what it holds;
- any property that holds another class's instances is a link to that class's page.

A sentence or two can explain the important properties, one per line, so each sits in its own context. The card can be a simple padded card or a full-width page; either way it reads like the top of the class file, made visual.

Building these by parsing the class files automatically is tempting. Writing them by hand is safer for now: regular expressions over source code are a debugging trap.

## A header you can steer by

On a phone, a module page spends half the screen on its title and tabs before any content shows. Instead:

- the header is small: the icon and the title, and it can start larger and shrink into a **sticky header** as you scroll;
- the header is a **dropdown** (a custom one, not a plain select): tap the arrow and see where this page sits in the site's tree, then jump anywhere;
- that tree could even be **pinch-to-zoom**, with CSS zoom between a minimum and a maximum, so you can pan around the whole site.

A first step already landed: on narrow screens the tabs now scroll on one line instead of wrapping (header 122 px → 85 px at 400 px wide). The title-as-dropdown is the next one.
