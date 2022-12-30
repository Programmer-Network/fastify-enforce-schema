'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const enforceSchema = require('../index.js')
const {
  getErrorMessage,
  hasProperties,
  isSchemaTypeExcluded
} = require('../utils.js')

test('Should fail if no options passed: every endpoint should have a schema', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema)

  try {
    fastify.post('/foo', {}, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(error.message, 'schema missing at the path POST: "/foo"')
  }
})

test('Should pass if no options passed and schema validation explicitly disabled', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema)
  
  fastify.get('/foo', { schema: false }, (req, reply) => {
    reply.code(201).send('ok')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 201)
  t.equal(res.payload, 'ok')
})

test('Should fail if no options passed: every POST should have a body unless explicitly set to false', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  // NOTE: My understanding is that we shouldn't need to manually specify { required: ['body'] } for the body to be required, but this isn't current behavior
  await fastify.register(enforceSchema)

  try {
    fastify.post('/foo', { schema: { response: { 201: {} } }}, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    // This is the error message I would expect to see
    t.equal(error.message, 'POST: /foo is missing a body schema')
  }
})

test('Should fail if schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema, { required: ['body'] })

  try {
    fastify.post('/foo', {}, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(error.message, 'schema missing at the path POST: "/foo"')
  }
})

test('Should fail if body schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema, { required: ['body'] })

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
  await fastify.register(enforceSchema, { required: ['response'] })

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

  await fastify.register(enforceSchema, { required: ['response'] })

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
      '"dog" is not a number. HTTP status codes from 100 - 599 supported'
    )
  }
})

test('Should pass if the keys in the response schema are valid HTTP codes', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { required: ['response'] })

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

  await fastify.register(enforceSchema, { required: ['params'] })

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

  await fastify.register(enforceSchema, { required: ['params'] })

  try {
    fastify.post('/foo/:bar', { schema: {} }, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(error.message, 'POST: /foo/:bar is missing a params schema')
  }
})

test('getErrorMessage should return a proper message', async (t) => {
  t.plan(3)

  t.equal(
    getErrorMessage('body', { path: '/bar', method: 'PUT' }),
    'PUT: /bar is missing a body schema'
  )
  t.equal(
    getErrorMessage('response', { path: '/bar', method: 'PUT' }),
    'PUT: /bar is missing a response schema'
  )
  t.equal(
    getErrorMessage('params', { path: '/bar', method: 'PUT' }),
    'PUT: /bar is missing a params schema'
  )
})

test('hasProperties should return 0 if no properties', async (t) => {
  t.plan(1)

  t.equal(hasProperties(null, 'whatever'), false)
})

test("isSchemaTypeExcluded should return true if its excluded inside 'excludedSchemas'", async (t) => {
  t.plan(10)

  t.equal(
    isSchemaTypeExcluded({ excludedSchemas: ['response'] }, 'response'),
    true
  )

  t.equal(isSchemaTypeExcluded({ excludedSchemas: ['body'] }, 'body'), true)
  t.equal(
    isSchemaTypeExcluded({ excludedSchemas: ['params'] }, 'params'),
    true
  )

  t.equal(
    isSchemaTypeExcluded(
      { excludedSchemas: ['params', 'body', 'response'] },
      'params'
    ),
    true
  )

  t.equal(isSchemaTypeExcluded({ excludedSchemas: [] }, 'params'), false)
  t.equal(isSchemaTypeExcluded({ excludedSchemas: [] }, 'body'), false)
  t.equal(isSchemaTypeExcluded({ excludedSchemas: [] }, 'response'), false)
  t.equal(isSchemaTypeExcluded(null, 'response'), false)
  t.equal(isSchemaTypeExcluded(undefined, 'body'), false)
  t.equal(isSchemaTypeExcluded(), false)
})

test('hasProperties should return true if at least one property exists', async (t) => {
  t.plan(1)

  const schema = {
    schema: {
      body: {
        type: 'object',
        properties: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'string'
          },
          baz: {
            type: 'string'
          }
        }
      }
    }
  }

  t.equal(hasProperties(schema, 'body'), true)
})

test('enforce should be disabled for excluded paths without excludedSchemas property', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, {
    required: ['response'],
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

  await fastify.register(enforceSchema, {
    required: ['response']
  })

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

  await fastify.register(enforceSchema, {
    required: ['response']
  })

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
    required: ['body']
  })

  fastify.get('/foo', { schema: { body: false } }, (req, reply) => {
    reply.code(200).send('exclude works')
  })

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'exclude works')
})

test('enforce should be disabled for excluded paths via false option directly on schema.params', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, {
    required: ['params']
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
    required: ['body'],
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

test('No http status codes set in schema for required schema type', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema, {
    required: ['response']
  })

  try {
    fastify.get('/foo', { schema: { response: {} } }, (req, reply) => {
      reply.code(200).send('exclude works')
    })
  } catch (err) {
    t.equal(
      err.message,
      'No HTTP status codes provided in the response schema'
    )
  }
})

test('Http status code outside support set in schema for required schema type', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema, {
    required: ['response']
  })

  try {
    fastify.get('/foo', { schema: { response: { 600: {} } } }, (req, reply) => {
      reply.code(200).send('exclude works')
    })
  } catch (err) {
    t.equal(err.message, 'HTTP status codes from 100 - 599 supported')
  }
})
