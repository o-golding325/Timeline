// Script to check for duplicate or similar events in events.deduped.json
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'events.deduped.json');
const events = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const similar = [];
for (let i = 0; i < events.length; i++) {
  for (let j = i + 1; j < events.length; j++) {
    if (events[i].year === events[j].year) {
      const t1 = normalize(events[i].title);
      const t2 = normalize(events[j].title);
      if (t1 === t2 || t1.includes(t2) || t2.includes(t1)) {
        similar.push([events[i], events[j]]);
      }
    }
  }
}

if (similar.length) {
  console.log('Potential duplicate/similar events:');
  for (const [a, b] of similar) {
    console.log(`- ${a.year}: "${a.title}" <-> "${b.title}"`);
  }
} else {
  console.log('No similar events found.');
}