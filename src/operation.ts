import z from 'zod/v4'
import { Point } from 'tree-sitter'
import { OperationCommandNameSchema } from './schema'
import { LanguageContext } from './lang'

export type OperationCommandName = z.infer<typeof OperationCommandNameSchema>

export type Op = 'split' | 'barf'

const OPERATION_COMMANDS: Record<OperationCommandName, [Op, string]> = {
  splitExpr: ['split', 'expressionAt'],
  barfForward: ['barf', 'forwardAt'],
  raiseExpr: ['raise', 'expressionAt'],
}

export const executeOperationCommand = (
  lang: LanguageContext,
  command: OperationCommandName,
  content: string,
  point: Point
) => {
  const tree = lang.parser.parse(content)

  const [op, impl] = OPERATION_COMMANDS[command]

  return lang.op[op]()[impl](tree, point)
}
