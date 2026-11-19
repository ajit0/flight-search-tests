const routes = {
  delToBom: {
    from: 'DEL',
    to: 'BOM',
    fromAirport: 'Delhi International Airport',
    toAirport: 'Chhatrapati Shivaji International Airport',
  },
  sameAirport: { from: 'DEL', to: 'DEL' },
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
  sameAirports: "Origin and destination can't be the same",
};

module.exports = { routes, travelDates, messages };
