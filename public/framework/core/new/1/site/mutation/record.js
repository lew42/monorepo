/* ONE record, two urls, two views that are BOTH on screen.
 *
 * Not a store, not a context, not an observable. A plain object living on a
 * common ancestor Page — which is an ordinary object, alive for the session —
 * plus a list of views that asked to be told. That list is the whole addition,
 * and it exists for a reason the framework creates:
 *
 *   render() memoizes. A second view of the same record is built ONCE and would
 *   otherwise show the value it had at build time, forever.
 *
 * `activate()` covers "stale when you come BACK". It cannot cover this, because
 * a parent that claims `$pages` stays mounted while its child is the leaf — both
 * views are on screen and neither is being re-activated. That is not a
 * hypothetical layout; it is one line, and it is in this section.
 *
 * watch() returns its own unwatch, so a page releases in deactivate() exactly
 * the way /forms/guard/ releases its listener. A subscriber that outlives its
 * page is the leak this shape is prone to.
 */
export function record(fields){
	const watchers = new Set();
	const data = { ...fields };

	return {
		data,

		set(key, value){
			data[key] = value;
			watchers.forEach(fn => fn(data));
			return this;
		},

		watch(fn){
			watchers.add(fn);
			fn(data);                       // paint once, now, with what is true
			return () => watchers.delete(fn);
		},

		count(){ return watchers.size; },   // how many views are listening right now
	};
}

export default record;
