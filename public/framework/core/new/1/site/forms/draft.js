/* sessionStorage, one key per form.
 *
 * Session, not local: a draft belongs to the tab you typed it in, and two tabs
 * open on the same form should not fight over one key. The cost is stated on
 * /forms/autosave/ rather than hidden — sessionStorage survives a reload and
 * dies with the tab, which is exactly the boundary beforeunload exists to cover.
 */
export function draft(key){
	const slot = "forms:" + key;

	return {
		read(){ return sessionStorage.getItem(slot) ?? ""; },
		write(text){ sessionStorage.setItem(slot, text); },
		clear(){ sessionStorage.removeItem(slot); },
	};
}

/* Restore on the way in, save on the way out of every keystroke.
 *
 * Debounced, because a write per keypress is a write per keypress; 300ms is
 * short enough that "I typed and then the power went out" is not a real story
 * and long enough that a fast typist writes once per word.
 *
 * Returns the control, so it chains onto field().
 */
export function autosave($control, key, saved){
	const store = draft(key);
	let timer;

	$control.el.value = store.read();

	return $control.on("input", () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			store.write($control.el.value);
			saved?.($control.el.value);
		}, 300);
	});
}
