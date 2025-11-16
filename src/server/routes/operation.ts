import z from 'zod/v4'
import { FastifyInstance, FastifyRequest } from 'fastify'
import {
  OperationRequestBodySchema,
  OperationResponseBodySchema,
} from './schema'
import { getLanguageContext } from '@src/lang'
import { executeOperationCommand } from '@src/operation'

type OperationRequestBody = z.infer<typeof OperationRequestBodySchema>
type OperationResponseBody = z.infer<typeof OperationResponseBodySchema>

export const registerOperationRoute = (app: FastifyInstance) => {
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
      const langContext = await getLanguageContext(lang)

      const result = executeOperationCommand(
        langContext,
        command,
        content,
        point
      )

      if (result === null || result == undefined) {
        reply.status(204).send()
      } else {
        reply.status(200).send(result satisfies OperationResponseBody)
      }
    }
  )
}
