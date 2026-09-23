# kbd

A keyboard-shortcut chip. `keys()` is the one function — it interleaves real `<kbd>` elements with a `+` separator so a screen reader still reads each key; the row and box around it are markup.

## Use

```js
import { keys } from "/app.js";

keys("Ctrl", "K");
```

## Watch out

- A bare `<kbd>` gets the box for free from `framework.css`'s mono list, but not the heavier bottom border — that lip is `kbd.js`'s whole job — [kbd.js](kbd.js)

## More

- [page](/framework/ui/kbd/) — rows, a shortcut list, and the bare-vs-boxed comparison
- Back to [UI](/framework/ui/).
