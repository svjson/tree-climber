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

  describe('Scope Navigation', () => {
    describe('interface { ... }', () => {
      describe('from behind closing bracket', () => {
        describe('scopeStart()', () => {
          it('should return position of opening interface bracket', () => {
            expect(
              lang.scope().scopeStart(tree, { row: 12, column: 1 })
            ).toEqual({
              row: 2,
              column: 24,
            })
          })
        })

        describe('scopeEnd', () => {
          it('should return EOF if no outer scope', () => {
            expect(lang.scope().scopeEnd(tree, { row: 12, column: 1 })).toEqual(
              {
                row: 44,
                column: 0,
              }
            )
          })
        })
      })

      describe('from before opening bracket', () => {
        describe('scopeEnd', () => {
          it('should return position of closing interface bracket', () => {
            expect(lang.scope().scopeEnd(tree, { row: 2, column: 24 })).toEqual(
              {
                row: 12,
                column: 1,
              }
            )
          })
        })
      })
    })

    it('scopeInto', () => {
      expect(lang.scope().scopeInto(tree, { row: 2, column: 24 })).toEqual({
        row: 3,
        column: 10,
      })
    })

    it('scopeOut', () => {
      expect(lang.scope().scopeOut(tree, { row: 3, column: 10 })).toEqual({
        row: 2,
        column: 24,
      })
    })
  })
})
