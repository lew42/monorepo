# Kit · Containers (Figma page `143:1235`, file QYN0G2URSBHYH5I06MOjxU)

Slots work: each container has a `Content` SLOT (property on the set, `slotContentId` on the child frame); instances fill with `slot.appendChild(...)`. Column of section cards at left, two 390×844 phone screens to its right.

## Built (component → node id → site path)
- Card, Ground=White/Inset/Prime/Dark + Content slot → `144:1137` → ui/card (nesting shown: Inset in White)
- Panel (Title, Icon, Content) → `145:13739` → ui/panel
- Accordion item, Open=False/True (Label, Content) → `145:13774` → ui/accordion
- Decision (Question, Reason, Content) → `145:13806`; Decision option, Chosen=False/True (Label, Tag, Sub) → `145:13805` → ui/decision
- Stat (Label, Value) → `145:14027` → ui/stats
- Timeline entry, Last=False/True (When, Title, Sub) → `145:14063` → ui/timeline
- Dialog, Kind=Dialog/Sheet (Title, Content, Actions slots) → `145:14100` → ui/dialog (+ bottom sheet)
- DataGrid, View=Table/Rail → `145:15020` → ui/datagrid + ui/table (ext/DataGrid): Grid toolbar `145:14973` (search + view switch + Chips slot), Chip `145:14691`, Search `145:14692`, View switch `145:14705`, Head cell Sort=None/Asc/Desc `145:14715`, Grid head `145:14716` (one opaque row, Updated ↓), Grid row 36 tall `145:14726`. No grey group rows; counts are chips.
- Mobile grid collapse: DataGrid Rail with Row Two-line instances (section `145:14682`).
- Screens: Dashboard (stats + timeline in a card) `145:15354`; List + sort sheet over a scrim `145:15402`.

## Not mapped
- ui/section: no component (it is a layout wrapper; the section cards use pad tokens directly).
- Sticky header, row hover/select states, chip horizontal scroll: static only.

## Values no token gives
- Hairlines: black 10% stroke (no border token). Timeline line: black 25%. Scrim: black 50%.
- Sheet top radius 16 (as in use-figma.md); sheet handle 40×4; timeline dot 10.
- Table columns 112 fixed, row height 36, chip/switch 44, mobile search is one line truncated.
- Stat value uses h2 (36); no stat-number style exists.

## Still off
- Timeline "When" (fixed 72) wraps "AUG 2026" onto two lines; component sets show empty slots as blank boxes; Button "+" icon is hidden in the sheet but still shown in the dialog strip (nested Icon not reset there everywhere).
