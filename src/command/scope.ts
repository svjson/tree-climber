import { Point, Tree } from 'tree-sitter'
import {
  findAncestorOfType,
  findDescendantOfType,
  findNodeOfType,
} from '@src/ast'
import { LanguageContext } from '@src/lang'

/**
 * Scope operations
 *
 * @param lang The language context
 * @returns Scope operations object
 */
export const scope = (lang: LanguageContext) => {
  const scopeTypes = lang.nodes.scopes

  /**
   * Get the scope node at a given point
   */
  const scopeAt = (tree: Tree, point: Point) => {
    return findNodeOfType(tree, point, scopeTypes)
  }

  /**
   * Get the start position of the scope at a given point
   */
  const scopeStart = (tree: Tree, point: Point) => {
    const scope =
      scopeAt(tree, point) ||
      findNodeOfType(tree, { ...point, column: point.column - 1 }, scopeTypes)

    return scope.startPosition
  }

  /**
   * Get the end position of the scope at a given point
   */
  const scopeEnd = (tree: Tree, point: Point) => {
    const scope = scopeAt(tree, point)

    if (!scope) return tree.rootNode.endPosition

    return scope.endPosition
  }

  /**
   * Get the start position of the first child scope within the scope at a given point
   */
  const scopeInto = (tree: Tree, point: Point) => {
    const current = scopeAt(tree, point)

    const childScope = findDescendantOfType(current, scopeTypes)

    return childScope?.startPosition
  }

  /**
   * Get the start position of the parent scope of the scope at a given point
   */
  const scopeOut = (tree: Tree, point: Point) => {
    const current = scopeAt(tree, point)

    const parentScope = findAncestorOfType(current.parent, scopeTypes)

    return parentScope?.startPosition
  }

  return {
    scopeAt,
    scopeEnd,
    scopeInto,
    scopeStart,
    scopeOut,
  }
}

export type Scope = ReturnType<typeof scope>
