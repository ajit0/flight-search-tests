# Part 1 - Requirement evaluation

Requirement: "The website users should be able to get the flights of a given flight route by a given date."

The test cases are in test-cases.csv (same as the "Test cases" tab in the Google Sheet).


## a) Questions I would ask

The requirement is short, so before testing I'd want to clear up these with the PO:

About the search itself
- Is this only one way, or round trip and multi-city too? The screenshot shows one way selected.
- Is it for guests and logged-in users both? Do they see the same results?
- Domestic only or international as well?

About the route
- Can the user type an airport code (DEL), a city name (Delhi), or both?
- What about cities with more than one airport, like London? Do we show all airports?
- Can from and to be the same? If not, what message do we show?
- Can the user select more than one airport in one field?

About the date
- Earliest date is today, I assume. What's the latest date we allow?
- "Today" based on which time zone - the user's or the departure airport's? For example, a user in London searching Delhi flights late at night is already on the next day in Delhi.
- Should flights that already left today still show up?
- Are flexible dates (+/- 3 days) part of this?

About the results
- What must each flight show? Airline, times, duration, stops, price, baggage?
- Default sorting? Any filters needed now?
- Direct flights only, or connecting flights too?
- What should the user see if there are no flights, or if the flight provider is down?

Non-functional
- How fast should results load?
- Which browsers and devices do we support? Is mobile in scope?
- Any accessibility requirements?
- Where does the flight data come from, and do we have a test environment with stable data?


## b) MVP

For me the MVP is the smallest version a real user can actually use to find a flight:

- One way trip, 1 adult, economy
- From and to with airport code or city name, with suggestions while typing
- One travel date, from today up to the allowed limit
- Results list with airline, departure and arrival time, duration, stops and price
- Clear error if a field is empty or wrong, and a clear message when there are no flights
- Works on the main browsers and on mobile

Things I'd leave for later: round trip and multi-city, more passengers and cabin classes, flexible dates, filters and sorting, price alerts, map search.

So the MVP is done when a user can search DEL to BOM for any allowed date and gets the right flights for that route and date, in an acceptable time.


## c) Improving collaboration between tester and PO

- Bring QA in early, during refinement and not after development. Most of the questions in (a) are cheaper to answer before any code is written.
- Do short "three amigos" sessions (PO, developer, tester) for each story and agree on examples and edge cases together.
- Write the acceptance criteria together, so they work as the spec and as the base for test cases.
- Agree on a Definition of Ready (no story in the sprint without acceptance criteria) and a Definition of Done (no story done without tests passing).
- Show the PO working builds during the sprint, not only at the demo, and share test results and the automation report regularly.
- Agree with the PO up front which failures block a release (wrong date, wrong route) and which can wait. Then release decisions are quick.
- Write decisions into the story (Jira or Confluence) and not only in chat, so nothing gets lost.


## d) User story and acceptance criteria format

I like the usual user story format with Given / When / Then for the acceptance criteria. The PO can read it easily, there's less room for misunderstanding, and each scenario maps directly to a test.

User story:
As a traveller, I want to search flights for a route on a specific date, so that I can pick a flight that fits my plans.

Acceptance criteria:

```
Scenario: Search one way flights for a date
  Given I am on the flight search page
  And I select "One way"
  When I search flights from "DEL" to "BOM" on "tomorrow"
  Then I see flights from "DEL" to "BOM"
  And every flight departs on "tomorrow"
  And the search form still shows "DEL", "BOM" and "tomorrow"

Scenario: Past dates can't be selected
  Given I am on the flight search page
  When I open the date picker
  Then all dates before today are disabled

Scenario: Destination is required
  Given I selected "DEL" as origin
  And the destination is empty
  When I click "Search"
  Then I see the error "Add arrival airport or city"
  And no search is started

Scenario Outline: Search for different dates
  When I search flights from "DEL" to "BOM" on "<date>"
  Then every flight departs on "<date>"
  Examples:
    | date      |
    | today     |
    | tomorrow  |
    | next week |
```

