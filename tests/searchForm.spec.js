const { test, expect } = require('@playwright/test');
const { FlightSearchPage } = require('../pages/FlightSearchPage');
const { routes, messages } = require('../test-data/searchData');
const { daysFromToday, toDisplayDate } = require('../utils/dateHelper');

const route = routes.delToBom;

test.describe('Search form', () => {
  let searchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new FlightSearchPage(page);
  });

  test('swap button switches from and to', async () => {
    await searchPage.openWithRoute(route, daysFromToday(7));
    await searchPage.swapRoute();

    await expect(searchPage.fromField).toContainText(route.to);
    await expect(searchPage.toField).toContainText(route.from);
  });

  test('past dates are disabled', async () => {
    const today = daysFromToday(0);
    const yesterday = daysFromToday(-1);
    test.skip(yesterday.getMonth() !== today.getMonth(), 'yesterday is not in the current month view');

    await searchPage.openWithRoute(route, daysFromToday(7));
    await searchPage.openCalendar();

    expect(await searchPage.isDayDisabled(yesterday)).toBe(true);
    expect(await searchPage.isDayDisabled(today)).toBe(false);
  });

  test('error when destination is empty', async ({ page }) => {
    await searchPage.openWithRoute(route, daysFromToday(7));
    const urlBefore = page.url();

    await searchPage.clearDestination();
    await searchPage.clickSearch();

    await expect(searchPage.destinationError).toHaveText(messages.missingDestination);
    await expect(searchPage.toField).toHaveAttribute('aria-invalid', 'true');
    expect(page.url()).toBe(urlBefore);
  });

  test('error when origin and destination are the same', async ({ page }) => {
    await searchPage.openWithRoute(routes.sameAirport, daysFromToday(7));
    const urlBefore = page.url();

    await searchPage.clickSearch();

    await expect(page.getByText(messages.sameAirports)).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('date picked on home page is shown in the date field', async () => {
    const date = daysFromToday(10);

    await searchPage.openHome();
    await searchPage.selectOneWay();
    await searchPage.selectDepartureDate(date);

    await expect(searchPage.dateField).toContainText(toDisplayDate(date));
  });

  test('typing DEL shows airport suggestions', async ({ page }) => {
    await searchPage.openHome();
    const autocompleteApi = page
      .waitForResponse((res) => res.url().includes('/api/autocomplete/'))
      .then((res) => res.status());

    await searchPage.typeOrigin(route.from);

    test.skip((await autocompleteApi) === 403, 'autocomplete api is blocked for automated browsers (403)');
    await expect(searchPage.suggestions.first()).toContainText(route.from);
  });
});
