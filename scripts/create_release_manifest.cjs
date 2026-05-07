const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const distDir = path.resolve(process.argv[2] || 'dist')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const manifestName = 'OandOcraft-release-manifest.json'
const manifestPath = path.join(distDir, manifestName)

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  console.error(`Release manifest failed: ${distDir} does not exist. Run npm run build:oando first.`)
  process.exit(1)
}

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (full === manifestPath) continue
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.isFile()) out.push(full)
  }
  return out
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

const files = walk(distDir)
  .map((full) => {
    const bytes = fs.readFileSync(full)
    return {
      path: path.relative(distDir, full).replace(/\\/g, '/'),
      bytes: bytes.length,
      sha256: sha256(bytes),
    }
  })
  .sort((a, b) => a.path.localeCompare(b.path))

const aggregate = crypto.createHash('sha256')
let totalBytes = 0
for (const file of files) {
  totalBytes += file.bytes
  aggregate.update(`${file.path}\0${file.bytes}\0${file.sha256}\n`)
}

const shortSha = git(['rev-parse', '--short', 'HEAD']) || 'unknown'
const commit = git(['rev-parse', 'HEAD']) || 'unknown'
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const versionLabel = `v${packageJson.version}-${shortSha}-${timestamp}`

const manifest = {
  product: 'OandOcraft',
  packageName: packageJson.name,
  packageVersion: packageJson.version,
  versionLabel,
  commit,
  basePath: '/OandOcraft/',
  artifactName: `OandOcraft-${versionLabel}-dist`,
  generatedAt: new Date().toISOString(),
  distDir: path.relative(process.cwd(), distDir).replace(/\\/g, '/'),
  totalFiles: files.length,
  totalBytes,
  aggregateSha256: aggregate.digest('hex'),
  files,
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Wrote ${path.relative(process.cwd(), manifestPath).replace(/\\/g, '/')}`)
console.log(JSON.stringify({
  artifactName: manifest.artifactName,
  totalFiles: manifest.totalFiles,
  totalBytes: manifest.totalBytes,
  aggregateSha256: manifest.aggregateSha256,
}, null, 2))
