// Roda os testes de src/lib (*.test.ts) sem instalar nada além do Node.
//
// Os arquivos do app importam sem extensão ('./pricing'), como o Vite aceita,
// mas o Node precisa da extensão. Por isso o script copia src/lib para uma
// pasta temporária, acrescenta ".ts" nos imports relativos e executa cada teste.
// Requer Node 22.6 ou mais novo (leitura de TypeScript embutida).
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 22 || (major === 22 && minor < 6)) {
  console.error(`Os testes precisam do Node 22.6 ou mais novo (você está no ${process.versions.node}).`)
  process.exit(1)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tmp = mkdtempSync(join(tmpdir(), 'margempro-tests-'))
const lib = join(tmp, 'lib')

cpSync(join(root, 'src', 'lib'), lib, { recursive: true })
writeFileSync(join(tmp, 'package.json'), '{"type":"module"}')

const files = readdirSync(lib).filter((f) => f.endsWith('.ts'))
for (const f of files) {
  const path = join(lib, f)
  const fixed = readFileSync(path, 'utf8').replace(/(from\s+['"])(\.\/[\w-]+)(['"])/g, '$1$2.ts$3')
  writeFileSync(path, fixed)
}

let failed = false
for (const f of files.filter((n) => n.endsWith('.test.ts'))) {
  console.log(`\n▶ ${f}`)
  const r = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--disable-warning=ExperimentalWarning', join(lib, f)],
    { stdio: 'inherit' },
  )
  if (r.status !== 0) failed = true
}

rmSync(tmp, { recursive: true, force: true })
process.exit(failed ? 1 : 0)
