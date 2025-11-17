import z from 'zod/v4'
import { Point, Tree } from 'tree-sitter'

import { OperationResponseBodySchema } from './server/routes/schema'
export type OperationResult = z.infer<typeof OperationResponseBodySchema>

export type NavigationCommand = (tree: Tree, point: Point) => Point | null

export type OperationCommand = (
  tree: Tree,
  point: Point
) => OperationResult | null
