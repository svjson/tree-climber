import z from 'zod/v4'

import {
  NavigationCommandNameSchema,
  OperationCommandNameSchema,
  PointSchema,
  QueryCommandNameSchema,
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
  point: z.optional(PointSchema),
})

export const QueryRequestBodySchema = RequestBodySchema.extend({
  command: QueryCommandNameSchema,
})

export const BoundaryPointSchema = z.object({
  pos: PointSchema,
  index: z.number(),
})

export const NodeSchema = z.object({
  type: z.string().nullable(),
  content: z.string().nullable(),
  start: BoundaryPointSchema,
  end: BoundaryPointSchema,
})

export const NodeInfoSchema = z.object({
  node: NodeSchema,
  parent: NodeSchema,
  children: z.array(NodeSchema),
})

export const QueryResponseBodySchema = NodeInfoSchema
