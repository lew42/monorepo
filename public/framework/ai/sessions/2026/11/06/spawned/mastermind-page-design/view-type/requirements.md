# Item: the type registry builds any class (View first)

Card: /framework/ai/2026/11/06/item-the-type-registry-builds-any-class/ · Ask relayed by voice-app, 2026-11-06.

The owner's words (via voice-app): the type registry (Item.types via Item.register) must be able to instantiate ANY class, not just Items. Register the core View class in it, so {"type":"View","content":"Hello world"} works (tag defaults to div). A quick monkey-patch import in Item is fine for core classes; don't pre-register everything. Make content/list hydration and LivePage rendering handle a non-Item member: construct it with its data and append it as a view.

Test: /live/div-test/ has {"content":{"add":{"id":"hello-div","type":"View","content":"Hello world"}}}. After a reload it shows a div saying "Hello world".

Built (worktree pd-view-type, commit d60d2c37a):
- Item.js imports and registers View; register() tolerates a class with no define_fields.
- hydrate() keeps a non-Item type as a plain Item wearing its type (it saves the same line back).
- Item.foreign(item) builds the class from the item's data, appending `content`; PageContent (plain Page) and LivePage (Block, Focus) call it.
- Proof: headless, /live/div-test/ on the worktree draws `<div>Hello world</div>`; main shows none. Item.test.mjs has 3 new checks.
