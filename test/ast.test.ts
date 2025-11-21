import { beforeAll, describe, expect, it } from 'vitest'
import { Tree } from 'tree-sitter'

import { getLanguageContext, LanguageContext } from '@src/lang'
import { pointIndex } from '@src/ast'
import { readAsset } from './fixtures'

describe('TypeScript', () => {
  let lang: LanguageContext
  let tree: Tree

  beforeAll(async () => {
    lang = await getLanguageContext('typescript')
    tree = lang.parser.parse(readAsset('ts/route-metadata._ts'))
  })

  describe('ast', () => {
    describe('pointIndex', () => {
      it('should return the correct offest/index for every valid point in tree', () => {
        const lines = tree.rootNode.text.split('\n')

        let expectedOffset = 0

        lines.forEach((line, row) => {
          for (let column = 0; column < line.length; column++) {
            expect(pointIndex(tree, { row, column })).toEqual(expectedOffset)
            expectedOffset++
          }
          expectedOffset++
        })
      })
    })
  })
})
