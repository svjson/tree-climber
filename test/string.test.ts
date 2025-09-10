import Parser from 'tree-sitter'
import TypeScript from 'tree-sitter-typescript'

import { describe, expect, it } from 'vitest'
import { nodeAt, nodeTypeAt, outputRecursive, splitExpressionAt } from '../src'

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

// describe('nodeTypeAt', () => {
//   it('should return THINGS', () => {
//     const source = `const myString = "my dapper string"`
//     const tree = parser.parse(source)

//     const result: string[] = []
//     for (let i = 0; i < source.length; i++) {
//       const node = nodeAt(tree, { row: 0, column: i })
//       result.push(nodeTypeAt(tree, { row: 0, column: i }))
//     }

//     //    expect(result).toEqual([])
//   })
// })

// describe('parse-string', () => {
//   it('should do the THING', () => {
//     const source = `const myString = "my dapper string"`
//     const tree = parser.parse(source)

//     outputRecursive(tree.rootNode)
//   })
// })
