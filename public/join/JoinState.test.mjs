import { test } from "../framework/core/Test/Test.js";
import { JoinState } from "./JoinState.js";

test("JoinState derives the button state and strips secrets from shared links", t => {
	t.eq(JoinState.of({ user: null, in_app: false }), "google", "no user: google");
	t.eq(JoinState.of({ user: null, in_app: true }), "inapp", "no user in another app's browser: inapp");
	t.eq(JoinState.of({ user: {}, push: false, permission: "granted" }), "allow", "user without a subscription: allow");
	t.eq(JoinState.of({ user: {}, push: true, permission: "default" }), "allow", "subscription but no permission: allow");
	t.eq(JoinState.of({ user: {}, push: true, permission: "granted" }), "done", "user, subscription, permission: done");
	t.eq(JoinState.share_url("https://x.com/join/?test=KEY&debug=1&ref=a#top"), "https://x.com/join/?ref=a#top", "test and debug are dropped, the rest stays");
	t.eq(JoinState.share_url("https://x.com/join/?test=KEY"), "https://x.com/join/", "no empty ?");
});
