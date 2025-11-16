import z from 'zod/v4'

/**
 * Point/Cursor position schema
 */
export const PointSchema = z.object({
  row: z.number().int(),
  column: z.number().int(),
})

/**
 * Base request body shape for all types of commands
 */
export const RequestBodySchema = z.object({
  lang: z.string(),
  point: PointSchema,
  content: z.string(),
})

export const NavigationCommandNameSchema = z.enum([
  'scopeEnd',
  'scopeStart',
  'scopeInto',
  'scopeOut',
])

export const NavigateRequestBodySchema = RequestBodySchema.extend({
  command: NavigationCommandNameSchema,
})

export const NavigateResponseBodySchema = z.object({
  point: PointSchema,
})

export const OperationCommandNameSchema = z.enum(['splitExpr', 'barfForward'])

export const OperationRequestBodySchema = RequestBodySchema.extend({
  command: OperationCommandNameSchema,
})

export const OperationResponseBodySchema = z.object({
  start: PointSchema,
  end: PointSchema,
  content: z.string(),
})
