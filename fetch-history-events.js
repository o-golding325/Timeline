// Usage: node fetch-history-events.js
// Fetches historical events from history.muffinlabs.com and saves to events.json

const fs = require('fs')
const fetch = require('node-fetch')

const outputPath = 'src/data/events.json'

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
  let allEvents = []
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 28; day++) { // 28 to avoid invalid dates
      try {
        const events = await fetchEvents(month, day)
        allEvents = allEvents.concat(events)
        console.log(`Fetched ${events.length} events for ${month}/${day}`)
      } catch (e) {
        console.error(`Error fetching ${month}/${day}:`, e)
      }
    }
  }
  fs.writeFileSync(outputPath, JSON.stringify(allEvents, null, 2))
  console.log(`Saved ${allEvents.length} events to ${outputPath}`)
}

main()
