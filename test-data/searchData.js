const routes = {
  delToBom: {
    from: 'DEL',
    to: 'BOM',
    fromAirport: 'Delhi International Airport',
    toAirport: 'Chhatrapati Shivaji International Airport',
  },
};

// one test is created for each date
const travelDates = [
  { label: 'today', days: 0 },
  { label: 'tomorrow', days: 1 },
  { label: 'next week', days: 7 },
  { label: 'next month', days: 35 },
];

const messages = {
  missingDestination: 'Add arrival airport or city',
};

module.exports = { routes, travelDates, messages };
