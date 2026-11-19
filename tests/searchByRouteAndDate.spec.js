const { test, expect } = require('@playwright/test');
const { FlightSearchPage } = require('../pages/FlightSearchPage');
const { FlightResultsPage } = require('../pages/FlightResultsPage');
const { routes, travelDates } = require('../test-data/searchData');
const { daysFromToday, toIsoDate, toDisplayDate, toShortDate } = require('../utils/dateHelper');

const route = routes.delToBom;

test.describe('Search DEL to BOM by date', () => {
  let searchPage;
  let resultsPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new FlightSearchPage(page);
    resultsPage = new FlightResultsPage(page);
  });

  for (const { label, days } of travelDates) {
    test(`results page shows DEL to BOM for ${label}`, async ({ page }) => {
      const date = daysFromToday(days);

      await test.step('select date and search', async () => {
        // open with a different date first, so the test really changes it
        await searchPage.openWithRoute(route, daysFromToday(days + 3));
        await searchPage.selectDepartureDate(date);
        await searchPage.clickSearch();
        await page.waitForURL(new RegExp(`depart=${toIsoDate(date)}`));
      });

      await test.step('check route and date on results page', async () => {
        await expect(searchPage.fromField).toContainText(`${route.from} ${route.fromAirport}`);
        await expect(searchPage.toField).toContainText(`${route.to} ${route.toAirport}`);
        await expect(searchPage.oneWayRadio).toBeChecked();
        await expect(searchPage.dateField).toContainText(toDisplayDate(date));

        expect(resultsPage.urlParam('from')).toBe(`${route.from}.AIRPORT`);
        expect(resultsPage.urlParam('to')).toBe(`${route.to}.AIRPORT`);
        expect(resultsPage.urlParam('depart')).toBe(toIsoDate(date));
      });
    });

    test(`flight cards show DEL to BOM departing ${label}`, async () => {
      const date = daysFromToday(days);

      await searchPage.openWithRoute(route, date);
      const flightsApi = resultsPage.waitForFlightsApi();
      await searchPage.clickSearch();
      const apiStatus = await flightsApi;

      // booking.com blocks the flights api for automated browsers (403).
      // Without flights there is nothing to check, so mark it skipped instead of passed.
      test.skip(apiStatus !== 200, `flights api returned ${apiStatus} (blocked by Booking.com), cards not checked`);

      await expect(resultsPage.flightCards.first()).toBeVisible();
      for (const card of (await resultsPage.flightCards.all()).slice(0, 5)) {
        await expect(card).toContainText(route.from);
        await expect(card).toContainText(route.to);
        await expect(card).toContainText(toShortDate(date));
      }
    });
  }
});
