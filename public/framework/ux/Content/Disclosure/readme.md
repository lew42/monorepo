# Disclosure — a title that opens into a section

A [Content](/framework/ux/Content/) module built on native `<details>`. Three stack words: `faq`, `flush`, `lines`.

## Use
```js
import Disclosure from "/framework/ux/Content/Disclosure/Disclosure.js";
new Disclosure({ stack: "flush", items: [{ title: "Question?", icon: "help", body: "Answer." }] });
```
One line places it: `{"place": {"module": "/framework/ux/Content/Disclosure/Disclosure.js", "stack": "faq", "items": […]}}`.

## Watch out
- The look is the stack word alone; never style an item. Rounded + zero gap pinches, so `flush` rounds the parent.
- Stateless: it writes nothing.

## More
- [Live demo](/framework/ux/Content/Disclosure/)
