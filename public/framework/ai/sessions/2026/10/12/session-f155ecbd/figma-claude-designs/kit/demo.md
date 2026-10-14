# Report: Demo · Site (done, 2026-10-14)

Figma file `QYN0G2URSBHYH5I06MOjxU`, page `Demo · Site` (`296:106079`, right after `Essentials`). Brief: [brief-demo.md](brief-demo.md). Task log: [demo/task.jsonl](demo/task.jsonl). Scheme A builder: [demo/build-a.figma.txt](demo/build-a.figma.txt).

## Checklist
- ✅ Ten screens, each 1920×1080, clip on, vertical scroll, built from page templates, nav items and Essentials cards (all instances).
- ✅ Four nav schemes, wired, active item set by a variant (`State=Active`, `Current`):
  - A dark sidebar + attached inner sidebar: Home `296:106080`, Docs · Getting started `…081`, Docs · Install `…082`, Settings `…089`.
  - B top nav + tabs: Buttons `…083`, Cards `…084`.
  - C icon rail + inner nav: Layouts `…085`, Templates `…086`.
  - D breadcrumb + next-page footer: Reading · Why instances `…087`, Why slots `…088`.
- ✅ Start screen Home, flow `Demo · Site` (`flowStartingPoints`), ▶ PROTOTYPE badge in the Notes frame.
- ✅ Notes frame left of the screens: how to play, scheme per screen, verdict.
- ✅ Wiring script listed every reaction destination: 0 dead links, every screen has an incoming link, every screen links back to Home.
- ✅ Screenshots seen at 100%: Home, Cards, Buttons, Layouts, Reading · Why instances. Not re-viewed after the last edit: Docs ×2, Settings, Templates, Why slots.

## Verdict
**A reads best.** The dark sidebar says where you are in the site; the gray inner sidebar attached to a white page says where you are in the section. B is light but runs out of room past six tabs, C needs labels on its icons, D suits linear reading only.

## Lessons
- A reaction cannot target its own screen (the script rolls back): skip the current item.
- Icon identity lives in the nested `Icon glyph` instance.
- Text mode `1:2` on a frame darkens Tree items.

## Small leftovers
- Footer buttons show a leading "+" icon (the Button default); hide it for clean arrows.
- The Reading screens' right column still shows sample session names.
