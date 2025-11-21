import Parser from 'tree-sitter'
import {
  scope,
  Scope,
  barf,
  Barf,
  split,
  Split,
  node,
  Node,
  raise,
  Raise,
} from './command'

export interface LanguageContextBase {
  language: string
  parser: Parser
  nodes: {
    delimiters: Record<string, string>
    scopes: string[]
    splittable: string[]
    units: string[]
  }
}

export type LanguageContext = LanguageContextBase & {
  node: () => Node
  op: {
    barf: () => Barf
    raise: () => Raise
    split: () => Split
  }
  scope: () => Scope
}

const LANGUAGES: Record<string, () => Promise<LanguageContextBase>> = {
  javascript: async () => {
    const JavaScript = await import('tree-sitter-javascript')
    const parser = new Parser()
    parser.setLanguage(JavaScript.default)
    return {
      language: 'JavaScript',
      parser,
      nodes: {
        delimiters: {},
        scopes: ['object'],
        splittable: ['string'],
        units: ['object'],
      },
    }
  },
  typescript: async () => {
    const TypeScript = await import('tree-sitter-typescript')
    const parser = new Parser()
    parser.setLanguage(TypeScript.typescript)
    return {
      language: 'TypeScript',
      parser,
      nodes: {
        delimiters: {
          arguments: ',',
          array: ',',
          intersection_type: ' &',
        },
        scopes: [
          'formal_parameters',
          'interface_body',
          'object',
          'object_type',
          'statement_block',
        ],
        splittable: [
          'array',
          'object',
          'object_type',
          'string',
          'template_string',
        ],
        units: [
          'array',
          'boolean',
          'interface_body',
          'member_expression',
          'number',
          'object',
          'object_type',
          'pair',
          'predefined_type',
          'property_signature',
          'string',
          'template_string',
          'type_query',
        ],
      },
    }
  },
}

const initializedLanguages: Record<string, LanguageContext> = {}

export const makeLanguageContext = async (lang: string, language: string) => {
  if (!LANGUAGES[language]) {
    throw new Error(`Unsupported language: ${lang}(${language})`)
  }

  let _scope: Scope
  let _barf: Barf
  let _raise: Raise
  let _split: Split
  let _node: Node

  const ctx = {
    ...(await LANGUAGES[language]()),
    node: () => (_node ??= node(ctx)),
    op: {
      barf: () => (_barf ??= barf(ctx)),
      raise: () => (_raise ??= raise(ctx)),
      split: () => (_split ??= split(ctx)),
    },
    scope: () => (_scope ??= scope(ctx)),
  }
  initializedLanguages[language] = ctx
}

export const getLanguageContext = async (lang: string) => {
  const language = lang.toLowerCase()
  if (!initializedLanguages[language]) {
    await makeLanguageContext(lang, language)
  }
  return initializedLanguages[language]
}
