# Live board — a visual summary of the dictation, updated as we talk

File **Claude November 2026** (`woCZQDoXKJW3GcJPZukW7f`), page **Live** (`45:49`). The root frame is **Live board** (`48:49`, 2600 wide, auto layout): a header, then three columns — left a list of topics (the current one highlighted), centre the current topic's main ideas as headed cards with short bullets, right a quieter sidebar of notes, decisions and open questions.

[Open the page](https://www.figma.com/design/woCZQDoXKJW3GcJPZukW7f?node-id=45-49) · [Open the board](https://www.figma.com/design/woCZQDoXKJW3GcJPZukW7f?node-id=48-49)

A page already named "Live" existed in this file but held an unrelated card-override test (text typed over, slot edited, loose layers vs. one instance); it was renamed **"Card overrides test (was Live)"** (`26:366`) rather than overwritten, and this is a fresh page. A different, unrelated **"Live" status board** (a grid, a decision tree, a "waiting on you" row) also exists in the **Lew42 Design System** file (`hbolzQ3Xnc78rhxAPj8xK2`, node `445:111`) — that one tracks what's being built across the whole system; this one is this voice session's own topic-by-topic summary, in a different file.

## Components (masters at the Live page root, left of the board)

| Component | Node id | Properties |
|---|---|---|
| **Topic row** (set, `State`: Normal / Current) | `46:58` (variants `46:52` / `46:55`) | `Title#46:0` (TEXT) |
| **Topic card** | `46:59` | `Title#46:3` (TEXT), `Bullets#46:4` (TEXT, one bullet per line, e.g. `"• point one\n• point two"`) |
| **Note** | `46:62` | `Text#46:5` (TEXT) |
| **Decision** (filled, ✓ icon — a settled call) | `46:65` | `Text#46:6` (TEXT) |
| **Question** (dashed outline, ? icon — still open) | `46:71` | `Text#46:7` (TEXT) |

Colour and spacing bind to this file's own **Scheme** (Light/Dark/Prime: `surface`, `ink`, `accent`, `muted`) and **Size** (S/M/L: `icon`, `pad`, `radius`, `text`) variable collections — the only tokens this file has. They're much smaller than the Lew42 Design System's Scale/Colors system, so the board's macro spacing (the 64px page padding, the 48px column gap) is hardcoded on the board frame itself, not bound to a token; say so if you add more board-level spacing. Decision/Question are marked by icon + word + fill/outline, never colour alone, per the brief.

Container ids for appending new instances: left list `48:56`, centre list `48:84`, right list `48:114`.

## Update recipe — short `use_figma` calls, no regeneration

**Add a topic** (a row on the left, a card in the centre):
```js
const row = (await figma.getNodeByIdAsync('46:52')).createInstance(); // or '46:55' to mark it current
(await figma.getNodeByIdAsync('48:56')).appendChild(row); row.layoutSizingHorizontal = 'FILL';
row.setProperties({ 'Title#46:0': 'New topic' });
const card = (await figma.getNodeByIdAsync('46:59')).createInstance();
(await figma.getNodeByIdAsync('48:84')).appendChild(card); card.layoutSizingHorizontal = 'FILL';
card.setProperties({ 'Title#46:3': 'New topic', 'Bullets#46:4': '• point one\n• point two' });
```

**Add a note, decision or question** (right sidebar; swap the master id — Note `46:62`, Decision `46:65`, Question `46:71` — and its text property key — `Text#46:5`, `Text#46:6`, `Text#46:7`):
```js
const inst = (await figma.getNodeByIdAsync('46:65')).createInstance();
(await figma.getNodeByIdAsync('48:114')).appendChild(inst); inst.layoutSizingHorizontal = 'FILL';
inst.setProperties({ 'Text#46:6': 'New decision text.' });
```

**Mark a different topic current** (swap an existing row's variant, both ways):
```js
const row = await figma.getNodeByIdAsync('<existing Topic row instance id>');
row.swapComponent(await figma.getNodeByIdAsync('46:55')); // '46:52' to un-highlight the old one
```

## Trap hit while building this

`resize(w, h)` resets `primaryAxisSizingMode`/`counterAxisSizingMode` back to `FIXED` even when they were set to `AUTO` (HUG) just before the call. The board frame, both sidebars, and all four card masters were built with `resize()` called *after* setting HUG — every one of them silently clipped its content to a fixed height until the modes were re-applied *after* `resize()`. Always call `resize()` first, then set the sizing modes.
