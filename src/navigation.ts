import { Tree, Point } from 'tree-sitter'
import { findDescendantOfType, findNodeOfType } from './ast'

const SCOPE_TYPES = ['interface_body', 'object_type']

export const scopeEnd = (tree: Tree, point: Point) => {
  const scope = findNodeOfType(tree, point, SCOPE_TYPES)

  return scope.endPosition
}

export const scopeStart = (tree: Tree, point: Point) => {
  const scope =
    findNodeOfType(tree, point, SCOPE_TYPES) ||
    findNodeOfType(tree, { ...point, column: point.column - 1 }, SCOPE_TYPES)

  return scope.startPosition
}

export const scopeInto = (tree: Tree, point: Point) => {
  const current = findNodeOfType(tree, point, SCOPE_TYPES)

  const childScope = findDescendantOfType(current, SCOPE_TYPES)

  return childScope?.startPosition
}
