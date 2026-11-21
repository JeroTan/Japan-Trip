# Japan field guide

Open **index.html** in a browser for the November 24–28, 2026 guide, or visit [the GitHub Pages site](https://jerotan.github.io/Japan-Trip/). The itinerary, hotel details, phrasebook and checklists run from the local files. Maps and official entry forms use the internet. Checklist progress belongs to the browser and device where you ticked it.

The guide uses the Japan trip workbook as its source. Its flight times are local to each airport. Hotel windows come from the bookings, while work visits, transfers and hobby stops can change. The guide is a snapshot and does not sync with Excel.

## Editing the guide

Edit the overview in `index.html`, the five dated itineraries in `day24.html` through `day28.html`, and the travel tools in `transport.html`, `phrases.html` and `checklist.html`. Each page contains its own travel information. Route maps show Google directions directly in the page. JavaScript handles controls, phrase search and checklist progress.

Pushing to `main` publishes the HTML, styles, scripts and assets to GitHub Pages. Every page includes a static `noindex` robots directive. The site and repository are public.

## Browser tests

With Node.js and npm installed, run:

```sh
npm ci
npx playwright install chromium
npm test
```

To use an existing Chrome installation, set `CHROME_PATH` to its executable. The application itself requires no installation or build.
