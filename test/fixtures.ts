import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ASSET_DIR = path.join(
  fileURLToPath(path.dirname(import.meta.url)),
  'assets'
)

export const readAsset = (fileName: string) => {
  return readFileSync(path.join(ASSET_DIR, fileName), 'utf8')
}
