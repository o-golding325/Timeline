// Script to check for duplicates before adding new events to events.json
// Usage: node add-event.cjs '{"year": "2024", "title": "Sample Event", ...}'
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'events.json');
const events = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isDuplicate(newEvent, events) {
  const key = `${newEvent.year}-${normalize(newEvent.title)}-${normalize(newEvent.description)}`;
  for (const event of events) {
    const existingKey = `${event.year}-${normalize(event.title)}-${normalize(event.description)}`;
    if (key === existingKey) return true;
  }
  return false;
}


// Read new event from command line argument or file
let newEvent = null;
if (process.argv.length < 3) {
  console.error('Usage: node add-event.cjs "{...event json...}" OR node add-event.cjs --file event.json');
  process.exit(1);
} 

if (process.argv[2] === '--file' && process.argv[3]) {
  try {
    const fileContent = fs.readFileSync(process.argv[3], 'utf8');
    newEvent = JSON.parse(fileContent);
  } catch (e) {
    console.error('Invalid or unreadable event file.');
    process.exit(1);
  }
} else {
  try {
    newEvent = JSON.parse(process.argv[2]);
  } catch (e) {
    console.error('Invalid event JSON.');
    process.exit(1);
  }
}

if (isDuplicate(newEvent, events)) {
  console.log('Duplicate event detected. Not adding.');
  process.exit(0);
}

// Add and save
if (
  newEvent.year && newEvent.title && newEvent.description && newEvent.explanation &&
  newEvent.title.length > 10 && newEvent.description.length > 10 && newEvent.explanation.length > 20
) {
  events.push(newEvent);
  fs.writeFileSync(inputPath, JSON.stringify(events, null, 2));
  console.log('Event added successfully.');
} else {
  console.error('Event missing required fields or too short.');
  process.exit(1);
}
