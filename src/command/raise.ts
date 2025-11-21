import Parser, { Point, SyntaxNode, Tree } from 'tree-sitter'
import { OperationResult } from '@src/types'
import { LanguageContext } from '@src/lang'
import { findNodeOfType } from '@src/ast'
import { formatOperationResult } from '@src/indent'

/**
 * Naive implementation of validating a raise replacement by
 * reparsing the three after performing the replacement and
 * checking for syntax errors.
 *
 * This could be made more efficient by using incremental parsing
 * APIs, but this is simpler and should be sufficient for
 * most use cases.
 *
 * @param parser The tree-sitter parser
 * @param fullText The full text of the original tree
 * @param replaceStart The start index of the text to be replaced
 * @param replaceEnd The end index of the text to be replaced
 * @param newContent The new content to insert
 * @returns true if the replacement results in a valid syntax tree
 */
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

/**
 * Raise operations - lift an expression to its parent expression.
 *
 * @param lang The language context
 * @returns Raise operations object
 */
export const raise = (lang: LanguageContext) => {
  const unitTypes = lang.nodes.units

  /**
   * Raise expression at point
   */
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
    return formatOperationResult(tree, parentExpr, expr)
  }

  return {
    expressionAt,
  }
}

export type Raise = ReturnType<typeof raise>
