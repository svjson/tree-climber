import Fastify, { FastifyRequest } from 'fastify'
import z from 'zod/v4'

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
type OperationRequestBody = z.infer<typeof OperationRequestBodySchema>

export const startService = async (port: number = 4434) => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.post(
    '/navigate',
    {
      schema: {
        response: {
          200: NavigateResponseBodySchema,
          204: z.null(),
        },
      },
    },
    async (req: FastifyRequest<{ Body: NavigateRequestBody }>, reply) => {
      const { lang, command, content, point } = req.body
      const langContext = await makeLanguageContext(lang)
      const result = executeNavigationCommand(
        langContext,
        command,
        content,
        point
      )

      if (result === null) {
        reply.status(204).send()
      } else {
        reply.status(200).send({ point: result })
      }
    }
  )

  app.post(
    '/operation',
    {
      schema: {
        response: {
          200: OperationResponseBodySchema,
          204: z.null(),
        },
      },
    },

    async (req: FastifyRequest<{ Body: OperationRequestBody }>, reply) => {
      const { lang, command, content, point } = req.body
      const langContext = await makeLanguageContext(lang)
      const result = executeOperationCommand(
        langContext,
        command,
        content,
        point
      )

      if (result === null) {
        reply.status(204).send()
      } else {
        reply.status(200).send(result)
      }
    }
  )

  app.listen({ port, host: '0.0.0.0' })
}

const port = Number(process.argv[2])

startService(isNaN(port) ? 4434 : port)
