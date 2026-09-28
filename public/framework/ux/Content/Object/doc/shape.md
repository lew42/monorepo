# Object — what the card reads

Unlike Question and Decision, this module reads and writes no log — it has no record
shape of its own. It only reads what is already on the subject you hand it:

- `subject.constructor` (or the subject itself, when it is a class) → the header.
- `subject.name`, else `subject.path`, else `subject.url` → the instance label, when
  the subject is not a class itself.
- `Object.keys(subject)` → the properties list, minus functions and DOM/View nodes.
- the subject's prototype's own method names → the methods list.

The class is [`Object.js`](/framework/ux/Content/Object/); every method is a seam, so a
variant (a different property filter, a different value formatter) is a subclass.
