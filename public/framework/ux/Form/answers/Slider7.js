import Scale7 from "./Scale7.js";

// T10: the same -3 … +3 answer as one native range slider. Unanswered (null) until touched.
export default class Slider7 extends Scale7 {
	static type = "T10";
	static title = "Seven-point slider";
	static native = "<input type=range min=-3 max=3 step=1> + <datalist> ticks";
	static use = "one thumb drag, ticks visible";
	static input = "slider";
	static skip = false;
	static example = { label: "How was the intro? (as a slider)" };
}
