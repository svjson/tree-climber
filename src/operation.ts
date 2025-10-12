import z from 'zod/v4'
import { splitExpressionAt } from './split'
import { barfForwardAt } from './barf'
import Parser, { Point, Tree } from 'tree-sitter'
import TypeScript from 'tree-sitter-typescript'
import { OperationCommandNameSchema } from './schema'
import { OperationCommand, OperationResult } from './types'

export type OperationCommandName = z.infer<typeof OperationCommandNameSchema>

const OPERATION_COMMANDS: Record<OperationCommandName, OperationCommand> = {
  splitExpr: splitExpressionAt,
  barfForward: barfForwardAt,
}

export const executeOperationCommand = (
  command: OperationCommandName,
  content: string,
  point: Point
) => {
  const parser = new Parser()
  parser.setLanguage(TypeScript.typescript)

  const tree = parser.parse(content)

  return OPERATION_COMMANDS[command](tree, point)
}
