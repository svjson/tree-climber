import { Point, Tree } from 'tree-sitter'
import { findAncestorOfType, findDescendantOfType, findNodeOfType } from './ast'
import { LanguageContext } from './lang'

export const scope = (lang: LanguageContext) => {
  const scopeTypes = lang.nodes.scopes

  const scopeAt = (tree: Tree, point: Point) => {
    return findNodeOfType(tree, point, scopeTypes)
  }

  const scopeStart = (tree: Tree, point: Point) => {
    const scope =
      scopeAt(tree, point) ||
      findNodeOfType(tree, { ...point, column: point.column - 1 }, scopeTypes)

    return scope.startPosition
  }

  const scopeEnd = (tree: Tree, point: Point) => {
    const scope = scopeAt(tree, point)

    if (!scope) return tree.rootNode.endPosition

    return scope.endPosition
  }

  const scopeInto = (tree: Tree, point: Point) => {
    const current = scopeAt(tree, point)

    const childScope = findDescendantOfType(current, scopeTypes)

    return childScope?.startPosition
  }

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
