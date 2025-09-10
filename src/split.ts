import { Tree, Point } from 'tree-sitter'
import { findNodeOfType } from './ast'

const SPLITTABLE = ['string']

export const splitExpressionAt = (tree: Tree, point: Point) => {
  const expNode = findNodeOfType(tree, point, SPLITTABLE)
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
