import { beforeAll, describe, expect, it } from 'vitest'
import { Tree } from 'tree-sitter'

import { getLanguageContext, LanguageContext } from '@src/lang'
import { readAsset } from './fixtures'

describe('TypeScript', () => {
  let lang: LanguageContext
  let tree: Tree

  beforeAll(async () => {
    lang = await getLanguageContext('typescript')
    tree = lang.parser.parse(readAsset('ts/route-metadata._ts'))
  })

  describe('Split', () => {
    describe('expressionAt', () => {
      it('should split string at point', () => {
        const source = `const myString = "my dapper string"`
        const tree = lang.parser.parse(source)

        expect(
          lang.op.split().expressionAt(tree, { row: 0, column: 20 })
        ).toEqual({
          start: { row: 0, column: 17 },
          end: { row: 0, column: 35 },
          content: '"my" " dapper string"',
        })
      })
    })
  })
})
