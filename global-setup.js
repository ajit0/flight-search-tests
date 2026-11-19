const fs = require('fs');

// runs once before all tests - start with empty allure results so old runs don't mix into the report
module.exports = () => {
  fs.rmSync('allure-results', { recursive: true, force: true });
};
