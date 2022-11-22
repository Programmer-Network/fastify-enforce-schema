"use strict";

const { test } = require("tap");
const Fastify = require("fastify");
const enforceSchema = require("../index.js");
const { getErrrorMessage, hasProperties } = require("../utils.js");

test("Should fail if body schema is missing", async t => {
  t.plan(1);

  const fastify = Fastify();

  await fastify.register(enforceSchema, { required: ["body"] });

  try {
    fastify.post("/foo", {}, (req, reply) => {
      reply.code(201).send("ok");
    });
  } catch (error) {
    t.equal(error.message, "/foo is missing a body schema");
  }
});

test("Should fail if response schema is missing", async t => {
  t.plan(1);

  const fastify = Fastify();

  await fastify.register(enforceSchema, { required: ["response"] });

  try {
    fastify.post("/foo", {}, (req, reply) => {
      reply.code(201).send("ok");
    });
  } catch (error) {
    t.equal(error.message, "/foo is missing a response schema");
  }
});

test("Should fail if params schema is missing", async t => {
  t.plan(1);

  const fastify = Fastify();

  await fastify.register(enforceSchema, { required: ["params"] });

  try {
    fastify.post("/foo", {}, (req, reply) => {
      reply.code(201).send("ok");
    });
  } catch (error) {
    t.equal(error.message, "/foo is missing a params schema");
  }
});

test("getErrorMessage should return a proper message", async t => {
  t.plan(3);

  t.equal(getErrrorMessage("body", "/bar"), "/bar is missing a body schema");
  t.equal(
    getErrrorMessage("response", "/bar"),
    "/bar is missing a response schema"
  );
  t.equal(
    getErrrorMessage("params", "/bar"),
    "/bar is missing a params schema"
  );
});

test("hasProperties should return 0 if no properties", async t => {
  t.plan(1);

  t.equal(hasProperties(null, "whatever"), false);
});

test("hasProperties should return true if at least one property exists", async t => {
  t.plan(1);

  const schema = {
    schema: {
      body: {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
          bar: {
            type: "string",
          },
          baz: {
            type: "string",
          },
        },
      },
    },
  };

  t.equal(hasProperties(schema, "body"), true);
});

test("enforce should be disabled for excluded paths", async t => {
  t.plan(2);

  const fastify = Fastify();

  await fastify.register(enforceSchema, {
    required: ["response"],
    exclude: ["/foo"],
  });

  fastify.get("/foo", {}, (req, reply) => {
    reply.code(200).send("exclude works");
  });

  const res = await fastify.inject({
    method: "GET",
    url: "/foo",
  });

  t.equal(res.statusCode, 200);
  t.equal(res.payload, "exclude works");
});
