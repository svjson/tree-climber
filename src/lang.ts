import Parser from 'tree-sitter'
import { scope, Scope } from './scope'
import { barf, Barf } from './barf'
import { split, Split } from './split'
import { node, Node } from './node'
import { raise, Raise } from './raise'

export interface LanguageContextBase {
  language: string
  parser: Parser
  nodes: {
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
        scopes: [
          'formal_parameters',
          'interface_body',
          'object',
          'object_type',
          'statement_block',
        ],
        splittable: ['string'],
        units: [
          'interface_body',
          'object_type',
          'pair',
          'predefined_type',
          'property_signature',
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
