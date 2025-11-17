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

  describe('Barf', () => {
    describe('barfForwardAt', () => {
      it('should barf last k/v-pair from object_type', () => {
        expect(lang.op.barf().forwardAt(tree, { row: 7, column: 11 })).toEqual({
          start: { row: 9, column: 6 },
          end: { row: 10, column: 5 },
          content: '}\n    templated: boolean',
        })
      })
    })
  })
})
