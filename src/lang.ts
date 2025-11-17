import Parser from 'tree-sitter'
import { scope, Scope } from './scope'
import { barf, Barf } from './barf'
import { split, Split } from './split'

export interface LanguageContextBase {
  language: string
  parser: Parser
}

export type LanguageContext = LanguageContextBase & {
  scope: () => Scope
  op: {
    barf: () => Barf
    split: () => Split
  }
}

const LANGUAGES: Record<string, () => Promise<LanguageContextBase>> = {
  typescript: async () => {
    const TypeScript = await import('tree-sitter-typescript')
    const parser = new Parser()
    parser.setLanguage(TypeScript.typescript)
    return { language: 'TypeScript', parser }
  },
}

const initializedLanguages: Record<string, LanguageContext> = {}

export const makeLanguageContext = async (lang: string, language: string) => {
  if (!LANGUAGES[language]) {
    throw new Error(`Unsupported language: ${lang}(${language})`)
  }

  let _scope: Scope
  let _barf: Barf
  let _split: Split

  const ctx = {
    ...(await LANGUAGES[language]()),
    scope: () => (_scope ??= scope(ctx)),
    op: {
      barf: () => (_barf ??= barf(ctx)),
      split: () => (_split ??= split(ctx)),
    },
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
