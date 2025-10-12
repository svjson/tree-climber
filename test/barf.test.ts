import Parser from 'tree-sitter'
import TypeScript from 'tree-sitter-typescript'

import { describe, expect, it } from 'vitest'
import { readAsset } from './fixtures'
import { barfForwardAt } from '@src/index'

const parser = new Parser()
parser.setLanguage(TypeScript.typescript)

describe('barfForwardAt', () => {
  it('should barf last k/v-pair from object_type', () => {
    const tree = parser.parse(readAsset('ts/route-metadata._ts'))

    expect(barfForwardAt(tree, { row: 7, column: 11 })).toEqual({
      start: { row: 9, column: 6 },
      end: { row: 10, column: 5 },
      content: '}\n    templated: boolean',
    })
  })
})
