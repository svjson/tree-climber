import Fastify, { FastifyRequest } from 'fastify'
import z from 'zod/v4'
import pino from 'pino'

import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import {
  NavigateRequestBodySchema,
  NavigateResponseBodySchema,
  OperationRequestBodySchema,
  OperationResponseBodySchema,
} from './schema'
import { executeNavigationCommand } from './navigation'
import { executeOperationCommand } from './operation'
import { makeLanguageContext } from './lang'

type NavigateRequestBody = z.infer<typeof NavigateRequestBodySchema>
type NavigateResponseBody = z.infer<typeof NavigateResponseBodySchema>
type OperationRequestBody = z.infer<typeof OperationRequestBodySchema>
type OperationResponseBody = z.infer<typeof OperationResponseBodySchema>

const log = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, ignore: 'pid,hostname' },
  },
})

export const startService = async (port: number = 4434) => {
  const app = Fastify({
    logger: false,
  }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.post(
    '/navigate',
    {
      schema: {
        body: NavigateRequestBodySchema,
        response: {
          200: NavigateResponseBodySchema,
          204: z.null(),
          500: z.any(),
        },
      },
    },
    async (req: FastifyRequest<{ Body: NavigateRequestBody }>, reply) => {
      const { lang, command, content, point } = req.body
      log.info(`[${lang}]${req.id}/navigate - BEGIN ${command}`)
      const langContext = await makeLanguageContext(lang)
      try {
        const result = executeNavigationCommand(
          langContext,
          command,
          content,
          point
        )
        if (result === null || result === undefined) {
          log.info(`[${lang}]${req.id}/navigate - NOREPLY ${command}`)
          reply.status(204).send()
        } else {
          log.info(
            `[${lang}]${req.id}/navigate - SUCCESS ${command} - ${JSON.stringify(result)}`
          )
          reply
            .status(200)
            .send({ point: result } satisfies NavigateResponseBody)
        }
      } catch (err) {
        log.error(`[${lang}]${req.id}/navigate - ERROR ${command}`)
        log.error(err)
        reply.status(500).send({ error: err, message: '' })
      }
    }
  )

  app.post(
    '/operation',
    {
      schema: {
        body: OperationRequestBodySchema,
        response: {
          200: OperationResponseBodySchema,
          204: z.null(),
          500: z.any(),
        },
      },
    },

    async (req: FastifyRequest<{ Body: OperationRequestBody }>, reply) => {
      const { lang, command, content, point } = req.body
      log.info(`[${lang}]${req.id}/operation - BEGIN ${command}`)
      const langContext = await makeLanguageContext(lang)

      try {
        const result = executeOperationCommand(
          langContext,
          command,
          content,
          point
        )

        if (result === null || result == undefined) {
          log.info(`[${lang}]${req.id}/operation - NOREPLY ${command}`)
          reply.status(204).send()
        } else {
          log.info(
            `[${lang}]${req.id}/operation - SUCCESS ${command} - ${JSON.stringify(result)}`
          )
          reply.status(200).send(result satisfies OperationResponseBody)
        }
      } catch (err) {
        log.error(`[${lang}]${req.id}/operation - ERROR ${command}`)
        log.error(err)
        reply.status(500).send({ error: err, message: '' })
      }
    }
  )

  try {
    app.listen({ port, host: '0.0.0.0' })
    log.info(`Listening on port: ${port}`)
  } catch (err) {
    log.error(err)
    process.exit(1)
  }
}

const port = Number(process.argv[2])

startService(isNaN(port) ? 4434 : port)
