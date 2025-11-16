import z from 'zod/v4'

import {
  NavigationCommandNameSchema,
  OperationCommandNameSchema,
  PointSchema,
} from '@src/schema'

/**
 * Base request body shape for all types of commands
 */
export const RequestBodySchema = z.object({
  lang: z.string(),
  point: PointSchema,
  content: z.string(),
})

export const NavigateRequestBodySchema = RequestBodySchema.extend({
  command: NavigationCommandNameSchema,
})

export const NavigateResponseBodySchema = z.object({
  point: PointSchema,
})

export const OperationRequestBodySchema = RequestBodySchema.extend({
  command: OperationCommandNameSchema,
})

export const OperationResponseBodySchema = z.object({
  start: PointSchema,
  end: PointSchema,
  content: z.string(),
})
