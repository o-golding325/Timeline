// import events from '../data/events.json'
// Use dynamic fetch for events
export async function getEvents() {
  const res = await fetch('/events-inner.json');
  return res.json();
}

// Get daily index based on days since epoch
// Returns an index for the daily event, ensuring no repeat within the last 100 days
export async function getDailyIndex() {
  const events = await getEvents();
  const now = new Date();
  const epoch = new Date('2022-01-01');
  const days = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
  // Build a list of the last 100 daily indices
  const recentIndices = new Set();
  for (let i = 1; i <= 100 && i < events.length; i++) {
    recentIndices.add(((days - i) % events.length + events.length) % events.length);
  }
  // Find the first index not in recentIndices, starting from today
  for (let offset = 0; offset < events.length; offset++) {
    const idx = (days + offset) % events.length;
    if (!recentIndices.has(idx)) return idx;
  }
  // Fallback: just return today's index
  return days % events.length;
}

// Get next unused index for user
export async function getNextUnusedIndex(used) {
  const events = await getEvents();
  for (let i = 0; i < events.length; i++) {
    if (!used.includes(i)) return i;
  }
  return null; // all used
}

// No default export; use getEvents()
