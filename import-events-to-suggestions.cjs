
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const API_KEY = 'yWW0RSyZCsW/1jtZho2rqQ==uMzcdyVn6YiErHoy';

// Load existing event IDs from events.json and suggestions.json
function loadExistingIds() {
  const eventsPath = path.join(__dirname, 'src', 'data', 'events.json');
  const suggestionsPath = path.join(__dirname, 'src', 'data', 'suggestions.json');
  let ids = new Set();
  try {
    const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    for (const e of events) {
      if (e.id) ids.add(e.id);
    }
  } catch (e) {}
  try {
    const suggestions = JSON.parse(fs.readFileSync(suggestionsPath, 'utf8'));
    for (const s of suggestions) {
      if (s.id) ids.add(s.id);
    }
  } catch (e) {}
  return ids;
}

async function fetchEvents(year) {
  const response = await axios.get('https://api.api-ninjas.com/v1/historicalevents', {
    headers: { 'X-Api-Key': API_KEY },
    params: { year }
  });
  return response.data;
}


function toSuggestionPayload(apiEvent) {
  const year = apiEvent.year ? String(apiEvent.year) : '';
  const eventText = apiEvent.event || '';
  const title = eventText ? eventText.substring(0, 60) + (eventText.length > 60 ? '...' : '') : 'Historical Event';
  const id = `event-${year}-${eventText.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 30)}`;
  return {
    feedback: JSON.stringify({ year, title, description: eventText, explanation: eventText, id }),
    id,
    year,
    title,
    description: eventText
  };
}


function validateEvent(payload) {
  // Basic validation: year, title, description, id must be present and non-empty
  if (!payload.year || !payload.title || !payload.description || !payload.id) return false;
  if (typeof payload.year !== 'string' || typeof payload.title !== 'string' || typeof payload.description !== 'string' || typeof payload.id !== 'string') return false;
  return true;
}

async function postSuggestion(payload) {
  try {
    const res = await axios.post('http://localhost:3000/api/suggestions', { feedback: payload.feedback }, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 201) {
      console.log('Suggestion submitted:', payload.feedback);
    } else {
      console.warn('Failed to submit suggestion:', res.status);
    }
  } catch (err) {
    if (err.response) {
      console.error('Error posting suggestion:', err.response.status, err.response.data);
    } else {
      console.error('Error posting suggestion:', err.message);
    }
  }
}



(async () => {
  const existingIds = loadExistingIds();
  let importedCount = 0;
  const centuryLimits = {};
  // Set limits for each completed century
  for (let c = 15; c <= 20; c++) {
    centuryLimits[c] = 150;
  }
  centuryLimits[21] = 30; // 21st century (2000–2025), lower limit

  for (let year = 1500; year <= 2025; year++) {
    const century = Math.floor(year / 100) + 1;
    if (!centuryLimits[century] || centuryLimits[century] <= 0) continue;
    try {
      const events = await fetchEvents(year);
      for (const apiEvent of events) {
        if (importedCount >= 500) break;
        const payload = toSuggestionPayload(apiEvent);
        if (existingIds.has(payload.id)) {
          console.log('Duplicate event, skipping:', payload.id);
          continue;
        }
        if (!validateEvent(payload)) {
          console.log('Invalid event, skipping:', payload);
          continue;
        }
        await postSuggestion(payload);
        existingIds.add(payload.id);
        importedCount++;
        centuryLimits[century]--;
        if (centuryLimits[century] <= 0) break;
      }
    } catch (err) {
      console.error('Error fetching events for year', year, err.message);
    }
  }
  console.log(`Imported ${importedCount} events.`);
})();
