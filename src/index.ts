import { Tree, SyntaxNode, Point } from 'tree-sitter'

export const nodeAt = (tree: Tree, point: Point) => {
  return tree.rootNode.descendantForPosition(point)
}

export const nodeTypeAt = (tree: Tree, point: Point) => {
  const descendant = nodeAt(tree, point)
  return descendant.type
}

export const outputRecursive = (node: SyntaxNode, depth = 0) => {
  console.log(' '.repeat(depth), node.type, node.toString())

  for (const child of node.children) {
    outputRecursive(child, depth + 1)
  }
}

const SPLITTABLE = ['string']

export const findAncestorOfType = (node: SyntaxNode, allowed: string[]) => {
  if (allowed.includes(node.type)) return node
  if (node.parent) return findAncestorOfType(node.parent, allowed)
  return null
}

export const findNodeOfType = (
  tree: Tree,
  point: Point,
  allowed: string[]
): SyntaxNode | null => {
  const deepest = nodeAt(tree, point)
  return findAncestorOfType(deepest, allowed)
}

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
