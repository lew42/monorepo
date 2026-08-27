import { Page, md, code, h2, demo } from "/app.js";
import { LiveChart, series } from "../Chart.js";

export default new Page({
	meta: import.meta,
	title: "Live",
	description: "A chart with a timer in it, and the proof that the timer stops when you leave.",
	icon: "timeline",

	content(){

		demo(() => {
			new LiveChart({ data: series() });
		}, "A point every 500ms. **Click D3 in the sidebar, wait a while, and come back** — the two numbers below the chart are how many points were drawn and how many could have been.");

		md("A timer on a page you navigated away from is the classic third-party leak. **A page is never destroyed** — `render()` builds the view once and `deactivate()` only drops a class, so CSS takes the page off screen with everything in it still alive. Nothing looks wrong while a hidden chart burns a layout and a repaint twice a second, forever, once per chart.");

		h2("One line, because the event already arrived");

		code.js(`export class LiveChart extends Chart {

    resized(width){
        super.resized(width);
        width ? this.start() : this.stop();
    }

    start(){ this.timer ??= setInterval(() => this.tick(), 500); }

    stop(){
        clearInterval(this.timer);
        this.timer = null;
    }
}`);

		md("`display: none` reports a resize to 0×0, so the observer that sizes the chart is also the one that suspends it. No `activated()`, no `deactivated()`, nothing on the page at all — which is what makes this chart safe to drop into a tab panel or a `<details>` that the page itself knows nothing about.");

		h2("What the page hooks are still for");

		code.js(`activated(){ this.poll(); }
deactivated(){ this.stop(); }`);

		md("`activated()` and `deactivated()` fire on every navigation and are the right place for anything **not tied to a box**: a websocket, a polling fetch, an audio element. They just cannot help you here, because at the moment they run the page has no size yet.");

		md("Back to [D3](/alex/examples/d3/).");
	},
});
