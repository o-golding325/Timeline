// apply-filtered.cjs
// Backs up events.json -> events.backup.json, replaces events.json with events.filtered.json
// then parses the new events.json and prints the number of events.

const fs = require('fs');
const path = require('path');

const dir = __dirname; // src/data
const orig = path.join(dir, 'events.json');
const backup = path.join(dir, 'events.backup.json');
const filtered = path.join(dir, 'events.filtered.json');

try {
  if (!fs.existsSync(filtered)) {
    console.error('Filtered file not found:', filtered);
    process.exit(2);
  }

  if (fs.existsSync(orig)) {
    fs.copyFileSync(orig, backup);
    console.log('Backup created:', backup);
  } else {
    console.log('Original events.json not found, skipping backup.');
  }

  fs.copyFileSync(filtered, orig);
  console.log('Replaced', orig, 'with', filtered);

  const raw = fs.readFileSync(orig, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('Replaced file is not a JSON array');
    process.exit(3);
  }
  console.log('New events.json length:', data.length);
  process.exit(0);
} catch (err) {
  console.error('Error applying filtered file:', err.message);
  process.exit(1);
}
