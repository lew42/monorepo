# Concepts — what this page is made of, as icon tiles

A [Content](/framework/ux/Content/) module. Each concept is a child page (name, slug, icon), shown as a link tile. The first thing on a page.

## Use
`{"place": {"module": "/framework/ux/Content/Concepts/Concepts.js", "items": [{"name": "Servex", "slug": "servex", "icon": "dns"}]}}`
Sections, drawn as columns: `"sections": [{"title": "Run", "items": […]}]`.

## Watch out
- Make each child with the create_page tool, then place this. A tile with no page 404s.
- Not every concept has a picture: an item may omit `icon`.
- A tile links to the page's own ADDRESS (`this.page.url`), never to where its files live
  (`folder_url()`) — a card can be shown at a different address than its files' folder (AI 2),
  and a tile built from `folder_url()` 404s there (fixed 2026-09-28,
  [concept-links-fix](/framework/ai/2026-09-28/concept-links-fix/)).
