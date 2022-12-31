'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const enforceSchema = require('../index.js')

test('required should be deprecated', async (t) => {
  t.plan(1)

  process.on('warning', (warning) => {
    t.equal(warning.name, 'DeprecationWarning')
  })

  const fastify = Fastify()
  await fastify.register(enforceSchema, { required: ['response', 'body', 'params'] })
})

test('Should this fail since response schema invalid?', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  fastify.get('/foo', { schema: { response: { 201: {} } } }, (req, reply) => {
    reply.code(201).send('ok')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  // We currently don't use the response schema to validate, so this fails
  t.not(res.statusCode, 201)
})
