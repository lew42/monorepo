## `GoogleButton.js`

`class GoogleButton extends View`: the Google sign-in button in Google's own branding (light or dark, three wordings). With a client id it loads Google Identity Services, lets Google draw the button and posts the ID token to `/api/auth/google`, the same call `/app/` makes. With none it is a mock that fires `signin` with a fake user and says so under the button. Test: `../../GoogleButton.test.mjs`.
