import Parser from 'tree-sitter'

export interface LanguageContext {
  language: string
  parser: Parser
}

const LANGUAGES = {
  typescript: async () => {
    const TypeScript = await import('tree-sitter-typescript')
    const parser = new Parser()
    parser.setLanguage(TypeScript.typescript)
    return { language: 'TypeScript', parser }
  },
}

const initializedLanguages: Record<string, LanguageContext> = {}

export const makeLanguageContext = async (lang: string) => {
  const language = lang.toLowerCase()
  if (!initializedLanguages[language]) {
    if (!LANGUAGES[language]) {
      throw new Error(`Unsupported language: ${lang}(${language})`)
    }
    initializedLanguages[language] = await LANGUAGES[language]()
  }
  return initializedLanguages[language]
}
