import { SyntaxNode, Point, Tree } from 'tree-sitter'
import { LanguageContext } from './lang'
import { nodeAt } from './ast'

const toNode = (node?: SyntaxNode) => {
  if (!node) return null
  return {
    type: node.type,
    content: node.text,
    start: {
      pos: node.startPosition,
      index: node.startIndex,
    },
    end: {
      pos: node.endPosition,
      index: node.endIndex,
    },
  }
}

const toNodeInfo = (node?: SyntaxNode) => {
  if (!node) return null

  return {
    node: toNode(node),
    parent: toNode(node.parent),
    children: node.children.map(toNode),
  }
}

export const node = (lang: LanguageContext) => {
  const at = (tree: Tree, point: Point) => {
    const node = nodeAt(tree, point)
    return toNodeInfo(node)
  }

  const before = (tree: Tree, point: Point) => {
    const node = nodeAt(tree, point)?.previousSibling
    return toNodeInfo(node)
  }

  const parent = (tree: Tree, point: Point) => {
    const node = nodeAt(tree, point)?.parent
    return toNodeInfo(node)
  }

  return { at, before, parent }
}

export type Node = ReturnType<typeof node>
