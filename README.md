# speculation-rules-demo


## What this is

A plain HTML/CSS/JS multi-page site with two versions of the homepage:

- `with-speculation.html` — Speculation Rules enabled (`prerender` + `prefetch`)
- `without-speculation.html` — Control version, no speculation rules

Each article page includes a live **performance dashboard** powered by the Navigation Timing API. It shows TTFB, DOM Content Loaded, full page load time, and whether the current navigation was prerendered.

## How to run

You need to serve this over HTTP — the Speculation Rules API does not work on `file://` URLs.

**Option 1: npx serve**
```bash
npx serve .
```

**Option 2: Python**
```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in Chrome (or any Chromium-based browser).

## How to benchmark

1. Open `with-speculation.html` in Chrome
2. Open DevTools → Network → set throttling to **Fast 3G**
3. Open DevTools → Performance → set CPU to **4x slowdown**
4. Hover over an article card for ~300ms, then click
5. Check the perf dashboard on the article page — look for the **"⚡ Prerendered navigation"** badge
6. Compare with `without-speculation.html` — same steps, same articles

## What to look at

- `activationStart` offset in the perf dashboard — this is how much head start the browser got
- **Perceived Load** metric — this is `loadEventEnd - activationStart`, the number that actually matters for user experience
- Navigation Timing type badge — `prerender` vs `navigate`

## File structure

```
speculation-rules-demo/
├── index.html                  # redirects to with-speculation.html
├── with-speculation.html       # homepage WITH rules enabled
├── without-speculation.html    # homepage WITHOUT rules (control)
├── perf-logger.js              # Navigation Timing capture + dashboard render
├── styles.css                  # shared styles
└── articles/
    ├── article-1.html
    ├── article-2.html
    ├── article-3.html
    ├── article-4.html
    └── article-5.html
```

## Browser support

The Speculation Rules API is Chromium-only (Chrome, Edge, Opera). Firefox and Safari will ignore the `<script type="speculationrules">` block silently — nothing will break, speculation just won't happen.

## Notes

- Speculation rules with `eagerness: "moderate"` trigger on hover after ~200ms delay
- The browser may skip prerendering if device memory is low or data-saver is enabled
- Test on localhost for consistent results — CDN/server variability will add noise
