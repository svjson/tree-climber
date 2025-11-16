import Fastify, { FastifyRequest } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { log } from './logger'
import { registerErrorHandler } from './error-handler'
import { registerLoggingHooks } from './hooks'
import { registerNavigationRoute } from './routes/navigate'
import { registerOperationRoute } from './routes/operation'

export const startService = async (port: number = 4434) => {
  const app = Fastify({
    logger: false,
  }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  registerErrorHandler(app)

  app.register(async (scope) => {
    registerLoggingHooks(scope)
    registerNavigationRoute(scope)
    registerOperationRoute(scope)
  })

  try {
    app.listen({ port, host: '0.0.0.0' })
    log.info(`Listening on port: ${port}`)
  } catch (err) {
    log.error(err)
    process.exit(1)
  }
}
