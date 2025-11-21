import { SyntaxNode, Point, Tree } from 'tree-sitter'
import { LanguageContext } from '@src/lang'
import { nodeAt } from '@src/ast'

/**
 * Construct a summary of a node, consisting of
 * the node type name, node text content and its
 * start and end positions, expressed both as
 * point(row, column) and index.
 */
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

/**
 * Construct summaries of a node, its immediate parent and
 * its immediate children.
 */
const toNodeInfo = (node?: SyntaxNode) => {
  if (!node) return null

  return {
    node: toNode(node),
    parent: toNode(node.parent),
    children: node.children.map(toNode),
  }
}

/**
 * Node queries
 */
export const node = (_lang: LanguageContext) => {
  /**
   * Query node at point
   */
  const at = (tree: Tree, point: Point) => {
    const node = nodeAt(tree, point)
    return toNodeInfo(node)
  }

  /**
   * Query node before node at point
   */
  const before = (tree: Tree, point: Point) => {
    const node = nodeAt(tree, point)?.previousSibling
    return toNodeInfo(node)
  }

  /**
   * Query parent node of node at point
   */
  const parent = (tree: Tree, point: Point) => {
    const node = nodeAt(tree, point)?.parent
    return toNodeInfo(node)
  }

  return { at, before, parent }
}

export type Node = ReturnType<typeof node>
