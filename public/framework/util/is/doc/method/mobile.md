A user-agent regex:
`/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Mobile/i.test(navigator.userAgent)`.

## Bites

Browser-only (reads `navigator`), and user-agent sniffing has been a losing
technique for a decade — browsers increasingly freeze or lie in the UA string
on purpose. A container query or `pointer: coarse` answers the layout
question this is usually reached for, without the sniff.

## Used by

Nothing today. See the readme's Decisions for the case to delete this one.
