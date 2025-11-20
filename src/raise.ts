import Parser, { Point, SyntaxNode, Tree } from 'tree-sitter'
import { OperationResult } from './types'
import { LanguageContext } from './lang'
import { findNodeOfType } from './ast'

const isValidReplacement = (
  parser: Parser,
  fullText: string,
  replaceStart: number,
  replaceEnd: number,
  newContent: string
): boolean => {
  const newText =
    fullText.slice(0, replaceStart) +
    ' ' +
    newContent +
    ' ' +
    fullText.slice(replaceEnd)

  const tree = parser.parse(newText)
  return !tree.rootNode.hasError
}

export const raise = (lang: LanguageContext) => {
  const unitTypes = lang.nodes.units

  const expressionAt = (tree: Tree, point: Point): OperationResult | null => {
    const expr: SyntaxNode = findNodeOfType(tree, point, unitTypes)

    let parentExpr = expr.parent

    while (
      !isValidReplacement(
        lang.parser,
        tree.rootNode.text,
        parentExpr.startIndex,
        parentExpr.endIndex,
        tree.rootNode.text.substring(expr.startIndex, expr.endIndex)
      )
    ) {
      parentExpr = parentExpr.parent
    }
    return {
      start: parentExpr.startPosition,
      end: parentExpr.endPosition,
      content: tree.rootNode.text.substring(expr.startIndex, expr.endIndex),
    }
  }

  return {
    expressionAt,
  }
}

export type Raise = ReturnType<typeof raise>
