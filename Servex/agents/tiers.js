/* THE ONE PLACE A TIER BECOMES A MODEL ID.
 * A role is four things: skill + tier + effort + tools; this file is only the tier.
 * Moving a tier to another provider (e.g. OpenRouter) is a one-line change here. */
export const TIERS = {
	fast: { provider: "anthropic", model: "claude-sonnet-5" },
	// Task masterminds and card managers: Opus (the owner, 2026-09-25: "those need to be higher level models").
	manager: { provider: "anthropic", model: "claude-opus-5-5" },
	architect: { provider: "anthropic", model: "claude-opus-5-5" },
	scan: { provider: "anthropic", model: "claude-haiku-4-5-20251001" }
};

export const model = tier => TIERS[tier]?.model ?? tier;
