/// <reference types="node" />

import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyRequest,
} from "fastify";

type OriginCallback = (err: Error | null, allow: boolean) => void;
type OriginType = string | boolean | RegExp;
type ValueOrArray<T> = T | ArrayOfValueOrArray<T>;

interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}

type FastifyEnforceSchemaPlugin = FastifyPluginCallback<
  | NonNullable<fastifyEnforceSchema.FastifyEnforceSchemaOptions>
  | fastifyEnforceSchema.FastifyEnforceSchemaOptionsDelegate
>;

enum SchemaTypes {
  Body = "body",
  Response = "response",
  Params = "params",
}

declare namespace fasticyEnforceSchema {
  export type OriginFunction = (
    origin: string,
    callback: OriginCallback
  ) => void;

  export interface FastifyEnforceSchemaOptions {
    required: string[SchemaTypes];
    /**
     * A list of endpoints to exclude by the route path
     */
    exclude: string[];
  }

  export interface FastifyEnforceSchemaOptionsDelegateCallback {
    (
      req: FastifyRequest,
      cb: (
        error: Error | null,
        enforceSchemaOptions?: FastifyEnforceSchemaOptions
      ) => void
    ): void;
  }

  export interface FastifyEnforceSchemaOptionsDelegatePromise {
    (req: FastifyRequest): Promise<FastifyEnforceSchemaOptions>;
  }

  export type FastifyEnforceSchemaOptionsDelegate =
    | FastifyEnforceSchemaOptionsDelegateCallback
    | FastifyEnforceSchemaOptionsDelegatePromise;

  export type FastifyPluginOptionsDelegate<
    T = FastifyEnforceSchemaOptionsDelegate
  > = (instance: FastifyInstance) => T;

  export const fastifyEnforceSchema: FastifyEnforceSchemaPlugin;
  export { fastifyEnforceSchema as default };
}

declare function fastifyEnforceSchema(
  ...params: Parameters<FastifyEnforceSchemaPlugin>
): ReturnType<FastifyEnforceSchemaPlugin>;

export = fastifyEnforceSchema;
