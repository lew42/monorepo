# Bad patterns in Lew42 v2 (2026-11-16, read-only sweep)

File `ADpu9u2V0BlEZfR3rrMfER`. Nothing was edited. Counts come from read-only scripts over all 27 pages (layers inside instances and masters are skipped unless noted); screenshots at 1:1 for the examples. Related: [study-core.md](./study-core.md), [study-sizes.md](./study-sizes.md), [lint.md](./lint.md), [build-checklist.md](./build-checklist.md).

## Conclusion

The file is confusing for three reasons, in this order: **layers are named for something they are not**, **parts live on the wrong page and several masters do one job**, and **empty scaffolding and leftovers sit on the canvas next to the real thing**. The raw-value and text-style problems are real but small, and lint already catches them. Most of the confusion is invisible to lint today, so five new lint rules (marked **new**) would catch about 80% of what you are seeing.

## Ranked by confusion for you

### 1. Names that lie (about 170 + 165 + 14)
- **"Card" frames that are not cards: 171.** 2600 XL 99, 1920 Desktop 42, Scale 26, Squeeze 3, AI 1. On 2600 XL and 1920 Desktop they are page regions holding one text label (`100:1457` is a 2440x1280 region with one label; also `100:8305`, `100:8345`). On Scale they are hand-built copies of the Card master with a Button (detached).
- **Default names: about 165** (`Frame`, `Group`, `Section`): `34:524`, `100:11258`, `8:32`.
- **"fixed" in the name, Fill/Hug in the settings: 14**: `114:9134`, `112:7241`, `110:648`.
- **Why bad:** you click through to "Card" and find a page region. Search and the Assets panel show the wrong thing.
- **Fix:** rename by what it is (Region, Row, Label); re-attach real Card copies to the master.
- **Lint:** default names and a Card-named frame that is not an instance of the Card master. **New**: `name-lies`.

### 2. Parts defined on the wrong page, and many masters for one job (about 25 masters)
- Card, Content · Stat and Card · with media live on **Scale**; `Layout.*` sets live on Elements and 2600 XL.
- **Rail + Main + Rail twice** (`100:3553`, 0 uses; `99:3835`, 1 use). **`Res.N Set` x8** (`100:8494`, `100:8938`, `100:9439`, ...), the same placeholder per size. **Test masters** "Master 1-6" (`19:459`, `19:479`, `19:499`). **Two cards / Three cards / Two small cards** per size are one Card at different widths.
- **Why bad:** this is the "defined on a bullshit page" you described. Swapping shows duplicates and click-through lands somewhere unrelated.
- **Fix:** one home page per master ([master-homes](/framework/ai/sessions/2026/11/16/spawned/mastermind-master-homes/)); archive the placeholders and test masters.
- **Lint:** no. A master-home census script can (master name vs page name, instance count 0 or 1). **New**: `master-census`.

### 3. Empty wrappers that add a level and no information (71 pure, 238 carry a mode)
- Of 309 one-child frames with no fill, stroke, effect or padding, **238 set a Scale mode**, so they carry information (not waste, though deep). **71 are pure**: `Row · 2` > `Example · …` (`100:10141`, `100:11227`, `100:9726`); mostly 1920 Desktop 12, 2600 XL 18, 1000 Default 8, 1600 LG 10.
- **Specimen** (`111:57`, 103 instances): Header + Content + Notes around the real thing, "Content slot: put the example here" and "No notes yet".
- **Why bad:** two levels to reach the thing; the Layers panel is a staircase.
- **Fix:** unwrap the 71; drop Specimen and show the instance bare on its ground (already agreed in size-page-spec).
- **Lint:** **new**: `empty-wrapper` (1 child, no paint, no padding, no mode override, not a page or region).

