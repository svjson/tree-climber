import { Point, Tree } from 'tree-sitter'
import { LanguageContext } from './lang'
import { nodeAt } from './ast'

export const node = (lang: LanguageContext) => {
  const at = (tree: Tree, point: Point) => {
    const type = nodeAt(tree, point)?.type
    if (!type) return null

    return {
      type,
    }
  }

  const before = (tree: Tree, point: Point) => {
    const type = nodeAt(tree, point)?.previousSibling?.type
    if (!type) return null

    return {
      type,
    }
  }

  return { at, before }
}

export type Node = ReturnType<typeof node>
