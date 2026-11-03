# Classify — a light overlay that shows the layout classes of any container, outlined

## Use
```js
import classify from "/framework/ext/Classify/Classify.js";
classify(el);          // outline el + its columns, label "flex three"
classify.toggle();     // every flex / grid / columns container on the page (Alt+L)
```
Or put `class="classify"` on an element. Add `?classify` to any URL to open a page with it on.

## Watch out
- The layer is absolute and `pointer-events: none`: it never moves the layout it shows. It redraws on resize and DOM change with a timer, not rAF (hidden tabs never run rAF).
- The outline style is not chosen yet: [/framework/ext/Classify/](/framework/ext/Classify/) shows four side by side.

## More
[page](/framework/ext/Classify/) · [Classify.js](./Classify.js) · rules behind a class: [CSSDoc](/framework/ext/CSSDoc/)
