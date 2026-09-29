/**
 * track(Klass) — installs opt-in instance tracking on a class: `Klass.track(instance)`,
 * called once from that class's own constructor, remembers the instance;
 * `Klass.instances()` reads them all back, live.
 *
 *   import { track } from "../track/track.js";
 *   track(Widget);                              // once, at module scope
 *   class Widget { constructor(){ Widget.track(this); } }
 *   Widget.instances()                          // → every live Widget
 *
 * Not every class should do this — most never call `track()` at all, so most
 * classes pay nothing and show up nowhere. Opt in only where "see every one of
 * these" is actually useful (the owner, 2026-09-29).
 *
 * A WeakRef set, not a plain array: several classes in this framework build
 * throwaway instances that live for one render and are then dropped (a `Page`
 * built just to draw a preview, `Page.drew_content()`'s own copy). A plain
 * array would hold every one of those forever and the tracked list would only
 * grow. A `WeakRef` lets the instance go once nothing else holds it;
 * `instances()` drops the dead ones as it reads, so the list is always
 * "what's actually still alive" — never a leak, never stale.
 */
export function track(Klass){
	const refs = new Set();

	Klass.track = function(instance){
		refs.add(new WeakRef(instance));
		return instance;
	};

	Klass.instances = function(){
		const live = [];
		for (const ref of refs){
			const instance = ref.deref();
			instance ? live.push(instance) : refs.delete(ref);
		}
		return live;
	};

	return Klass;
}

export default track;
