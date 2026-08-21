# Dropdown — one choice out of a list: a trigger showing its picture and its name, and a list that opens in the top layer, so nothing can clip it

## Use
```js
import dropdown from "/framework/ext/Dropdown/dropdown.js";

dropdown({
    options: [{ value: "flex", label: "flex", icon: "view_column" }],   // icon: a Material name, or a function that draws one
    value: "flex",                                                      // what the trigger wears
    title: "Display",                                                   // the trigger's tooltip
    pick: name => item.set("display", name),                            // once, on a choice
});

new Dropdown({ options, value, pick }).draw();   // the class — every method is a seam
```

## Watch out
- The list is a `[popover]`, so **outside-click and Escape are the browser's**, not this module's — don't add your own, and don't reach for `position: absolute`: [doc/decisions.md](./doc/decisions.md)
- It closes on a pick and hands you the value; **redraw the trigger yourself** if the value it shows can change from elsewhere — nothing here watches your data
- A picture is a Material Icons **ligature**: a name the font lacks renders as the whole word, hundreds of px wide. Measure before you ship one
- `place()` runs once per open, off `getBoundingClientRect()` — a trigger that moves while the list is open takes the list nowhere with it

## More
- [/framework/ext/Dropdown/](/framework/ext/Dropdown/) — the page: pick one, see it
- [`doc/decisions.md`](./doc/decisions.md) — why the top layer, why a class, what a native `<select>` could not do
- Consumers: [`ext/Panel`](/framework/ext/Panel/)'s properties rail — its **template** and **display** pickers
