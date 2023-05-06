'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const enforceSchema = require('../index.js')

test('response schema should fail if incomplete', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  try {
    fastify.get(
      '/foo',
      { schema: { response: { 201: false } } },
      (req, reply) => {
        reply.code(201).send('ok')
      }
    )
  } catch (err) {
    t.equal(
      err.message,
      'FastifyEnforceSchema: In GET: /foo, schema response key "201" must be a non-empty object.'
    )
  }
})

test('response schema should accept top-level properties', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  fastify.get(
    '/foo',
    {
      schema: {
        response: {
          200: {
            message: { type: 'string' }
          }
        }
      }
    },
    (req, reply) => {
      reply.code(200).send({ message: 'ok' })
    }
  )

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo'
  })

  t.equal(res.statusCode, 200)
  t.equal(JSON.parse(res.body).message, 'ok')
})

test('Should pass if response schema is upheld', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  fastify.get(
    '/foo',
    {
      schema: {
        response: {
          200: {
            type: 'string'
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
})

test('Should pass if response contains default key', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  fastify.get(
    '/foo',
    {
      schema: {
        response: {
          default: {
            type: 'string'
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
})

test('body schema should accept top-level properties', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.post(
    '/foo',
    {
      schema: {
        body: {
          bar: { type: 'string' }
        }
      }
    },
    (req, reply) => {
      reply.code(200).send('ok')
    }
  )

  const res = await fastify.inject({
    method: 'POST',
    url: '/foo',
    payload: { bar: 'baz' }
  })

  t.equal(res.statusCode, 200)
})

test('body schema should fail if request contradicts schema', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.post(
    '/foo',
    {
      schema: {
        body: {
          bar: { type: 'string' }
        }
      }
    },
    (req, reply) => {
      reply.code(200).send('ok')
    }
  )

  const res = await fastify.inject({
    method: 'POST',
    url: '/foo',
    payload: { bar: { foo: 'baz' } }
  })

  t.equal(res.statusCode, 400)
})

test('Should fail if required body property is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.post(
    '/foo',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            foo: { type: 'string' }
          },
          required: ['foo']
        }
      }
    },
    (req, reply) => {
      reply.code(200).send('ok')
    }
  )

  const res = await fastify.inject({
    method: 'POST',
    url: '/foo'
  })

  t.equal(res.statusCode, 400)
})

test('Should pass if body schema is upheld', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.post(
    '/foo',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            bar: { type: 'string' }
          },
          required: ['bar']
        }
      }
    },
    (req, reply) => {
      reply.code(200).send('ok')
    }
  )

  const res = await fastify.inject({
    method: 'POST',
    url: '/foo',
    payload: { bar: 'baz' }
  })

  t.equal(res.statusCode, 200)
})

test('params schema should accept top-level properties', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.get(
    '/foo/:bar',
    {
      schema: {
        params: {
          bar: { type: 'string' }
        }
      }
    },
    (req, reply) => {
      reply.code(200).send('ok')
    }
  )

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo/baz'
  })

  t.equal(res.statusCode, 200)
})

test('params schema should fail if request contradicts schema', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.get(
    '/foo/:bar',
    {
      schema: {
        params: {
          bar: { type: 'number' }
        }
      }
    },
    (req, reply) => {
      reply.code(200).send('ok')
    }
  )

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo/bar'
  })

  t.equal(res.statusCode, 400)
})

test('Should pass if params schema is upheld', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.get(
    '/foo/:bar',
    {
      schema: {
        params: {
          bar: { type: 'string' }
        }
      }
    },
    (req, reply) => {
      reply.code(200).send('ok')
    }
  )

  const res = await fastify.inject({
    method: 'GET',
    url: '/foo/bar'
  })

  t.equal(res.statusCode, 200)
})

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

test('Should fail if schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema)

  try {
    fastify.post('/foo', {}, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(
      error.message,
      'FastifyEnforceSchema: POST: /foo is missing a schema'
    )
  }
})

test('Should fail if body schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema, { disabled: ['response'] })

  try {
    fastify.post('/foo', { schema: {} }, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(
      error.message,
      'FastifyEnforceSchema: POST: /foo is missing a body schema'
    )
  }
})

test('Should fail if response schema is missing', async (t) => {
  t.plan(1)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  try {
    fastify.post('/foo', { schema: {} }, (req, reply) => {
      reply.code(201).send('ok')
    })
  } catch (error) {
    t.equal(
      error.message,
      'FastifyEnforceSchema: POST: /foo is missing a response schema'
    )
  }
})

test('Should fail if response schema values are not integers between 100 - 599', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema)

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
      'FastifyEnforceSchema: In POST: /foo, "dog" is not `default` or a supported HTTP status code.'
    )
  }
})

test('Should pass if the keys in the response schema are valid HTTP codes', async (t) => {
  t.plan(2)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

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
    t.equal(
      error.message,
      'FastifyEnforceSchema: GET: /foo/:bar is missing a params schema'
    )
  }
})

test('enforce should be disabled for excluded paths without excludedSchemas property', async (t) => {
  t.plan(2)

  const fastify = Fastify()

  await fastify.register(enforceSchema, { exclude: [{ url: '/foo' }] })

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

  await fastify.register(enforceSchema)

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

  await fastify.register(enforceSchema)

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

  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.post('/foo', { schema: { disabled: ['body'] } }, (req, reply) => {
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

  await fastify.register(enforceSchema, { disabled: ['response'] })

  fastify.get(
    '/foo/:bar',
    { schema: { disabled: ['params'] } },
    (req, reply) => {
      reply.code(200).send('exclude works')
    }
  )

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

  await fastify.register(enforceSchema)

  try {
    fastify.get('/foo', { schema: { response: {} } }, (req, reply) => {
      reply.code(200).send('exclude works')
    })
  } catch (err) {
    t.equal(
      err.message,
      'FastifyEnforceSchema: In GET: /foo, no HTTP status codes were provided in the response schema.'
    )
  }
})

test('Http status code outside support set in schema for required schema type', async (t) => {
  t.plan(1)

  const fastify = Fastify()

  await fastify.register(enforceSchema)

  try {
    fastify.get('/foo', { schema: { response: { 600: {} } } }, (req, reply) => {
      reply.code(200).send('exclude works')
    })
  } catch (err) {
    t.equal(
      err.message,
      'FastifyEnforceSchema: In GET: /foo, schema response key "600" must be a valid HTTP code which ranges from 100 - 599.'
    )
  }
})
