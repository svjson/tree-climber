import { Point } from 'tree-sitter'
import z from 'zod/v4'

import { Node } from '@src/node'
import { QueryCommandNameSchema } from './schema'
import { LanguageContext } from './lang'

export type QueryCommandName = z.infer<typeof QueryCommandNameSchema>

export type LanguageConstruct = 'scope'

const QUERY_COMMANDS: Record<QueryCommandName, keyof Node> = {
  nodeAt: 'at',
  nodeBefore: 'before',
  nodeParent: 'parent',
}

export const executeQueryCommand = (
  lang: LanguageContext,
  command: QueryCommandName,
  content: string,
  point: Point
) => {
  const tree = lang.parser.parse(content)
  return lang.node()[QUERY_COMMANDS[command]](tree, point)
}
