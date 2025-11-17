import { Point, Tree } from 'tree-sitter'
import { findAncestorOfType, findDescendantOfType, findNodeOfType } from './ast'

const SCOPE_TYPES = [
  'formal_parameters',
  'interface_body',
  'object',
  'object_type',
  'statement_block',
]

export const scopeAt = (tree: Tree, point: Point) => {
  return findNodeOfType(tree, point, SCOPE_TYPES)
}

export const scopeStart = (tree: Tree, point: Point) => {
  const scope =
    scopeAt(tree, point) ||
    findNodeOfType(tree, { ...point, column: point.column - 1 }, SCOPE_TYPES)

  return scope.startPosition
}

export const scopeEnd = (tree: Tree, point: Point) => {
  const scope = scopeAt(tree, point)

  if (!scope) return tree.rootNode.endPosition

  return scope.endPosition
}

export const scopeInto = (tree: Tree, point: Point) => {
  const current = scopeAt(tree, point)

  const childScope = findDescendantOfType(current, SCOPE_TYPES)

  return childScope?.startPosition
}

export const scopeOut = (tree: Tree, point: Point) => {
  const current = scopeAt(tree, point)

  const parentScope = findAncestorOfType(current.parent, SCOPE_TYPES)

  return parentScope?.startPosition
}
