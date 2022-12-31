'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const enforceSchema = require('../index.js')

test('Should pass if plugin disabled', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, { disabled: true })

  fastify.get('/foo', (req, reply) => {
    reply.code(201).send('ok')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 201)
  t.equal(res.payload, 'ok')
})

test('Should fail if body schema missing from POST route', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema)

  try {
    fastify.post('/foo', { schema: { response: { 201: {} } } }, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(error.message, 'POST: /foo is missing a body schema')
  }
})

test('Should fail if schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema) // , { required: ['body'] }

  try {
    fastify.post('/foo', {}, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(error.message, 'POST: /foo is missing a schema')
  }
})

test('Should fail if body schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema, { disabled: ['response'] }) //

  try {
    fastify.post('/foo', { schema: {} }, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(error.message, 'POST: /foo is missing a body schema')
  }
})

test('Should fail if response schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema) // , { required: ['response'] }

  try {
    fastify.post('/foo', { schema: {} }, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(error.message, 'POST: /foo is missing a response schema')
  }
})

test('Should fail if response schema values are not integers between 100 - 599', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema) // , { required: ['response'] }

  try {
    fastify.post(
      '/foo',
      {
        schema: {
          response: { dog: 1 }
        }
      },
      (req, reply) => {
        reply.code(201).send('ok')
      }
    )
  } catch (error) {
    t.equal(
      error.message,
      'POST /foo: "dog" is not a number. HTTP status codes from 100 - 599 supported'
    )
  }
})

test('Should pass if the keys in the response schema are valid HTTP codes', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  await fastify.register(enforceSchema) // , { required: ['response'] }

  fastify.get(
    '/foo',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              id: {
                type: 'number'
              },
              description: {
                type: 'string'
              },
              name: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    (req, reply) => {
      reply.code(200).send('ok')
    }
  )

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'ok')
})

test('Should NOT fail if params schema is missing', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.get('/foo', { schema: {} }, (req, reply) => {
    reply.code(200).send('ok')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'ok')
})

test('Should fail if params schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema, { disabled: ['response'] })

  try {
    fastify.get('/foo/:bar', { schema: {} }, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(error.message, 'GET: /foo/:bar is missing a params schema')
  }
})

test('enforce should be disabled for excluded paths without excludedSchemas property', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, {
    // required: ['response'],
    exclude: [{ url: '/foo' }]
  })

  fastify.get('/foo', {}, (req, reply) => {
    reply.code(200).send('exclude works')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'exclude works')
})

test('enforce should be disabled for excluded paths via false option directly on schema', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema) // , { required: ['response'] }

  fastify.get('/foo', { schema: false }, (req, reply) => {
    reply.code(200).send('exclude works')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'exclude works')
})

test('enforce should be disabled for excluded paths via false option directly on schema.response', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema) // , { required: ['response'] }

  fastify.get('/foo', { schema: { response: false } }, (req, reply) => {
    reply.code(200).send('exclude works')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'exclude works')
})

test('enforce should be disabled for excluded paths via false option directly on schema.body', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, {
    disabled: ['response']
    // required: ['body']
  })

  fastify.post('/foo', { schema: { body: false } }, (req, reply) => {
    reply.code(200).send('exclude works')
  })

  const res = await fastify.inject({
    method: 'POST',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'exclude works')
})

test('enforce should be disabled for excluded paths via false option directly on schema.params', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, {
    disabled: ['response']
    // required: ['params']
  })

  fastify.get('/foo/:bar', { schema: { params: false } }, (req, reply) => {
    reply.code(200).send('exclude works')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo/test'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'exclude works')
})

test('enforce should be disabled at the body schema', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, {
    disabled: ['response'],
    // required: ['body'],
    exclude: [
      { url: '/foo', excludedSchemas: ['body'], excludedHTTPVerbs: ['GET'] }
    ]
  })

  fastify.post(
    '/foo',
    {
      schema: {}
    },
    (req, reply) => {
      reply.code(200).send('body schema excluded for /foo')
    }
  )

  const res = await fastify.inject({
    method: 'POST',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'body schema excluded for /foo')
})

test('No http status codes set in schema for response schema', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema) // , { required: ['response'] }

  try {
    fastify.get('/foo', { schema: { response: {} } }, (req, reply) => {
      reply.code(200).send('exclude works')
    })
  } catch (err) {
    t.equal(
      err.message,
      'GET /foo: No HTTP status codes provided in the response schema'
    )
  }
})

test('Http status code outside support set in schema for required schema type', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema) // , { required: ['response'] }

  try {
    fastify.get('/foo', { schema: { response: { 600: {} } } }, (req, reply) => {
      reply.code(200).send('exclude works')
    })
  } catch (err) {
    t.equal(err.message, 'GET /foo: HTTP status codes from 100 - 599 supported')
  }
})
