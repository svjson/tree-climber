import { Point, Tree } from 'tree-sitter'
import { OperationResult } from './types'
import { LanguageContext } from './lang'
import { findAncestorOfType, findNodeOfType } from './ast'

export const raise = (lang: LanguageContext) => {
  const scopeTypes = lang.nodes.scopes

  const expressionAt = (tree: Tree, point: Point): OperationResult | null => {
    // FIXME: Overload scopeStart/scopeEnd/etc to optionally return the full node ?
    //    const scopeStart = lang.scope().scopeStart(tree, point)
    //    const scopeEnd = lang.scope().scopeEnd(tree, point)

    const scope =
      lang.scope().scopeAt(tree, point) ||
      findNodeOfType(tree, { ...point, column: point.column - 1 }, scopeTypes)

    const parentScope = findAncestorOfType(scope.parent, scopeTypes)

    return {
      start: parentScope.startPosition,
      end: parentScope.endPosition,
      content: tree.rootNode.text.substring(scope.startIndex, scope.endIndex),
    }
  }

  return {
    expressionAt,
  }
}

export type Raise = ReturnType<typeof raise>
