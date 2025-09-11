import Parser, { Tree, Point } from 'tree-sitter'
import TypeScript from 'tree-sitter-typescript'
import z from 'zod/v4'

import { findDescendantOfType, findNodeOfType } from './ast'
import { scopeEnd, scopeInto, scopeOut, scopeStart } from './scope'
import { NavigationCommandNameSchema } from './schema'
import { NavigationCommand } from './types'

export type NavigationCommandName = z.infer<typeof NavigationCommandNameSchema>

const NAVIGATION_COMMANDS: Record<NavigationCommandName, NavigationCommand> = {
  scopeEnd: scopeEnd,
  scopeStart: scopeStart,
  scopeInto: scopeInto,
  scopeOut: scopeOut,
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
