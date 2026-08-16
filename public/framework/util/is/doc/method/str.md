`typeof value === "string"`. An empty string is still a string —
`is.str("")` is `true`.

## Used by

`View.append()` (a bare string child, and the `url()` loader's meta check) and
`Page.class.js` (telling a space-separated `children` string from an array).
