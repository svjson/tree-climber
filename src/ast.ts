import { Tree, SyntaxNode, Point } from 'tree-sitter'

export const nodeAt = (tree: Tree, point: Point): SyntaxNode => {
  return tree.rootNode.descendantForPosition(point)
}

export const nodeTypeAt = (tree: Tree, point: Point): string => {
  const descendant = nodeAt(tree, point)
  return descendant.type
}

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
