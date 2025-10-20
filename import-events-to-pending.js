const axios = require('axios');
const fs = require('fs');
const API_KEY = 'yWW0RSyZCsW/1jtZho2rqQ==uMzcdyVn6YiErHoy';

async function fetchEvents(year) {
  const response = await axios.get('https://api.api-ninjas.com/v1/historicalevents', {
    headers: { 'X-Api-Key': API_KEY },
    params: { year }
  });
  return response.data;
}

function toEventSuggestion(apiEvent) {
  return {
    year: apiEvent.year ? String(apiEvent.year) : '',
    title: apiEvent.event ? apiEvent.event.substring(0, 60) + (apiEvent.event.length > 60 ? '...' : '') : 'Historical Event',
    description: apiEvent.event || '',
    explanation: apiEvent.event || '',
    id: `event-${apiEvent.year}-${apiEvent.event.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 30)}`,
    status: 'pending' // Mark as pending for admin review
  };
}

function isDuplicate(event, pending) {
  return pending.some(ev => ev.id === event.id);
}

function isValid(event) {
  return event.year && event.title && event.description && event.id;
}

async function importEventsToPending(year) {
  const newEvents = await fetchEvents(year);
  const formatted = newEvents.map(toEventSuggestion).filter(isValid);

  const path = './src/data/pending-events.json';
  let pending = [];
  if (fs.existsSync(path)) {
    pending = JSON.parse(fs.readFileSync(path, 'utf8'));
  }

  // Avoid duplicates by id
  const merged = [
    ...pending,
    ...formatted.filter(e => !isDuplicate(e, pending))
  ];

  fs.writeFileSync(path, JSON.stringify(merged, null, 2));
  console.log(`Imported ${formatted.length} valid events for year ${year} to pending-events.json.`);
}

// Example usage: import events for a range of years
(async () => {
  for (let year = 1960; year <= 1970; year++) {
    await importEventsToPending(year);
  }
})();
