/* THE ONE PLACE A TIER BECOMES A MODEL ID.
 * A role is four things: skill + tier + effort + tools; this file is only the tier.
 * Moving a tier to another provider (e.g. OpenRouter) is a one-line change here. */
export const TIERS = {
	fast: { provider: "anthropic", model: "claude-sonnet-5" },
	// Task masterminds and card managers: Opus (the owner, 2026-09-25: "those need to be higher level models").
	manager: { provider: "anthropic", model: "claude-opus-5-5" },
	architect: { provider: "anthropic", model: "claude-opus-5-5" },
	scan: { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
	/* EXAMPLE, not wired to any role yet (Servex/ext/openrouter/readme.md): giving
	 * a role this tier instead of `scan` would send every one of its turns through
	 * OpenRouter at whatever the cheapest model there costs. `roles.js`'s
	 * `defaults()` copies a row's `provider` onto any role whose `tier` names it
	 * (review.md finding 5 — this field used to have no caller at all, and only
	 * worked by accident when the model also happened to contain a `/`), so the
	 * only thing stopping this today is "nobody has measured whether a cheap
	 * OpenRouter model finishes a scan as well as Haiku does" (the spike's job). */
	scan_openrouter: { provider: "openrouter", model: "deepseek/deepseek-v4.1-flash" }
};

export const model = tier => TIERS[tier]?.model ?? tier;
export const provider = tier => TIERS[tier]?.provider ?? "anthropic";
