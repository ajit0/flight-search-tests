# AKQA SQA take-away test

Part 1 (requirement evaluation) is in `part1-requirement-evaluation/`:
- `answers.md` - answers for a) to h)
- `test-cases.csv` - test cases with priority (can be imported into Google Sheets)

Part 2 - I picked Case 1: flight search on Booking.com (https://www.booking.com/flights/index.en-gb.html),
automated with Playwright and JavaScript, using page objects.

## Setup and run

Node 18 or newer.

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

The base url is set in `playwright.config.js` (`https://flights.booking.com`), can be changed with the `BASE_URL` env variable.

## Tests

`tests/searchByRouteAndDate.spec.js` - task 2a. Searches DEL to BOM for today, tomorrow, next week and next month
(dates are in `test-data/searchData.js`, one test per date). The test picks the date in the calendar, clicks Search
and checks that the results page shows DEL, BOM, one way and the selected date, and that the url has the same values.

`tests/searchForm.spec.js` - extra tests:
- swap button switches from and to
- past dates are disabled in the calendar
- empty destination shows "Add arrival airport or city" and search doesn't happen
- date picked on the home page is shown in the date field
- typing DEL shows airport suggestions

```
pages/        page objects (search form, results page)
tests/        specs
test-data/    route, dates, messages
utils/        date helpers
```

## Booking.com blocks some calls

While writing the tests I found Booking.com blocks some of its apis for automated browsers:

- airport autocomplete (`/api/autocomplete/`) returns 403 "Request blocked"
- flights list (`/api/flights/`) returns 403
- after many runs in a short time it shows a bot check page first (`chal_t=` in the url)

The rest (form, calendar, search button, results page) works fine. I didn't try to get around the blocking. Instead:
- the route is opened with the search url (same link the site builds after a search). Date selection and search are done in the ui.
- flight cards are checked only when the flights api returns 200. Otherwise the test adds a "blocked" note in the report.
- the autocomplete test is skipped with a reason when the api returns 403.
- if the bot check page doesn't go away, the test is skipped. Wait a few minutes before running again.

In a real project I would ask for the test machines to be whitelisted on a test environment, or mock these apis with `page.route()`.
