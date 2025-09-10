import { SyntaxNode } from 'tree-sitter'

export { splitExpressionAt } from './split'

export const outputRecursive = (node: SyntaxNode, depth = 0) => {
  console.log(' '.repeat(depth), node.type, node.toString())

  for (const child of node.children) {
    outputRecursive(child, depth + 1)
  }
}
