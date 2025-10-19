// filter-global-events.cjs
// Usage: node filter-global-events.cjs
// Filters events.json for global, historically significant events.
// Writes output to events.filtered.json

const fs = require('fs');
const readline = require('readline');
const path = require('path');


const inputPath = path.join(__dirname, 'events.json');
const backupPath = path.join(__dirname, 'events.backup.json');
const outputPath = path.join(__dirname, 'events.json'); // overwrite in-place

// Sharpened keywords/phrases for only the most globally significant events
const globalKeywords = [
  // Major wars and peace
  'world war', 'declaration of war', 'peace treaty', 'armistice', 'treaty of versailles', 'treaty of paris',
  'treaty of westphalia', 'treaty of tordesillas', 'treaty of utrecht', 'treaty of ghent',
  'hiroshima', 'nagasaki', 'pearl harbor', 'd-day', 'september 11', '9/11',
  // Scientific breakthroughs
  'scientific breakthrough', 'discovery of', 'invention of', 'first vaccine', 'first computer', 'first flight',
  'first satellite', 'first nuclear', 'first man', 'first woman', 'first in vitro', 'first heart transplant',
  'moon landing', 'apollo 11', 'sputnik', 'internet', 'nobel prize', 'atomic bomb', 'nuclear test',
  // Social/cultural milestones
  'civil rights', 'abolition of slavery', 'women’s suffrage', 'women’s rights', 'universal suffrage',
  'fall of berlin wall', 'fall of the berlin wall', 'berlin wall', 'mandela released', 'rosa parks',
  'martin luther king jr.', 'mahatma gandhi', 'malala yousafzai',
  // Global pandemics and disasters
  'pandemic', 'covid', 'coronavirus', 'chernobyl', 'fukushima', 'titanic',
  // Major independence/collapse
  'independence of', 'collapse of', 'fall of', 'unification of', 'partition of',
  // Major organizations
  'united nations', 'european union', 'nato', 'g7', 'g8', 'g20',
];

// Keywords/phrases that suggest local/minor events (to exclude)
const localExclude = [
  'local', 'village', 'town', 'county', 'district', 'neighborhood', 'school', 'mall', 'store',
  'minor', 'small', 'regional', 'provincial', 'municipal', 'parish', 'club', 'pageant', 'beauty queen',
  'talent show', 'reality show', 'tv show', 'television', 'radio', 'movie', 'film', 'cinema', 'actor',
  'actress', 'celebrity', 'pop star', 'singer', 'band', 'album', 'song', 'music', 'theater', 'theatre',
  'play', 'opera', 'ballet', 'museum', 'gallery', 'exhibit', 'art', 'painting', 'sculpture', 'statue',
  'graffiti', 'mural', 'restaurant', 'cafe', 'bar', 'pub', 'bakery', 'store', 'shop', 'market', 'mall',
  'parade', 'carnival', 'fair', 'circus', 'zoo', 'aquarium', 'park', 'garden', 'beach', 'resort', 'hotel',
  'motel', 'inn', 'hostel', 'camp', 'campground', 'camping', 'picnic', 'birthday', 'wedding', 'anniversary',
  'funeral', 'memorial', 'ceremony', 'party', 'festival', 'holiday', 'celebration', 'gathering', 'meeting',
  'conference', 'seminar', 'workshop', 'lecture', 'talk', 'presentation', 'panel', 'symposium',
  // REMOVED: protest, demonstration, march, rally, strike, boycott, petition, campaign, movement, initiative
  // REMOVED: project, program, plan, policy, law, bill, ordinance, regulation, rule, order, decree
  // REMOVED: disasters, accident, crash, fire, flood, storm, hurricane, tornado, earthquake, landslide, avalanche, explosion
  // REMOVED: wars, battle, uprising, revolution, coup, assassination, genocide, massacre
  // REMOVED: scientific, invention, discovery, milestone, Nobel, prize, award
  // REMOVED: major transport, ship, train, plane, flight, space, satellite, moon, Mars, Apollo, Challenger, Hubble, James Webb
  // REMOVED: pandemic, COVID, coronavirus, vaccine, WHO, World Health Organization
  'announcement', 'statement', 'press release', 'news', 'report', 'article', 'column', 'editorial', 'opinion',
  'review', 'interview', 'profile', 'feature', 'story', 'piece', 'segment', 'clip', 'broadcast', 'podcast', 'blog',
  'tweet', 'post', 'comment', 'thread', 'forum', 'chat', 'message', 'email', 'letter', 'memo', 'note', 'reminder',
  'invitation', 'greeting', 'card', 'gift', 'award', 'prize', 'medal', 'trophy', 'certificate', 'diploma', 'degree',
  'license', 'permit', 'passport', 'visa', 'ticket', 'receipt', 'invoice', 'bill', 'check', 'contract', 'agreement',
  'deal', 'settlement', 'transaction', 'purchase', 'sale', 'trade', 'exchange', 'barter', 'auction', 'bid', 'offer',
  'proposal', 'quote', 'estimate', 'appraisal', 'assessment', 'evaluation', 'inspection', 'audit', 'survey', 'poll',
  'census', 'inventory', 'stock', 'supply', 'demand', 'order', 'shipment', 'delivery', 'shipment', 'dispatch',
  'distribution', 'supply', 'demand', 'order', 'shipment', 'delivery', 'dispatch', 'distribution',
];

function isGlobalHistoric(event) {
  const text = (
    (event.title || '') + ' ' +
    (event.description || '') + ' ' +
    (event.explanation || '')
  ).toLowerCase();

  // Exclude if local/minor
  if (localExclude.some(word => text.includes(word))) return false;

  // Only include if a sharpened global/historic keyword is present
  if (globalKeywords.some(word => text.includes(word))) return true;

  // Otherwise, exclude
  return false;
}

async function filterEvents() {
  // Backup original events.json
  if (fs.existsSync(inputPath)) {
    fs.copyFileSync(inputPath, backupPath);
    console.log('Backup created:', backupPath);
  } else {
    console.log('Original events.json not found, skipping backup.');
  }

  const input = fs.createReadStream(inputPath);
  const rl = readline.createInterface({ input });
  let filtered = [];
  let buffer = '';
  let insideObject = false;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed.startsWith('{')) {
      buffer = line + '\n';
      insideObject = true;
    } else if (insideObject) {
      buffer += line + '\n';
      if (trimmed.startsWith('}')) {
        // Try to parse the object
        try {
          const obj = JSON.parse(buffer.replace(/,$/, ''));
          if (isGlobalHistoric(obj)) {
            filtered.push(JSON.parse(buffer.replace(/,$/, '')));
          }
        } catch (e) {
          // Not a valid object, skip
        }
        buffer = '';
        insideObject = false;
      }
    }
  }

  // Write filtered events back to events.json
  fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));
  console.log('Filtered events written to', outputPath);
  console.log('New events.json length:', filtered.length);
}

filterEvents();