### 4. Leftovers on the canvas: hidden content, archives, placeholders (about 100 + 8 + 9 spots)
- **Hidden: Live has 87 hidden nodes** (`116:30`, `116:31`); **8 hidden Archive frames up to 25104x15891** (`114:9405`, `128:7317`, `128:8426`, `128:8859`, `128:9174`); hidden `Cut · old page contents` (`88:124`, `100:9889`, `100:4037`).
- **Placeholders never filled:** the Specimen template left on the canvas (`103:23641`); default Card text: "Card title" 49, "KICKER" 67, "Open" 67, "Learn more" 104, "Details" 74, "Short body." 21.
- **Why bad:** the file looks half-built; hidden frames still count for file size, search and selection.
- **Fix:** move to a collapsed Archive page; replace default text or delete the layer.
- **Lint:** hidden-in-master only. **New**: page-level hidden rule and a default-text rule (list of the strings above).

### 5. Hand-typed labels that duplicate Figma's own (about 121)
- Text like "600 SM", "Mobile · 400" typed beside things that already have a mode or a page name: `116:58`, `108:3903`, `114:9133`, `100:12152`. The Review tag ("Draft") is a real instance, but it sits on **every block (139 in 312 Review instances; Live 16, 2600 XL 43)**, so it says nothing.
- **Why bad:** the label goes stale when the mode changes, and it is a second source of truth.
- **Fix:** delete typed labels; show the mode in the layer name or let the Review tag appear only on what is not approved.
- **Lint:** a typed text matching a mode name or size outside Page previews. **New**: `typed-label`.

### 6. Frames named by size (about 440)
- `100:9684`, `100:9698`, `109:28`. You decided against resolution in layer names (it blocks swapping). Many follow a "Page · W x H (fixed: …)" habit.
- **Fix:** name by role; the mode carries the width.
- **Lint:** a number-by-number pattern in the name outside Page frames. Same `name-lies` rule.

### 7. Prose blocks on the canvas (about 80 over 220 characters)
- 2600 XL 20, AI 14, 1920 Desktop 11; an `Intro` frame on every size page: `100:10102`, `100:9891`, `100:9687`, `100:5866`, `100:4039`, `100:8280`.
- **Why bad:** reading text where you came to look at a design; it goes stale.
- **Fix:** move to the AI page or the repo docs; leave a one-line caption.
- **Lint:** line-length catches width only. **New**: a length rule.

### 8. Fixed x Fixed frames inside auto layout (about 360)
- Mostly intentional Page viewports; but 96 on Scale: `50:4245`, `50:4248`, `87:251`.
- **Lint:** child-drives and mode-mismatch cover part of it. Only the Scale ones are really wrong.

### 9. Raw values instead of tokens (concentrated)
- **Scale:** raw fill 44, raw gap 200. **Explore: Color permutations (2712 nodes):** raw fill 412, raw padding 412, raw gap 255 (`8:2`, `34:1573`, `34:1581`, `50:4077`). The size pages and Showcase are mostly clean.
- **Lint: yes** (raw-value, raw-fill). Fixing it is not worth it on Explore pages that will be archived.

### 10. Same-on-same fills (90 on 2600 XL, 12 on 1920 Desktop)
- White cards on white regions; light gray on light gray. From the 2026-11-16 lint run; not recounted here. **Lint: yes** (same-on-same).

### 11. Unstyled text (about 100)
- Concentrated in Explore pages (Drag playground 54, Sizing 10) and `Columns 1` (`101:12452`). No mixed styles; no Inter outside instances. **Lint: yes** (unstyled-text).

## Not found
No mixed text styles in one layer, and no Inter outside instances. The Button copy count (233) was not re-filtered from instance internals, so treat it as a ceiling.

## Next, cheapest first
1. Add the five **new** lint rules (`name-lies`, `empty-wrapper`, `master-census`, `typed-label`, page-level hidden and default-text) to [lint.js](./lint.js). They are read-only.
2. Archive Explore (7 pages) and the 8 hidden Archive frames: this removes most of patterns 4, 9 and 11 at once.
3. Rename the 171 fake Cards, then unwrap the 71 empty wrappers. These need a writer; one page at a time.
