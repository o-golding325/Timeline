// Usage: node convert-events.js
// Reads events.json and writes events.js in your app format

const fs = require('fs')
const path = require('path')

const inputPath = path.join(__dirname, 'src', 'data', 'events.json')
const outputPath = path.join(__dirname, 'src', 'data', 'events.js')

const events = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

const jsContent =
  'const events = ' + JSON.stringify(events, null, 2) + '\n\nexport default events\n'

fs.writeFileSync(outputPath, jsContent)
console.log('Converted events.json to events.js!')
