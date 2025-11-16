import z from 'zod/v4'
import { splitExpressionAt } from './split'
import { barfForwardAt } from './barf'
import { Point } from 'tree-sitter'
import { OperationCommandNameSchema } from './schema'
import { OperationCommand } from './types'
import { LanguageContext } from './lang'

export type OperationCommandName = z.infer<typeof OperationCommandNameSchema>

const OPERATION_COMMANDS: Record<OperationCommandName, OperationCommand> = {
  splitExpr: splitExpressionAt,
  barfForward: barfForwardAt,
}

export const executeOperationCommand = (
  lang: LanguageContext,
  command: OperationCommandName,
  content: string,
  point: Point
) => {
  const tree = lang.parser.parse(content)

  return OPERATION_COMMANDS[command](tree, point)
}
