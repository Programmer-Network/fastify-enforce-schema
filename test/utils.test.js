'use strict'

const { test } = require('tap')
const {
  SCHEMA_TYPES,
  getErrorMessage,
  hasProperties,
  isSchemaTypeExcluded,
  isSchemaDisabled
} = require('../utils.js')

test('isSchemaDisabled should return true if all schemas disabled', async (t) => {
  t.plan(1)

  t.equal(isSchemaDisabled(Object.values(SCHEMA_TYPES)), true)
})

test('isSchemaDisabled should return false if not all schemas are disabled', async (t) => {
  t.plan(1)

  t.equal(isSchemaDisabled(['response', 'body']), false)
})

test('getErrorMessage should return a proper message', async (t) => {
  t.plan(3)

  t.equal(
    getErrorMessage({ schemaType: 'body' }, { path: '/bar', method: 'PUT' }),
    'PUT: /bar is missing a body schema'
  )
  t.equal(
    getErrorMessage({ schemaType: 'response' }, { path: '/bar', method: 'PUT' }),
    'PUT: /bar is missing a response schema'
  )
  t.equal(
    getErrorMessage({ schemaType: 'params' }, { path: '/bar', method: 'PUT' }),
    'PUT: /bar is missing a params schema'
  )
})

test('hasProperties should return 0 if no properties', async (t) => {
  t.plan(1)

  t.equal(hasProperties(null, 'whatever'), false)
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
