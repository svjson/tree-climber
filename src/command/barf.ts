import { Point, Tree } from 'tree-sitter'
import { OperationResult } from '@src/types'
import { LanguageContext } from '@src/lang'

/**
 * Barf nodes - narrow a delimited expression.
 */
export const barf = (lang: LanguageContext) => {
  /**
   * Barf forward - Excludes the last child of an expression by moving the
   * closing delimiter to the left of it.
   */
  const forwardAt = (tree: Tree, point: Point): OperationResult | null => {
    const scope = lang.scope().scopeAt(tree, point)

    if (scope.childCount === 0) return null

    const delimiter = scope.children.at(-1)
    const lastChild = scope.children.at(-2)

    return {
      start: lastChild.startPosition,
      end: delimiter.endPosition,
      content:
        delimiter.text +
        tree.rootNode.text.substring(lastChild.endIndex, delimiter.startIndex) +
        lastChild.text,
    }
  }

  return {
    forwardAt,
  }
}

export type Barf = ReturnType<typeof barf>
