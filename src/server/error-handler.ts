import { FastifyInstance } from 'fastify'

export const registerErrorHandler = (app: FastifyInstance) => {
  app.setErrorHandler(async (err: any, _, reply) => {
    reply
      .status(500)
      .type('application/json')
      .send({
        error: err?.name ?? 'Internal Error',
        message: err?.message ?? 'Unable to fulfill request',
      })
  })
}
