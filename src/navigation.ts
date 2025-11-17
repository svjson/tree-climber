import { Point } from 'tree-sitter'
import z from 'zod/v4'

import { NavigationCommandNameSchema } from './schema'
import { LanguageContext } from './lang'

export type NavigationCommandName = z.infer<typeof NavigationCommandNameSchema>

export type LanguageConstruct = 'scope'

const NAVIGATION_COMMANDS: Record<NavigationCommandName, LanguageConstruct> = {
  scopeEnd: 'scope',
  scopeStart: 'scope',
  scopeInto: 'scope',
  scopeOut: 'scope',
}

export const executeNavigationCommand = (
  lang: LanguageContext,
  command: NavigationCommandName,
  content: string,
  point: Point
) => {
  const tree = lang.parser.parse(content)
  return lang[NAVIGATION_COMMANDS[command]]()[command](tree, point)
}
