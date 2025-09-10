import { Tree, SyntaxNode, Point } from 'tree-sitter'

export const outputRecursive = (node: SyntaxNode, depth = 0) => {
  console.log(' '.repeat(depth), node.type, node.toString())

  for (const child of node.children) {
    outputRecursive(child, depth + 1)
  }
}
