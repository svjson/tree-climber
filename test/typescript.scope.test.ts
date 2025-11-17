import Parser from 'tree-sitter'
import TypeScript from 'tree-sitter-typescript'

import { describe, expect, it } from 'vitest'
import { scopeEnd, scopeInto, scopeStart } from '@src/index'
import { readAsset } from './fixtures'
import { scopeOut } from '@src/index'

const parser = new Parser()
parser.setLanguage(TypeScript.typescript)

describe('TypeScript', () => {
  describe('Scope Navigation', () => {
    describe('interface { ... }', () => {
      describe('from behind closing bracket', () => {
        describe('scopeStart()', () => {
          it('should return position of opening interface bracket', () => {
            const tree = parser.parse(readAsset('ts/route-metadata._ts'))

            expect(scopeStart(tree, { row: 12, column: 1 })).toEqual({
              row: 2,
              column: 24,
            })
          })
        })

        describe('scopeEnd', () => {
          it('should return EOF if no outer scope', () => {
            const tree = parser.parse(readAsset('ts/route-metadata._ts'))

            expect(scopeEnd(tree, { row: 12, column: 1 })).toEqual({
              row: 44,
              column: 0,
            })
          })
        })
      })

      describe('from before opening bracket', () => {
        describe('scopeEnd', () => {
          it('should return position of closing interface bracket', () => {
            const tree = parser.parse(readAsset('ts/route-metadata._ts'))

            expect(scopeEnd(tree, { row: 2, column: 24 })).toEqual({
              row: 12,
              column: 1,
            })
          })
        })
      })
    })

    it('scopeInto', () => {
      const tree = parser.parse(readAsset('ts/route-metadata._ts'))

      expect(scopeInto(tree, { row: 2, column: 24 })).toEqual({
        row: 3,
        column: 10,
      })
    })

    it('scopeOut', () => {
      const tree = parser.parse(readAsset('ts/route-metadata._ts'))

      expect(scopeOut(tree, { row: 3, column: 10 })).toEqual({
        row: 2,
        column: 24,
      })
    })
  })
})
