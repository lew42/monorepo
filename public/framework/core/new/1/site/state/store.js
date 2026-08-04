/* State two pages share when neither is the other's parent.
 *
 * A module is the honest home for it, and the reason is greppable: both pages
 * `import` this file, so the sharing is visible in both of them. The alternative
 * — hanging it on a common ancestor Page — is invisible from either end and
 * breaks the moment someone moves a page in the tree.
 *
 * Lifetime is the module registry: it survives every soft navigation and Back,
 * and dies on reload. Same as a Page instance — the difference is scope, not
 * survival.
 */

// A plain object, not a class. Nothing here needs identity or methods.
export const store = {
	picked: [],
};

export function pick(name){
	store.picked = store.picked.includes(name)
		? store.picked.filter(item => item !== name)
		: [...store.picked, name];

	return store.picked;
}
