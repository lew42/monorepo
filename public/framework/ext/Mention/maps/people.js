/**
 * people — the `@` namespace: name → { url, icon }. `@owner` and `@mastermind`
 * stay plain text unless the name is in this map — same lookup as `refs.js`,
 * a different object. `@` never uses `refs.js`, and `#` never uses this one:
 * that split is the whole point (the owner, 2026-09-30: "`@` is kept for
 * users and agents").
 *
 * `owner` has no `url` — there's no page for the person reading this, so
 * `@owner` renders as an icon and the word, not a link. Mention.js's `item()`
 * call already handles that (no `href` given draws a `<div>` instead of an
 * `<a>`).
 *
 * The rest are agent ROLES, from `servex/doc/roles.md`'s own table — every
 * one points at the same page today because that table is the one place
 * they're each described; a role that earns its own page later just gets
 * its own `url` here.
 */
export default {

	owner: { icon: "person" },

	mastermind:       { url: "/framework/servex/md/doc/roles/", icon: "psychology" },
	"task-mastermind": { url: "/framework/servex/md/doc/roles/", icon: "workspaces" },
	minion:            { url: "/framework/servex/md/doc/roles/", icon: "engineering" },

	// The brief's own first-targets list said "smart-assistant"; the role
	// table names it "master assistant" — kept both keys pointing at the same
	// place rather than guess which one the owner will actually type.
	"master-assistant": { url: "/framework/servex/md/doc/roles/", icon: "support_agent" },
	"smart-assistant":  { url: "/framework/servex/md/doc/roles/", icon: "support_agent" },
	"fast-assistant":   { url: "/framework/servex/md/doc/roles/", icon: "bolt" },

	"card-assistant": { url: "/framework/servex/md/doc/roles/", icon: "chat_bubble" },
	"card-manager":   { url: "/framework/servex/md/doc/roles/", icon: "manage_accounts" },
	clarity:          { url: "/framework/servex/md/doc/roles/", icon: "lightbulb" },
};
