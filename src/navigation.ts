import Parser, { Tree, Point } from 'tree-sitter'
import TypeScript from 'tree-sitter-typescript'
import z from 'zod/v4'

import { findDescendantOfType, findNodeOfType } from './ast'
import { NavigationCommandNameSchema } from './schema'
import { NavigationCommand } from './types'

const SCOPE_TYPES = ['interface_body', 'object_type']

export type NavigationCommandName = z.infer<typeof NavigationCommandNameSchema>

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

const NAVIGATION_COMMANDS: Record<NavigationCommandName, NavigationCommand> = {
  scopeEnd: scopeEnd,
  scopeStart: scopeStart,
  scopeInto: scopeInto,
}

export const executeNavigationCommand = (
  command: NavigationCommandName,
  content: string,
  point: Point
) => {
  const parser = new Parser()
  parser.setLanguage(TypeScript.typescript)

  const tree = parser.parse(content)

  return NAVIGATION_COMMANDS[command](tree, point)
}
