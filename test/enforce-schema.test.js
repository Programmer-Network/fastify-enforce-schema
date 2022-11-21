"use strict";

const { test } = require("tap");
const Fastify = require("fastify");
const enforceSchema = require("../index.js");

test("Should fail if body schema is missing", t => {
  t.plan(3);

  const fastify = Fastify();

  fastify
    .register(enforceSchema, { required: ["body", "response"] })
    .ready(err => {
      if (err) console.error(err);
      console.log("READY");
    });

  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
            },
          },
        },
      },
    },
    (req, reply) => {
      console.log("ITS OK");
      reply.send("ok");
    }
  );

  fastify.inject(
    {
      method: "POST",
      url: "/",
      body: { name: "foo" },
    },
    (err, res) => {
      console.log("TEST DONE");
      t.error(err);
      t.equal(res.statusCode, 200);
      t.equal(res.payload, "ok");
    }
  );
});
