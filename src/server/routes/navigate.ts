import z from 'zod/v4'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { NavigateRequestBodySchema, NavigateResponseBodySchema } from './schema'
import { getLanguageContext } from '@src/lang'
import { executeNavigationCommand } from '@src/navigation'

type NavigateRequestBody = z.infer<typeof NavigateRequestBodySchema>
type NavigateResponseBody = z.infer<typeof NavigateResponseBodySchema>

export const registerNavigationRoute = (app: FastifyInstance) => {
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
      const langContext = await getLanguageContext(lang)

      const result = executeNavigationCommand(
        langContext,
        command,
        content,
        point
      )

      if (result === null || result === undefined) {
        reply.status(204).send()
      } else {
        reply.status(200).send({ point: result } satisfies NavigateResponseBody)
      }
    }
  )
}
