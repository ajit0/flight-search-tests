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

Allure report (results are written to `allure-results/` on every run):

```
npm run allure:generate    # builds allure-report/ from the last run
npm run allure:open        # opens it in the browser
```

The base url is set in `playwright.config.js` (`https://flights.booking.com`), can be changed with the `BASE_URL` env variable.
The url from the assignment (`https://www.booking.com/flights/index.en-gb.html`) redirects to `flights.booking.com`, so the tests use that host directly.
Example for another environment: `BASE_URL=https://staging.example.com npm test`

## Tests

`tests/searchByRouteAndDate.spec.js` - task 2a. Two tests for each date (today, tomorrow, next week, next month,
dates are in `test-data/searchData.js`):
- `results page shows DEL to BOM for <date>` - picks the date in the calendar, clicks Search and checks that the results
  page shows DEL, BOM, one way and the selected date, and that the url has the same values.
- `flight cards show DEL to BOM departing <date>` - checks the first flight cards show DEL, BOM and the selected date.
  Booking.com blocks the flights api for automated browsers, so these are skipped (see below).

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

While writing the tests I found Booking.com blocks some of its apis for automated browsers:

- airport autocomplete (`/api/autocomplete/`) returns 403 "Request blocked"
- flights list (`/api/flights/`) returns 403
- after many runs in a short time it shows a bot check page first (`chal_t=` in the url)

The rest (form, calendar, search button, results page) works fine. I didn't try to get around the blocking. Instead:
- the route is opened with the search url (same link the site builds after a search). Date selection and search are done in the ui.
- the flight cards tests run only when the flights api returns 200. Otherwise they are marked skipped with the
  reason ("flights api returned 403 ...") so the report doesn't show a pass for something that wasn't checked.
- the autocomplete test is skipped with a reason when the api returns 403.
- if the bot check page doesn't go away, the test is skipped. Wait a few minutes before running again.

Last run: 9 passed, 5 skipped (4 flight cards tests + autocomplete, all because of 403).

I didn't mock the flights api with `page.route()` because I never got a real 200 response to copy its format from,
and a made-up response would only test my own mock. In a real project I would ask for the test machines to be
whitelisted on a test environment, or save a real response and mock with it.
