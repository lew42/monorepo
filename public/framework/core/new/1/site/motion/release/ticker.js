/* Three things a page can start, and what each one does after you leave.
 *
 * Page.render() memoizes into `this.view`, so a page you have visited is never
 * torn down — Router takes its classes off and CSS hides it. Everything the page
 * started is therefore still started, and that is the correct default: it is what
 * makes going back instant and what keeps a half-typed <input> half-typed.
 *
 * It is also why deactivate() exists.
 */
export class Ticker {

	constructor(...args){
		this.assign(...args);
		this.intervals = 0;
		this.frames = 0;
	}

	assign(...args){ return Object.assign(this, ...args); }

	start(){
		if (this.running) return this;
		this.running = true;

		this.timer = setInterval(() => this.intervals++, 100);
		this.loop = () => { this.frames++; this.frame = requestAnimationFrame(this.loop); };
		this.frame = requestAnimationFrame(this.loop);

		return this;
	}

	stop(){
		if (!this.running) return this;
		this.running = false;

		clearInterval(this.timer);
		cancelAnimationFrame(this.frame);

		return this;
	}

	/* The CSS animation is the control in this experiment: the browser does not
	 * advance an animation on an element that is not rendered, so its clock stops
	 * on its own. A timer and a rAF loop have no idea the element went away. */
	read(){
		const css_ms = this.$motion_spinner.el.getAnimations()[0]?.currentTime ?? 0;

		return [
			`running                 ${this.running}`,
			`setInterval ticks       ${this.intervals}`,
			`requestAnimationFrame   ${this.frames}`,
			`css animation ms        ${Math.round(css_ms)}`,
		].join("\n");
	}
}
