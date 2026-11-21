# Japan field guide

Open **index.html** in a browser to use the November 24–28, 2026 guide. The itinerary, hotel details, phrasebook and checklists run from the local files. Maps and official entry forms use the internet. Checklist progress belongs to the browser and device where you ticked it.

The guide uses the Japan trip workbook as its source. Its flight times are local to each airport. Hotel windows come from the bookings, while work visits, transfers and hobby stops can change. The guide is a snapshot and does not sync with Excel.

## Browser tests

With Node.js and npm installed, run:

```sh
npm ci
npx playwright install chromium
npm test
```

To use an existing Chrome installation, set `CHROME_PATH` to its executable. The application itself requires no installation or build.
