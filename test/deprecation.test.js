'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const enforceSchema = require('../index.js')

test('handle "body: false" deprecation but avoid the Fastify warning and continue working as expected', async (t) => {
  t.plan(3)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  const warn = (warning) => {
    t.equal(warning.name, 'DeprecationWarning')
  }
  process.on('warning', warn)

  fastify.post(
    '/foo',
    {
      schema: {
        body: false
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

  process.off('warning', warn)
})

test('handle "params: false" deprecation but avoid the Fastify warning and continue working as expected', async (t) => {
  t.plan(3)

  const fastify = Fastify()
  await fastify.register(enforceSchema, { disabled: ['response'] })

  const warn = (warning) => {
    t.equal(warning.name, 'DeprecationWarning')
  }
  process.on('warning', warn)

  fastify.get(
    '/foo/:bar',
    {
      schema: {
        params: false
      }
    },
    (req, reply) => {
      reply.code(200).send('Success')
    }
  )
  const res = await fastify.inject({
    method: 'GET',
    url: '/foo/bar'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'Success')

  process.off('warning', warn)
})

test('should correctly add "body" to existing disabled array if "body: false"', async (t) => {
  t.plan(3)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  const warn = (warning) => {
    t.equal(warning.name, 'DeprecationWarning')
  }
  process.on('warning', warn)

  fastify.post(
    '/foo',
    {
      schema: {
        disabled: ['response'],
        body: false
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

  process.off('warning', warn)
})

test('should correctly add "params" to existing disabled array if "params: false"', async (t) => {
  t.plan(3)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  const warn = (warning) => {
    t.equal(warning.name, 'DeprecationWarning')
  }
  process.on('warning', warn)

  fastify.get(
    '/foo/:bar',
    {
      schema: {
        disabled: ['response'],
        params: false
      }
    },
    (req, reply) => {
      reply.code(200).send('Success')
    }
  )
  const res = await fastify.inject({
    method: 'GET',
    url: '/foo/bar'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'Success')

  process.off('warning', warn)
})

test('should correctly skip adding "body" if contained in disabled array', async (t) => {
  t.plan(3)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  const warn = (warning) => {
    t.equal(warning.name, 'DeprecationWarning')
  }
  process.on('warning', warn)

  fastify.post(
    '/foo',
    {
      schema: {
        disabled: ['response', 'body'],
        body: false
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

  process.off('warning', warn)
})

test('should correctly skip adding "params" if contained in disabled array', async (t) => {
  t.plan(3)

  const fastify = Fastify()
  await fastify.register(enforceSchema)

  const warn = (warning) => {
    t.equal(warning.name, 'DeprecationWarning')
  }
  process.on('warning', warn)

  fastify.get(
    '/foo/:bar',
    {
      schema: {
        disabled: ['response', 'params'],
        params: false
      }
    },
    (req, reply) => {
      reply.code(200).send('Success')
    }
  )
  const res = await fastify.inject({
    method: 'GET',
    url: '/foo/bar'
  })

  t.equal(res.statusCode, 200)
  t.equal(res.payload, 'Success')

  process.off('warning', warn)
})
