// Script to deduplicate and clean events.json for global significance and formatting
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'events.json');
const outputPath = path.join(__dirname, 'events.deduped.json');

const events = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const seen = new Set();
const deduped = [];

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

for (const event of events) {
  // Use year+title+desc as a uniqueness key
  const key = `${event.year}-${normalize(event.title)}-${normalize(event.description)}`;
  if (!seen.has(key)) {
    // Only keep events with all required fields and global significance
    if (
      event.year && event.title && event.description && event.explanation &&
      event.title.length > 10 && event.description.length > 10 && event.explanation.length > 20
    ) {
      deduped.push(event);
      seen.add(key);
    }
  }
}

fs.writeFileSync(outputPath, JSON.stringify(deduped, null, 2));
console.log(`Deduplicated: ${deduped.length} events written to ${outputPath}`);