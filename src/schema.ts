import z from 'zod/v4'

/**
 * Point/Cursor position schema
 */
export const PointSchema = z.object({
  row: z.number().int(),
  column: z.number().int(),
})

export const NavigationCommandNameSchema = z.enum([
  'scopeEnd',
  'scopeStart',
  'scopeInto',
  'scopeOut',
])

export const OperationCommandNameSchema = z.enum([
  'raiseExpr',
  'splitExpr',
  'barfForward',
])

export const QueryCommandNameSchema = z.enum(['nodeAt', 'nodeBefore'])
