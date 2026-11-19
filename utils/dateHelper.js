// 0 = today, 1 = tomorrow ...
function daysFromToday(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

// 2026-11-19 (format used in the url and in the calendar)
function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Thu 19 Nov (format shown in the travel date field)
function toDisplayDate(date) {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  return `${weekday} ${date.getDate()} ${month}`;
}

module.exports = { daysFromToday, toIsoDate, toDisplayDate };
