/* Somewhere for a late failure to land.
 *
 * A page's view is memoized and merely hidden the moment you navigate, so an
 * error written into the page that started the work is delivered PERFECTLY
 * CORRECTLY to somewhere nobody is looking. That is the finding on
 * /forms/optimistic/, and this is the smallest honest answer to it: a surface
 * that outlives the page.
 *
 * Raw DOM, not an element factory, and that is deliberate. `div.c(…)`
 * auto-appends to View.captor, and this is called from a timer — long after the
 * captor moved on. Building the node by hand is the one place in this section
 * where not using the framework is the correct answer.
 *
 * In a real site this belongs to app chrome. It lives in my directory because
 * site/app.js is not mine to edit — and that is itself the finding: there is
 * currently nowhere for a late failure to go.
 */
export function notify(text, kind = ""){
	const toast = document.createElement("div");

	toast.className = ("forms-toast " + kind).trim();
	toast.textContent = text;
	toast.addEventListener("click", () => toast.remove());

	document.body.appendChild(toast);
	setTimeout(() => toast.remove(), 8000);

	return toast;
}

export default notify;
