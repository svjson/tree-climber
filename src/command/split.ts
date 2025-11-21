import { Tree, Point } from 'tree-sitter'
import { findNodeOfType } from '@src/ast'
import { OperationResult } from '@src/types'
import { LanguageContext } from '@src/lang'

/**
 * Split nodes - divide a delimited expression into two.
 *
 * @param lang The language context
 * @returns Split operations object
 */
export const split = (lang: LanguageContext) => {
  /**
   * Split expression at point
   */
  const expressionAt = (tree: Tree, point: Point): OperationResult | null => {
    const expNode = findNodeOfType(tree, point, lang.nodes.splittable)
    if (expNode) {
      const delimitLeft = expNode.children[0]
      const expContent = expNode.children[1]
      const delimitRight = expNode.children[2]

      const splitPoint = point.column - expContent.startPosition.column

      const segments = [
        expContent.text.substring(0, splitPoint),
        expContent.text.substring(splitPoint),
      ]

      const content = segments
        .map((s) => `${delimitLeft.text}${s}${delimitRight.text}`)
        .join(' ')

      return {
        start: expNode.startPosition,
        end: expNode.endPosition,
        content,
      }
    }
  }

  return {
    expressionAt,
  }
}

export type Split = ReturnType<typeof split>
