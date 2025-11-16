import { Point } from 'tree-sitter'
import z from 'zod/v4'

import { scopeEnd, scopeInto, scopeOut, scopeStart } from './scope'
import { NavigationCommandNameSchema } from './schema'
import { NavigationCommand } from './types'
import { LanguageContext } from './lang'

export type NavigationCommandName = z.infer<typeof NavigationCommandNameSchema>

const NAVIGATION_COMMANDS: Record<NavigationCommandName, NavigationCommand> = {
  scopeEnd: scopeEnd,
  scopeStart: scopeStart,
  scopeInto: scopeInto,
  scopeOut: scopeOut,
}

export const executeNavigationCommand = (
  lang: LanguageContext,
  command: NavigationCommandName,
  content: string,
  point: Point
) => {
  const tree = lang.parser.parse(content)
  return NAVIGATION_COMMANDS[command](tree, point)
}
