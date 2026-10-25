import Popover from "/framework/ux/Popover/Popover.js";

/** The one way the Sessions pages open a menu from a button: a ux Popover that wears `sessions-pop` (framework/ai/sessions/sessions.css).
 *  The list header's range and Filters menus and the session page's Timeline filters all call it. `content` runs with the Popover as `this`
 *  (so it can `this.close()`); `cls` adds a size class such as `sessions-pop-filters`. */
export default class SessionPopover {
	static open(anchor, content, cls = ""){ return new Popover({ anchor: anchor.el, role: "dialog", content }).draw().ac("sessions-pop " + cls); }
}
