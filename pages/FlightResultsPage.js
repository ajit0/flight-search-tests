class FlightResultsPage {
  constructor(page) {
    this.page = page;
    this.flightCards = page.locator('[data-testid="searchresults_card"]');
  }

  // call this before clicking Search, returns the status code of the flights api
  waitForFlightsApi() {
    return this.page
      .waitForResponse((res) => res.url().includes('/api/flights/'), { timeout: 30_000 })
      .then((res) => res.status());
  }

  urlParam(name) {
    return new URL(this.page.url()).searchParams.get(name);
  }
}

module.exports = { FlightResultsPage };
