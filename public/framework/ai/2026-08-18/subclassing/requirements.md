# Subclassing convention → the `code` skill

## The ask, verbatim

> does it say, keep files under 100 lines?  that was a soft suggestion, not a hard rule.  add a "try" to that one?
>
> also, somewhere in there, along that same context: try to use sub classes for parts of the machine.  if a class needs several things, create a Thing class to manage it.  Even if there's only one ThingManager, often you need specific functionality for unique cases.  The point is: utilize additional classes, where possible.
>
> Also, I don't think I've outlined Subclassing yet.  I don't mean extends.  Well, I do, but I mean like this:
>
> ```
> List.View = class ListView extends View
>
> then Sortable.List = class SortableList extends List; // at this point, Sortable.List.View === List.View
> ```
>
> So then, you can replace it, if necessary:
>
> ```
> Sortable.List.View = class SortableListView extends List.View
> ```
>
> And so, you can have these machines.  You import whichever part you need, and you get all its sub machines.  And in the class, you can use `new this.constructor.Thing`, in order to dynamically access the current class' SubClass.
>
> Does that make sense?  Make a note of it.  We have a MASSIVE number of modules with 5-10-20 sub files, probably due to this 100 line "rule".
>
> The idea is, if a file is getting to be over 100 lines, it might be time to break out parts into logical pieces.  But only if it makes sense.  You don't want to arbitrarily split something in half.  If it needs 500 lines, fine.

## Scope

`.claude/skills/code/SKILL.md` only. No code under `public/` changes — this is a convention
note, not a refactor. Do not go rename or restructure existing modules.
