const fs = require('fs')

const seedPath = process.argv[2] || 'supabase/seed.sql'
const sql = fs.readFileSync(seedPath, 'utf8')

function readSqlStrings(input) {
  const values = []
  for (let i = 0; i < input.length; i += 1) {
    if (input[i] !== "'") continue
    let value = ''
    i += 1
    while (i < input.length) {
      const ch = input[i]
      if (ch === "'") {
        if (input[i + 1] === "'") {
          value += "'"
          i += 2
          continue
        }
        break
      }
      value += ch
      i += 1
    }
    values.push(value)
  }
  return values
}

function countObjectValues(record) {
  return record && typeof record === 'object' && !Array.isArray(record)
    ? Object.keys(record).length
    : 0
}

const payloads = []
for (const literal of readSqlStrings(sql)) {
  const trimmed = literal.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) continue
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && Array.isArray(parsed.floors)) {
      payloads.push(parsed)
    }
  } catch {
    // Non-JSON SQL string literal.
  }
}

const totals = {
  payloads: payloads.length,
  floors: 0,
  elements: 0,
  employees: 0,
  neighborhoods: 0,
  annotations: 0,
  walls: 0,
  desks: 0,
  rooms: 0,
  doors: 0,
  windows: 0,
  furniture: 0,
}

const furnitureTypes = new Set([
  'sofa',
  'plant',
  'table-conference',
  'phone-booth',
  'workstation',
  'armchair',
  'storage',
  'decor',
])

for (const payload of payloads) {
  totals.floors += payload.floors.length
  totals.employees += countObjectValues(payload.employees)
  totals.neighborhoods += countObjectValues(payload.neighborhoods)
  totals.annotations += countObjectValues(payload.annotations)

  for (const floor of payload.floors) {
    const elements = floor.elements && typeof floor.elements === 'object' ? floor.elements : {}
    for (const element of Object.values(elements)) {
      totals.elements += 1
      if (!element || typeof element !== 'object') continue
      if (element.type === 'wall') totals.walls += 1
      if (element.type === 'desk') totals.desks += 1
      if (element.type === 'door') totals.doors += 1
      if (element.type === 'window') totals.windows += 1
      if (String(element.type || '').includes('room') || element.type === 'private-office') {
        totals.rooms += 1
      }
      if (furnitureTypes.has(element.type)) totals.furniture += 1
    }
  }
}

const required = [
  ['payloads', 1],
  ['floors', 1],
  ['elements', 1],
  ['employees', 1],
  ['walls', 1],
  ['desks', 1],
  ['rooms', 1],
  ['doors', 1],
  ['windows', 1],
  ['furniture', 1],
]

const failures = required
  .filter(([key, minimum]) => totals[key] < minimum)
  .map(([key, minimum]) => `${key}=${totals[key]} expected >= ${minimum}`)

console.log(`Verified ${seedPath}`)
console.log(JSON.stringify(totals, null, 2))

if (failures.length) {
  console.error(`Seed payload verification failed: ${failures.join(', ')}`)
  process.exit(1)
}
