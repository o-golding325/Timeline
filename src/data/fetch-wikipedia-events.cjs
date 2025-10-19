// fetch-wikipedia-events.cjs
// Fetches globally significant events from Wikipedia for years 1000 BC to 2025 AD
// Usage: node fetch-wikipedia-events.cjs
// Output: src/data/events.json

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'events.json');

// Fetch a wide range of years for a large, diverse event pool
const years = [];
for (let y = 1500; y <= 2025; y++) {
  years.push(y.toString());
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchEventsForYear(year) {
  const title = year.includes('BC') ? `${year}` : `${year}`;
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text&redirects=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.parse || !data.parse.text) {
      console.log('No parse/text for', year);
      return [];
    }
    const html = data.parse.text['*'];
    // Debug: print a snippet of the HTML
    console.log('HTML snippet for', year, ':', html.slice(0, 500));
    // Extract events from the HTML
    const matches = html.match(/<li>(.*?)<\/li>/g);
    if (!matches) {
      console.log('No <li> matches for', year);
      return [];
    }
    console.log('Found', matches.length, '<li> items for', year);
    return matches.map(li => {
      // Remove HTML tags
      const text = li.replace(/<[^>]+>/g, '').replace(/\[.*?\]/g, '').trim();
      // Debug: print first 3 items
      if (Math.random() < 0.1) console.log('Sample event:', text);
      // Filter for global/historic events (simple heuristic)
      if (text.length < 30) return null;
      if (/\b(birth|death|local|village|town|county|school|mall|store|minor|small|regional|provincial|municipal|parish|club|pageant|beauty queen|talent show|reality show|tv show|television|radio|movie|film|cinema|actor|actress|celebrity|pop star|singer|band|album|song|music|theater|theatre|play|opera|ballet|museum|gallery|exhibit|art|painting|sculpture|statue|graffiti|mural|restaurant|cafe|bar|pub|bakery|store|shop|market|mall|parade|carnival|fair|circus|zoo|aquarium|park|garden|beach|resort|hotel|motel|inn|hostel|camp|campground|camping|picnic|birthday|wedding|anniversary|funeral|memorial|ceremony|party|festival|holiday|celebration|gathering|meeting|conference|seminar|workshop|lecture|talk|presentation|panel|symposium|protest|demonstration|march|rally|strike|boycott|petition|campaign|movement|initiative|project|program|plan|policy|law|bill|ordinance|regulation|rule|order|decree|mandate|directive|instruction|guideline|recommendation|advisory|alert|warning|notice|announcement|statement|press release|news|report|article|column|editorial|opinion|review|interview|profile|feature|story|piece|segment|clip|broadcast|podcast|blog|tweet|post|comment|thread|forum|chat|message|email|letter|memo|note|reminder|invitation|greeting|card|gift|award|prize|medal|trophy|certificate|diploma|degree|license|permit|passport|visa|ticket|receipt|invoice|bill|check|contract|agreement|deal|settlement|transaction|purchase|sale|trade|exchange|barter|auction|bid|offer|proposal|quote|estimate|appraisal|assessment|evaluation|inspection|audit|survey|poll|census|inventory|stock|supply|demand|order|shipment|delivery|shipment|dispatch|distribution|supply|demand|order|shipment|delivery|dispatch|distribution)\b/i.test(text)) return null;
      return {
        year,
        description: text,
        explanation: text,
        title: text.slice(0, 80) + (text.length > 80 ? '...' : ''),
        id: `event-${year.replace(/\s/g, '-')}-${Math.abs(text.hashCode ? text.hashCode() : text.length)}`
      };
    }).filter(Boolean);
  } catch (err) {
    console.log('Error fetching/parsing', year, err);
    return [];
  }
}

// Simple hash for event id
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

(async () => {
  let allEvents = [];
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    process.stdout.write(`Fetching ${year}...\r`);
    const events = await fetchEventsForYear(year);
    if (events.length) {
      allEvents = allEvents.concat(events);
      console.log(`Fetched ${events.length} events for ${year}`);
    }
    await delay(200); // polite delay
  }
  fs.writeFileSync(outputPath, JSON.stringify(allEvents, null, 2));
  console.log(`\nSaved ${allEvents.length} events to ${outputPath}`);
})();
