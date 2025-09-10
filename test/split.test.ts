import Parser from 'tree-sitter'
import TypeScript from 'tree-sitter-typescript'

import { describe, expect, it } from 'vitest'
import { splitExpressionAt } from '../src/split'

const parser = new Parser()
parser.setLanguage(TypeScript.typescript)

describe('splitExpressionAt', () => {
  it('should split string at point', () => {
    const source = `const myString = "my dapper string"`
    const tree = parser.parse(source)

    expect(splitExpressionAt(tree, { row: 0, column: 20 })).toEqual({
      start: { row: 0, column: 17 },
      end: { row: 0, column: 35 },
      content: '"my" " dapper string"',
    })
  })
})
