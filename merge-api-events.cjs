// Usage: node merge-api-events.js
// Fetches events from History Muffinlabs API and merges with your events.json pool

const fs = require('fs')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const path = require('path')

const eventsPath = path.join(__dirname, 'src', 'data', 'events.json')

function loadLocalEvents() {
  if (!fs.existsSync(eventsPath)) return []
  return JSON.parse(fs.readFileSync(eventsPath, 'utf8'))
}

function eventKey(event) {
  // Use year+description as a simple uniqueness key
  return `${event.year}-${event.description}`.toLowerCase()
}

async function fetchEvents(month, day) {
  const url = `http://history.muffinlabs.com/date/${month}/${day}`
  const res = await fetch(url)
  const data = await res.json()
  return data.data.Events.map((event, i) => ({
    id: `event-${month}-${day}-${i}`,
    title: event.text.slice(0, 60) + (event.text.length > 60 ? '...' : ''),
    year: parseInt(event.year, 10),
    description: event.text,
    explanation: event.text
  }))
}

async function main() {
  let localEvents = loadLocalEvents()
  const localKeys = new Set(localEvents.map(eventKey))
  let newEvents = []
  // Helper to get days in a month (handles leap years for February)
  function daysInMonth(month, year = 2024) {
    return new Date(year, month, 0).getDate();
  }
  for (let month = 1; month <= 12; month++) {
    const days = daysInMonth(month)
    for (let day = 1; day <= days; day++) {
      try {
        const events = await fetchEvents(month, day)
        for (const event of events) {
          if (!localKeys.has(eventKey(event))) {
            newEvents.push(event)
            localKeys.add(eventKey(event))
          }
        }
        console.log(`Checked ${month}/${day}`)
      } catch (e) {
        console.error(`Error fetching ${month}/${day}:`, e)
      }
    }
  }
  const merged = localEvents.concat(newEvents)
  fs.writeFileSync(eventsPath, JSON.stringify(merged, null, 2))
  console.log(`Merged ${newEvents.length} new events. Total: ${merged.length}`)
}

main()