How I'd work with the PO on it: the PO owns the "why" and the business rules, and I help turn them into concrete examples, especially the edge cases (time zones, last bookable date, no results). We go through the criteria together in refinement, the PO signs them off before the sprint, and at the end the PO accepts the story against the same criteria.


## e) Test cases and assumptions

Assumptions I made:
1. The MVP is one way, 1 adult, economy (like in the screenshot).
2. "Today" is based on the user's local time zone.
3. Dates from today up to around 11 months ahead can be picked. Past dates can't.
4. From and to are both required and must be different.
5. The user can type an airport code or a city and pick from suggestions.
6. "Flights on a given date" means flights departing on that date (local time of the departure airport).
7. Each result shows at least airline, times, duration, stops and price.
8. Flight data comes from a third-party provider, so availability and prices change all the time. Tests shouldn't depend on a fixed number of flights or fixed prices.

I wrote 24 test cases, covering the main search, results, date picker, validation, autocomplete and some non-functional checks. They're all in test-cases.csv with steps, expected results and priority. The most important ones:

- TC01 / TC02 - search DEL to BOM for today and tomorrow
- TC04 - results only show the selected route
- TC03 - date in a later month (calendar has to move)
- TC05 - route and date are kept on the results page and in the url
- TC06 - past dates are disabled
- TC08 / TC09 - empty destination or origin shows an error
- TC12 - suggestions when typing "DEL"


## f) Priorities

The question I ask for each test is: how bad is it for the user and the business if this fails, and is there a workaround?

- Showstopper - the core of the feature is broken, or the user could book the wrong flight. Release is blocked. Example: TC01, TC02 (search for today/tomorrow doesn't work) and TC04 (wrong route shown). A wrong date or route means a wrong booking, which costs money, trust and support calls.
- High - an important part of the flow is broken or misleading, but there may be a workaround. Should be fixed before release. Example: TC03 (next month dates), TC05 (date lost on results page), TC06 (past dates selectable), TC08/TC09 (no validation), TC12 (no suggestions), TC16, TC17, TC20, TC21.
- Normal - a secondary feature or edge case fails, the user can still do the main task. Fix in a normal sprint. Example: TC11 (swap button - the user can still enter the route by hand), TC07, TC10, TC13-TC15, TC18, TC19, TC22, TC23.
- Low - cosmetic, no impact on the actual result. Example: TC24 (date format in another language).

The reason for each test case is also in the "Why this priority" column of the CSV.


## g) Types of testing

- Functional testing - search by route and date, results, form behaviour
- Smoke / sanity - TC01 and TC02 after every deployment
- Regression - the automated suite on every build or nightly
- Negative and boundary testing - empty fields, same airports, past dates, last bookable date, "today" late at night
- API / integration testing - the autocomplete and flight search APIs return correct data, the UI shows it correctly, and errors (provider down, timeouts) are handled
- Data validation - flight dates, times and time zones match the provider data
- Cross-browser and cross-device - Chrome, Safari, Firefox, Edge, desktop and mobile
- Accessibility - keyboard use, screen reader labels, contrast (WCAG 2.1 AA)
- Performance / load - how fast results load, how the search behaves with many users
- Security - input handling in the airport field (XSS), rate limiting / bot protection
- Localisation - date formats, languages, currencies
- Exploratory / usability - is the flow easy and clear for a real user
- UAT - PO and business sign-off against the acceptance criteria


## h) Exit criteria

I'd consider testing for this requirement done when:

1. All planned test cases have been run, or skipped with a reason the PO agreed to.
2. All Showstopper and High test cases pass.
3. There are no open Showstopper or High bugs. Normal and Low bugs are logged, and the PO is fine releasing with them.
4. All acceptance criteria are met and the PO has accepted the story.
5. The automated smoke and regression suite is green for the release build.
6. Non-functional targets are met (load time, supported browsers and devices, no critical accessibility issues).
7. A short test summary is shared with what was tested, the results, and any open risks.
