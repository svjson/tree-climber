import { Tree, Point } from 'tree-sitter'
import { findNodeOfType, pointIndex } from '@src/ast'
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
      const exprNodes = expNode.children.slice(1, expNode.children.length - 1)
      const delimitRight = expNode.children.at(-1)

      if (exprNodes.length > 1) {
        const targetNode = exprNodes.find(
          (n) =>
            (point.row == n.startPosition.row &&
              point.column >= n.startPosition.column &&
              point.column < n.endPosition.column) ||
            (point.row == n.endPosition.row &&
              point.column >= n.endPosition.column &&
              point.column < n.endPosition.column) ||
            (point.row > n.startPosition.row && point.row < n.endPosition.row)
        )
        if (targetNode) {
          point = { ...targetNode.startPosition }
        }
      }

      const nodeContent = expNode.text.slice(
        delimitLeft.text.length,
        -delimitRight.text.length
      )

      const splitPoint = pointIndex(tree, point) - delimitLeft.endIndex

      const segments = [
        nodeContent.substring(0, splitPoint),
        nodeContent.substring(splitPoint),
      ]

      const partDelimiter = lang.nodes.delimiters[expNode.parent.type]
      const content = segments
        .map((s) => `${delimitLeft.text}${s}${delimitRight.text}`)
        .join(partDelimiter ? `${partDelimiter} ` : ' ')

      return {
        start: expNode.startPosition,
        end: expNode.endPosition,
        content,
        point,
      }
    }
  }

  return {
    expressionAt,
  }
}

export type Split = ReturnType<typeof split>
