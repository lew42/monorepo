# Brief: kit sweep — retire prime grounds, add focus states (2026-10-12, night)

Read [brief-ds.md](brief-ds.md) first. The owner's rule: prime is a splash (an icon, a primary button, a toggle's on track), never a ground behind text. Earlier kit pieces still carry the old prime-ground states. Fix them in place so every page that uses them updates.

## Do
1. **Chip** `145:14691` `State=Selected` and **Segment** `145:13934` `State=Active`: restyle to the `Current` look (bare 10–25% black inset, ink text, accent icon if any). Keep the variant names so instances don't break; then delete nothing.
2. **Row** `139:1095` `State=Selected`: same treatment (10% inset + accent icon), matching Tree row's `Current`.
3. **Focus ring** variants for Button, Toggle `163:2283`, Checkbox `163:2284`, Radio `163:2285`, Dropdown `163:2256`: a 2 px `accent` outline offset 2. Add as `State=Focus` (or a boolean `Focus`), whichever fits each set.
4. **Toggle off knob**: lighter (white knob on the 15% ink track) so off reads quiet; on stays accent + `on-accent` knob.
5. Search every DS page for raw prime fills (`prime` variable or `#FF6157`) on frames that hold text; list them in the report, fix the ones in kit components, leave page-level ones noted.
6. Screenshot before/after of each component set; put a small "Sweep · before / after" section on `Kit · Controls`.

Report `kit/ds-sweep.md` (what changed, ids, anything left), committed by path.
