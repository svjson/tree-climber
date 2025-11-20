import z from 'zod/v4'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { QueryRequestBodySchema, QueryResponseBodySchema } from './schema'
import { getLanguageContext } from '@src/lang'
import { executeQueryCommand } from '@src/query'
import { log } from '../logger'

type QueryRequestBody = z.infer<typeof QueryRequestBodySchema>
type QueryResponseBody = z.infer<typeof QueryResponseBodySchema>

export const registerQueryRoute = (app: FastifyInstance) => {
  app.post(
    '/query',
    {
      schema: {
        body: QueryRequestBodySchema,
        response: {
          200: QueryResponseBodySchema,
          204: z.null(),
          500: z.any(),
        },
      },
    },
    async (req: FastifyRequest<{ Body: QueryRequestBody }>, reply) => {
      const { lang, command, content, point } = req.body
      const langContext = await getLanguageContext(lang)

      const result = executeQueryCommand(langContext, command, content, point)

      log.info(JSON.stringify(result))

      if (result === null || result === undefined) {
        reply.status(204).send()
      } else {
        reply.status(200).send(result satisfies QueryResponseBody)
      }
    }
  )
}
