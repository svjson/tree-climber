import { FastifyInstance } from 'fastify'

import { log } from './logger'

export const registerLoggingHooks = (app: FastifyInstance) => {
  /**
   * Log incoming requests
   */
  app.addHook('preHandler', async (req) => {
    const { lang, command } = (req.body as any) ?? {}
    log.info(`[${req.id}]-[${lang ?? '-'}] [${req.url}]-[ BEGIN ] ${command}`)
  })

  /**
   * Log on reply send if successful or no-op
   */
  app.addHook('onSend', async (req, reply, payload) => {
    if (reply.statusCode === 500) {
      log.error(payload)
      return
    }
    const { lang, command } = (req.body as any) ?? {}
    const result = reply.statusCode === 204 ? 'NO OP' : 'SUCCESS'
    log.info(
      `[${req.id}]-[${lang ?? '-'}] [${req.url}]-[ ${result} ] ${command}${payload ? ` - ${JSON.stringify(payload)}` : ''}`
    )
  })

  /**
   * Log on error
   */
  app.addHook('onError', async (req, _, err) => {
    const { lang, command } = (req.body as any) ?? {}
    log.error(`[${req.id}]-[${lang ?? '-'}] [${req.url}]-[ ERROR ] ${command}`)
    log.error(err)
  })
}
