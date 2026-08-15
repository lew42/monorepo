import LocalStorageSaver from "../../ext/Saver/LocalStorageSaver.js";

const saver = new LocalStorageSaver({ key: "lew42-devbar" });
const html = document.documentElement;

export const MIN = 200;

/* The rail's persisted state — one document, one key, through ext/Saver, so a knob
 * flipped twice in a frame still writes once. Every piece of it is a class or a
 * custom property on <html>, which is why restoring is only writing them back and
 * nothing in the rail has to remember anything itself.
 *
 * ⚠ `restore()` settles on a MICROTASK, and microtasks drain before the first paint
 *   — so the rail comes back the way you left it with no flash, despite `load()`
 *   being a promise. Anything that needs the state must chain onto it. */
export const settings = { open: false, width: null, knobs: [], threads: {} };

export function set(values){
	Object.assign(settings, values);
	saver.save(settings);
	return settings;
}

export async function restore(){
	Object.assign(settings, await saver.load());
	html.classList.toggle("dev-open", !!settings.open);
	settings.knobs.forEach(cls => html.classList.add(cls));
	if (settings.width) rail(settings.width);
	return settings;
}

/* The one number the panel's width and the shell's reservation both read
 * (devbar.css), clamped so neither the rail nor the page can vanish.
 *
 * ⚠ `--rail-floor: 0` alongside it: `.app` otherwise stops its push above a 26rem
 *   reading column, and a "390" preset silently lands on 416. That floor guards a
 *   DEFAULT width against a small screen; a width you asked for needs no guarding. */
export function rail(px){
	const width = Math.round(Math.min(Math.max(px, MIN), innerWidth - MIN));
	html.style.setProperty("--dev-rail", width + "px");
	html.style.setProperty("--rail-floor", "0px");
	return width;
}

// A knob IS a class on <html> — this only adds remembering which are on.
export function knob(cls, on){
	html.classList.toggle(cls, on);
	const knobs = new Set(settings.knobs);
	on ? knobs.add(cls) : knobs.delete(cls);
	return set({ knobs: [...knobs] });
}

export default settings;
