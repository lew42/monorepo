# Page templates: pages as the building block, `class Template extends Page`, and property binding (mastermind brief)

**Owner (2026-10-12, dictated):** we keep building previews of UI, UX, sections, layouts and page templates. They are everywhere, each broken in its own way, and none is great. Instead: a **small set of robust layouts**, each wrapped as a page and reused.

## The owner's ideas (design questions; decide each, record the alternative)
1. **Name:** not `Layout` (unclear whether that is a view, a system or a widget). The lean is `class Template extends Page`.
2. **Render many:** a page has a `render` method, a light wrapper around a View. A template rendered several times needs a `views` array, and updates go to every view.
3. **Clone vs extend:**
   - You can extend a class but not an object.
   - `Object.create` or a `page.clone()` could fork an instance with some record keeping.
   - Watch the linkage: events turned on and off between linked objects can make things update when they shouldn't, or not when they should.
4. **Data binding when you use a template:**
   - A template mocked up with filler text must be rewired to real data.
   - Idea: `clone({ title: "x", cost: someProperty })` takes a plain object mapping property names to either a static value or a **Property** object.
   - A Property object binds live, so streaming updates re-render automatically.
5. **A `Property` class** (the owner built one before): each property is its own object, extending the events class, with get/set passing values to sub-objects.
   - Compare it with `Item`'s events: is it more object-oriented, and does it fix event trouble we have had?
   - It can be passed as the value of any renderable field: text, number or instance.
   - The owner does not want a major restructuring now. Recommend, prototype small, and measure.

## Done when (tick each with proof)
- [ ] **Past work first:** use the `past-work` skill (being built in [past-work-skill](../past-work-skill/requirements.md); until it lands, a Haiku minion under 60k does the same). Cover page templates, layouts, Item/events, any old Property class, `core/Page/parts/`, `content.md`, `ai-api.md`. Write `past-work.md` here.
- [ ] **Investigate → `plan.md`:** how Page, View and Item render and bind today, and the decisions above with a recommendation each.
- [ ] **Architecture page** at `core/Page/doc/templates.md`: classes, what extends what, the binding flow. Show it on the Page docs.
- [ ] **Smallest slice:**
  - one `Template` (pick the Figma palette page's big white card layout, which the owner liked);
  - rendered twice with different data, one field bound to a live Property;
  - a demo page with the rendered view next to a debug view of the instance.
- [ ] Screenshots at 400/1200/1920/3440; smoke clean; commit each step; merge.

**Coordinate with:**
- @mastermind-data-grid, on whether table/rail is a Template setting;
- @mastermind-style-system, on the card word and colour schemes;
- [layout-catalog](../layout-catalog/requirements.md), on which layouts become templates.

Opus 5.5 for design, Sonnet to build. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open: keep going through all of it.
