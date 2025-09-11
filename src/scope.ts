import { Point, Tree } from 'tree-sitter'
import { findAncestorOfType, findDescendantOfType, findNodeOfType } from './ast'

const SCOPE_TYPES = ['interface_body', 'object_type']

export const scopeStart = (tree: Tree, point: Point) => {
  const scope =
    findNodeOfType(tree, point, SCOPE_TYPES) ||
    findNodeOfType(tree, { ...point, column: point.column - 1 }, SCOPE_TYPES)

  return scope.startPosition
}

export const scopeEnd = (tree: Tree, point: Point) => {
  const scope = findNodeOfType(tree, point, SCOPE_TYPES)

  return scope.endPosition
}

export const scopeInto = (tree: Tree, point: Point) => {
  const current = findNodeOfType(tree, point, SCOPE_TYPES)

  const childScope = findDescendantOfType(current, SCOPE_TYPES)

  return childScope?.startPosition
}

export const scopeOut = (tree: Tree, point: Point) => {
  const current = findNodeOfType(tree, point, SCOPE_TYPES)

  const parentScope = findAncestorOfType(current.parent, SCOPE_TYPES)

  return parentScope?.startPosition
}
