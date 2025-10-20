const fs = require('fs');

const suggestionsPath = './api/suggestions.json';
const eventsPath = './src/data/events.json';

function isEventSuggestion(s) {
  // Try to parse feedback as event object
  try {
    const event = JSON.parse(s.feedback);
    return event && event.id && event.year && event.title;
  } catch {
    return false;
  }
}

function isDuplicate(event, events) {
  return events.some(e => e.id === event.id);
}

function moveApprovedEvents() {
  if (!fs.existsSync(suggestionsPath)) {
    console.log('No suggestions.json found.');
    return;
  }
  const suggestions = JSON.parse(fs.readFileSync(suggestionsPath, 'utf8'));
  let events = [];
  if (fs.existsSync(eventsPath)) {
    events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  }
  let moved = 0;
  for (const s of suggestions) {
    if (s.status === 'approved' && isEventSuggestion(s)) {
      const event = JSON.parse(s.feedback);
      if (!isDuplicate(event, events)) {
        events.push(event);
        moved++;
      }
    }
  }
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
  console.log(`Moved ${moved} approved events to events.json.`);
}

moveApprovedEvents();
