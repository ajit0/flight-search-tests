const { test, expect } = require('@playwright/test');
const { toIsoDate } = require('../utils/dateHelper');

// Search form - same form on the flights home page and on the results page
class FlightSearchPage {
  constructor(page) {
    this.page = page;

    this.oneWayOption = page.locator('[data-ui-name="search_type_oneway"]');
    this.oneWayRadio = page.locator('[data-ui-name="input_search_type_oneway"]');

    this.fromField = page.locator('[data-ui-name="input_location_from_segment_0"]');
    this.toField = page.locator('[data-ui-name="input_location_to_segment_0"]');
    this.swapButton = page.getByRole('button', { name: /switch origin/i });
    this.locationInput = page.locator('[data-ui-name="input_text_autocomplete"]');
    this.suggestions = page.getByRole('option');
    // same id is rendered twice on the page, so take the first one
    this.destinationError = page.locator('#location_input_to_0_error').first();

    this.dateField = page.locator('[data-ui-name="button_date_segment_0"]');
    this.calendar = page.locator('[data-ui-name="calendar_body"]');
    this.nextMonth = page.getByRole('button', { name: 'Next month' });
    this.prevMonth = page.getByRole('button', { name: 'Previous month' });

    this.searchButton = page.locator('[data-ui-name="button_search_submit"]');
  }

  async openHome() {
    await this.page.goto('/?locale=en-gb');
    await this.waitForForm();
  }

  // Typing an airport doesn't work in automation (autocomplete api gives 403),
  // so the route is set through the search url - same link the site creates itself.
  async openWithRoute({ from, to }, date) {
    const query = new URLSearchParams({
      type: 'ONEWAY',
      adults: '1',
      cabinClass: 'ECONOMY',
      from: `${from}.AIRPORT`,
      to: `${to}.AIRPORT`,
      depart: toIsoDate(date),
      locale: 'en-gb',
    });
    await this.page.goto(`/flights/${from}.AIRPORT-${to}.AIRPORT/?${query}`);
    await this.waitForForm();
    await expect(this.fromField).toContainText(from);
    await expect(this.toField).toContainText(to);
  }

  async waitForForm() {
    try {
      await this.searchButton.waitFor({ timeout: 45_000 });
    } catch (err) {
      // chal_t in the url means booking.com is showing its bot check page
      test.skip(this.page.url().includes('chal_t='), 'Blocked by Booking.com bot check');
      throw err;
    }
  }

  // Right after load the form sometimes ignores clicks (page js not ready yet).
  // Do the action, check it worked, try again if not.
  async retryUntil(action, check) {
    await expect(async () => {
      await action();
      await check();
    }).toPass({ timeout: 20_000 });
  }

  async selectOneWay() {
    await this.retryUntil(
      () => this.oneWayOption.click(),
      async () => {
        await expect(this.oneWayRadio).toBeChecked({ timeout: 2000 });
        // label changes to "Travel date" only after the page really switched to one way
        await expect(this.dateField).not.toContainText('Travel dates', { timeout: 2000 });
      },
    );
  }

  async openCalendar() {
    await this.retryUntil(
      async () => {
        if (!(await this.calendar.isVisible())) await this.dateField.click();
      },
      () => expect(this.calendar).toBeVisible({ timeout: 2000 }),
    );
  }

  calendarDay(date) {
    return this.calendar.locator(`[data-date="${toIsoDate(date)}"]`);
  }

  async selectDepartureDate(date) {
    await this.openCalendar();
    const day = this.calendarDay(date);

    // move back or forward until the month with our date is shown
    for (let i = 0; i < 12 && !(await day.isVisible()); i++) {
      const firstDay = await this.calendar.locator('[data-date]').first().getAttribute('data-date');
      if (toIsoDate(date) < firstDay) {
        await this.prevMonth.click();
      } else {
        await this.nextMonth.click();
      }
    }

    await day.click();
    await this.calendar.waitFor({ state: 'hidden' });
  }

  async isDayDisabled(date) {
    return (await this.calendarDay(date).getAttribute('aria-disabled')) === 'true';
  }

  async clickSearch() {
    await this.searchButton.click();
  }

  async swapRoute() {
    const before = await this.fromField.innerText();
    await this.retryUntil(
      async () => {
        if ((await this.fromField.innerText()) === before) await this.swapButton.click();
      },
      () => expect(this.fromField).not.toHaveText(before, { timeout: 2000 }),
    );
  }

  async openLocation(field) {
    await this.retryUntil(
      async () => {
        if (!(await this.locationInput.isVisible())) await field.click();
      },
      () => expect(this.locationInput).toBeVisible({ timeout: 2000 }),
    );
  }

  async clearDestination() {
    await this.openLocation(this.toField);
    await this.locationInput.press('Backspace');
    await this.page.keyboard.press('Escape');
  }

  async typeOrigin(text) {
    await this.openLocation(this.fromField);
    await this.locationInput.press('Backspace');
    await this.locationInput.pressSequentially(text, { delay: 100 });
  }
}

module.exports = { FlightSearchPage };
