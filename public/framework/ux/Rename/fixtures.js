/* The rules pass `rename_options()` falls back to when Servex's `/api/hitl` isn't up
 * or answers `ok:false` — plain, honest variations on the current title, never
 * pretending to be a clever rename assistant. The production site is static, so this
 * is what a real visitor actually sees. */
export function fixture_names(title){
	const base = title.trim();
	const words = base.split(/\s+/).filter(Boolean);

	// Five names, each visibly DIFFERENT from the title as typed — "keep current"
	// (drawn separately, above this list) is already the "no change" option, so
	// nothing here should read as a no-op pick.
	const swapped = words.length > 1 ? [words.at(-1), ...words.slice(0, -1)].join(" ") : base + " (alt)";
	const shorter = words.length > 1 ? words.slice(0, -1).join(" ") : base.slice(0, Math.ceil(base.length / 2));

	return [swapped, base + " — v2", "New: " + base, shorter, base.length > 24 ? base.slice(0, 24).trim() + "…" : base + " (short)"];
}
