# Two-column layouts page (2026-10-13)

Figma file `QYN0G2URSBHYH5I06MOjxU`, page **`Layouts · Two columns`** (`213:24357`), root frame `213:24358`, Notes box `214:29047`, rows in frame `213:24367`. Brief: [brief-two-col.md](brief-two-col.md).

## Built
- 15 variants (rows 01 to 15), each at 390, 768, 1200, 1920 and 3440: 50/50, 60/40, 40/60, text + image (inset), text + image (bleed), text + texture, text + big icon, card on a ground with the other side open, both sides cards, dark | light halves, light | gray halves with a nested card, sticky rail + long content, form + explainer, big number + text on near-black, dark card nested in light.
- Each row has a caption under its title: what goes on each side and why that ground. Each sample is a `Ground` instance (`177:1312`) with Resolution Mobile / Default / Mega by width; buttons and inputs are kit instances.
- Images reused from the file (Video · Storyboard); none generated. Texture is a stripe gradient made on the page.
- Linked from `Claude · Overview`, design-system card (`214:29064`, after 4.1). Nav row on the page links Overview, 4.1, 4.
- Verdict (Notes box): keep 04 + 05, 08, 10 or 11, 12, 13, 14.

## Not done / caveats
- No kit component was changed. Rows are built from frames so each width can show its own stacking; `Layout / Two columns` and `Split` are not instanced.
- Value no token gives: a hairline outline (black 10%) on every sample so gray-on-gray grounds show.
- Still looks off: row 11's gray half is the same gray as the page, so only the hairline separates it; the 3440 rows are mostly air by design.
- Nothing waits on the owner.
