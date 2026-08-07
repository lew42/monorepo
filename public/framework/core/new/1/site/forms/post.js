/* NOT a network call, and the pages say so out loud.
 *
 * Production is pure static hosting — there is no endpoint here and there never
 * will be. This is a promise and a setTimeout. A fake that pretended to be real
 * would be a lie in a teaching document, and every page that calls it prints
 * this fact next to the result.
 *
 * `ms` is generous on purpose: 900ms is long enough to click a nav link while
 * the "request" is still in flight, which is the whole point of /forms/optimistic/.
 */
export function post(data, { ms = 900, fail = false } = {}){
	return new Promise((resolve, reject) => setTimeout(
		() => fail ? reject(new Error("the server said no")) : resolve({ ok: true, data }),
		ms));
}

export default post;
