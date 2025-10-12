import z from 'zod/v4'

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

export const NavigateRequestBodySchema = z.object({
  command: NavigationCommandNameSchema,
  point: PointSchema,
  content: z.string(),
})

export const NavigateResponseBodySchema = z.object({
  point: PointSchema,
})

export const OperationCommandNameSchema = z.enum(['splitExpr', 'barfForward'])

export const OperationRequestBodySchema = z.object({
  command: OperationCommandNameSchema,
  point: PointSchema,
  content: z.string(),
})

export const OperationResponseBodySchema = z.object({
  start: PointSchema,
  end: PointSchema,
  content: z.string(),
})
