import z from 'zod/v4'
import { OperationResponseBodySchema } from './schema'
import { Point, Tree } from 'tree-sitter'

export type OperationResult = z.infer<typeof OperationResponseBodySchema>

export type NavigationCommand = (tree: Tree, point: Point) => Point | null

export type OperationCommand = (
  tree: Tree,
  point: Point
) => OperationResult | null
