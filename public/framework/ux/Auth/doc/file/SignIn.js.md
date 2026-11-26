## `SignIn.js`

`class SignIn extends Auth`: the quick sign-in view. Google first (a `GoogleButton`), then Apple (a mock) and an email link; "Use a password instead" switches to `Auth`'s own login screen. It overrides only the seams `login()`, `social_button()` and `social()`.
