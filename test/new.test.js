'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const enforceSchema = require('../index.js')

test('schema.disabled must be an array', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  try {
    fastify.post(
      '/foo',
      {
        schema: {
          disabled: false
        }
      },
      (req, reply) => {
        reply.code(200).send('Success')
      }
    )
  } catch (error) {
    t.equal(
      error.message,
      'FastifyEnforceSchema: In POST: /foo, schema.disabled must be an array.'
    )
  }
})

test('disabled should ignore enforced body schema', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.post(
    '/foo',
    {
      schema: {
        disabled: ['body']
      }
    },
    (req, reply) => {
      reply.code(200).send('Success')
    }
  )
  const res = await fastify.inject({
    method: 'POST',
    url: '/foo',
    payload: { bar: 'string' }
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'Success')
})

// TODO: handle query
// query: {
//   name: { type: "string" },
// },
