# AKQA SQA take-away test

Part 1 (requirement evaluation) is in `part1-requirement-evaluation/`:
- `answers.md` - answers for a) to h)
- `test-cases.csv` - test cases with priority (can be imported into Google Sheets)

Part 2 - I picked Case 1: flight search on Booking.com (https://www.booking.com/flights/index.en-gb.html),
automated with Playwright and JavaScript, using page objects.

## Setup and run

Node 20 or newer.

```
npm install
npx playwright install chromium
npm test
```

Some other ways to run:

```
npx playwright test tests/searchForm.spec.js     # one file
npx playwright test -g "tomorrow"                # tests with "tomorrow" in the name
npx playwright test --headed                     # see the browser
npx playwright test --debug                      # step through with the inspector
npx playwright test --ui                         # ui mode
npm run report                                   # html report of the last run
```

Allure report (`allure-results/` is cleared at the start of every run):

```
npm run allure:generate    # builds allure-report/ from the last run
npm run allure:open        # opens it in the browser
```

Base url is `https://flights.booking.com` (the assignment link redirects there). To run against another environment:
`BASE_URL=https://staging.example.com npm test`

## Tests

`tests/searchByRouteAndDate.spec.js` - task 2a. Two tests for each date (today, tomorrow, next week, next month):
- results page - picks the date in the calendar, clicks Search, checks DEL, BOM, one way and the date on the
  results page and in the url
- flight cards - checks the first cards show DEL, BOM and the date. Skipped for now, see below.

`tests/searchForm.spec.js` - extra tests:
- swap button switches from and to
- past dates are disabled in the calendar
- empty destination shows "Add arrival airport or city" and search doesn't happen
- same origin and destination shows "Origin and destination can't be the same" (TC10)
- date picked on the home page is shown in the date field
- typing DEL shows airport suggestions

```
pages/        page objects (search form, results page)
tests/        specs
test-data/    route, dates, messages
utils/        date helpers
```

## Booking.com blocks some calls

Booking.com blocks some of its apis for automated browsers:

- airport autocomplete (`/api/autocomplete/`) - 403 "Request blocked"
- flights list (`/api/flights/`) - 403
- after many runs in a short time - bot check page (`chal_t=` in the url)

Form, calendar, search button and results page work fine. I didn't try to get around the blocking:
- the route is opened with the search url (same link the site builds). Date and Search are done in the ui.
- flight cards tests and the autocomplete test are skipped with the reason when the api gives 403,
  so the report doesn't show a pass for something that wasn't checked
- if the bot check page doesn't go away, the test is skipped. Wait a few minutes and run again.

Last run: 9 passed, 5 skipped (all 5 because of 403).

I didn't mock the flights api with `page.route()` because I never got a real response to copy the format from.
In a real project I'd ask for the test machines to be whitelisted on a test environment, or mock with a saved real response.
