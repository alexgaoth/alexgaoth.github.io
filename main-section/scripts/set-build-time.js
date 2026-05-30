// Cross-platform alternative to the Unix `$(date -u ...)` trick in package.json.
// Writes REACT_APP_BUILD_TIME to .env.production.local before `react-scripts build`.
const fs = require('fs');
const path = require('path');
const ts = new Date().toISOString();
fs.writeFileSync(
  path.join(__dirname, '..', '.env.production.local'),
  `REACT_APP_BUILD_TIME=${ts}\n`,
);
console.log(`[set-build-time] ${ts}`);
