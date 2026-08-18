import { View, div, span } from "/app.js";
import { locate } from "./address.js";

View.stylesheet(import.meta, "DesignTool.css");

/* Where the finding is. `aim($view, find)` makes any view point at an element:
   hover rings it, a click keeps the ring and scrolls it into view, a second click
   lets go. The report says what is wrong; this is the only thing that says where.

   ⚠ An overlay box, never a style on the element itself. The page under a ring is
   the page being measured, and anything written onto it is one more thing the next
   analysis reads back. */
export function aim($view, find, label){
	return $view.ac("dt-aim")
		.on("pointerenter", () => hover(find(), label))
		.on("pointerleave", () => hover(null))
		.on("click", () => hold($view, find(), label));
}

export { locate };

/* Point a view at a FINDING — the one door all three report surfaces use, because
   deciding whether to offer a ring is the same decision three times. `spot` is the
   exemplar a roll-up carries (`path` and `sel` stay on the container, where the fix
   goes); a finding is its own address when it has none. Record: readme.md.

   ⚠ Nothing to ring is an answer. An empty path resolves to the analysis ROOT
   (address.js), so `dead-space` and `invisible` rang the entire viewport — the view
   comes straight back instead, with no affordance promising a location. */
export function point($view, root, i){
	const at = i.spot ?? i;
	return at.path && locate(root, at.path) ? aim($view, () => locate(root, at.path), at.sel) : $view;
}

let $spot, $tag, $held, held, over, frame;

const hover = (el, label) => { over = el; draw(label); };

/* ⚠ Below 34em the rail docks along the BOTTOM of the window (devbar.css), so an
   element scrolled to the centre lands under it. */
const SHEET = matchMedia("(width < 34em)");

function hold($view, el, label){
	const same = $held === $view;
	$held?.rc("dt-aimed");
	$held = same ? null : $view.ac("dt-aimed");
	held = same ? null : el;

	if (held) held.scrollIntoView({
		block: SHEET.matches ? "start" : "center", inline: "nearest", behavior: "smooth" });
	draw(label);
}

export function clear(){
	$held?.rc("dt-aimed");
	$held = held = over = null;
	draw();
}

/* One box, tracked per frame — so it follows a smooth scroll, a drag of the rail and
   a panel resize with no listener for any of them, and lets go by itself the moment
   its element leaves the document. */
function draw(label){
	cancelAnimationFrame(frame);

	const el = held ?? over;
	if (!el) return void $spot?.rc("on");

	spot().ac("on");
	let was;

	frame = requestAnimationFrame(function follow(){
		if (!el.isConnected) return clear();

		const box = el.getBoundingClientRect();

		/* ⚠ A TARGET OUTSIDE THE WINDOW RINGS NOTHING AT ALL — the box is
		   `position: fixed`, so it is drawn off-screen and hover, the gesture the row
		   invites, produces no feedback. Pinned to the near edge as a bar instead. */
		const off = box.bottom < 0 ? "up" : box.top > innerHeight ? "down" : "";
		const s = $spot.el.style;

		s.left = `${box.left}px`;
		s.width = `${box.width}px`;
		s.top = off === "down" ? `${innerHeight - EDGE}px` : off ? "0px" : `${box.top}px`;
		s.height = off ? `${EDGE}px` : `${box.height}px`;

		if (off !== was){
			was = off;
			$spot.rc("dt-up dt-down").ac(off && `dt-${off}`);
			$tag.text(`${ARROW[off] ?? ""}${label ?? ""}`);
		}

		frame = requestAnimationFrame(follow);
	});
}

const EDGE = 3;
const ARROW = { up: "↑ ", down: "↓ " };

/* ⚠ On <body> and marked ignorable: mounted inside `.app` it would be measured by
   the very analysis it is reporting on. */
const spot = () => $spot ??= div.c("dt-spot")
	.attr("data-layout-ignore", "")
	.append(() => { $tag = span.c("dt-spot-tag"); })
	.append_to(View.body());

export default aim;
