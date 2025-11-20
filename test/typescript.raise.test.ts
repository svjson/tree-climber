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

  describe('Raise', () => {
    describe('expressionAt', () => {
      it('should raise child object_type to parent object_type', () => {
        expect(
          lang.op.raise().expressionAt(tree, { row: 7, column: 11 })
        ).toEqual({
          start: { row: 3, column: 10 },
          end: { row: 11, column: 3 },
          content: [
            '{',
            '      href: string',
            '      templated: boolean',
            '    }',
          ].join('\n'),
        })
      })

      it('should raise property_signature to parent property_signature', () => {
        expect(
          lang.op.raise().expressionAt(tree, { row: 8, column: 8 })
        ).toEqual({
          start: { row: 7, column: 4 },
          end: { row: 10, column: 5 },
          content: ['href: string'].join('\n'),
        })
      })

      it('should raise object property_signature to parent property_signature', () => {
        expect(
          lang.op.raise().expressionAt(tree, { row: 7, column: 4 })
        ).toEqual({
          start: { row: 3, column: 2 },
          end: { row: 11, column: 3 },
          content: [
            'link: {',
            '    href: string',
            '    templated: boolean',
            '  }',
          ].join('\n'),
        })
      })
    })
  })
})
