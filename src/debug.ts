import { SyntaxNode } from 'tree-sitter'

export const outputRecursive = (node: SyntaxNode, depth = 0) => {
  const padding = ' '.repeat(depth * 2)
  console.log(`${padding} - Node Type: '${node.type}'`)
  console.log(node.text)

  for (const child of node.children) {
    outputRecursive(child, depth + 1)
  }
}
