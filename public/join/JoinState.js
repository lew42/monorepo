/**
 * JoinState: the page's two pure decisions, kept out of Join.js so node can test them (Join.js needs a DOM).
 *
 *   JoinState.of({ user, in_app, push, permission })   // "google" | "inapp" | "allow" | "done"
 *   JoinState.share_url(location.href)                 // the page's url without ?test= and ?debug=
 */
export class JoinState {

	static of({ user, in_app, push, permission }){
		return !user ? (in_app ? "inapp" : "google") : push && permission === "granted" ? "done" : "allow";
	}

	static share_url(href){
		const url = new URL(href);
		url.searchParams.delete("test");
		url.searchParams.delete("debug");
		return url.href;
	}
}

export default JoinState;
