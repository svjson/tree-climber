import { SyntaxNode, Tree } from 'tree-sitter'
import { OperationResult } from './types'

export const formatOperationResult = (
  tree: Tree,
  toReplace: SyntaxNode,
  replacement: SyntaxNode
): OperationResult => {
  const diff = replacement.startPosition.column - toReplace.startPosition.column
  const content = tree.rootNode.text
    .substring(replacement.startIndex, replacement.endIndex)
    .split('\n')
    .map((line, n) => {
      return n === 0
        ? line
        : diff > 0
          ? line.length >= diff && line.substring(0, diff).trim() === ''
            ? line.substring(diff)
            : line
          : `${' '.repeat(-diff)}${line}`
    })
    .join('\n')

  return {
    start: toReplace.startPosition,
    end: toReplace.endPosition,
    content,
  }
}
