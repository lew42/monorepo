# `.fig-select` now works (2026-10-12)

✅ Picking a row sets the trigger text and closes; outside click and Escape close; Arrow keys move, Enter picks; only one is open at a time. Try it on [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/).

---

### 🧱 FigSelect `ext/Figma/tokens/FigSelect.js`

```js
class FigSelect { static install(); static pick(sel,row); static move(sel,step); static rows(sel) }
```

- One delegated listener set serves every `.fig-select`, so plain markup needs no setup; `page.js` calls `FigSelect.install()`.
- Reuses `ux/Menu`'s recipe (native `<details>`, outside click) rather than `ux/Popover`: the markup and CSS were already fixed. No second popover system.
- A pick fires a bubbling `fig-select` event (`detail.value`).

---

### Checked
- Headless: pick, outside click, Escape, one-open, keyboard pick all passed; full review: pass, 5 notes, all answered.
- ⚠️ Not done: phone bottom sheet (`ux/Popover` has no sheet mode); Tab away leaves it open, as a native `<details>` does. The first ArrowDown on a closed select opens and moves one row.
- Docs: [controls.md](/framework/ext/Figma/doc/controls.md).
