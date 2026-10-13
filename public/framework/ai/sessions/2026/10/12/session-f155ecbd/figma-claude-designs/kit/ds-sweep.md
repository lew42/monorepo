# Kit sweep: prime grounds retired, focus states added (2026-10-12, night)

Brief: [brief-sweep.md](brief-sweep.md). Figma file `QYN0G2URSBHYH5I06MOjxU`. Before/after is on `Kit · Controls` in the frame **Sweep · before / after** (`165:22139`; left = screenshot of the old set, right = live instances of the new one).

## Already done before this sweep (verified, not changed)
- Chip `145:14691` `Selected` and Segment `145:13934` `Active` were already a bare 25% black inset with ink text (same as their `Current`). Row `139:1095` `Selected` (both sizes) is already a 10% inset + accent icon, like Tree row `Current`.

## Changed
- **Focus**: new boolean variant property `Focus` (false/true) on Button `139:1132`, Toggle `163:2283`, Checkbox `163:2284`, Radio `163:2285`, Dropdown `163:2256` (existing variants renamed `…, Focus=false`, so instances keep working). Each `Focus=true` variant holds a child `Focus ring (2px accent, offset 2)`: no fill, 2 px `accent` stroke, outside, 2 px gap. A drop-shadow ring was tried first and rejected: it shows through the translucent 10% fills. Ring sits on the Track/Box/Ring/Trigger, or on the whole button.
- **Toggle off knob** `163:2260`: white (on-accent knob unchanged on `On`).
- **Prime grounds in kit components, now 10-25% inset with ink text and an accent splash**: Tag `Selected` `145:13729` (25%), Toolbar Tool button `Active` `145:13830` (10%, accent icon), Pagination `Current` Number `145:13851` and Icon `145:13857` (10%), Badge `Tone=Accent` `145:13716` (10%, accent dot), Chat bubble `Who=Me` `145:1063` (25%, was prime).

## Scan: prime fill on a frame that holds text (all DS pages + kit pages)
Every hit on the DS pages (`2.1`–`2.7`, `3`, `4`, `4.1`, `5`, `1`) was an instance of the kit components above, so they updated by themselves; none are left page-level. Not scanned: `Lab · …`, `Claude prototype`, old numbered pages.
Left on purpose (page-level or a splash, not a ground behind running text):
- ▶ PROTOTYPE badges (`154:15993`, `154:15998`–`154:16013`) and UI Kit `Ground · prime` (`140:1332`, a demo of grounds), `Col` (`140:1148`, the selected layer in Tree-in-a-sheet): these are the owner's markers and demos. `Col` is the one real ground left; it needs a look.
- Avatar `Tone=Accent`, Checkbox/Radio `On`, Toggle `On`, Mic `Listening`, Primary button: small splashes, kept.
- Two `Component 1` accent instances on Kit · Containers (`144:13697`, `144:13731`) are Badge/Tag instances; they follow the fix.

## Not done / notes
- No token for the white toggle knob (raw white) or the focus gap: the gap binds to `surface`, the ring to `accent`.
- The focus variants sit in a row beside the originals in each set; Dropdown's row is wide (6 variants). Screenshot of the section was read at full size; ring clipping inside the section rows was fixed (clipsContent off, 8 px pad).
- Still looks off: the Dropdown "before" image is cut at the old set's height (the old menu overflowed), and the Chip set was not re-shot because it needed no change.
