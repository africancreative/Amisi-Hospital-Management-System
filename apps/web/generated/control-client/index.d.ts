
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model Module
 * 
 */
export type Module = $Result.DefaultSelection<Prisma.$ModulePayload>
/**
 * Model TenantModule
 * 
 */
export type TenantModule = $Result.DefaultSelection<Prisma.$TenantModulePayload>
/**
 * Model SystemAdmin
 * 
 */
export type SystemAdmin = $Result.DefaultSelection<Prisma.$SystemAdminPayload>
/**
 * Model GlobalSettings
 * 
 */
export type GlobalSettings = $Result.DefaultSelection<Prisma.$GlobalSettingsPayload>
/**
 * Model SystemPayment
 * 
 */
export type SystemPayment = $Result.DefaultSelection<Prisma.$SystemPaymentPayload>
/**
 * Model Plan
 * 
 */
export type Plan = $Result.DefaultSelection<Prisma.$PlanPayload>
/**
 * Model Subscription
 * 
 */
export type Subscription = $Result.DefaultSelection<Prisma.$SubscriptionPayload>
/**
 * Model PatientIndex
 * 
 */
export type PatientIndex = $Result.DefaultSelection<Prisma.$PatientIndexPayload>
/**
 * Model TenantUsage
 * 
 */
export type TenantUsage = $Result.DefaultSelection<Prisma.$TenantUsagePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const DeploymentTier: {
  CLINIC: 'CLINIC',
  HOSPITAL: 'HOSPITAL',
  NETWORK: 'NETWORK',
  GENERAL: 'GENERAL',
  RESEARCH: 'RESEARCH'
};

export type DeploymentTier = (typeof DeploymentTier)[keyof typeof DeploymentTier]


export const TenantStatus: {
  active: 'active',
  suspended: 'suspended',
  terminated: 'terminated'
};

export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus]


export const BillingCycle: {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
};

export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle]

}

export type DeploymentTier = $Enums.DeploymentTier

export const DeploymentTier: typeof $Enums.DeploymentTier

export type TenantStatus = $Enums.TenantStatus

export const TenantStatus: typeof $Enums.TenantStatus

export type BillingCycle = $Enums.BillingCycle

export const BillingCycle: typeof $Enums.BillingCycle

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs>;

  /**
   * `prisma.module`: Exposes CRUD operations for the **Module** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Modules
    * const modules = await prisma.module.findMany()
    * ```
    */
  get module(): Prisma.ModuleDelegate<ExtArgs>;

  /**
   * `prisma.tenantModule`: Exposes CRUD operations for the **TenantModule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantModules
    * const tenantModules = await prisma.tenantModule.findMany()
    * ```
    */
  get tenantModule(): Prisma.TenantModuleDelegate<ExtArgs>;

  /**
   * `prisma.systemAdmin`: Exposes CRUD operations for the **SystemAdmin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemAdmins
    * const systemAdmins = await prisma.systemAdmin.findMany()
    * ```
    */
  get systemAdmin(): Prisma.SystemAdminDelegate<ExtArgs>;

  /**
   * `prisma.globalSettings`: Exposes CRUD operations for the **GlobalSettings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GlobalSettings
    * const globalSettings = await prisma.globalSettings.findMany()
    * ```
    */
  get globalSettings(): Prisma.GlobalSettingsDelegate<ExtArgs>;

  /**
   * `prisma.systemPayment`: Exposes CRUD operations for the **SystemPayment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemPayments
    * const systemPayments = await prisma.systemPayment.findMany()
    * ```
    */
  get systemPayment(): Prisma.SystemPaymentDelegate<ExtArgs>;

  /**
   * `prisma.plan`: Exposes CRUD operations for the **Plan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Plans
    * const plans = await prisma.plan.findMany()
    * ```
    */
  get plan(): Prisma.PlanDelegate<ExtArgs>;

  /**
   * `prisma.subscription`: Exposes CRUD operations for the **Subscription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Subscriptions
    * const subscriptions = await prisma.subscription.findMany()
    * ```
    */
  get subscription(): Prisma.SubscriptionDelegate<ExtArgs>;

  /**
   * `prisma.patientIndex`: Exposes CRUD operations for the **PatientIndex** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PatientIndices
    * const patientIndices = await prisma.patientIndex.findMany()
    * ```
    */
  get patientIndex(): Prisma.PatientIndexDelegate<ExtArgs>;

  /**
   * `prisma.tenantUsage`: Exposes CRUD operations for the **TenantUsage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TenantUsages
    * const tenantUsages = await prisma.tenantUsage.findMany()
    * ```
    */
  get tenantUsage(): Prisma.TenantUsageDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Tenant: 'Tenant',
    Module: 'Module',
    TenantModule: 'TenantModule',
    SystemAdmin: 'SystemAdmin',
    GlobalSettings: 'GlobalSettings',
    SystemPayment: 'SystemPayment',
    Plan: 'Plan',
    Subscription: 'Subscription',
    PatientIndex: 'PatientIndex',
    TenantUsage: 'TenantUsage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "tenant" | "module" | "tenantModule" | "systemAdmin" | "globalSettings" | "systemPayment" | "plan" | "subscription" | "patientIndex" | "tenantUsage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      Module: {
        payload: Prisma.$ModulePayload<ExtArgs>
        fields: Prisma.ModuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ModuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ModuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload>
          }
          findFirst: {
            args: Prisma.ModuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ModuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload>
          }
          findMany: {
            args: Prisma.ModuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload>[]
          }
          create: {
            args: Prisma.ModuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload>
          }
          createMany: {
            args: Prisma.ModuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ModuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload>[]
          }
          delete: {
            args: Prisma.ModuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload>
          }
          update: {
            args: Prisma.ModuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload>
          }
          deleteMany: {
            args: Prisma.ModuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ModuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ModuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModulePayload>
          }
          aggregate: {
            args: Prisma.ModuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateModule>
          }
          groupBy: {
            args: Prisma.ModuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<ModuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.ModuleCountArgs<ExtArgs>
            result: $Utils.Optional<ModuleCountAggregateOutputType> | number
          }
        }
      }
      TenantModule: {
        payload: Prisma.$TenantModulePayload<ExtArgs>
        fields: Prisma.TenantModuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantModuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantModuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          findFirst: {
            args: Prisma.TenantModuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantModuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          findMany: {
            args: Prisma.TenantModuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>[]
          }
          create: {
            args: Prisma.TenantModuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          createMany: {
            args: Prisma.TenantModuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantModuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>[]
          }
          delete: {
            args: Prisma.TenantModuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          update: {
            args: Prisma.TenantModuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          deleteMany: {
            args: Prisma.TenantModuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantModuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantModuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantModulePayload>
          }
          aggregate: {
            args: Prisma.TenantModuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantModule>
          }
          groupBy: {
            args: Prisma.TenantModuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantModuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantModuleCountArgs<ExtArgs>
            result: $Utils.Optional<TenantModuleCountAggregateOutputType> | number
          }
        }
      }
      SystemAdmin: {
        payload: Prisma.$SystemAdminPayload<ExtArgs>
        fields: Prisma.SystemAdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemAdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemAdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload>
          }
          findFirst: {
            args: Prisma.SystemAdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemAdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload>
          }
          findMany: {
            args: Prisma.SystemAdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload>[]
          }
          create: {
            args: Prisma.SystemAdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload>
          }
          createMany: {
            args: Prisma.SystemAdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SystemAdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload>[]
          }
          delete: {
            args: Prisma.SystemAdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload>
          }
          update: {
            args: Prisma.SystemAdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload>
          }
          deleteMany: {
            args: Prisma.SystemAdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemAdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SystemAdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemAdminPayload>
          }
          aggregate: {
            args: Prisma.SystemAdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemAdmin>
          }
          groupBy: {
            args: Prisma.SystemAdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemAdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemAdminCountArgs<ExtArgs>
            result: $Utils.Optional<SystemAdminCountAggregateOutputType> | number
          }
        }
      }
      GlobalSettings: {
        payload: Prisma.$GlobalSettingsPayload<ExtArgs>
        fields: Prisma.GlobalSettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GlobalSettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GlobalSettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload>
          }
          findFirst: {
            args: Prisma.GlobalSettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GlobalSettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload>
          }
          findMany: {
            args: Prisma.GlobalSettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload>[]
          }
          create: {
            args: Prisma.GlobalSettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload>
          }
          createMany: {
            args: Prisma.GlobalSettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GlobalSettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload>[]
          }
          delete: {
            args: Prisma.GlobalSettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload>
          }
          update: {
            args: Prisma.GlobalSettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload>
          }
          deleteMany: {
            args: Prisma.GlobalSettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GlobalSettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GlobalSettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalSettingsPayload>
          }
          aggregate: {
            args: Prisma.GlobalSettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGlobalSettings>
          }
          groupBy: {
            args: Prisma.GlobalSettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<GlobalSettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.GlobalSettingsCountArgs<ExtArgs>
            result: $Utils.Optional<GlobalSettingsCountAggregateOutputType> | number
          }
        }
      }
      SystemPayment: {
        payload: Prisma.$SystemPaymentPayload<ExtArgs>
        fields: Prisma.SystemPaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemPaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemPaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload>
          }
          findFirst: {
            args: Prisma.SystemPaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemPaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload>
          }
          findMany: {
            args: Prisma.SystemPaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload>[]
          }
          create: {
            args: Prisma.SystemPaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload>
          }
          createMany: {
            args: Prisma.SystemPaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SystemPaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload>[]
          }
          delete: {
            args: Prisma.SystemPaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload>
          }
          update: {
            args: Prisma.SystemPaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload>
          }
          deleteMany: {
            args: Prisma.SystemPaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemPaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SystemPaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemPaymentPayload>
          }
          aggregate: {
            args: Prisma.SystemPaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemPayment>
          }
          groupBy: {
            args: Prisma.SystemPaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemPaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemPaymentCountArgs<ExtArgs>
            result: $Utils.Optional<SystemPaymentCountAggregateOutputType> | number
          }
        }
      }
      Plan: {
        payload: Prisma.$PlanPayload<ExtArgs>
        fields: Prisma.PlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload>
          }
          findFirst: {
            args: Prisma.PlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload>
          }
          findMany: {
            args: Prisma.PlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload>[]
          }
          create: {
            args: Prisma.PlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload>
          }
          createMany: {
            args: Prisma.PlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload>[]
          }
          delete: {
            args: Prisma.PlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload>
          }
          update: {
            args: Prisma.PlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload>
          }
          deleteMany: {
            args: Prisma.PlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlanPayload>
          }
          aggregate: {
            args: Prisma.PlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlan>
          }
          groupBy: {
            args: Prisma.PlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlanCountArgs<ExtArgs>
            result: $Utils.Optional<PlanCountAggregateOutputType> | number
          }
        }
      }
      Subscription: {
        payload: Prisma.$SubscriptionPayload<ExtArgs>
        fields: Prisma.SubscriptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SubscriptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SubscriptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          findFirst: {
            args: Prisma.SubscriptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SubscriptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          findMany: {
            args: Prisma.SubscriptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>[]
          }
          create: {
            args: Prisma.SubscriptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          createMany: {
            args: Prisma.SubscriptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SubscriptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>[]
          }
          delete: {
            args: Prisma.SubscriptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          update: {
            args: Prisma.SubscriptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          deleteMany: {
            args: Prisma.SubscriptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SubscriptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SubscriptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          aggregate: {
            args: Prisma.SubscriptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubscription>
          }
          groupBy: {
            args: Prisma.SubscriptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SubscriptionCountArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionCountAggregateOutputType> | number
          }
        }
      }
      PatientIndex: {
        payload: Prisma.$PatientIndexPayload<ExtArgs>
        fields: Prisma.PatientIndexFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PatientIndexFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PatientIndexFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload>
          }
          findFirst: {
            args: Prisma.PatientIndexFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PatientIndexFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload>
          }
          findMany: {
            args: Prisma.PatientIndexFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload>[]
          }
          create: {
            args: Prisma.PatientIndexCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload>
          }
          createMany: {
            args: Prisma.PatientIndexCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PatientIndexCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload>[]
          }
          delete: {
            args: Prisma.PatientIndexDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload>
          }
          update: {
            args: Prisma.PatientIndexUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload>
          }
          deleteMany: {
            args: Prisma.PatientIndexDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PatientIndexUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PatientIndexUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PatientIndexPayload>
          }
          aggregate: {
            args: Prisma.PatientIndexAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePatientIndex>
          }
          groupBy: {
            args: Prisma.PatientIndexGroupByArgs<ExtArgs>
            result: $Utils.Optional<PatientIndexGroupByOutputType>[]
          }
          count: {
            args: Prisma.PatientIndexCountArgs<ExtArgs>
            result: $Utils.Optional<PatientIndexCountAggregateOutputType> | number
          }
        }
      }
      TenantUsage: {
        payload: Prisma.$TenantUsagePayload<ExtArgs>
        fields: Prisma.TenantUsageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantUsageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantUsageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload>
          }
          findFirst: {
            args: Prisma.TenantUsageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantUsageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload>
          }
          findMany: {
            args: Prisma.TenantUsageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload>[]
          }
          create: {
            args: Prisma.TenantUsageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload>
          }
          createMany: {
            args: Prisma.TenantUsageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantUsageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload>[]
          }
          delete: {
            args: Prisma.TenantUsageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload>
          }
          update: {
            args: Prisma.TenantUsageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload>
          }
          deleteMany: {
            args: Prisma.TenantUsageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUsageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantUsageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantUsagePayload>
          }
          aggregate: {
            args: Prisma.TenantUsageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenantUsage>
          }
          groupBy: {
            args: Prisma.TenantUsageGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantUsageGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantUsageCountArgs<ExtArgs>
            result: $Utils.Optional<TenantUsageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    entitlements: number
    payments: number
    subscriptions: number
    usages: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entitlements?: boolean | TenantCountOutputTypeCountEntitlementsArgs
    payments?: boolean | TenantCountOutputTypeCountPaymentsArgs
    subscriptions?: boolean | TenantCountOutputTypeCountSubscriptionsArgs
    usages?: boolean | TenantCountOutputTypeCountUsagesArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountEntitlementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantModuleWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountPaymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemPaymentWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountSubscriptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantUsageWhereInput
  }


  /**
   * Count Type ModuleCountOutputType
   */

  export type ModuleCountOutputType = {
    tenants: number
  }

  export type ModuleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | ModuleCountOutputTypeCountTenantsArgs
  }

  // Custom InputTypes
  /**
   * ModuleCountOutputType without action
   */
  export type ModuleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModuleCountOutputType
     */
    select?: ModuleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ModuleCountOutputType without action
   */
  export type ModuleCountOutputTypeCountTenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantModuleWhereInput
  }


  /**
   * Count Type PlanCountOutputType
   */

  export type PlanCountOutputType = {
    subscriptions: number
  }

  export type PlanCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subscriptions?: boolean | PlanCountOutputTypeCountSubscriptionsArgs
  }

  // Custom InputTypes
  /**
   * PlanCountOutputType without action
   */
  export type PlanCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlanCountOutputType
     */
    select?: PlanCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PlanCountOutputType without action
   */
  export type PlanCountOutputTypeCountSubscriptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionWhereInput
  }


  /**
   * Count Type SubscriptionCountOutputType
   */

  export type SubscriptionCountOutputType = {
    usages: number
  }

  export type SubscriptionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usages?: boolean | SubscriptionCountOutputTypeCountUsagesArgs
  }

  // Custom InputTypes
  /**
   * SubscriptionCountOutputType without action
   */
  export type SubscriptionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionCountOutputType
     */
    select?: SubscriptionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SubscriptionCountOutputType without action
   */
  export type SubscriptionCountOutputTypeCountUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantUsageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    dbUrl: string | null
    encryptionKeyReference: string | null
    tier: $Enums.DeploymentTier | null
    region: string | null
    status: $Enums.TenantStatus | null
    suspensionReason: string | null
    suspendedAt: Date | null
    address: string | null
    logoUrl: string | null
    primaryColor: string | null
    secondaryColor: string | null
    trialEndsAt: Date | null
    publicKeySpki: string | null
    sharedSecret: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    dbUrl: string | null
    encryptionKeyReference: string | null
    tier: $Enums.DeploymentTier | null
    region: string | null
    status: $Enums.TenantStatus | null
    suspensionReason: string | null
    suspendedAt: Date | null
    address: string | null
    logoUrl: string | null
    primaryColor: string | null
    secondaryColor: string | null
    trialEndsAt: Date | null
    publicKeySpki: string | null
    sharedSecret: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    dbUrl: number
    encryptionKeyReference: number
    tier: number
    region: number
    status: number
    suspensionReason: number
    suspendedAt: number
    address: number
    logoUrl: number
    primaryColor: number
    secondaryColor: number
    trialEndsAt: number
    enabledModules: number
    publicKeySpki: number
    sharedSecret: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    dbUrl?: true
    encryptionKeyReference?: true
    tier?: true
    region?: true
    status?: true
    suspensionReason?: true
    suspendedAt?: true
    address?: true
    logoUrl?: true
    primaryColor?: true
    secondaryColor?: true
    trialEndsAt?: true
    publicKeySpki?: true
    sharedSecret?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    dbUrl?: true
    encryptionKeyReference?: true
    tier?: true
    region?: true
    status?: true
    suspensionReason?: true
    suspendedAt?: true
    address?: true
    logoUrl?: true
    primaryColor?: true
    secondaryColor?: true
    trialEndsAt?: true
    publicKeySpki?: true
    sharedSecret?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    dbUrl?: true
    encryptionKeyReference?: true
    tier?: true
    region?: true
    status?: true
    suspensionReason?: true
    suspendedAt?: true
    address?: true
    logoUrl?: true
    primaryColor?: true
    secondaryColor?: true
    trialEndsAt?: true
    enabledModules?: true
    publicKeySpki?: true
    sharedSecret?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier: $Enums.DeploymentTier
    region: string
    status: $Enums.TenantStatus
    suspensionReason: string | null
    suspendedAt: Date | null
    address: string | null
    logoUrl: string | null
    primaryColor: string | null
    secondaryColor: string | null
    trialEndsAt: Date | null
    enabledModules: JsonValue
    publicKeySpki: string | null
    sharedSecret: string | null
    createdAt: Date
    updatedAt: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    dbUrl?: boolean
    encryptionKeyReference?: boolean
    tier?: boolean
    region?: boolean
    status?: boolean
    suspensionReason?: boolean
    suspendedAt?: boolean
    address?: boolean
    logoUrl?: boolean
    primaryColor?: boolean
    secondaryColor?: boolean
    trialEndsAt?: boolean
    enabledModules?: boolean
    publicKeySpki?: boolean
    sharedSecret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    entitlements?: boolean | Tenant$entitlementsArgs<ExtArgs>
    payments?: boolean | Tenant$paymentsArgs<ExtArgs>
    subscriptions?: boolean | Tenant$subscriptionsArgs<ExtArgs>
    usages?: boolean | Tenant$usagesArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    dbUrl?: boolean
    encryptionKeyReference?: boolean
    tier?: boolean
    region?: boolean
    status?: boolean
    suspensionReason?: boolean
    suspendedAt?: boolean
    address?: boolean
    logoUrl?: boolean
    primaryColor?: boolean
    secondaryColor?: boolean
    trialEndsAt?: boolean
    enabledModules?: boolean
    publicKeySpki?: boolean
    sharedSecret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    dbUrl?: boolean
    encryptionKeyReference?: boolean
    tier?: boolean
    region?: boolean
    status?: boolean
    suspensionReason?: boolean
    suspendedAt?: boolean
    address?: boolean
    logoUrl?: boolean
    primaryColor?: boolean
    secondaryColor?: boolean
    trialEndsAt?: boolean
    enabledModules?: boolean
    publicKeySpki?: boolean
    sharedSecret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entitlements?: boolean | Tenant$entitlementsArgs<ExtArgs>
    payments?: boolean | Tenant$paymentsArgs<ExtArgs>
    subscriptions?: boolean | Tenant$subscriptionsArgs<ExtArgs>
    usages?: boolean | Tenant$usagesArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      entitlements: Prisma.$TenantModulePayload<ExtArgs>[]
      payments: Prisma.$SystemPaymentPayload<ExtArgs>[]
      subscriptions: Prisma.$SubscriptionPayload<ExtArgs>[]
      usages: Prisma.$TenantUsagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      dbUrl: string
      encryptionKeyReference: string
      tier: $Enums.DeploymentTier
      region: string
      status: $Enums.TenantStatus
      suspensionReason: string | null
      suspendedAt: Date | null
      address: string | null
      logoUrl: string | null
      primaryColor: string | null
      secondaryColor: string | null
      trialEndsAt: Date | null
      enabledModules: Prisma.JsonValue
      publicKeySpki: string | null
      sharedSecret: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    entitlements<T extends Tenant$entitlementsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$entitlementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findMany"> | Null>
    payments<T extends Tenant$paymentsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "findMany"> | Null>
    subscriptions<T extends Tenant$subscriptionsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$subscriptionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findMany"> | Null>
    usages<T extends Tenant$usagesArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$usagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */ 
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly dbUrl: FieldRef<"Tenant", 'String'>
    readonly encryptionKeyReference: FieldRef<"Tenant", 'String'>
    readonly tier: FieldRef<"Tenant", 'DeploymentTier'>
    readonly region: FieldRef<"Tenant", 'String'>
    readonly status: FieldRef<"Tenant", 'TenantStatus'>
    readonly suspensionReason: FieldRef<"Tenant", 'String'>
    readonly suspendedAt: FieldRef<"Tenant", 'DateTime'>
    readonly address: FieldRef<"Tenant", 'String'>
    readonly logoUrl: FieldRef<"Tenant", 'String'>
    readonly primaryColor: FieldRef<"Tenant", 'String'>
    readonly secondaryColor: FieldRef<"Tenant", 'String'>
    readonly trialEndsAt: FieldRef<"Tenant", 'DateTime'>
    readonly enabledModules: FieldRef<"Tenant", 'Json'>
    readonly publicKeySpki: FieldRef<"Tenant", 'String'>
    readonly sharedSecret: FieldRef<"Tenant", 'String'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
  }

  /**
   * Tenant.entitlements
   */
  export type Tenant$entitlementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    where?: TenantModuleWhereInput
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    cursor?: TenantModuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * Tenant.payments
   */
  export type Tenant$paymentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    where?: SystemPaymentWhereInput
    orderBy?: SystemPaymentOrderByWithRelationInput | SystemPaymentOrderByWithRelationInput[]
    cursor?: SystemPaymentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SystemPaymentScalarFieldEnum | SystemPaymentScalarFieldEnum[]
  }

  /**
   * Tenant.subscriptions
   */
  export type Tenant$subscriptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    where?: SubscriptionWhereInput
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    cursor?: SubscriptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Tenant.usages
   */
  export type Tenant$usagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    where?: TenantUsageWhereInput
    orderBy?: TenantUsageOrderByWithRelationInput | TenantUsageOrderByWithRelationInput[]
    cursor?: TenantUsageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantUsageScalarFieldEnum | TenantUsageScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model Module
   */

  export type AggregateModule = {
    _count: ModuleCountAggregateOutputType | null
    _avg: ModuleAvgAggregateOutputType | null
    _sum: ModuleSumAggregateOutputType | null
    _min: ModuleMinAggregateOutputType | null
    _max: ModuleMaxAggregateOutputType | null
  }

  export type ModuleAvgAggregateOutputType = {
    basePrice: Decimal | null
  }

  export type ModuleSumAggregateOutputType = {
    basePrice: Decimal | null
  }

  export type ModuleMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    description: string | null
    basePrice: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ModuleMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    description: string | null
    basePrice: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ModuleCountAggregateOutputType = {
    id: number
    name: number
    code: number
    description: number
    basePrice: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ModuleAvgAggregateInputType = {
    basePrice?: true
  }

  export type ModuleSumAggregateInputType = {
    basePrice?: true
  }

  export type ModuleMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    basePrice?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ModuleMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    basePrice?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ModuleCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    basePrice?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ModuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Module to aggregate.
     */
    where?: ModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Modules to fetch.
     */
    orderBy?: ModuleOrderByWithRelationInput | ModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Modules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Modules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Modules
    **/
    _count?: true | ModuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ModuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ModuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ModuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ModuleMaxAggregateInputType
  }

  export type GetModuleAggregateType<T extends ModuleAggregateArgs> = {
        [P in keyof T & keyof AggregateModule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateModule[P]>
      : GetScalarType<T[P], AggregateModule[P]>
  }




  export type ModuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ModuleWhereInput
    orderBy?: ModuleOrderByWithAggregationInput | ModuleOrderByWithAggregationInput[]
    by: ModuleScalarFieldEnum[] | ModuleScalarFieldEnum
    having?: ModuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ModuleCountAggregateInputType | true
    _avg?: ModuleAvgAggregateInputType
    _sum?: ModuleSumAggregateInputType
    _min?: ModuleMinAggregateInputType
    _max?: ModuleMaxAggregateInputType
  }

  export type ModuleGroupByOutputType = {
    id: string
    name: string
    code: string
    description: string | null
    basePrice: Decimal
    createdAt: Date
    updatedAt: Date
    _count: ModuleCountAggregateOutputType | null
    _avg: ModuleAvgAggregateOutputType | null
    _sum: ModuleSumAggregateOutputType | null
    _min: ModuleMinAggregateOutputType | null
    _max: ModuleMaxAggregateOutputType | null
  }

  type GetModuleGroupByPayload<T extends ModuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ModuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ModuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ModuleGroupByOutputType[P]>
            : GetScalarType<T[P], ModuleGroupByOutputType[P]>
        }
      >
    >


  export type ModuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    basePrice?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenants?: boolean | Module$tenantsArgs<ExtArgs>
    _count?: boolean | ModuleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["module"]>

  export type ModuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    basePrice?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["module"]>

  export type ModuleSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    basePrice?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ModuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | Module$tenantsArgs<ExtArgs>
    _count?: boolean | ModuleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ModuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ModulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Module"
    objects: {
      tenants: Prisma.$TenantModulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      description: string | null
      basePrice: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["module"]>
    composites: {}
  }

  type ModuleGetPayload<S extends boolean | null | undefined | ModuleDefaultArgs> = $Result.GetResult<Prisma.$ModulePayload, S>

  type ModuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ModuleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ModuleCountAggregateInputType | true
    }

  export interface ModuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Module'], meta: { name: 'Module' } }
    /**
     * Find zero or one Module that matches the filter.
     * @param {ModuleFindUniqueArgs} args - Arguments to find a Module
     * @example
     * // Get one Module
     * const module = await prisma.module.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ModuleFindUniqueArgs>(args: SelectSubset<T, ModuleFindUniqueArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Module that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ModuleFindUniqueOrThrowArgs} args - Arguments to find a Module
     * @example
     * // Get one Module
     * const module = await prisma.module.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ModuleFindUniqueOrThrowArgs>(args: SelectSubset<T, ModuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Module that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleFindFirstArgs} args - Arguments to find a Module
     * @example
     * // Get one Module
     * const module = await prisma.module.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ModuleFindFirstArgs>(args?: SelectSubset<T, ModuleFindFirstArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Module that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleFindFirstOrThrowArgs} args - Arguments to find a Module
     * @example
     * // Get one Module
     * const module = await prisma.module.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ModuleFindFirstOrThrowArgs>(args?: SelectSubset<T, ModuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Modules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Modules
     * const modules = await prisma.module.findMany()
     * 
     * // Get first 10 Modules
     * const modules = await prisma.module.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const moduleWithIdOnly = await prisma.module.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ModuleFindManyArgs>(args?: SelectSubset<T, ModuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Module.
     * @param {ModuleCreateArgs} args - Arguments to create a Module.
     * @example
     * // Create one Module
     * const Module = await prisma.module.create({
     *   data: {
     *     // ... data to create a Module
     *   }
     * })
     * 
     */
    create<T extends ModuleCreateArgs>(args: SelectSubset<T, ModuleCreateArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Modules.
     * @param {ModuleCreateManyArgs} args - Arguments to create many Modules.
     * @example
     * // Create many Modules
     * const module = await prisma.module.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ModuleCreateManyArgs>(args?: SelectSubset<T, ModuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Modules and returns the data saved in the database.
     * @param {ModuleCreateManyAndReturnArgs} args - Arguments to create many Modules.
     * @example
     * // Create many Modules
     * const module = await prisma.module.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Modules and only return the `id`
     * const moduleWithIdOnly = await prisma.module.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ModuleCreateManyAndReturnArgs>(args?: SelectSubset<T, ModuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Module.
     * @param {ModuleDeleteArgs} args - Arguments to delete one Module.
     * @example
     * // Delete one Module
     * const Module = await prisma.module.delete({
     *   where: {
     *     // ... filter to delete one Module
     *   }
     * })
     * 
     */
    delete<T extends ModuleDeleteArgs>(args: SelectSubset<T, ModuleDeleteArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Module.
     * @param {ModuleUpdateArgs} args - Arguments to update one Module.
     * @example
     * // Update one Module
     * const module = await prisma.module.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ModuleUpdateArgs>(args: SelectSubset<T, ModuleUpdateArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Modules.
     * @param {ModuleDeleteManyArgs} args - Arguments to filter Modules to delete.
     * @example
     * // Delete a few Modules
     * const { count } = await prisma.module.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ModuleDeleteManyArgs>(args?: SelectSubset<T, ModuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Modules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Modules
     * const module = await prisma.module.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ModuleUpdateManyArgs>(args: SelectSubset<T, ModuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Module.
     * @param {ModuleUpsertArgs} args - Arguments to update or create a Module.
     * @example
     * // Update or create a Module
     * const module = await prisma.module.upsert({
     *   create: {
     *     // ... data to create a Module
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Module we want to update
     *   }
     * })
     */
    upsert<T extends ModuleUpsertArgs>(args: SelectSubset<T, ModuleUpsertArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Modules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleCountArgs} args - Arguments to filter Modules to count.
     * @example
     * // Count the number of Modules
     * const count = await prisma.module.count({
     *   where: {
     *     // ... the filter for the Modules we want to count
     *   }
     * })
    **/
    count<T extends ModuleCountArgs>(
      args?: Subset<T, ModuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ModuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Module.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ModuleAggregateArgs>(args: Subset<T, ModuleAggregateArgs>): Prisma.PrismaPromise<GetModuleAggregateType<T>>

    /**
     * Group by Module.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ModuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ModuleGroupByArgs['orderBy'] }
        : { orderBy?: ModuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ModuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetModuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Module model
   */
  readonly fields: ModuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Module.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ModuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenants<T extends Module$tenantsArgs<ExtArgs> = {}>(args?: Subset<T, Module$tenantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Module model
   */ 
  interface ModuleFieldRefs {
    readonly id: FieldRef<"Module", 'String'>
    readonly name: FieldRef<"Module", 'String'>
    readonly code: FieldRef<"Module", 'String'>
    readonly description: FieldRef<"Module", 'String'>
    readonly basePrice: FieldRef<"Module", 'Decimal'>
    readonly createdAt: FieldRef<"Module", 'DateTime'>
    readonly updatedAt: FieldRef<"Module", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Module findUnique
   */
  export type ModuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * Filter, which Module to fetch.
     */
    where: ModuleWhereUniqueInput
  }

  /**
   * Module findUniqueOrThrow
   */
  export type ModuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * Filter, which Module to fetch.
     */
    where: ModuleWhereUniqueInput
  }

  /**
   * Module findFirst
   */
  export type ModuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * Filter, which Module to fetch.
     */
    where?: ModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Modules to fetch.
     */
    orderBy?: ModuleOrderByWithRelationInput | ModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Modules.
     */
    cursor?: ModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Modules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Modules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Modules.
     */
    distinct?: ModuleScalarFieldEnum | ModuleScalarFieldEnum[]
  }

  /**
   * Module findFirstOrThrow
   */
  export type ModuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * Filter, which Module to fetch.
     */
    where?: ModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Modules to fetch.
     */
    orderBy?: ModuleOrderByWithRelationInput | ModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Modules.
     */
    cursor?: ModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Modules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Modules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Modules.
     */
    distinct?: ModuleScalarFieldEnum | ModuleScalarFieldEnum[]
  }

  /**
   * Module findMany
   */
  export type ModuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * Filter, which Modules to fetch.
     */
    where?: ModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Modules to fetch.
     */
    orderBy?: ModuleOrderByWithRelationInput | ModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Modules.
     */
    cursor?: ModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Modules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Modules.
     */
    skip?: number
    distinct?: ModuleScalarFieldEnum | ModuleScalarFieldEnum[]
  }

  /**
   * Module create
   */
  export type ModuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * The data needed to create a Module.
     */
    data: XOR<ModuleCreateInput, ModuleUncheckedCreateInput>
  }

  /**
   * Module createMany
   */
  export type ModuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Modules.
     */
    data: ModuleCreateManyInput | ModuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Module createManyAndReturn
   */
  export type ModuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Modules.
     */
    data: ModuleCreateManyInput | ModuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Module update
   */
  export type ModuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * The data needed to update a Module.
     */
    data: XOR<ModuleUpdateInput, ModuleUncheckedUpdateInput>
    /**
     * Choose, which Module to update.
     */
    where: ModuleWhereUniqueInput
  }

  /**
   * Module updateMany
   */
  export type ModuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Modules.
     */
    data: XOR<ModuleUpdateManyMutationInput, ModuleUncheckedUpdateManyInput>
    /**
     * Filter which Modules to update
     */
    where?: ModuleWhereInput
  }

  /**
   * Module upsert
   */
  export type ModuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * The filter to search for the Module to update in case it exists.
     */
    where: ModuleWhereUniqueInput
    /**
     * In case the Module found by the `where` argument doesn't exist, create a new Module with this data.
     */
    create: XOR<ModuleCreateInput, ModuleUncheckedCreateInput>
    /**
     * In case the Module was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ModuleUpdateInput, ModuleUncheckedUpdateInput>
  }

  /**
   * Module delete
   */
  export type ModuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
    /**
     * Filter which Module to delete.
     */
    where: ModuleWhereUniqueInput
  }

  /**
   * Module deleteMany
   */
  export type ModuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Modules to delete
     */
    where?: ModuleWhereInput
  }

  /**
   * Module.tenants
   */
  export type Module$tenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    where?: TenantModuleWhereInput
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    cursor?: TenantModuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * Module without action
   */
  export type ModuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Module
     */
    select?: ModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ModuleInclude<ExtArgs> | null
  }


  /**
   * Model TenantModule
   */

  export type AggregateTenantModule = {
    _count: TenantModuleCountAggregateOutputType | null
    _min: TenantModuleMinAggregateOutputType | null
    _max: TenantModuleMaxAggregateOutputType | null
  }

  export type TenantModuleMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    moduleId: string | null
    isEnabled: boolean | null
    validUntil: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantModuleMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    moduleId: string | null
    isEnabled: boolean | null
    validUntil: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantModuleCountAggregateOutputType = {
    id: number
    tenantId: number
    moduleId: number
    isEnabled: number
    validUntil: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantModuleMinAggregateInputType = {
    id?: true
    tenantId?: true
    moduleId?: true
    isEnabled?: true
    validUntil?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantModuleMaxAggregateInputType = {
    id?: true
    tenantId?: true
    moduleId?: true
    isEnabled?: true
    validUntil?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantModuleCountAggregateInputType = {
    id?: true
    tenantId?: true
    moduleId?: true
    isEnabled?: true
    validUntil?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantModuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantModule to aggregate.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantModules
    **/
    _count?: true | TenantModuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantModuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantModuleMaxAggregateInputType
  }

  export type GetTenantModuleAggregateType<T extends TenantModuleAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantModule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantModule[P]>
      : GetScalarType<T[P], AggregateTenantModule[P]>
  }




  export type TenantModuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantModuleWhereInput
    orderBy?: TenantModuleOrderByWithAggregationInput | TenantModuleOrderByWithAggregationInput[]
    by: TenantModuleScalarFieldEnum[] | TenantModuleScalarFieldEnum
    having?: TenantModuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantModuleCountAggregateInputType | true
    _min?: TenantModuleMinAggregateInputType
    _max?: TenantModuleMaxAggregateInputType
  }

  export type TenantModuleGroupByOutputType = {
    id: string
    tenantId: string
    moduleId: string
    isEnabled: boolean
    validUntil: Date | null
    createdAt: Date
    updatedAt: Date
    _count: TenantModuleCountAggregateOutputType | null
    _min: TenantModuleMinAggregateOutputType | null
    _max: TenantModuleMaxAggregateOutputType | null
  }

  type GetTenantModuleGroupByPayload<T extends TenantModuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantModuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantModuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantModuleGroupByOutputType[P]>
            : GetScalarType<T[P], TenantModuleGroupByOutputType[P]>
        }
      >
    >


  export type TenantModuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleId?: boolean
    isEnabled?: boolean
    validUntil?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    module?: boolean | ModuleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantModule"]>

  export type TenantModuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    moduleId?: boolean
    isEnabled?: boolean
    validUntil?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    module?: boolean | ModuleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantModule"]>

  export type TenantModuleSelectScalar = {
    id?: boolean
    tenantId?: boolean
    moduleId?: boolean
    isEnabled?: boolean
    validUntil?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantModuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    module?: boolean | ModuleDefaultArgs<ExtArgs>
  }
  export type TenantModuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    module?: boolean | ModuleDefaultArgs<ExtArgs>
  }

  export type $TenantModulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantModule"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      module: Prisma.$ModulePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      moduleId: string
      isEnabled: boolean
      validUntil: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantModule"]>
    composites: {}
  }

  type TenantModuleGetPayload<S extends boolean | null | undefined | TenantModuleDefaultArgs> = $Result.GetResult<Prisma.$TenantModulePayload, S>

  type TenantModuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TenantModuleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TenantModuleCountAggregateInputType | true
    }

  export interface TenantModuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantModule'], meta: { name: 'TenantModule' } }
    /**
     * Find zero or one TenantModule that matches the filter.
     * @param {TenantModuleFindUniqueArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantModuleFindUniqueArgs>(args: SelectSubset<T, TenantModuleFindUniqueArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TenantModule that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TenantModuleFindUniqueOrThrowArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantModuleFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantModuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TenantModule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindFirstArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantModuleFindFirstArgs>(args?: SelectSubset<T, TenantModuleFindFirstArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TenantModule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindFirstOrThrowArgs} args - Arguments to find a TenantModule
     * @example
     * // Get one TenantModule
     * const tenantModule = await prisma.tenantModule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantModuleFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantModuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TenantModules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantModules
     * const tenantModules = await prisma.tenantModule.findMany()
     * 
     * // Get first 10 TenantModules
     * const tenantModules = await prisma.tenantModule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantModuleWithIdOnly = await prisma.tenantModule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantModuleFindManyArgs>(args?: SelectSubset<T, TenantModuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TenantModule.
     * @param {TenantModuleCreateArgs} args - Arguments to create a TenantModule.
     * @example
     * // Create one TenantModule
     * const TenantModule = await prisma.tenantModule.create({
     *   data: {
     *     // ... data to create a TenantModule
     *   }
     * })
     * 
     */
    create<T extends TenantModuleCreateArgs>(args: SelectSubset<T, TenantModuleCreateArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TenantModules.
     * @param {TenantModuleCreateManyArgs} args - Arguments to create many TenantModules.
     * @example
     * // Create many TenantModules
     * const tenantModule = await prisma.tenantModule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantModuleCreateManyArgs>(args?: SelectSubset<T, TenantModuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantModules and returns the data saved in the database.
     * @param {TenantModuleCreateManyAndReturnArgs} args - Arguments to create many TenantModules.
     * @example
     * // Create many TenantModules
     * const tenantModule = await prisma.tenantModule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantModules and only return the `id`
     * const tenantModuleWithIdOnly = await prisma.tenantModule.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantModuleCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantModuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TenantModule.
     * @param {TenantModuleDeleteArgs} args - Arguments to delete one TenantModule.
     * @example
     * // Delete one TenantModule
     * const TenantModule = await prisma.tenantModule.delete({
     *   where: {
     *     // ... filter to delete one TenantModule
     *   }
     * })
     * 
     */
    delete<T extends TenantModuleDeleteArgs>(args: SelectSubset<T, TenantModuleDeleteArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TenantModule.
     * @param {TenantModuleUpdateArgs} args - Arguments to update one TenantModule.
     * @example
     * // Update one TenantModule
     * const tenantModule = await prisma.tenantModule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantModuleUpdateArgs>(args: SelectSubset<T, TenantModuleUpdateArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TenantModules.
     * @param {TenantModuleDeleteManyArgs} args - Arguments to filter TenantModules to delete.
     * @example
     * // Delete a few TenantModules
     * const { count } = await prisma.tenantModule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantModuleDeleteManyArgs>(args?: SelectSubset<T, TenantModuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantModules
     * const tenantModule = await prisma.tenantModule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantModuleUpdateManyArgs>(args: SelectSubset<T, TenantModuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TenantModule.
     * @param {TenantModuleUpsertArgs} args - Arguments to update or create a TenantModule.
     * @example
     * // Update or create a TenantModule
     * const tenantModule = await prisma.tenantModule.upsert({
     *   create: {
     *     // ... data to create a TenantModule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantModule we want to update
     *   }
     * })
     */
    upsert<T extends TenantModuleUpsertArgs>(args: SelectSubset<T, TenantModuleUpsertArgs<ExtArgs>>): Prisma__TenantModuleClient<$Result.GetResult<Prisma.$TenantModulePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TenantModules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleCountArgs} args - Arguments to filter TenantModules to count.
     * @example
     * // Count the number of TenantModules
     * const count = await prisma.tenantModule.count({
     *   where: {
     *     // ... the filter for the TenantModules we want to count
     *   }
     * })
    **/
    count<T extends TenantModuleCountArgs>(
      args?: Subset<T, TenantModuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantModuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantModuleAggregateArgs>(args: Subset<T, TenantModuleAggregateArgs>): Prisma.PrismaPromise<GetTenantModuleAggregateType<T>>

    /**
     * Group by TenantModule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantModuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantModuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantModuleGroupByArgs['orderBy'] }
        : { orderBy?: TenantModuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantModuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantModuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantModule model
   */
  readonly fields: TenantModuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantModule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantModuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    module<T extends ModuleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ModuleDefaultArgs<ExtArgs>>): Prisma__ModuleClient<$Result.GetResult<Prisma.$ModulePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantModule model
   */ 
  interface TenantModuleFieldRefs {
    readonly id: FieldRef<"TenantModule", 'String'>
    readonly tenantId: FieldRef<"TenantModule", 'String'>
    readonly moduleId: FieldRef<"TenantModule", 'String'>
    readonly isEnabled: FieldRef<"TenantModule", 'Boolean'>
    readonly validUntil: FieldRef<"TenantModule", 'DateTime'>
    readonly createdAt: FieldRef<"TenantModule", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantModule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantModule findUnique
   */
  export type TenantModuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule findUniqueOrThrow
   */
  export type TenantModuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule findFirst
   */
  export type TenantModuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantModules.
     */
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule findFirstOrThrow
   */
  export type TenantModuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModule to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantModules.
     */
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule findMany
   */
  export type TenantModuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter, which TenantModules to fetch.
     */
    where?: TenantModuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantModules to fetch.
     */
    orderBy?: TenantModuleOrderByWithRelationInput | TenantModuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantModules.
     */
    cursor?: TenantModuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantModules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantModules.
     */
    skip?: number
    distinct?: TenantModuleScalarFieldEnum | TenantModuleScalarFieldEnum[]
  }

  /**
   * TenantModule create
   */
  export type TenantModuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantModule.
     */
    data: XOR<TenantModuleCreateInput, TenantModuleUncheckedCreateInput>
  }

  /**
   * TenantModule createMany
   */
  export type TenantModuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantModules.
     */
    data: TenantModuleCreateManyInput | TenantModuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantModule createManyAndReturn
   */
  export type TenantModuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TenantModules.
     */
    data: TenantModuleCreateManyInput | TenantModuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantModule update
   */
  export type TenantModuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantModule.
     */
    data: XOR<TenantModuleUpdateInput, TenantModuleUncheckedUpdateInput>
    /**
     * Choose, which TenantModule to update.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule updateMany
   */
  export type TenantModuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantModules.
     */
    data: XOR<TenantModuleUpdateManyMutationInput, TenantModuleUncheckedUpdateManyInput>
    /**
     * Filter which TenantModules to update
     */
    where?: TenantModuleWhereInput
  }

  /**
   * TenantModule upsert
   */
  export type TenantModuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantModule to update in case it exists.
     */
    where: TenantModuleWhereUniqueInput
    /**
     * In case the TenantModule found by the `where` argument doesn't exist, create a new TenantModule with this data.
     */
    create: XOR<TenantModuleCreateInput, TenantModuleUncheckedCreateInput>
    /**
     * In case the TenantModule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantModuleUpdateInput, TenantModuleUncheckedUpdateInput>
  }

  /**
   * TenantModule delete
   */
  export type TenantModuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
    /**
     * Filter which TenantModule to delete.
     */
    where: TenantModuleWhereUniqueInput
  }

  /**
   * TenantModule deleteMany
   */
  export type TenantModuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantModules to delete
     */
    where?: TenantModuleWhereInput
  }

  /**
   * TenantModule without action
   */
  export type TenantModuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantModule
     */
    select?: TenantModuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantModuleInclude<ExtArgs> | null
  }


  /**
   * Model SystemAdmin
   */

  export type AggregateSystemAdmin = {
    _count: SystemAdminCountAggregateOutputType | null
    _min: SystemAdminMinAggregateOutputType | null
    _max: SystemAdminMaxAggregateOutputType | null
  }

  export type SystemAdminMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    passwordHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SystemAdminMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    passwordHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SystemAdminCountAggregateOutputType = {
    id: number
    name: number
    email: number
    passwordHash: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SystemAdminMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SystemAdminMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SystemAdminCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SystemAdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemAdmin to aggregate.
     */
    where?: SystemAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemAdmins to fetch.
     */
    orderBy?: SystemAdminOrderByWithRelationInput | SystemAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemAdmins
    **/
    _count?: true | SystemAdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemAdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemAdminMaxAggregateInputType
  }

  export type GetSystemAdminAggregateType<T extends SystemAdminAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemAdmin[P]>
      : GetScalarType<T[P], AggregateSystemAdmin[P]>
  }




  export type SystemAdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemAdminWhereInput
    orderBy?: SystemAdminOrderByWithAggregationInput | SystemAdminOrderByWithAggregationInput[]
    by: SystemAdminScalarFieldEnum[] | SystemAdminScalarFieldEnum
    having?: SystemAdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemAdminCountAggregateInputType | true
    _min?: SystemAdminMinAggregateInputType
    _max?: SystemAdminMaxAggregateInputType
  }

  export type SystemAdminGroupByOutputType = {
    id: string
    name: string
    email: string
    passwordHash: string
    createdAt: Date
    updatedAt: Date
    _count: SystemAdminCountAggregateOutputType | null
    _min: SystemAdminMinAggregateOutputType | null
    _max: SystemAdminMaxAggregateOutputType | null
  }

  type GetSystemAdminGroupByPayload<T extends SystemAdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemAdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemAdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemAdminGroupByOutputType[P]>
            : GetScalarType<T[P], SystemAdminGroupByOutputType[P]>
        }
      >
    >


  export type SystemAdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["systemAdmin"]>

  export type SystemAdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["systemAdmin"]>

  export type SystemAdminSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $SystemAdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemAdmin"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      passwordHash: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["systemAdmin"]>
    composites: {}
  }

  type SystemAdminGetPayload<S extends boolean | null | undefined | SystemAdminDefaultArgs> = $Result.GetResult<Prisma.$SystemAdminPayload, S>

  type SystemAdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SystemAdminFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SystemAdminCountAggregateInputType | true
    }

  export interface SystemAdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemAdmin'], meta: { name: 'SystemAdmin' } }
    /**
     * Find zero or one SystemAdmin that matches the filter.
     * @param {SystemAdminFindUniqueArgs} args - Arguments to find a SystemAdmin
     * @example
     * // Get one SystemAdmin
     * const systemAdmin = await prisma.systemAdmin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemAdminFindUniqueArgs>(args: SelectSubset<T, SystemAdminFindUniqueArgs<ExtArgs>>): Prisma__SystemAdminClient<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SystemAdmin that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SystemAdminFindUniqueOrThrowArgs} args - Arguments to find a SystemAdmin
     * @example
     * // Get one SystemAdmin
     * const systemAdmin = await prisma.systemAdmin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemAdminFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemAdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemAdminClient<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SystemAdmin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAdminFindFirstArgs} args - Arguments to find a SystemAdmin
     * @example
     * // Get one SystemAdmin
     * const systemAdmin = await prisma.systemAdmin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemAdminFindFirstArgs>(args?: SelectSubset<T, SystemAdminFindFirstArgs<ExtArgs>>): Prisma__SystemAdminClient<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SystemAdmin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAdminFindFirstOrThrowArgs} args - Arguments to find a SystemAdmin
     * @example
     * // Get one SystemAdmin
     * const systemAdmin = await prisma.systemAdmin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemAdminFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemAdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemAdminClient<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SystemAdmins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemAdmins
     * const systemAdmins = await prisma.systemAdmin.findMany()
     * 
     * // Get first 10 SystemAdmins
     * const systemAdmins = await prisma.systemAdmin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemAdminWithIdOnly = await prisma.systemAdmin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemAdminFindManyArgs>(args?: SelectSubset<T, SystemAdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SystemAdmin.
     * @param {SystemAdminCreateArgs} args - Arguments to create a SystemAdmin.
     * @example
     * // Create one SystemAdmin
     * const SystemAdmin = await prisma.systemAdmin.create({
     *   data: {
     *     // ... data to create a SystemAdmin
     *   }
     * })
     * 
     */
    create<T extends SystemAdminCreateArgs>(args: SelectSubset<T, SystemAdminCreateArgs<ExtArgs>>): Prisma__SystemAdminClient<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SystemAdmins.
     * @param {SystemAdminCreateManyArgs} args - Arguments to create many SystemAdmins.
     * @example
     * // Create many SystemAdmins
     * const systemAdmin = await prisma.systemAdmin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemAdminCreateManyArgs>(args?: SelectSubset<T, SystemAdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SystemAdmins and returns the data saved in the database.
     * @param {SystemAdminCreateManyAndReturnArgs} args - Arguments to create many SystemAdmins.
     * @example
     * // Create many SystemAdmins
     * const systemAdmin = await prisma.systemAdmin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SystemAdmins and only return the `id`
     * const systemAdminWithIdOnly = await prisma.systemAdmin.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SystemAdminCreateManyAndReturnArgs>(args?: SelectSubset<T, SystemAdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SystemAdmin.
     * @param {SystemAdminDeleteArgs} args - Arguments to delete one SystemAdmin.
     * @example
     * // Delete one SystemAdmin
     * const SystemAdmin = await prisma.systemAdmin.delete({
     *   where: {
     *     // ... filter to delete one SystemAdmin
     *   }
     * })
     * 
     */
    delete<T extends SystemAdminDeleteArgs>(args: SelectSubset<T, SystemAdminDeleteArgs<ExtArgs>>): Prisma__SystemAdminClient<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SystemAdmin.
     * @param {SystemAdminUpdateArgs} args - Arguments to update one SystemAdmin.
     * @example
     * // Update one SystemAdmin
     * const systemAdmin = await prisma.systemAdmin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemAdminUpdateArgs>(args: SelectSubset<T, SystemAdminUpdateArgs<ExtArgs>>): Prisma__SystemAdminClient<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SystemAdmins.
     * @param {SystemAdminDeleteManyArgs} args - Arguments to filter SystemAdmins to delete.
     * @example
     * // Delete a few SystemAdmins
     * const { count } = await prisma.systemAdmin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemAdminDeleteManyArgs>(args?: SelectSubset<T, SystemAdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemAdmins
     * const systemAdmin = await prisma.systemAdmin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemAdminUpdateManyArgs>(args: SelectSubset<T, SystemAdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SystemAdmin.
     * @param {SystemAdminUpsertArgs} args - Arguments to update or create a SystemAdmin.
     * @example
     * // Update or create a SystemAdmin
     * const systemAdmin = await prisma.systemAdmin.upsert({
     *   create: {
     *     // ... data to create a SystemAdmin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemAdmin we want to update
     *   }
     * })
     */
    upsert<T extends SystemAdminUpsertArgs>(args: SelectSubset<T, SystemAdminUpsertArgs<ExtArgs>>): Prisma__SystemAdminClient<$Result.GetResult<Prisma.$SystemAdminPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SystemAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAdminCountArgs} args - Arguments to filter SystemAdmins to count.
     * @example
     * // Count the number of SystemAdmins
     * const count = await prisma.systemAdmin.count({
     *   where: {
     *     // ... the filter for the SystemAdmins we want to count
     *   }
     * })
    **/
    count<T extends SystemAdminCountArgs>(
      args?: Subset<T, SystemAdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemAdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemAdminAggregateArgs>(args: Subset<T, SystemAdminAggregateArgs>): Prisma.PrismaPromise<GetSystemAdminAggregateType<T>>

    /**
     * Group by SystemAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemAdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemAdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemAdminGroupByArgs['orderBy'] }
        : { orderBy?: SystemAdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemAdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemAdmin model
   */
  readonly fields: SystemAdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemAdmin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemAdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemAdmin model
   */ 
  interface SystemAdminFieldRefs {
    readonly id: FieldRef<"SystemAdmin", 'String'>
    readonly name: FieldRef<"SystemAdmin", 'String'>
    readonly email: FieldRef<"SystemAdmin", 'String'>
    readonly passwordHash: FieldRef<"SystemAdmin", 'String'>
    readonly createdAt: FieldRef<"SystemAdmin", 'DateTime'>
    readonly updatedAt: FieldRef<"SystemAdmin", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SystemAdmin findUnique
   */
  export type SystemAdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * Filter, which SystemAdmin to fetch.
     */
    where: SystemAdminWhereUniqueInput
  }

  /**
   * SystemAdmin findUniqueOrThrow
   */
  export type SystemAdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * Filter, which SystemAdmin to fetch.
     */
    where: SystemAdminWhereUniqueInput
  }

  /**
   * SystemAdmin findFirst
   */
  export type SystemAdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * Filter, which SystemAdmin to fetch.
     */
    where?: SystemAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemAdmins to fetch.
     */
    orderBy?: SystemAdminOrderByWithRelationInput | SystemAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemAdmins.
     */
    cursor?: SystemAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemAdmins.
     */
    distinct?: SystemAdminScalarFieldEnum | SystemAdminScalarFieldEnum[]
  }

  /**
   * SystemAdmin findFirstOrThrow
   */
  export type SystemAdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * Filter, which SystemAdmin to fetch.
     */
    where?: SystemAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemAdmins to fetch.
     */
    orderBy?: SystemAdminOrderByWithRelationInput | SystemAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemAdmins.
     */
    cursor?: SystemAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemAdmins.
     */
    distinct?: SystemAdminScalarFieldEnum | SystemAdminScalarFieldEnum[]
  }

  /**
   * SystemAdmin findMany
   */
  export type SystemAdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * Filter, which SystemAdmins to fetch.
     */
    where?: SystemAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemAdmins to fetch.
     */
    orderBy?: SystemAdminOrderByWithRelationInput | SystemAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemAdmins.
     */
    cursor?: SystemAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemAdmins.
     */
    skip?: number
    distinct?: SystemAdminScalarFieldEnum | SystemAdminScalarFieldEnum[]
  }

  /**
   * SystemAdmin create
   */
  export type SystemAdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * The data needed to create a SystemAdmin.
     */
    data: XOR<SystemAdminCreateInput, SystemAdminUncheckedCreateInput>
  }

  /**
   * SystemAdmin createMany
   */
  export type SystemAdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemAdmins.
     */
    data: SystemAdminCreateManyInput | SystemAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemAdmin createManyAndReturn
   */
  export type SystemAdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SystemAdmins.
     */
    data: SystemAdminCreateManyInput | SystemAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemAdmin update
   */
  export type SystemAdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * The data needed to update a SystemAdmin.
     */
    data: XOR<SystemAdminUpdateInput, SystemAdminUncheckedUpdateInput>
    /**
     * Choose, which SystemAdmin to update.
     */
    where: SystemAdminWhereUniqueInput
  }

  /**
   * SystemAdmin updateMany
   */
  export type SystemAdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemAdmins.
     */
    data: XOR<SystemAdminUpdateManyMutationInput, SystemAdminUncheckedUpdateManyInput>
    /**
     * Filter which SystemAdmins to update
     */
    where?: SystemAdminWhereInput
  }

  /**
   * SystemAdmin upsert
   */
  export type SystemAdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * The filter to search for the SystemAdmin to update in case it exists.
     */
    where: SystemAdminWhereUniqueInput
    /**
     * In case the SystemAdmin found by the `where` argument doesn't exist, create a new SystemAdmin with this data.
     */
    create: XOR<SystemAdminCreateInput, SystemAdminUncheckedCreateInput>
    /**
     * In case the SystemAdmin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemAdminUpdateInput, SystemAdminUncheckedUpdateInput>
  }

  /**
   * SystemAdmin delete
   */
  export type SystemAdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
    /**
     * Filter which SystemAdmin to delete.
     */
    where: SystemAdminWhereUniqueInput
  }

  /**
   * SystemAdmin deleteMany
   */
  export type SystemAdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemAdmins to delete
     */
    where?: SystemAdminWhereInput
  }

  /**
   * SystemAdmin without action
   */
  export type SystemAdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemAdmin
     */
    select?: SystemAdminSelect<ExtArgs> | null
  }


  /**
   * Model GlobalSettings
   */

  export type AggregateGlobalSettings = {
    _count: GlobalSettingsCountAggregateOutputType | null
    _min: GlobalSettingsMinAggregateOutputType | null
    _max: GlobalSettingsMaxAggregateOutputType | null
  }

  export type GlobalSettingsMinAggregateOutputType = {
    id: string | null
    platformName: string | null
    platformLogoUrl: string | null
    platformSlogan: string | null
    heroTitle: string | null
    heroSubtitle: string | null
    heroCTA: string | null
    heroImageUrl: string | null
    showHero: boolean | null
    showFeatures: boolean | null
    feature1Title: string | null
    feature1Desc: string | null
    feature1Icon: string | null
    feature2Title: string | null
    feature2Desc: string | null
    feature2Icon: string | null
    feature3Title: string | null
    feature3Desc: string | null
    feature3Icon: string | null
    paypalClientId: string | null
    paypalClientSecret: string | null
    paypalEnv: string | null
    mpesaConsumerKey: string | null
    mpesaConsumerSecret: string | null
    mpesaPasskey: string | null
    mpesaShortcode: string | null
    updatedAt: Date | null
  }

  export type GlobalSettingsMaxAggregateOutputType = {
    id: string | null
    platformName: string | null
    platformLogoUrl: string | null
    platformSlogan: string | null
    heroTitle: string | null
    heroSubtitle: string | null
    heroCTA: string | null
    heroImageUrl: string | null
    showHero: boolean | null
    showFeatures: boolean | null
    feature1Title: string | null
    feature1Desc: string | null
    feature1Icon: string | null
    feature2Title: string | null
    feature2Desc: string | null
    feature2Icon: string | null
    feature3Title: string | null
    feature3Desc: string | null
    feature3Icon: string | null
    paypalClientId: string | null
    paypalClientSecret: string | null
    paypalEnv: string | null
    mpesaConsumerKey: string | null
    mpesaConsumerSecret: string | null
    mpesaPasskey: string | null
    mpesaShortcode: string | null
    updatedAt: Date | null
  }

  export type GlobalSettingsCountAggregateOutputType = {
    id: number
    platformName: number
    platformLogoUrl: number
    platformSlogan: number
    heroTitle: number
    heroSubtitle: number
    heroCTA: number
    heroImageUrl: number
    showHero: number
    showFeatures: number
    feature1Title: number
    feature1Desc: number
    feature1Icon: number
    feature2Title: number
    feature2Desc: number
    feature2Icon: number
    feature3Title: number
    feature3Desc: number
    feature3Icon: number
    paypalClientId: number
    paypalClientSecret: number
    paypalEnv: number
    mpesaConsumerKey: number
    mpesaConsumerSecret: number
    mpesaPasskey: number
    mpesaShortcode: number
    updatedAt: number
    _all: number
  }


  export type GlobalSettingsMinAggregateInputType = {
    id?: true
    platformName?: true
    platformLogoUrl?: true
    platformSlogan?: true
    heroTitle?: true
    heroSubtitle?: true
    heroCTA?: true
    heroImageUrl?: true
    showHero?: true
    showFeatures?: true
    feature1Title?: true
    feature1Desc?: true
    feature1Icon?: true
    feature2Title?: true
    feature2Desc?: true
    feature2Icon?: true
    feature3Title?: true
    feature3Desc?: true
    feature3Icon?: true
    paypalClientId?: true
    paypalClientSecret?: true
    paypalEnv?: true
    mpesaConsumerKey?: true
    mpesaConsumerSecret?: true
    mpesaPasskey?: true
    mpesaShortcode?: true
    updatedAt?: true
  }

  export type GlobalSettingsMaxAggregateInputType = {
    id?: true
    platformName?: true
    platformLogoUrl?: true
    platformSlogan?: true
    heroTitle?: true
    heroSubtitle?: true
    heroCTA?: true
    heroImageUrl?: true
    showHero?: true
    showFeatures?: true
    feature1Title?: true
    feature1Desc?: true
    feature1Icon?: true
    feature2Title?: true
    feature2Desc?: true
    feature2Icon?: true
    feature3Title?: true
    feature3Desc?: true
    feature3Icon?: true
    paypalClientId?: true
    paypalClientSecret?: true
    paypalEnv?: true
    mpesaConsumerKey?: true
    mpesaConsumerSecret?: true
    mpesaPasskey?: true
    mpesaShortcode?: true
    updatedAt?: true
  }

  export type GlobalSettingsCountAggregateInputType = {
    id?: true
    platformName?: true
    platformLogoUrl?: true
    platformSlogan?: true
    heroTitle?: true
    heroSubtitle?: true
    heroCTA?: true
    heroImageUrl?: true
    showHero?: true
    showFeatures?: true
    feature1Title?: true
    feature1Desc?: true
    feature1Icon?: true
    feature2Title?: true
    feature2Desc?: true
    feature2Icon?: true
    feature3Title?: true
    feature3Desc?: true
    feature3Icon?: true
    paypalClientId?: true
    paypalClientSecret?: true
    paypalEnv?: true
    mpesaConsumerKey?: true
    mpesaConsumerSecret?: true
    mpesaPasskey?: true
    mpesaShortcode?: true
    updatedAt?: true
    _all?: true
  }

  export type GlobalSettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GlobalSettings to aggregate.
     */
    where?: GlobalSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalSettings to fetch.
     */
    orderBy?: GlobalSettingsOrderByWithRelationInput | GlobalSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GlobalSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GlobalSettings
    **/
    _count?: true | GlobalSettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GlobalSettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GlobalSettingsMaxAggregateInputType
  }

  export type GetGlobalSettingsAggregateType<T extends GlobalSettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateGlobalSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGlobalSettings[P]>
      : GetScalarType<T[P], AggregateGlobalSettings[P]>
  }




  export type GlobalSettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GlobalSettingsWhereInput
    orderBy?: GlobalSettingsOrderByWithAggregationInput | GlobalSettingsOrderByWithAggregationInput[]
    by: GlobalSettingsScalarFieldEnum[] | GlobalSettingsScalarFieldEnum
    having?: GlobalSettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GlobalSettingsCountAggregateInputType | true
    _min?: GlobalSettingsMinAggregateInputType
    _max?: GlobalSettingsMaxAggregateInputType
  }

  export type GlobalSettingsGroupByOutputType = {
    id: string
    platformName: string
    platformLogoUrl: string | null
    platformSlogan: string | null
    heroTitle: string | null
    heroSubtitle: string | null
    heroCTA: string | null
    heroImageUrl: string | null
    showHero: boolean
    showFeatures: boolean
    feature1Title: string | null
    feature1Desc: string | null
    feature1Icon: string | null
    feature2Title: string | null
    feature2Desc: string | null
    feature2Icon: string | null
    feature3Title: string | null
    feature3Desc: string | null
    feature3Icon: string | null
    paypalClientId: string | null
    paypalClientSecret: string | null
    paypalEnv: string
    mpesaConsumerKey: string | null
    mpesaConsumerSecret: string | null
    mpesaPasskey: string | null
    mpesaShortcode: string | null
    updatedAt: Date
    _count: GlobalSettingsCountAggregateOutputType | null
    _min: GlobalSettingsMinAggregateOutputType | null
    _max: GlobalSettingsMaxAggregateOutputType | null
  }

  type GetGlobalSettingsGroupByPayload<T extends GlobalSettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GlobalSettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GlobalSettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GlobalSettingsGroupByOutputType[P]>
            : GetScalarType<T[P], GlobalSettingsGroupByOutputType[P]>
        }
      >
    >


  export type GlobalSettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    platformName?: boolean
    platformLogoUrl?: boolean
    platformSlogan?: boolean
    heroTitle?: boolean
    heroSubtitle?: boolean
    heroCTA?: boolean
    heroImageUrl?: boolean
    showHero?: boolean
    showFeatures?: boolean
    feature1Title?: boolean
    feature1Desc?: boolean
    feature1Icon?: boolean
    feature2Title?: boolean
    feature2Desc?: boolean
    feature2Icon?: boolean
    feature3Title?: boolean
    feature3Desc?: boolean
    feature3Icon?: boolean
    paypalClientId?: boolean
    paypalClientSecret?: boolean
    paypalEnv?: boolean
    mpesaConsumerKey?: boolean
    mpesaConsumerSecret?: boolean
    mpesaPasskey?: boolean
    mpesaShortcode?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["globalSettings"]>

  export type GlobalSettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    platformName?: boolean
    platformLogoUrl?: boolean
    platformSlogan?: boolean
    heroTitle?: boolean
    heroSubtitle?: boolean
    heroCTA?: boolean
    heroImageUrl?: boolean
    showHero?: boolean
    showFeatures?: boolean
    feature1Title?: boolean
    feature1Desc?: boolean
    feature1Icon?: boolean
    feature2Title?: boolean
    feature2Desc?: boolean
    feature2Icon?: boolean
    feature3Title?: boolean
    feature3Desc?: boolean
    feature3Icon?: boolean
    paypalClientId?: boolean
    paypalClientSecret?: boolean
    paypalEnv?: boolean
    mpesaConsumerKey?: boolean
    mpesaConsumerSecret?: boolean
    mpesaPasskey?: boolean
    mpesaShortcode?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["globalSettings"]>

  export type GlobalSettingsSelectScalar = {
    id?: boolean
    platformName?: boolean
    platformLogoUrl?: boolean
    platformSlogan?: boolean
    heroTitle?: boolean
    heroSubtitle?: boolean
    heroCTA?: boolean
    heroImageUrl?: boolean
    showHero?: boolean
    showFeatures?: boolean
    feature1Title?: boolean
    feature1Desc?: boolean
    feature1Icon?: boolean
    feature2Title?: boolean
    feature2Desc?: boolean
    feature2Icon?: boolean
    feature3Title?: boolean
    feature3Desc?: boolean
    feature3Icon?: boolean
    paypalClientId?: boolean
    paypalClientSecret?: boolean
    paypalEnv?: boolean
    mpesaConsumerKey?: boolean
    mpesaConsumerSecret?: boolean
    mpesaPasskey?: boolean
    mpesaShortcode?: boolean
    updatedAt?: boolean
  }


  export type $GlobalSettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GlobalSettings"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      platformName: string
      platformLogoUrl: string | null
      platformSlogan: string | null
      heroTitle: string | null
      heroSubtitle: string | null
      heroCTA: string | null
      heroImageUrl: string | null
      showHero: boolean
      showFeatures: boolean
      feature1Title: string | null
      feature1Desc: string | null
      feature1Icon: string | null
      feature2Title: string | null
      feature2Desc: string | null
      feature2Icon: string | null
      feature3Title: string | null
      feature3Desc: string | null
      feature3Icon: string | null
      paypalClientId: string | null
      paypalClientSecret: string | null
      paypalEnv: string
      mpesaConsumerKey: string | null
      mpesaConsumerSecret: string | null
      mpesaPasskey: string | null
      mpesaShortcode: string | null
      updatedAt: Date
    }, ExtArgs["result"]["globalSettings"]>
    composites: {}
  }

  type GlobalSettingsGetPayload<S extends boolean | null | undefined | GlobalSettingsDefaultArgs> = $Result.GetResult<Prisma.$GlobalSettingsPayload, S>

  type GlobalSettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GlobalSettingsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GlobalSettingsCountAggregateInputType | true
    }

  export interface GlobalSettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GlobalSettings'], meta: { name: 'GlobalSettings' } }
    /**
     * Find zero or one GlobalSettings that matches the filter.
     * @param {GlobalSettingsFindUniqueArgs} args - Arguments to find a GlobalSettings
     * @example
     * // Get one GlobalSettings
     * const globalSettings = await prisma.globalSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GlobalSettingsFindUniqueArgs>(args: SelectSubset<T, GlobalSettingsFindUniqueArgs<ExtArgs>>): Prisma__GlobalSettingsClient<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GlobalSettings that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GlobalSettingsFindUniqueOrThrowArgs} args - Arguments to find a GlobalSettings
     * @example
     * // Get one GlobalSettings
     * const globalSettings = await prisma.globalSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GlobalSettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, GlobalSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GlobalSettingsClient<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GlobalSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalSettingsFindFirstArgs} args - Arguments to find a GlobalSettings
     * @example
     * // Get one GlobalSettings
     * const globalSettings = await prisma.globalSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GlobalSettingsFindFirstArgs>(args?: SelectSubset<T, GlobalSettingsFindFirstArgs<ExtArgs>>): Prisma__GlobalSettingsClient<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GlobalSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalSettingsFindFirstOrThrowArgs} args - Arguments to find a GlobalSettings
     * @example
     * // Get one GlobalSettings
     * const globalSettings = await prisma.globalSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GlobalSettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, GlobalSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__GlobalSettingsClient<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GlobalSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GlobalSettings
     * const globalSettings = await prisma.globalSettings.findMany()
     * 
     * // Get first 10 GlobalSettings
     * const globalSettings = await prisma.globalSettings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const globalSettingsWithIdOnly = await prisma.globalSettings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GlobalSettingsFindManyArgs>(args?: SelectSubset<T, GlobalSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GlobalSettings.
     * @param {GlobalSettingsCreateArgs} args - Arguments to create a GlobalSettings.
     * @example
     * // Create one GlobalSettings
     * const GlobalSettings = await prisma.globalSettings.create({
     *   data: {
     *     // ... data to create a GlobalSettings
     *   }
     * })
     * 
     */
    create<T extends GlobalSettingsCreateArgs>(args: SelectSubset<T, GlobalSettingsCreateArgs<ExtArgs>>): Prisma__GlobalSettingsClient<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GlobalSettings.
     * @param {GlobalSettingsCreateManyArgs} args - Arguments to create many GlobalSettings.
     * @example
     * // Create many GlobalSettings
     * const globalSettings = await prisma.globalSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GlobalSettingsCreateManyArgs>(args?: SelectSubset<T, GlobalSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GlobalSettings and returns the data saved in the database.
     * @param {GlobalSettingsCreateManyAndReturnArgs} args - Arguments to create many GlobalSettings.
     * @example
     * // Create many GlobalSettings
     * const globalSettings = await prisma.globalSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GlobalSettings and only return the `id`
     * const globalSettingsWithIdOnly = await prisma.globalSettings.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GlobalSettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, GlobalSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GlobalSettings.
     * @param {GlobalSettingsDeleteArgs} args - Arguments to delete one GlobalSettings.
     * @example
     * // Delete one GlobalSettings
     * const GlobalSettings = await prisma.globalSettings.delete({
     *   where: {
     *     // ... filter to delete one GlobalSettings
     *   }
     * })
     * 
     */
    delete<T extends GlobalSettingsDeleteArgs>(args: SelectSubset<T, GlobalSettingsDeleteArgs<ExtArgs>>): Prisma__GlobalSettingsClient<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GlobalSettings.
     * @param {GlobalSettingsUpdateArgs} args - Arguments to update one GlobalSettings.
     * @example
     * // Update one GlobalSettings
     * const globalSettings = await prisma.globalSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GlobalSettingsUpdateArgs>(args: SelectSubset<T, GlobalSettingsUpdateArgs<ExtArgs>>): Prisma__GlobalSettingsClient<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GlobalSettings.
     * @param {GlobalSettingsDeleteManyArgs} args - Arguments to filter GlobalSettings to delete.
     * @example
     * // Delete a few GlobalSettings
     * const { count } = await prisma.globalSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GlobalSettingsDeleteManyArgs>(args?: SelectSubset<T, GlobalSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GlobalSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GlobalSettings
     * const globalSettings = await prisma.globalSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GlobalSettingsUpdateManyArgs>(args: SelectSubset<T, GlobalSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GlobalSettings.
     * @param {GlobalSettingsUpsertArgs} args - Arguments to update or create a GlobalSettings.
     * @example
     * // Update or create a GlobalSettings
     * const globalSettings = await prisma.globalSettings.upsert({
     *   create: {
     *     // ... data to create a GlobalSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GlobalSettings we want to update
     *   }
     * })
     */
    upsert<T extends GlobalSettingsUpsertArgs>(args: SelectSubset<T, GlobalSettingsUpsertArgs<ExtArgs>>): Prisma__GlobalSettingsClient<$Result.GetResult<Prisma.$GlobalSettingsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GlobalSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalSettingsCountArgs} args - Arguments to filter GlobalSettings to count.
     * @example
     * // Count the number of GlobalSettings
     * const count = await prisma.globalSettings.count({
     *   where: {
     *     // ... the filter for the GlobalSettings we want to count
     *   }
     * })
    **/
    count<T extends GlobalSettingsCountArgs>(
      args?: Subset<T, GlobalSettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GlobalSettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GlobalSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GlobalSettingsAggregateArgs>(args: Subset<T, GlobalSettingsAggregateArgs>): Prisma.PrismaPromise<GetGlobalSettingsAggregateType<T>>

    /**
     * Group by GlobalSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalSettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GlobalSettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GlobalSettingsGroupByArgs['orderBy'] }
        : { orderBy?: GlobalSettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GlobalSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGlobalSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GlobalSettings model
   */
  readonly fields: GlobalSettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GlobalSettings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GlobalSettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GlobalSettings model
   */ 
  interface GlobalSettingsFieldRefs {
    readonly id: FieldRef<"GlobalSettings", 'String'>
    readonly platformName: FieldRef<"GlobalSettings", 'String'>
    readonly platformLogoUrl: FieldRef<"GlobalSettings", 'String'>
    readonly platformSlogan: FieldRef<"GlobalSettings", 'String'>
    readonly heroTitle: FieldRef<"GlobalSettings", 'String'>
    readonly heroSubtitle: FieldRef<"GlobalSettings", 'String'>
    readonly heroCTA: FieldRef<"GlobalSettings", 'String'>
    readonly heroImageUrl: FieldRef<"GlobalSettings", 'String'>
    readonly showHero: FieldRef<"GlobalSettings", 'Boolean'>
    readonly showFeatures: FieldRef<"GlobalSettings", 'Boolean'>
    readonly feature1Title: FieldRef<"GlobalSettings", 'String'>
    readonly feature1Desc: FieldRef<"GlobalSettings", 'String'>
    readonly feature1Icon: FieldRef<"GlobalSettings", 'String'>
    readonly feature2Title: FieldRef<"GlobalSettings", 'String'>
    readonly feature2Desc: FieldRef<"GlobalSettings", 'String'>
    readonly feature2Icon: FieldRef<"GlobalSettings", 'String'>
    readonly feature3Title: FieldRef<"GlobalSettings", 'String'>
    readonly feature3Desc: FieldRef<"GlobalSettings", 'String'>
    readonly feature3Icon: FieldRef<"GlobalSettings", 'String'>
    readonly paypalClientId: FieldRef<"GlobalSettings", 'String'>
    readonly paypalClientSecret: FieldRef<"GlobalSettings", 'String'>
    readonly paypalEnv: FieldRef<"GlobalSettings", 'String'>
    readonly mpesaConsumerKey: FieldRef<"GlobalSettings", 'String'>
    readonly mpesaConsumerSecret: FieldRef<"GlobalSettings", 'String'>
    readonly mpesaPasskey: FieldRef<"GlobalSettings", 'String'>
    readonly mpesaShortcode: FieldRef<"GlobalSettings", 'String'>
    readonly updatedAt: FieldRef<"GlobalSettings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GlobalSettings findUnique
   */
  export type GlobalSettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * Filter, which GlobalSettings to fetch.
     */
    where: GlobalSettingsWhereUniqueInput
  }

  /**
   * GlobalSettings findUniqueOrThrow
   */
  export type GlobalSettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * Filter, which GlobalSettings to fetch.
     */
    where: GlobalSettingsWhereUniqueInput
  }

  /**
   * GlobalSettings findFirst
   */
  export type GlobalSettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * Filter, which GlobalSettings to fetch.
     */
    where?: GlobalSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalSettings to fetch.
     */
    orderBy?: GlobalSettingsOrderByWithRelationInput | GlobalSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GlobalSettings.
     */
    cursor?: GlobalSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GlobalSettings.
     */
    distinct?: GlobalSettingsScalarFieldEnum | GlobalSettingsScalarFieldEnum[]
  }

  /**
   * GlobalSettings findFirstOrThrow
   */
  export type GlobalSettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * Filter, which GlobalSettings to fetch.
     */
    where?: GlobalSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalSettings to fetch.
     */
    orderBy?: GlobalSettingsOrderByWithRelationInput | GlobalSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GlobalSettings.
     */
    cursor?: GlobalSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GlobalSettings.
     */
    distinct?: GlobalSettingsScalarFieldEnum | GlobalSettingsScalarFieldEnum[]
  }

  /**
   * GlobalSettings findMany
   */
  export type GlobalSettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * Filter, which GlobalSettings to fetch.
     */
    where?: GlobalSettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalSettings to fetch.
     */
    orderBy?: GlobalSettingsOrderByWithRelationInput | GlobalSettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GlobalSettings.
     */
    cursor?: GlobalSettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalSettings.
     */
    skip?: number
    distinct?: GlobalSettingsScalarFieldEnum | GlobalSettingsScalarFieldEnum[]
  }

  /**
   * GlobalSettings create
   */
  export type GlobalSettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * The data needed to create a GlobalSettings.
     */
    data: XOR<GlobalSettingsCreateInput, GlobalSettingsUncheckedCreateInput>
  }

  /**
   * GlobalSettings createMany
   */
  export type GlobalSettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GlobalSettings.
     */
    data: GlobalSettingsCreateManyInput | GlobalSettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GlobalSettings createManyAndReturn
   */
  export type GlobalSettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GlobalSettings.
     */
    data: GlobalSettingsCreateManyInput | GlobalSettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GlobalSettings update
   */
  export type GlobalSettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * The data needed to update a GlobalSettings.
     */
    data: XOR<GlobalSettingsUpdateInput, GlobalSettingsUncheckedUpdateInput>
    /**
     * Choose, which GlobalSettings to update.
     */
    where: GlobalSettingsWhereUniqueInput
  }

  /**
   * GlobalSettings updateMany
   */
  export type GlobalSettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GlobalSettings.
     */
    data: XOR<GlobalSettingsUpdateManyMutationInput, GlobalSettingsUncheckedUpdateManyInput>
    /**
     * Filter which GlobalSettings to update
     */
    where?: GlobalSettingsWhereInput
  }

  /**
   * GlobalSettings upsert
   */
  export type GlobalSettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * The filter to search for the GlobalSettings to update in case it exists.
     */
    where: GlobalSettingsWhereUniqueInput
    /**
     * In case the GlobalSettings found by the `where` argument doesn't exist, create a new GlobalSettings with this data.
     */
    create: XOR<GlobalSettingsCreateInput, GlobalSettingsUncheckedCreateInput>
    /**
     * In case the GlobalSettings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GlobalSettingsUpdateInput, GlobalSettingsUncheckedUpdateInput>
  }

  /**
   * GlobalSettings delete
   */
  export type GlobalSettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
    /**
     * Filter which GlobalSettings to delete.
     */
    where: GlobalSettingsWhereUniqueInput
  }

  /**
   * GlobalSettings deleteMany
   */
  export type GlobalSettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GlobalSettings to delete
     */
    where?: GlobalSettingsWhereInput
  }

  /**
   * GlobalSettings without action
   */
  export type GlobalSettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalSettings
     */
    select?: GlobalSettingsSelect<ExtArgs> | null
  }


  /**
   * Model SystemPayment
   */

  export type AggregateSystemPayment = {
    _count: SystemPaymentCountAggregateOutputType | null
    _avg: SystemPaymentAvgAggregateOutputType | null
    _sum: SystemPaymentSumAggregateOutputType | null
    _min: SystemPaymentMinAggregateOutputType | null
    _max: SystemPaymentMaxAggregateOutputType | null
  }

  export type SystemPaymentAvgAggregateOutputType = {
    amount: Decimal | null
  }

  export type SystemPaymentSumAggregateOutputType = {
    amount: Decimal | null
  }

  export type SystemPaymentMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    amount: Decimal | null
    currency: string | null
    method: string | null
    status: string | null
    reference: string | null
    customerEmail: string | null
    customerName: string | null
    description: string | null
    createdAt: Date | null
  }

  export type SystemPaymentMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    amount: Decimal | null
    currency: string | null
    method: string | null
    status: string | null
    reference: string | null
    customerEmail: string | null
    customerName: string | null
    description: string | null
    createdAt: Date | null
  }

  export type SystemPaymentCountAggregateOutputType = {
    id: number
    tenantId: number
    amount: number
    currency: number
    method: number
    status: number
    reference: number
    customerEmail: number
    customerName: number
    description: number
    createdAt: number
    _all: number
  }


  export type SystemPaymentAvgAggregateInputType = {
    amount?: true
  }

  export type SystemPaymentSumAggregateInputType = {
    amount?: true
  }

  export type SystemPaymentMinAggregateInputType = {
    id?: true
    tenantId?: true
    amount?: true
    currency?: true
    method?: true
    status?: true
    reference?: true
    customerEmail?: true
    customerName?: true
    description?: true
    createdAt?: true
  }

  export type SystemPaymentMaxAggregateInputType = {
    id?: true
    tenantId?: true
    amount?: true
    currency?: true
    method?: true
    status?: true
    reference?: true
    customerEmail?: true
    customerName?: true
    description?: true
    createdAt?: true
  }

  export type SystemPaymentCountAggregateInputType = {
    id?: true
    tenantId?: true
    amount?: true
    currency?: true
    method?: true
    status?: true
    reference?: true
    customerEmail?: true
    customerName?: true
    description?: true
    createdAt?: true
    _all?: true
  }

  export type SystemPaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemPayment to aggregate.
     */
    where?: SystemPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemPayments to fetch.
     */
    orderBy?: SystemPaymentOrderByWithRelationInput | SystemPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemPayments
    **/
    _count?: true | SystemPaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SystemPaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SystemPaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemPaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemPaymentMaxAggregateInputType
  }

  export type GetSystemPaymentAggregateType<T extends SystemPaymentAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemPayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemPayment[P]>
      : GetScalarType<T[P], AggregateSystemPayment[P]>
  }




  export type SystemPaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemPaymentWhereInput
    orderBy?: SystemPaymentOrderByWithAggregationInput | SystemPaymentOrderByWithAggregationInput[]
    by: SystemPaymentScalarFieldEnum[] | SystemPaymentScalarFieldEnum
    having?: SystemPaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemPaymentCountAggregateInputType | true
    _avg?: SystemPaymentAvgAggregateInputType
    _sum?: SystemPaymentSumAggregateInputType
    _min?: SystemPaymentMinAggregateInputType
    _max?: SystemPaymentMaxAggregateInputType
  }

  export type SystemPaymentGroupByOutputType = {
    id: string
    tenantId: string | null
    amount: Decimal
    currency: string
    method: string
    status: string
    reference: string
    customerEmail: string
    customerName: string
    description: string | null
    createdAt: Date
    _count: SystemPaymentCountAggregateOutputType | null
    _avg: SystemPaymentAvgAggregateOutputType | null
    _sum: SystemPaymentSumAggregateOutputType | null
    _min: SystemPaymentMinAggregateOutputType | null
    _max: SystemPaymentMaxAggregateOutputType | null
  }

  type GetSystemPaymentGroupByPayload<T extends SystemPaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemPaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemPaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemPaymentGroupByOutputType[P]>
            : GetScalarType<T[P], SystemPaymentGroupByOutputType[P]>
        }
      >
    >


  export type SystemPaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    amount?: boolean
    currency?: boolean
    method?: boolean
    status?: boolean
    reference?: boolean
    customerEmail?: boolean
    customerName?: boolean
    description?: boolean
    createdAt?: boolean
    tenant?: boolean | SystemPayment$tenantArgs<ExtArgs>
  }, ExtArgs["result"]["systemPayment"]>

  export type SystemPaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    amount?: boolean
    currency?: boolean
    method?: boolean
    status?: boolean
    reference?: boolean
    customerEmail?: boolean
    customerName?: boolean
    description?: boolean
    createdAt?: boolean
    tenant?: boolean | SystemPayment$tenantArgs<ExtArgs>
  }, ExtArgs["result"]["systemPayment"]>

  export type SystemPaymentSelectScalar = {
    id?: boolean
    tenantId?: boolean
    amount?: boolean
    currency?: boolean
    method?: boolean
    status?: boolean
    reference?: boolean
    customerEmail?: boolean
    customerName?: boolean
    description?: boolean
    createdAt?: boolean
  }

  export type SystemPaymentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | SystemPayment$tenantArgs<ExtArgs>
  }
  export type SystemPaymentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | SystemPayment$tenantArgs<ExtArgs>
  }

  export type $SystemPaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemPayment"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string | null
      amount: Prisma.Decimal
      currency: string
      method: string
      status: string
      reference: string
      customerEmail: string
      customerName: string
      description: string | null
      createdAt: Date
    }, ExtArgs["result"]["systemPayment"]>
    composites: {}
  }

  type SystemPaymentGetPayload<S extends boolean | null | undefined | SystemPaymentDefaultArgs> = $Result.GetResult<Prisma.$SystemPaymentPayload, S>

  type SystemPaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SystemPaymentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SystemPaymentCountAggregateInputType | true
    }

  export interface SystemPaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemPayment'], meta: { name: 'SystemPayment' } }
    /**
     * Find zero or one SystemPayment that matches the filter.
     * @param {SystemPaymentFindUniqueArgs} args - Arguments to find a SystemPayment
     * @example
     * // Get one SystemPayment
     * const systemPayment = await prisma.systemPayment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemPaymentFindUniqueArgs>(args: SelectSubset<T, SystemPaymentFindUniqueArgs<ExtArgs>>): Prisma__SystemPaymentClient<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SystemPayment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SystemPaymentFindUniqueOrThrowArgs} args - Arguments to find a SystemPayment
     * @example
     * // Get one SystemPayment
     * const systemPayment = await prisma.systemPayment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemPaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemPaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemPaymentClient<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SystemPayment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemPaymentFindFirstArgs} args - Arguments to find a SystemPayment
     * @example
     * // Get one SystemPayment
     * const systemPayment = await prisma.systemPayment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemPaymentFindFirstArgs>(args?: SelectSubset<T, SystemPaymentFindFirstArgs<ExtArgs>>): Prisma__SystemPaymentClient<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SystemPayment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemPaymentFindFirstOrThrowArgs} args - Arguments to find a SystemPayment
     * @example
     * // Get one SystemPayment
     * const systemPayment = await prisma.systemPayment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemPaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemPaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemPaymentClient<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SystemPayments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemPaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemPayments
     * const systemPayments = await prisma.systemPayment.findMany()
     * 
     * // Get first 10 SystemPayments
     * const systemPayments = await prisma.systemPayment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemPaymentWithIdOnly = await prisma.systemPayment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemPaymentFindManyArgs>(args?: SelectSubset<T, SystemPaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SystemPayment.
     * @param {SystemPaymentCreateArgs} args - Arguments to create a SystemPayment.
     * @example
     * // Create one SystemPayment
     * const SystemPayment = await prisma.systemPayment.create({
     *   data: {
     *     // ... data to create a SystemPayment
     *   }
     * })
     * 
     */
    create<T extends SystemPaymentCreateArgs>(args: SelectSubset<T, SystemPaymentCreateArgs<ExtArgs>>): Prisma__SystemPaymentClient<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SystemPayments.
     * @param {SystemPaymentCreateManyArgs} args - Arguments to create many SystemPayments.
     * @example
     * // Create many SystemPayments
     * const systemPayment = await prisma.systemPayment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemPaymentCreateManyArgs>(args?: SelectSubset<T, SystemPaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SystemPayments and returns the data saved in the database.
     * @param {SystemPaymentCreateManyAndReturnArgs} args - Arguments to create many SystemPayments.
     * @example
     * // Create many SystemPayments
     * const systemPayment = await prisma.systemPayment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SystemPayments and only return the `id`
     * const systemPaymentWithIdOnly = await prisma.systemPayment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SystemPaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, SystemPaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SystemPayment.
     * @param {SystemPaymentDeleteArgs} args - Arguments to delete one SystemPayment.
     * @example
     * // Delete one SystemPayment
     * const SystemPayment = await prisma.systemPayment.delete({
     *   where: {
     *     // ... filter to delete one SystemPayment
     *   }
     * })
     * 
     */
    delete<T extends SystemPaymentDeleteArgs>(args: SelectSubset<T, SystemPaymentDeleteArgs<ExtArgs>>): Prisma__SystemPaymentClient<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SystemPayment.
     * @param {SystemPaymentUpdateArgs} args - Arguments to update one SystemPayment.
     * @example
     * // Update one SystemPayment
     * const systemPayment = await prisma.systemPayment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemPaymentUpdateArgs>(args: SelectSubset<T, SystemPaymentUpdateArgs<ExtArgs>>): Prisma__SystemPaymentClient<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SystemPayments.
     * @param {SystemPaymentDeleteManyArgs} args - Arguments to filter SystemPayments to delete.
     * @example
     * // Delete a few SystemPayments
     * const { count } = await prisma.systemPayment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemPaymentDeleteManyArgs>(args?: SelectSubset<T, SystemPaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemPaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemPayments
     * const systemPayment = await prisma.systemPayment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemPaymentUpdateManyArgs>(args: SelectSubset<T, SystemPaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SystemPayment.
     * @param {SystemPaymentUpsertArgs} args - Arguments to update or create a SystemPayment.
     * @example
     * // Update or create a SystemPayment
     * const systemPayment = await prisma.systemPayment.upsert({
     *   create: {
     *     // ... data to create a SystemPayment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemPayment we want to update
     *   }
     * })
     */
    upsert<T extends SystemPaymentUpsertArgs>(args: SelectSubset<T, SystemPaymentUpsertArgs<ExtArgs>>): Prisma__SystemPaymentClient<$Result.GetResult<Prisma.$SystemPaymentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SystemPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemPaymentCountArgs} args - Arguments to filter SystemPayments to count.
     * @example
     * // Count the number of SystemPayments
     * const count = await prisma.systemPayment.count({
     *   where: {
     *     // ... the filter for the SystemPayments we want to count
     *   }
     * })
    **/
    count<T extends SystemPaymentCountArgs>(
      args?: Subset<T, SystemPaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemPaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemPaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemPaymentAggregateArgs>(args: Subset<T, SystemPaymentAggregateArgs>): Prisma.PrismaPromise<GetSystemPaymentAggregateType<T>>

    /**
     * Group by SystemPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemPaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemPaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemPaymentGroupByArgs['orderBy'] }
        : { orderBy?: SystemPaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemPaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemPayment model
   */
  readonly fields: SystemPaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemPayment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemPaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends SystemPayment$tenantArgs<ExtArgs> = {}>(args?: Subset<T, SystemPayment$tenantArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemPayment model
   */ 
  interface SystemPaymentFieldRefs {
    readonly id: FieldRef<"SystemPayment", 'String'>
    readonly tenantId: FieldRef<"SystemPayment", 'String'>
    readonly amount: FieldRef<"SystemPayment", 'Decimal'>
    readonly currency: FieldRef<"SystemPayment", 'String'>
    readonly method: FieldRef<"SystemPayment", 'String'>
    readonly status: FieldRef<"SystemPayment", 'String'>
    readonly reference: FieldRef<"SystemPayment", 'String'>
    readonly customerEmail: FieldRef<"SystemPayment", 'String'>
    readonly customerName: FieldRef<"SystemPayment", 'String'>
    readonly description: FieldRef<"SystemPayment", 'String'>
    readonly createdAt: FieldRef<"SystemPayment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SystemPayment findUnique
   */
  export type SystemPaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SystemPayment to fetch.
     */
    where: SystemPaymentWhereUniqueInput
  }

  /**
   * SystemPayment findUniqueOrThrow
   */
  export type SystemPaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SystemPayment to fetch.
     */
    where: SystemPaymentWhereUniqueInput
  }

  /**
   * SystemPayment findFirst
   */
  export type SystemPaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SystemPayment to fetch.
     */
    where?: SystemPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemPayments to fetch.
     */
    orderBy?: SystemPaymentOrderByWithRelationInput | SystemPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemPayments.
     */
    cursor?: SystemPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemPayments.
     */
    distinct?: SystemPaymentScalarFieldEnum | SystemPaymentScalarFieldEnum[]
  }

  /**
   * SystemPayment findFirstOrThrow
   */
  export type SystemPaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SystemPayment to fetch.
     */
    where?: SystemPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemPayments to fetch.
     */
    orderBy?: SystemPaymentOrderByWithRelationInput | SystemPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemPayments.
     */
    cursor?: SystemPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemPayments.
     */
    distinct?: SystemPaymentScalarFieldEnum | SystemPaymentScalarFieldEnum[]
  }

  /**
   * SystemPayment findMany
   */
  export type SystemPaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * Filter, which SystemPayments to fetch.
     */
    where?: SystemPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemPayments to fetch.
     */
    orderBy?: SystemPaymentOrderByWithRelationInput | SystemPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemPayments.
     */
    cursor?: SystemPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemPayments.
     */
    skip?: number
    distinct?: SystemPaymentScalarFieldEnum | SystemPaymentScalarFieldEnum[]
  }

  /**
   * SystemPayment create
   */
  export type SystemPaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * The data needed to create a SystemPayment.
     */
    data: XOR<SystemPaymentCreateInput, SystemPaymentUncheckedCreateInput>
  }

  /**
   * SystemPayment createMany
   */
  export type SystemPaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemPayments.
     */
    data: SystemPaymentCreateManyInput | SystemPaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemPayment createManyAndReturn
   */
  export type SystemPaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SystemPayments.
     */
    data: SystemPaymentCreateManyInput | SystemPaymentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SystemPayment update
   */
  export type SystemPaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * The data needed to update a SystemPayment.
     */
    data: XOR<SystemPaymentUpdateInput, SystemPaymentUncheckedUpdateInput>
    /**
     * Choose, which SystemPayment to update.
     */
    where: SystemPaymentWhereUniqueInput
  }

  /**
   * SystemPayment updateMany
   */
  export type SystemPaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemPayments.
     */
    data: XOR<SystemPaymentUpdateManyMutationInput, SystemPaymentUncheckedUpdateManyInput>
    /**
     * Filter which SystemPayments to update
     */
    where?: SystemPaymentWhereInput
  }

  /**
   * SystemPayment upsert
   */
  export type SystemPaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * The filter to search for the SystemPayment to update in case it exists.
     */
    where: SystemPaymentWhereUniqueInput
    /**
     * In case the SystemPayment found by the `where` argument doesn't exist, create a new SystemPayment with this data.
     */
    create: XOR<SystemPaymentCreateInput, SystemPaymentUncheckedCreateInput>
    /**
     * In case the SystemPayment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemPaymentUpdateInput, SystemPaymentUncheckedUpdateInput>
  }

  /**
   * SystemPayment delete
   */
  export type SystemPaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
    /**
     * Filter which SystemPayment to delete.
     */
    where: SystemPaymentWhereUniqueInput
  }

  /**
   * SystemPayment deleteMany
   */
  export type SystemPaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemPayments to delete
     */
    where?: SystemPaymentWhereInput
  }

  /**
   * SystemPayment.tenant
   */
  export type SystemPayment$tenantArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    where?: TenantWhereInput
  }

  /**
   * SystemPayment without action
   */
  export type SystemPaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemPayment
     */
    select?: SystemPaymentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SystemPaymentInclude<ExtArgs> | null
  }


  /**
   * Model Plan
   */

  export type AggregatePlan = {
    _count: PlanCountAggregateOutputType | null
    _avg: PlanAvgAggregateOutputType | null
    _sum: PlanSumAggregateOutputType | null
    _min: PlanMinAggregateOutputType | null
    _max: PlanMaxAggregateOutputType | null
  }

  export type PlanAvgAggregateOutputType = {
    price: Decimal | null
    maxPatients: number | null
    maxUsers: number | null
    maxBeds: number | null
  }

  export type PlanSumAggregateOutputType = {
    price: Decimal | null
    maxPatients: number | null
    maxUsers: number | null
    maxBeds: number | null
  }

  export type PlanMinAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    description: string | null
    price: Decimal | null
    currency: string | null
    billingCycle: $Enums.BillingCycle | null
    maxPatients: number | null
    maxUsers: number | null
    maxBeds: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PlanMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    description: string | null
    price: Decimal | null
    currency: string | null
    billingCycle: $Enums.BillingCycle | null
    maxPatients: number | null
    maxUsers: number | null
    maxBeds: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PlanCountAggregateOutputType = {
    id: number
    name: number
    code: number
    description: number
    price: number
    currency: number
    billingCycle: number
    features: number
    maxPatients: number
    maxUsers: number
    maxBeds: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PlanAvgAggregateInputType = {
    price?: true
    maxPatients?: true
    maxUsers?: true
    maxBeds?: true
  }

  export type PlanSumAggregateInputType = {
    price?: true
    maxPatients?: true
    maxUsers?: true
    maxBeds?: true
  }

  export type PlanMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    price?: true
    currency?: true
    billingCycle?: true
    maxPatients?: true
    maxUsers?: true
    maxBeds?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PlanMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    price?: true
    currency?: true
    billingCycle?: true
    maxPatients?: true
    maxUsers?: true
    maxBeds?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PlanCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    description?: true
    price?: true
    currency?: true
    billingCycle?: true
    features?: true
    maxPatients?: true
    maxUsers?: true
    maxBeds?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Plan to aggregate.
     */
    where?: PlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Plans to fetch.
     */
    orderBy?: PlanOrderByWithRelationInput | PlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Plans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Plans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Plans
    **/
    _count?: true | PlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PlanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PlanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlanMaxAggregateInputType
  }

  export type GetPlanAggregateType<T extends PlanAggregateArgs> = {
        [P in keyof T & keyof AggregatePlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlan[P]>
      : GetScalarType<T[P], AggregatePlan[P]>
  }




  export type PlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlanWhereInput
    orderBy?: PlanOrderByWithAggregationInput | PlanOrderByWithAggregationInput[]
    by: PlanScalarFieldEnum[] | PlanScalarFieldEnum
    having?: PlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlanCountAggregateInputType | true
    _avg?: PlanAvgAggregateInputType
    _sum?: PlanSumAggregateInputType
    _min?: PlanMinAggregateInputType
    _max?: PlanMaxAggregateInputType
  }

  export type PlanGroupByOutputType = {
    id: string
    name: string
    code: string
    description: string | null
    price: Decimal
    currency: string
    billingCycle: $Enums.BillingCycle
    features: JsonValue
    maxPatients: number
    maxUsers: number
    maxBeds: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: PlanCountAggregateOutputType | null
    _avg: PlanAvgAggregateOutputType | null
    _sum: PlanSumAggregateOutputType | null
    _min: PlanMinAggregateOutputType | null
    _max: PlanMaxAggregateOutputType | null
  }

  type GetPlanGroupByPayload<T extends PlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlanGroupByOutputType[P]>
            : GetScalarType<T[P], PlanGroupByOutputType[P]>
        }
      >
    >


  export type PlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    price?: boolean
    currency?: boolean
    billingCycle?: boolean
    features?: boolean
    maxPatients?: boolean
    maxUsers?: boolean
    maxBeds?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    subscriptions?: boolean | Plan$subscriptionsArgs<ExtArgs>
    _count?: boolean | PlanCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["plan"]>

  export type PlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    price?: boolean
    currency?: boolean
    billingCycle?: boolean
    features?: boolean
    maxPatients?: boolean
    maxUsers?: boolean
    maxBeds?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["plan"]>

  export type PlanSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    description?: boolean
    price?: boolean
    currency?: boolean
    billingCycle?: boolean
    features?: boolean
    maxPatients?: boolean
    maxUsers?: boolean
    maxBeds?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PlanInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subscriptions?: boolean | Plan$subscriptionsArgs<ExtArgs>
    _count?: boolean | PlanCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PlanIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Plan"
    objects: {
      subscriptions: Prisma.$SubscriptionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      description: string | null
      price: Prisma.Decimal
      currency: string
      billingCycle: $Enums.BillingCycle
      features: Prisma.JsonValue
      maxPatients: number
      maxUsers: number
      maxBeds: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["plan"]>
    composites: {}
  }

  type PlanGetPayload<S extends boolean | null | undefined | PlanDefaultArgs> = $Result.GetResult<Prisma.$PlanPayload, S>

  type PlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PlanFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlanCountAggregateInputType | true
    }

  export interface PlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Plan'], meta: { name: 'Plan' } }
    /**
     * Find zero or one Plan that matches the filter.
     * @param {PlanFindUniqueArgs} args - Arguments to find a Plan
     * @example
     * // Get one Plan
     * const plan = await prisma.plan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlanFindUniqueArgs>(args: SelectSubset<T, PlanFindUniqueArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Plan that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PlanFindUniqueOrThrowArgs} args - Arguments to find a Plan
     * @example
     * // Get one Plan
     * const plan = await prisma.plan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlanFindUniqueOrThrowArgs>(args: SelectSubset<T, PlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Plan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanFindFirstArgs} args - Arguments to find a Plan
     * @example
     * // Get one Plan
     * const plan = await prisma.plan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlanFindFirstArgs>(args?: SelectSubset<T, PlanFindFirstArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Plan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanFindFirstOrThrowArgs} args - Arguments to find a Plan
     * @example
     * // Get one Plan
     * const plan = await prisma.plan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlanFindFirstOrThrowArgs>(args?: SelectSubset<T, PlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Plans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Plans
     * const plans = await prisma.plan.findMany()
     * 
     * // Get first 10 Plans
     * const plans = await prisma.plan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const planWithIdOnly = await prisma.plan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlanFindManyArgs>(args?: SelectSubset<T, PlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Plan.
     * @param {PlanCreateArgs} args - Arguments to create a Plan.
     * @example
     * // Create one Plan
     * const Plan = await prisma.plan.create({
     *   data: {
     *     // ... data to create a Plan
     *   }
     * })
     * 
     */
    create<T extends PlanCreateArgs>(args: SelectSubset<T, PlanCreateArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Plans.
     * @param {PlanCreateManyArgs} args - Arguments to create many Plans.
     * @example
     * // Create many Plans
     * const plan = await prisma.plan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlanCreateManyArgs>(args?: SelectSubset<T, PlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Plans and returns the data saved in the database.
     * @param {PlanCreateManyAndReturnArgs} args - Arguments to create many Plans.
     * @example
     * // Create many Plans
     * const plan = await prisma.plan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Plans and only return the `id`
     * const planWithIdOnly = await prisma.plan.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlanCreateManyAndReturnArgs>(args?: SelectSubset<T, PlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Plan.
     * @param {PlanDeleteArgs} args - Arguments to delete one Plan.
     * @example
     * // Delete one Plan
     * const Plan = await prisma.plan.delete({
     *   where: {
     *     // ... filter to delete one Plan
     *   }
     * })
     * 
     */
    delete<T extends PlanDeleteArgs>(args: SelectSubset<T, PlanDeleteArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Plan.
     * @param {PlanUpdateArgs} args - Arguments to update one Plan.
     * @example
     * // Update one Plan
     * const plan = await prisma.plan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlanUpdateArgs>(args: SelectSubset<T, PlanUpdateArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Plans.
     * @param {PlanDeleteManyArgs} args - Arguments to filter Plans to delete.
     * @example
     * // Delete a few Plans
     * const { count } = await prisma.plan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlanDeleteManyArgs>(args?: SelectSubset<T, PlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Plans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Plans
     * const plan = await prisma.plan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlanUpdateManyArgs>(args: SelectSubset<T, PlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Plan.
     * @param {PlanUpsertArgs} args - Arguments to update or create a Plan.
     * @example
     * // Update or create a Plan
     * const plan = await prisma.plan.upsert({
     *   create: {
     *     // ... data to create a Plan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Plan we want to update
     *   }
     * })
     */
    upsert<T extends PlanUpsertArgs>(args: SelectSubset<T, PlanUpsertArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Plans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanCountArgs} args - Arguments to filter Plans to count.
     * @example
     * // Count the number of Plans
     * const count = await prisma.plan.count({
     *   where: {
     *     // ... the filter for the Plans we want to count
     *   }
     * })
    **/
    count<T extends PlanCountArgs>(
      args?: Subset<T, PlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Plan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlanAggregateArgs>(args: Subset<T, PlanAggregateArgs>): Prisma.PrismaPromise<GetPlanAggregateType<T>>

    /**
     * Group by Plan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlanGroupByArgs['orderBy'] }
        : { orderBy?: PlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Plan model
   */
  readonly fields: PlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Plan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    subscriptions<T extends Plan$subscriptionsArgs<ExtArgs> = {}>(args?: Subset<T, Plan$subscriptionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Plan model
   */ 
  interface PlanFieldRefs {
    readonly id: FieldRef<"Plan", 'String'>
    readonly name: FieldRef<"Plan", 'String'>
    readonly code: FieldRef<"Plan", 'String'>
    readonly description: FieldRef<"Plan", 'String'>
    readonly price: FieldRef<"Plan", 'Decimal'>
    readonly currency: FieldRef<"Plan", 'String'>
    readonly billingCycle: FieldRef<"Plan", 'BillingCycle'>
    readonly features: FieldRef<"Plan", 'Json'>
    readonly maxPatients: FieldRef<"Plan", 'Int'>
    readonly maxUsers: FieldRef<"Plan", 'Int'>
    readonly maxBeds: FieldRef<"Plan", 'Int'>
    readonly isActive: FieldRef<"Plan", 'Boolean'>
    readonly createdAt: FieldRef<"Plan", 'DateTime'>
    readonly updatedAt: FieldRef<"Plan", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Plan findUnique
   */
  export type PlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * Filter, which Plan to fetch.
     */
    where: PlanWhereUniqueInput
  }

  /**
   * Plan findUniqueOrThrow
   */
  export type PlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * Filter, which Plan to fetch.
     */
    where: PlanWhereUniqueInput
  }

  /**
   * Plan findFirst
   */
  export type PlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * Filter, which Plan to fetch.
     */
    where?: PlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Plans to fetch.
     */
    orderBy?: PlanOrderByWithRelationInput | PlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Plans.
     */
    cursor?: PlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Plans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Plans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Plans.
     */
    distinct?: PlanScalarFieldEnum | PlanScalarFieldEnum[]
  }

  /**
   * Plan findFirstOrThrow
   */
  export type PlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * Filter, which Plan to fetch.
     */
    where?: PlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Plans to fetch.
     */
    orderBy?: PlanOrderByWithRelationInput | PlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Plans.
     */
    cursor?: PlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Plans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Plans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Plans.
     */
    distinct?: PlanScalarFieldEnum | PlanScalarFieldEnum[]
  }

  /**
   * Plan findMany
   */
  export type PlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * Filter, which Plans to fetch.
     */
    where?: PlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Plans to fetch.
     */
    orderBy?: PlanOrderByWithRelationInput | PlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Plans.
     */
    cursor?: PlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Plans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Plans.
     */
    skip?: number
    distinct?: PlanScalarFieldEnum | PlanScalarFieldEnum[]
  }

  /**
   * Plan create
   */
  export type PlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * The data needed to create a Plan.
     */
    data: XOR<PlanCreateInput, PlanUncheckedCreateInput>
  }

  /**
   * Plan createMany
   */
  export type PlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Plans.
     */
    data: PlanCreateManyInput | PlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Plan createManyAndReturn
   */
  export type PlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Plans.
     */
    data: PlanCreateManyInput | PlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Plan update
   */
  export type PlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * The data needed to update a Plan.
     */
    data: XOR<PlanUpdateInput, PlanUncheckedUpdateInput>
    /**
     * Choose, which Plan to update.
     */
    where: PlanWhereUniqueInput
  }

  /**
   * Plan updateMany
   */
  export type PlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Plans.
     */
    data: XOR<PlanUpdateManyMutationInput, PlanUncheckedUpdateManyInput>
    /**
     * Filter which Plans to update
     */
    where?: PlanWhereInput
  }

  /**
   * Plan upsert
   */
  export type PlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * The filter to search for the Plan to update in case it exists.
     */
    where: PlanWhereUniqueInput
    /**
     * In case the Plan found by the `where` argument doesn't exist, create a new Plan with this data.
     */
    create: XOR<PlanCreateInput, PlanUncheckedCreateInput>
    /**
     * In case the Plan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlanUpdateInput, PlanUncheckedUpdateInput>
  }

  /**
   * Plan delete
   */
  export type PlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
    /**
     * Filter which Plan to delete.
     */
    where: PlanWhereUniqueInput
  }

  /**
   * Plan deleteMany
   */
  export type PlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Plans to delete
     */
    where?: PlanWhereInput
  }

  /**
   * Plan.subscriptions
   */
  export type Plan$subscriptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    where?: SubscriptionWhereInput
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    cursor?: SubscriptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Plan without action
   */
  export type PlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Plan
     */
    select?: PlanSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlanInclude<ExtArgs> | null
  }


  /**
   * Model Subscription
   */

  export type AggregateSubscription = {
    _count: SubscriptionCountAggregateOutputType | null
    _min: SubscriptionMinAggregateOutputType | null
    _max: SubscriptionMaxAggregateOutputType | null
  }

  export type SubscriptionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    planId: string | null
    status: string | null
    startDate: Date | null
    endDate: Date | null
    signedToken: string | null
    autoRenew: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SubscriptionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    planId: string | null
    status: string | null
    startDate: Date | null
    endDate: Date | null
    signedToken: string | null
    autoRenew: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SubscriptionCountAggregateOutputType = {
    id: number
    tenantId: number
    planId: number
    status: number
    startDate: number
    endDate: number
    signedToken: number
    autoRenew: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SubscriptionMinAggregateInputType = {
    id?: true
    tenantId?: true
    planId?: true
    status?: true
    startDate?: true
    endDate?: true
    signedToken?: true
    autoRenew?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SubscriptionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    planId?: true
    status?: true
    startDate?: true
    endDate?: true
    signedToken?: true
    autoRenew?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SubscriptionCountAggregateInputType = {
    id?: true
    tenantId?: true
    planId?: true
    status?: true
    startDate?: true
    endDate?: true
    signedToken?: true
    autoRenew?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SubscriptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Subscription to aggregate.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Subscriptions
    **/
    _count?: true | SubscriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubscriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubscriptionMaxAggregateInputType
  }

  export type GetSubscriptionAggregateType<T extends SubscriptionAggregateArgs> = {
        [P in keyof T & keyof AggregateSubscription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubscription[P]>
      : GetScalarType<T[P], AggregateSubscription[P]>
  }




  export type SubscriptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionWhereInput
    orderBy?: SubscriptionOrderByWithAggregationInput | SubscriptionOrderByWithAggregationInput[]
    by: SubscriptionScalarFieldEnum[] | SubscriptionScalarFieldEnum
    having?: SubscriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubscriptionCountAggregateInputType | true
    _min?: SubscriptionMinAggregateInputType
    _max?: SubscriptionMaxAggregateInputType
  }

  export type SubscriptionGroupByOutputType = {
    id: string
    tenantId: string
    planId: string
    status: string
    startDate: Date
    endDate: Date | null
    signedToken: string | null
    autoRenew: boolean
    createdAt: Date
    updatedAt: Date
    _count: SubscriptionCountAggregateOutputType | null
    _min: SubscriptionMinAggregateOutputType | null
    _max: SubscriptionMaxAggregateOutputType | null
  }

  type GetSubscriptionGroupByPayload<T extends SubscriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubscriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubscriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubscriptionGroupByOutputType[P]>
            : GetScalarType<T[P], SubscriptionGroupByOutputType[P]>
        }
      >
    >


  export type SubscriptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    planId?: boolean
    status?: boolean
    startDate?: boolean
    endDate?: boolean
    signedToken?: boolean
    autoRenew?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    plan?: boolean | PlanDefaultArgs<ExtArgs>
    usages?: boolean | Subscription$usagesArgs<ExtArgs>
    _count?: boolean | SubscriptionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscription"]>

  export type SubscriptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    planId?: boolean
    status?: boolean
    startDate?: boolean
    endDate?: boolean
    signedToken?: boolean
    autoRenew?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    plan?: boolean | PlanDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscription"]>

  export type SubscriptionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    planId?: boolean
    status?: boolean
    startDate?: boolean
    endDate?: boolean
    signedToken?: boolean
    autoRenew?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SubscriptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    plan?: boolean | PlanDefaultArgs<ExtArgs>
    usages?: boolean | Subscription$usagesArgs<ExtArgs>
    _count?: boolean | SubscriptionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SubscriptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    plan?: boolean | PlanDefaultArgs<ExtArgs>
  }

  export type $SubscriptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Subscription"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      plan: Prisma.$PlanPayload<ExtArgs>
      usages: Prisma.$TenantUsagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      planId: string
      status: string
      startDate: Date
      endDate: Date | null
      signedToken: string | null
      autoRenew: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["subscription"]>
    composites: {}
  }

  type SubscriptionGetPayload<S extends boolean | null | undefined | SubscriptionDefaultArgs> = $Result.GetResult<Prisma.$SubscriptionPayload, S>

  type SubscriptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SubscriptionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SubscriptionCountAggregateInputType | true
    }

  export interface SubscriptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Subscription'], meta: { name: 'Subscription' } }
    /**
     * Find zero or one Subscription that matches the filter.
     * @param {SubscriptionFindUniqueArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SubscriptionFindUniqueArgs>(args: SelectSubset<T, SubscriptionFindUniqueArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Subscription that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SubscriptionFindUniqueOrThrowArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SubscriptionFindUniqueOrThrowArgs>(args: SelectSubset<T, SubscriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Subscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindFirstArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SubscriptionFindFirstArgs>(args?: SelectSubset<T, SubscriptionFindFirstArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Subscription that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindFirstOrThrowArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SubscriptionFindFirstOrThrowArgs>(args?: SelectSubset<T, SubscriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Subscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Subscriptions
     * const subscriptions = await prisma.subscription.findMany()
     * 
     * // Get first 10 Subscriptions
     * const subscriptions = await prisma.subscription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const subscriptionWithIdOnly = await prisma.subscription.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SubscriptionFindManyArgs>(args?: SelectSubset<T, SubscriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Subscription.
     * @param {SubscriptionCreateArgs} args - Arguments to create a Subscription.
     * @example
     * // Create one Subscription
     * const Subscription = await prisma.subscription.create({
     *   data: {
     *     // ... data to create a Subscription
     *   }
     * })
     * 
     */
    create<T extends SubscriptionCreateArgs>(args: SelectSubset<T, SubscriptionCreateArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Subscriptions.
     * @param {SubscriptionCreateManyArgs} args - Arguments to create many Subscriptions.
     * @example
     * // Create many Subscriptions
     * const subscription = await prisma.subscription.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SubscriptionCreateManyArgs>(args?: SelectSubset<T, SubscriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Subscriptions and returns the data saved in the database.
     * @param {SubscriptionCreateManyAndReturnArgs} args - Arguments to create many Subscriptions.
     * @example
     * // Create many Subscriptions
     * const subscription = await prisma.subscription.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Subscriptions and only return the `id`
     * const subscriptionWithIdOnly = await prisma.subscription.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SubscriptionCreateManyAndReturnArgs>(args?: SelectSubset<T, SubscriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Subscription.
     * @param {SubscriptionDeleteArgs} args - Arguments to delete one Subscription.
     * @example
     * // Delete one Subscription
     * const Subscription = await prisma.subscription.delete({
     *   where: {
     *     // ... filter to delete one Subscription
     *   }
     * })
     * 
     */
    delete<T extends SubscriptionDeleteArgs>(args: SelectSubset<T, SubscriptionDeleteArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Subscription.
     * @param {SubscriptionUpdateArgs} args - Arguments to update one Subscription.
     * @example
     * // Update one Subscription
     * const subscription = await prisma.subscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SubscriptionUpdateArgs>(args: SelectSubset<T, SubscriptionUpdateArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Subscriptions.
     * @param {SubscriptionDeleteManyArgs} args - Arguments to filter Subscriptions to delete.
     * @example
     * // Delete a few Subscriptions
     * const { count } = await prisma.subscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SubscriptionDeleteManyArgs>(args?: SelectSubset<T, SubscriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Subscriptions
     * const subscription = await prisma.subscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SubscriptionUpdateManyArgs>(args: SelectSubset<T, SubscriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Subscription.
     * @param {SubscriptionUpsertArgs} args - Arguments to update or create a Subscription.
     * @example
     * // Update or create a Subscription
     * const subscription = await prisma.subscription.upsert({
     *   create: {
     *     // ... data to create a Subscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Subscription we want to update
     *   }
     * })
     */
    upsert<T extends SubscriptionUpsertArgs>(args: SelectSubset<T, SubscriptionUpsertArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Subscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionCountArgs} args - Arguments to filter Subscriptions to count.
     * @example
     * // Count the number of Subscriptions
     * const count = await prisma.subscription.count({
     *   where: {
     *     // ... the filter for the Subscriptions we want to count
     *   }
     * })
    **/
    count<T extends SubscriptionCountArgs>(
      args?: Subset<T, SubscriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubscriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Subscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubscriptionAggregateArgs>(args: Subset<T, SubscriptionAggregateArgs>): Prisma.PrismaPromise<GetSubscriptionAggregateType<T>>

    /**
     * Group by Subscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SubscriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SubscriptionGroupByArgs['orderBy'] }
        : { orderBy?: SubscriptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Subscription model
   */
  readonly fields: SubscriptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Subscription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SubscriptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    plan<T extends PlanDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PlanDefaultArgs<ExtArgs>>): Prisma__PlanClient<$Result.GetResult<Prisma.$PlanPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    usages<T extends Subscription$usagesArgs<ExtArgs> = {}>(args?: Subset<T, Subscription$usagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Subscription model
   */ 
  interface SubscriptionFieldRefs {
    readonly id: FieldRef<"Subscription", 'String'>
    readonly tenantId: FieldRef<"Subscription", 'String'>
    readonly planId: FieldRef<"Subscription", 'String'>
    readonly status: FieldRef<"Subscription", 'String'>
    readonly startDate: FieldRef<"Subscription", 'DateTime'>
    readonly endDate: FieldRef<"Subscription", 'DateTime'>
    readonly signedToken: FieldRef<"Subscription", 'String'>
    readonly autoRenew: FieldRef<"Subscription", 'Boolean'>
    readonly createdAt: FieldRef<"Subscription", 'DateTime'>
    readonly updatedAt: FieldRef<"Subscription", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Subscription findUnique
   */
  export type SubscriptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription findUniqueOrThrow
   */
  export type SubscriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription findFirst
   */
  export type SubscriptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Subscriptions.
     */
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription findFirstOrThrow
   */
  export type SubscriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Subscriptions.
     */
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription findMany
   */
  export type SubscriptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscriptions to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription create
   */
  export type SubscriptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to create a Subscription.
     */
    data: XOR<SubscriptionCreateInput, SubscriptionUncheckedCreateInput>
  }

  /**
   * Subscription createMany
   */
  export type SubscriptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Subscriptions.
     */
    data: SubscriptionCreateManyInput | SubscriptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Subscription createManyAndReturn
   */
  export type SubscriptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Subscriptions.
     */
    data: SubscriptionCreateManyInput | SubscriptionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Subscription update
   */
  export type SubscriptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to update a Subscription.
     */
    data: XOR<SubscriptionUpdateInput, SubscriptionUncheckedUpdateInput>
    /**
     * Choose, which Subscription to update.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription updateMany
   */
  export type SubscriptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Subscriptions.
     */
    data: XOR<SubscriptionUpdateManyMutationInput, SubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which Subscriptions to update
     */
    where?: SubscriptionWhereInput
  }

  /**
   * Subscription upsert
   */
  export type SubscriptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The filter to search for the Subscription to update in case it exists.
     */
    where: SubscriptionWhereUniqueInput
    /**
     * In case the Subscription found by the `where` argument doesn't exist, create a new Subscription with this data.
     */
    create: XOR<SubscriptionCreateInput, SubscriptionUncheckedCreateInput>
    /**
     * In case the Subscription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SubscriptionUpdateInput, SubscriptionUncheckedUpdateInput>
  }

  /**
   * Subscription delete
   */
  export type SubscriptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter which Subscription to delete.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription deleteMany
   */
  export type SubscriptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Subscriptions to delete
     */
    where?: SubscriptionWhereInput
  }

  /**
   * Subscription.usages
   */
  export type Subscription$usagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    where?: TenantUsageWhereInput
    orderBy?: TenantUsageOrderByWithRelationInput | TenantUsageOrderByWithRelationInput[]
    cursor?: TenantUsageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantUsageScalarFieldEnum | TenantUsageScalarFieldEnum[]
  }

  /**
   * Subscription without action
   */
  export type SubscriptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
  }


  /**
   * Model PatientIndex
   */

  export type AggregatePatientIndex = {
    _count: PatientIndexCountAggregateOutputType | null
    _min: PatientIndexMinAggregateOutputType | null
    _max: PatientIndexMaxAggregateOutputType | null
  }

  export type PatientIndexMinAggregateOutputType = {
    biometricHash: string | null
    biometricType: string | null
    tenantId: string | null
    patientId: string | null
    description: string | null
    timestamp: Date | null
    updatedAt: Date | null
  }

  export type PatientIndexMaxAggregateOutputType = {
    biometricHash: string | null
    biometricType: string | null
    tenantId: string | null
    patientId: string | null
    description: string | null
    timestamp: Date | null
    updatedAt: Date | null
  }

  export type PatientIndexCountAggregateOutputType = {
    biometricHash: number
    biometricType: number
    tenantId: number
    patientId: number
    description: number
    timestamp: number
    updatedAt: number
    _all: number
  }


  export type PatientIndexMinAggregateInputType = {
    biometricHash?: true
    biometricType?: true
    tenantId?: true
    patientId?: true
    description?: true
    timestamp?: true
    updatedAt?: true
  }

  export type PatientIndexMaxAggregateInputType = {
    biometricHash?: true
    biometricType?: true
    tenantId?: true
    patientId?: true
    description?: true
    timestamp?: true
    updatedAt?: true
  }

  export type PatientIndexCountAggregateInputType = {
    biometricHash?: true
    biometricType?: true
    tenantId?: true
    patientId?: true
    description?: true
    timestamp?: true
    updatedAt?: true
    _all?: true
  }

  export type PatientIndexAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PatientIndex to aggregate.
     */
    where?: PatientIndexWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PatientIndices to fetch.
     */
    orderBy?: PatientIndexOrderByWithRelationInput | PatientIndexOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PatientIndexWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PatientIndices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PatientIndices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PatientIndices
    **/
    _count?: true | PatientIndexCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PatientIndexMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PatientIndexMaxAggregateInputType
  }

  export type GetPatientIndexAggregateType<T extends PatientIndexAggregateArgs> = {
        [P in keyof T & keyof AggregatePatientIndex]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePatientIndex[P]>
      : GetScalarType<T[P], AggregatePatientIndex[P]>
  }




  export type PatientIndexGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PatientIndexWhereInput
    orderBy?: PatientIndexOrderByWithAggregationInput | PatientIndexOrderByWithAggregationInput[]
    by: PatientIndexScalarFieldEnum[] | PatientIndexScalarFieldEnum
    having?: PatientIndexScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PatientIndexCountAggregateInputType | true
    _min?: PatientIndexMinAggregateInputType
    _max?: PatientIndexMaxAggregateInputType
  }

  export type PatientIndexGroupByOutputType = {
    biometricHash: string
    biometricType: string
    tenantId: string
    patientId: string
    description: string | null
    timestamp: Date
    updatedAt: Date
    _count: PatientIndexCountAggregateOutputType | null
    _min: PatientIndexMinAggregateOutputType | null
    _max: PatientIndexMaxAggregateOutputType | null
  }

  type GetPatientIndexGroupByPayload<T extends PatientIndexGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PatientIndexGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PatientIndexGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PatientIndexGroupByOutputType[P]>
            : GetScalarType<T[P], PatientIndexGroupByOutputType[P]>
        }
      >
    >


  export type PatientIndexSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    biometricHash?: boolean
    biometricType?: boolean
    tenantId?: boolean
    patientId?: boolean
    description?: boolean
    timestamp?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["patientIndex"]>

  export type PatientIndexSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    biometricHash?: boolean
    biometricType?: boolean
    tenantId?: boolean
    patientId?: boolean
    description?: boolean
    timestamp?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["patientIndex"]>

  export type PatientIndexSelectScalar = {
    biometricHash?: boolean
    biometricType?: boolean
    tenantId?: boolean
    patientId?: boolean
    description?: boolean
    timestamp?: boolean
    updatedAt?: boolean
  }


  export type $PatientIndexPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PatientIndex"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      biometricHash: string
      biometricType: string
      tenantId: string
      patientId: string
      description: string | null
      timestamp: Date
      updatedAt: Date
    }, ExtArgs["result"]["patientIndex"]>
    composites: {}
  }

  type PatientIndexGetPayload<S extends boolean | null | undefined | PatientIndexDefaultArgs> = $Result.GetResult<Prisma.$PatientIndexPayload, S>

  type PatientIndexCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PatientIndexFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PatientIndexCountAggregateInputType | true
    }

  export interface PatientIndexDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PatientIndex'], meta: { name: 'PatientIndex' } }
    /**
     * Find zero or one PatientIndex that matches the filter.
     * @param {PatientIndexFindUniqueArgs} args - Arguments to find a PatientIndex
     * @example
     * // Get one PatientIndex
     * const patientIndex = await prisma.patientIndex.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PatientIndexFindUniqueArgs>(args: SelectSubset<T, PatientIndexFindUniqueArgs<ExtArgs>>): Prisma__PatientIndexClient<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PatientIndex that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PatientIndexFindUniqueOrThrowArgs} args - Arguments to find a PatientIndex
     * @example
     * // Get one PatientIndex
     * const patientIndex = await prisma.patientIndex.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PatientIndexFindUniqueOrThrowArgs>(args: SelectSubset<T, PatientIndexFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PatientIndexClient<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PatientIndex that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientIndexFindFirstArgs} args - Arguments to find a PatientIndex
     * @example
     * // Get one PatientIndex
     * const patientIndex = await prisma.patientIndex.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PatientIndexFindFirstArgs>(args?: SelectSubset<T, PatientIndexFindFirstArgs<ExtArgs>>): Prisma__PatientIndexClient<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PatientIndex that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientIndexFindFirstOrThrowArgs} args - Arguments to find a PatientIndex
     * @example
     * // Get one PatientIndex
     * const patientIndex = await prisma.patientIndex.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PatientIndexFindFirstOrThrowArgs>(args?: SelectSubset<T, PatientIndexFindFirstOrThrowArgs<ExtArgs>>): Prisma__PatientIndexClient<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PatientIndices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientIndexFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PatientIndices
     * const patientIndices = await prisma.patientIndex.findMany()
     * 
     * // Get first 10 PatientIndices
     * const patientIndices = await prisma.patientIndex.findMany({ take: 10 })
     * 
     * // Only select the `biometricHash`
     * const patientIndexWithBiometricHashOnly = await prisma.patientIndex.findMany({ select: { biometricHash: true } })
     * 
     */
    findMany<T extends PatientIndexFindManyArgs>(args?: SelectSubset<T, PatientIndexFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PatientIndex.
     * @param {PatientIndexCreateArgs} args - Arguments to create a PatientIndex.
     * @example
     * // Create one PatientIndex
     * const PatientIndex = await prisma.patientIndex.create({
     *   data: {
     *     // ... data to create a PatientIndex
     *   }
     * })
     * 
     */
    create<T extends PatientIndexCreateArgs>(args: SelectSubset<T, PatientIndexCreateArgs<ExtArgs>>): Prisma__PatientIndexClient<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PatientIndices.
     * @param {PatientIndexCreateManyArgs} args - Arguments to create many PatientIndices.
     * @example
     * // Create many PatientIndices
     * const patientIndex = await prisma.patientIndex.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PatientIndexCreateManyArgs>(args?: SelectSubset<T, PatientIndexCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PatientIndices and returns the data saved in the database.
     * @param {PatientIndexCreateManyAndReturnArgs} args - Arguments to create many PatientIndices.
     * @example
     * // Create many PatientIndices
     * const patientIndex = await prisma.patientIndex.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PatientIndices and only return the `biometricHash`
     * const patientIndexWithBiometricHashOnly = await prisma.patientIndex.createManyAndReturn({ 
     *   select: { biometricHash: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PatientIndexCreateManyAndReturnArgs>(args?: SelectSubset<T, PatientIndexCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PatientIndex.
     * @param {PatientIndexDeleteArgs} args - Arguments to delete one PatientIndex.
     * @example
     * // Delete one PatientIndex
     * const PatientIndex = await prisma.patientIndex.delete({
     *   where: {
     *     // ... filter to delete one PatientIndex
     *   }
     * })
     * 
     */
    delete<T extends PatientIndexDeleteArgs>(args: SelectSubset<T, PatientIndexDeleteArgs<ExtArgs>>): Prisma__PatientIndexClient<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PatientIndex.
     * @param {PatientIndexUpdateArgs} args - Arguments to update one PatientIndex.
     * @example
     * // Update one PatientIndex
     * const patientIndex = await prisma.patientIndex.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PatientIndexUpdateArgs>(args: SelectSubset<T, PatientIndexUpdateArgs<ExtArgs>>): Prisma__PatientIndexClient<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PatientIndices.
     * @param {PatientIndexDeleteManyArgs} args - Arguments to filter PatientIndices to delete.
     * @example
     * // Delete a few PatientIndices
     * const { count } = await prisma.patientIndex.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PatientIndexDeleteManyArgs>(args?: SelectSubset<T, PatientIndexDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PatientIndices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientIndexUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PatientIndices
     * const patientIndex = await prisma.patientIndex.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PatientIndexUpdateManyArgs>(args: SelectSubset<T, PatientIndexUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PatientIndex.
     * @param {PatientIndexUpsertArgs} args - Arguments to update or create a PatientIndex.
     * @example
     * // Update or create a PatientIndex
     * const patientIndex = await prisma.patientIndex.upsert({
     *   create: {
     *     // ... data to create a PatientIndex
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PatientIndex we want to update
     *   }
     * })
     */
    upsert<T extends PatientIndexUpsertArgs>(args: SelectSubset<T, PatientIndexUpsertArgs<ExtArgs>>): Prisma__PatientIndexClient<$Result.GetResult<Prisma.$PatientIndexPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PatientIndices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientIndexCountArgs} args - Arguments to filter PatientIndices to count.
     * @example
     * // Count the number of PatientIndices
     * const count = await prisma.patientIndex.count({
     *   where: {
     *     // ... the filter for the PatientIndices we want to count
     *   }
     * })
    **/
    count<T extends PatientIndexCountArgs>(
      args?: Subset<T, PatientIndexCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PatientIndexCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PatientIndex.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientIndexAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PatientIndexAggregateArgs>(args: Subset<T, PatientIndexAggregateArgs>): Prisma.PrismaPromise<GetPatientIndexAggregateType<T>>

    /**
     * Group by PatientIndex.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PatientIndexGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PatientIndexGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PatientIndexGroupByArgs['orderBy'] }
        : { orderBy?: PatientIndexGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PatientIndexGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPatientIndexGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PatientIndex model
   */
  readonly fields: PatientIndexFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PatientIndex.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PatientIndexClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PatientIndex model
   */ 
  interface PatientIndexFieldRefs {
    readonly biometricHash: FieldRef<"PatientIndex", 'String'>
    readonly biometricType: FieldRef<"PatientIndex", 'String'>
    readonly tenantId: FieldRef<"PatientIndex", 'String'>
    readonly patientId: FieldRef<"PatientIndex", 'String'>
    readonly description: FieldRef<"PatientIndex", 'String'>
    readonly timestamp: FieldRef<"PatientIndex", 'DateTime'>
    readonly updatedAt: FieldRef<"PatientIndex", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PatientIndex findUnique
   */
  export type PatientIndexFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * Filter, which PatientIndex to fetch.
     */
    where: PatientIndexWhereUniqueInput
  }

  /**
   * PatientIndex findUniqueOrThrow
   */
  export type PatientIndexFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * Filter, which PatientIndex to fetch.
     */
    where: PatientIndexWhereUniqueInput
  }

  /**
   * PatientIndex findFirst
   */
  export type PatientIndexFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * Filter, which PatientIndex to fetch.
     */
    where?: PatientIndexWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PatientIndices to fetch.
     */
    orderBy?: PatientIndexOrderByWithRelationInput | PatientIndexOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PatientIndices.
     */
    cursor?: PatientIndexWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PatientIndices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PatientIndices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PatientIndices.
     */
    distinct?: PatientIndexScalarFieldEnum | PatientIndexScalarFieldEnum[]
  }

  /**
   * PatientIndex findFirstOrThrow
   */
  export type PatientIndexFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * Filter, which PatientIndex to fetch.
     */
    where?: PatientIndexWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PatientIndices to fetch.
     */
    orderBy?: PatientIndexOrderByWithRelationInput | PatientIndexOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PatientIndices.
     */
    cursor?: PatientIndexWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PatientIndices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PatientIndices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PatientIndices.
     */
    distinct?: PatientIndexScalarFieldEnum | PatientIndexScalarFieldEnum[]
  }

  /**
   * PatientIndex findMany
   */
  export type PatientIndexFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * Filter, which PatientIndices to fetch.
     */
    where?: PatientIndexWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PatientIndices to fetch.
     */
    orderBy?: PatientIndexOrderByWithRelationInput | PatientIndexOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PatientIndices.
     */
    cursor?: PatientIndexWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PatientIndices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PatientIndices.
     */
    skip?: number
    distinct?: PatientIndexScalarFieldEnum | PatientIndexScalarFieldEnum[]
  }

  /**
   * PatientIndex create
   */
  export type PatientIndexCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * The data needed to create a PatientIndex.
     */
    data: XOR<PatientIndexCreateInput, PatientIndexUncheckedCreateInput>
  }

  /**
   * PatientIndex createMany
   */
  export type PatientIndexCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PatientIndices.
     */
    data: PatientIndexCreateManyInput | PatientIndexCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PatientIndex createManyAndReturn
   */
  export type PatientIndexCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PatientIndices.
     */
    data: PatientIndexCreateManyInput | PatientIndexCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PatientIndex update
   */
  export type PatientIndexUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * The data needed to update a PatientIndex.
     */
    data: XOR<PatientIndexUpdateInput, PatientIndexUncheckedUpdateInput>
    /**
     * Choose, which PatientIndex to update.
     */
    where: PatientIndexWhereUniqueInput
  }

  /**
   * PatientIndex updateMany
   */
  export type PatientIndexUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PatientIndices.
     */
    data: XOR<PatientIndexUpdateManyMutationInput, PatientIndexUncheckedUpdateManyInput>
    /**
     * Filter which PatientIndices to update
     */
    where?: PatientIndexWhereInput
  }

  /**
   * PatientIndex upsert
   */
  export type PatientIndexUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * The filter to search for the PatientIndex to update in case it exists.
     */
    where: PatientIndexWhereUniqueInput
    /**
     * In case the PatientIndex found by the `where` argument doesn't exist, create a new PatientIndex with this data.
     */
    create: XOR<PatientIndexCreateInput, PatientIndexUncheckedCreateInput>
    /**
     * In case the PatientIndex was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PatientIndexUpdateInput, PatientIndexUncheckedUpdateInput>
  }

  /**
   * PatientIndex delete
   */
  export type PatientIndexDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
    /**
     * Filter which PatientIndex to delete.
     */
    where: PatientIndexWhereUniqueInput
  }

  /**
   * PatientIndex deleteMany
   */
  export type PatientIndexDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PatientIndices to delete
     */
    where?: PatientIndexWhereInput
  }

  /**
   * PatientIndex without action
   */
  export type PatientIndexDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PatientIndex
     */
    select?: PatientIndexSelect<ExtArgs> | null
  }


  /**
   * Model TenantUsage
   */

  export type AggregateTenantUsage = {
    _count: TenantUsageCountAggregateOutputType | null
    _avg: TenantUsageAvgAggregateOutputType | null
    _sum: TenantUsageSumAggregateOutputType | null
    _min: TenantUsageMinAggregateOutputType | null
    _max: TenantUsageMaxAggregateOutputType | null
  }

  export type TenantUsageAvgAggregateOutputType = {
    activeUsers: number | null
    activePatients: number | null
    storageUsedMb: Decimal | null
    apiCallsCount: number | null
  }

  export type TenantUsageSumAggregateOutputType = {
    activeUsers: number | null
    activePatients: number | null
    storageUsedMb: Decimal | null
    apiCallsCount: number | null
  }

  export type TenantUsageMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    subscriptionId: string | null
    date: Date | null
    activeUsers: number | null
    activePatients: number | null
    storageUsedMb: Decimal | null
    apiCallsCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantUsageMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    subscriptionId: string | null
    date: Date | null
    activeUsers: number | null
    activePatients: number | null
    storageUsedMb: Decimal | null
    apiCallsCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantUsageCountAggregateOutputType = {
    id: number
    tenantId: number
    subscriptionId: number
    date: number
    activeUsers: number
    activePatients: number
    storageUsedMb: number
    apiCallsCount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantUsageAvgAggregateInputType = {
    activeUsers?: true
    activePatients?: true
    storageUsedMb?: true
    apiCallsCount?: true
  }

  export type TenantUsageSumAggregateInputType = {
    activeUsers?: true
    activePatients?: true
    storageUsedMb?: true
    apiCallsCount?: true
  }

  export type TenantUsageMinAggregateInputType = {
    id?: true
    tenantId?: true
    subscriptionId?: true
    date?: true
    activeUsers?: true
    activePatients?: true
    storageUsedMb?: true
    apiCallsCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantUsageMaxAggregateInputType = {
    id?: true
    tenantId?: true
    subscriptionId?: true
    date?: true
    activeUsers?: true
    activePatients?: true
    storageUsedMb?: true
    apiCallsCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantUsageCountAggregateInputType = {
    id?: true
    tenantId?: true
    subscriptionId?: true
    date?: true
    activeUsers?: true
    activePatients?: true
    storageUsedMb?: true
    apiCallsCount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantUsageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantUsage to aggregate.
     */
    where?: TenantUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantUsages to fetch.
     */
    orderBy?: TenantUsageOrderByWithRelationInput | TenantUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TenantUsages
    **/
    _count?: true | TenantUsageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TenantUsageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TenantUsageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantUsageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantUsageMaxAggregateInputType
  }

  export type GetTenantUsageAggregateType<T extends TenantUsageAggregateArgs> = {
        [P in keyof T & keyof AggregateTenantUsage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenantUsage[P]>
      : GetScalarType<T[P], AggregateTenantUsage[P]>
  }




  export type TenantUsageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantUsageWhereInput
    orderBy?: TenantUsageOrderByWithAggregationInput | TenantUsageOrderByWithAggregationInput[]
    by: TenantUsageScalarFieldEnum[] | TenantUsageScalarFieldEnum
    having?: TenantUsageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantUsageCountAggregateInputType | true
    _avg?: TenantUsageAvgAggregateInputType
    _sum?: TenantUsageSumAggregateInputType
    _min?: TenantUsageMinAggregateInputType
    _max?: TenantUsageMaxAggregateInputType
  }

  export type TenantUsageGroupByOutputType = {
    id: string
    tenantId: string
    subscriptionId: string
    date: Date
    activeUsers: number
    activePatients: number
    storageUsedMb: Decimal
    apiCallsCount: number
    createdAt: Date
    updatedAt: Date
    _count: TenantUsageCountAggregateOutputType | null
    _avg: TenantUsageAvgAggregateOutputType | null
    _sum: TenantUsageSumAggregateOutputType | null
    _min: TenantUsageMinAggregateOutputType | null
    _max: TenantUsageMaxAggregateOutputType | null
  }

  type GetTenantUsageGroupByPayload<T extends TenantUsageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantUsageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantUsageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantUsageGroupByOutputType[P]>
            : GetScalarType<T[P], TenantUsageGroupByOutputType[P]>
        }
      >
    >


  export type TenantUsageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    subscriptionId?: boolean
    date?: boolean
    activeUsers?: boolean
    activePatients?: boolean
    storageUsedMb?: boolean
    apiCallsCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    subscription?: boolean | SubscriptionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantUsage"]>

  export type TenantUsageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    subscriptionId?: boolean
    date?: boolean
    activeUsers?: boolean
    activePatients?: boolean
    storageUsedMb?: boolean
    apiCallsCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    subscription?: boolean | SubscriptionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenantUsage"]>

  export type TenantUsageSelectScalar = {
    id?: boolean
    tenantId?: boolean
    subscriptionId?: boolean
    date?: boolean
    activeUsers?: boolean
    activePatients?: boolean
    storageUsedMb?: boolean
    apiCallsCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantUsageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    subscription?: boolean | SubscriptionDefaultArgs<ExtArgs>
  }
  export type TenantUsageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    subscription?: boolean | SubscriptionDefaultArgs<ExtArgs>
  }

  export type $TenantUsagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TenantUsage"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      subscription: Prisma.$SubscriptionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      subscriptionId: string
      date: Date
      activeUsers: number
      activePatients: number
      storageUsedMb: Prisma.Decimal
      apiCallsCount: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenantUsage"]>
    composites: {}
  }

  type TenantUsageGetPayload<S extends boolean | null | undefined | TenantUsageDefaultArgs> = $Result.GetResult<Prisma.$TenantUsagePayload, S>

  type TenantUsageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TenantUsageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TenantUsageCountAggregateInputType | true
    }

  export interface TenantUsageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TenantUsage'], meta: { name: 'TenantUsage' } }
    /**
     * Find zero or one TenantUsage that matches the filter.
     * @param {TenantUsageFindUniqueArgs} args - Arguments to find a TenantUsage
     * @example
     * // Get one TenantUsage
     * const tenantUsage = await prisma.tenantUsage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantUsageFindUniqueArgs>(args: SelectSubset<T, TenantUsageFindUniqueArgs<ExtArgs>>): Prisma__TenantUsageClient<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TenantUsage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TenantUsageFindUniqueOrThrowArgs} args - Arguments to find a TenantUsage
     * @example
     * // Get one TenantUsage
     * const tenantUsage = await prisma.tenantUsage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantUsageFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantUsageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantUsageClient<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TenantUsage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageFindFirstArgs} args - Arguments to find a TenantUsage
     * @example
     * // Get one TenantUsage
     * const tenantUsage = await prisma.tenantUsage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantUsageFindFirstArgs>(args?: SelectSubset<T, TenantUsageFindFirstArgs<ExtArgs>>): Prisma__TenantUsageClient<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TenantUsage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageFindFirstOrThrowArgs} args - Arguments to find a TenantUsage
     * @example
     * // Get one TenantUsage
     * const tenantUsage = await prisma.tenantUsage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantUsageFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantUsageFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantUsageClient<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TenantUsages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TenantUsages
     * const tenantUsages = await prisma.tenantUsage.findMany()
     * 
     * // Get first 10 TenantUsages
     * const tenantUsages = await prisma.tenantUsage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantUsageWithIdOnly = await prisma.tenantUsage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantUsageFindManyArgs>(args?: SelectSubset<T, TenantUsageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TenantUsage.
     * @param {TenantUsageCreateArgs} args - Arguments to create a TenantUsage.
     * @example
     * // Create one TenantUsage
     * const TenantUsage = await prisma.tenantUsage.create({
     *   data: {
     *     // ... data to create a TenantUsage
     *   }
     * })
     * 
     */
    create<T extends TenantUsageCreateArgs>(args: SelectSubset<T, TenantUsageCreateArgs<ExtArgs>>): Prisma__TenantUsageClient<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TenantUsages.
     * @param {TenantUsageCreateManyArgs} args - Arguments to create many TenantUsages.
     * @example
     * // Create many TenantUsages
     * const tenantUsage = await prisma.tenantUsage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantUsageCreateManyArgs>(args?: SelectSubset<T, TenantUsageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TenantUsages and returns the data saved in the database.
     * @param {TenantUsageCreateManyAndReturnArgs} args - Arguments to create many TenantUsages.
     * @example
     * // Create many TenantUsages
     * const tenantUsage = await prisma.tenantUsage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TenantUsages and only return the `id`
     * const tenantUsageWithIdOnly = await prisma.tenantUsage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantUsageCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantUsageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TenantUsage.
     * @param {TenantUsageDeleteArgs} args - Arguments to delete one TenantUsage.
     * @example
     * // Delete one TenantUsage
     * const TenantUsage = await prisma.tenantUsage.delete({
     *   where: {
     *     // ... filter to delete one TenantUsage
     *   }
     * })
     * 
     */
    delete<T extends TenantUsageDeleteArgs>(args: SelectSubset<T, TenantUsageDeleteArgs<ExtArgs>>): Prisma__TenantUsageClient<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TenantUsage.
     * @param {TenantUsageUpdateArgs} args - Arguments to update one TenantUsage.
     * @example
     * // Update one TenantUsage
     * const tenantUsage = await prisma.tenantUsage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUsageUpdateArgs>(args: SelectSubset<T, TenantUsageUpdateArgs<ExtArgs>>): Prisma__TenantUsageClient<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TenantUsages.
     * @param {TenantUsageDeleteManyArgs} args - Arguments to filter TenantUsages to delete.
     * @example
     * // Delete a few TenantUsages
     * const { count } = await prisma.tenantUsage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantUsageDeleteManyArgs>(args?: SelectSubset<T, TenantUsageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TenantUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TenantUsages
     * const tenantUsage = await prisma.tenantUsage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUsageUpdateManyArgs>(args: SelectSubset<T, TenantUsageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TenantUsage.
     * @param {TenantUsageUpsertArgs} args - Arguments to update or create a TenantUsage.
     * @example
     * // Update or create a TenantUsage
     * const tenantUsage = await prisma.tenantUsage.upsert({
     *   create: {
     *     // ... data to create a TenantUsage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TenantUsage we want to update
     *   }
     * })
     */
    upsert<T extends TenantUsageUpsertArgs>(args: SelectSubset<T, TenantUsageUpsertArgs<ExtArgs>>): Prisma__TenantUsageClient<$Result.GetResult<Prisma.$TenantUsagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TenantUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageCountArgs} args - Arguments to filter TenantUsages to count.
     * @example
     * // Count the number of TenantUsages
     * const count = await prisma.tenantUsage.count({
     *   where: {
     *     // ... the filter for the TenantUsages we want to count
     *   }
     * })
    **/
    count<T extends TenantUsageCountArgs>(
      args?: Subset<T, TenantUsageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantUsageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TenantUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantUsageAggregateArgs>(args: Subset<T, TenantUsageAggregateArgs>): Prisma.PrismaPromise<GetTenantUsageAggregateType<T>>

    /**
     * Group by TenantUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUsageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantUsageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantUsageGroupByArgs['orderBy'] }
        : { orderBy?: TenantUsageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantUsageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantUsageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TenantUsage model
   */
  readonly fields: TenantUsageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TenantUsage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantUsageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    subscription<T extends SubscriptionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SubscriptionDefaultArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TenantUsage model
   */ 
  interface TenantUsageFieldRefs {
    readonly id: FieldRef<"TenantUsage", 'String'>
    readonly tenantId: FieldRef<"TenantUsage", 'String'>
    readonly subscriptionId: FieldRef<"TenantUsage", 'String'>
    readonly date: FieldRef<"TenantUsage", 'DateTime'>
    readonly activeUsers: FieldRef<"TenantUsage", 'Int'>
    readonly activePatients: FieldRef<"TenantUsage", 'Int'>
    readonly storageUsedMb: FieldRef<"TenantUsage", 'Decimal'>
    readonly apiCallsCount: FieldRef<"TenantUsage", 'Int'>
    readonly createdAt: FieldRef<"TenantUsage", 'DateTime'>
    readonly updatedAt: FieldRef<"TenantUsage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TenantUsage findUnique
   */
  export type TenantUsageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsage to fetch.
     */
    where: TenantUsageWhereUniqueInput
  }

  /**
   * TenantUsage findUniqueOrThrow
   */
  export type TenantUsageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsage to fetch.
     */
    where: TenantUsageWhereUniqueInput
  }

  /**
   * TenantUsage findFirst
   */
  export type TenantUsageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsage to fetch.
     */
    where?: TenantUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantUsages to fetch.
     */
    orderBy?: TenantUsageOrderByWithRelationInput | TenantUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantUsages.
     */
    cursor?: TenantUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantUsages.
     */
    distinct?: TenantUsageScalarFieldEnum | TenantUsageScalarFieldEnum[]
  }

  /**
   * TenantUsage findFirstOrThrow
   */
  export type TenantUsageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsage to fetch.
     */
    where?: TenantUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantUsages to fetch.
     */
    orderBy?: TenantUsageOrderByWithRelationInput | TenantUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TenantUsages.
     */
    cursor?: TenantUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TenantUsages.
     */
    distinct?: TenantUsageScalarFieldEnum | TenantUsageScalarFieldEnum[]
  }

  /**
   * TenantUsage findMany
   */
  export type TenantUsageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * Filter, which TenantUsages to fetch.
     */
    where?: TenantUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TenantUsages to fetch.
     */
    orderBy?: TenantUsageOrderByWithRelationInput | TenantUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TenantUsages.
     */
    cursor?: TenantUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TenantUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TenantUsages.
     */
    skip?: number
    distinct?: TenantUsageScalarFieldEnum | TenantUsageScalarFieldEnum[]
  }

  /**
   * TenantUsage create
   */
  export type TenantUsageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * The data needed to create a TenantUsage.
     */
    data: XOR<TenantUsageCreateInput, TenantUsageUncheckedCreateInput>
  }

  /**
   * TenantUsage createMany
   */
  export type TenantUsageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TenantUsages.
     */
    data: TenantUsageCreateManyInput | TenantUsageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TenantUsage createManyAndReturn
   */
  export type TenantUsageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TenantUsages.
     */
    data: TenantUsageCreateManyInput | TenantUsageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TenantUsage update
   */
  export type TenantUsageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * The data needed to update a TenantUsage.
     */
    data: XOR<TenantUsageUpdateInput, TenantUsageUncheckedUpdateInput>
    /**
     * Choose, which TenantUsage to update.
     */
    where: TenantUsageWhereUniqueInput
  }

  /**
   * TenantUsage updateMany
   */
  export type TenantUsageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TenantUsages.
     */
    data: XOR<TenantUsageUpdateManyMutationInput, TenantUsageUncheckedUpdateManyInput>
    /**
     * Filter which TenantUsages to update
     */
    where?: TenantUsageWhereInput
  }

  /**
   * TenantUsage upsert
   */
  export type TenantUsageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * The filter to search for the TenantUsage to update in case it exists.
     */
    where: TenantUsageWhereUniqueInput
    /**
     * In case the TenantUsage found by the `where` argument doesn't exist, create a new TenantUsage with this data.
     */
    create: XOR<TenantUsageCreateInput, TenantUsageUncheckedCreateInput>
    /**
     * In case the TenantUsage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUsageUpdateInput, TenantUsageUncheckedUpdateInput>
  }

  /**
   * TenantUsage delete
   */
  export type TenantUsageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
    /**
     * Filter which TenantUsage to delete.
     */
    where: TenantUsageWhereUniqueInput
  }

  /**
   * TenantUsage deleteMany
   */
  export type TenantUsageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TenantUsages to delete
     */
    where?: TenantUsageWhereInput
  }

  /**
   * TenantUsage without action
   */
  export type TenantUsageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantUsage
     */
    select?: TenantUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantUsageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TenantScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    dbUrl: 'dbUrl',
    encryptionKeyReference: 'encryptionKeyReference',
    tier: 'tier',
    region: 'region',
    status: 'status',
    suspensionReason: 'suspensionReason',
    suspendedAt: 'suspendedAt',
    address: 'address',
    logoUrl: 'logoUrl',
    primaryColor: 'primaryColor',
    secondaryColor: 'secondaryColor',
    trialEndsAt: 'trialEndsAt',
    enabledModules: 'enabledModules',
    publicKeySpki: 'publicKeySpki',
    sharedSecret: 'sharedSecret',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const ModuleScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    description: 'description',
    basePrice: 'basePrice',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ModuleScalarFieldEnum = (typeof ModuleScalarFieldEnum)[keyof typeof ModuleScalarFieldEnum]


  export const TenantModuleScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    moduleId: 'moduleId',
    isEnabled: 'isEnabled',
    validUntil: 'validUntil',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantModuleScalarFieldEnum = (typeof TenantModuleScalarFieldEnum)[keyof typeof TenantModuleScalarFieldEnum]


  export const SystemAdminScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    passwordHash: 'passwordHash',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SystemAdminScalarFieldEnum = (typeof SystemAdminScalarFieldEnum)[keyof typeof SystemAdminScalarFieldEnum]


  export const GlobalSettingsScalarFieldEnum: {
    id: 'id',
    platformName: 'platformName',
    platformLogoUrl: 'platformLogoUrl',
    platformSlogan: 'platformSlogan',
    heroTitle: 'heroTitle',
    heroSubtitle: 'heroSubtitle',
    heroCTA: 'heroCTA',
    heroImageUrl: 'heroImageUrl',
    showHero: 'showHero',
    showFeatures: 'showFeatures',
    feature1Title: 'feature1Title',
    feature1Desc: 'feature1Desc',
    feature1Icon: 'feature1Icon',
    feature2Title: 'feature2Title',
    feature2Desc: 'feature2Desc',
    feature2Icon: 'feature2Icon',
    feature3Title: 'feature3Title',
    feature3Desc: 'feature3Desc',
    feature3Icon: 'feature3Icon',
    paypalClientId: 'paypalClientId',
    paypalClientSecret: 'paypalClientSecret',
    paypalEnv: 'paypalEnv',
    mpesaConsumerKey: 'mpesaConsumerKey',
    mpesaConsumerSecret: 'mpesaConsumerSecret',
    mpesaPasskey: 'mpesaPasskey',
    mpesaShortcode: 'mpesaShortcode',
    updatedAt: 'updatedAt'
  };

  export type GlobalSettingsScalarFieldEnum = (typeof GlobalSettingsScalarFieldEnum)[keyof typeof GlobalSettingsScalarFieldEnum]


  export const SystemPaymentScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    amount: 'amount',
    currency: 'currency',
    method: 'method',
    status: 'status',
    reference: 'reference',
    customerEmail: 'customerEmail',
    customerName: 'customerName',
    description: 'description',
    createdAt: 'createdAt'
  };

  export type SystemPaymentScalarFieldEnum = (typeof SystemPaymentScalarFieldEnum)[keyof typeof SystemPaymentScalarFieldEnum]


  export const PlanScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    description: 'description',
    price: 'price',
    currency: 'currency',
    billingCycle: 'billingCycle',
    features: 'features',
    maxPatients: 'maxPatients',
    maxUsers: 'maxUsers',
    maxBeds: 'maxBeds',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PlanScalarFieldEnum = (typeof PlanScalarFieldEnum)[keyof typeof PlanScalarFieldEnum]


  export const SubscriptionScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    planId: 'planId',
    status: 'status',
    startDate: 'startDate',
    endDate: 'endDate',
    signedToken: 'signedToken',
    autoRenew: 'autoRenew',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SubscriptionScalarFieldEnum = (typeof SubscriptionScalarFieldEnum)[keyof typeof SubscriptionScalarFieldEnum]


  export const PatientIndexScalarFieldEnum: {
    biometricHash: 'biometricHash',
    biometricType: 'biometricType',
    tenantId: 'tenantId',
    patientId: 'patientId',
    description: 'description',
    timestamp: 'timestamp',
    updatedAt: 'updatedAt'
  };

  export type PatientIndexScalarFieldEnum = (typeof PatientIndexScalarFieldEnum)[keyof typeof PatientIndexScalarFieldEnum]


  export const TenantUsageScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    subscriptionId: 'subscriptionId',
    date: 'date',
    activeUsers: 'activeUsers',
    activePatients: 'activePatients',
    storageUsedMb: 'storageUsedMb',
    apiCallsCount: 'apiCallsCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantUsageScalarFieldEnum = (typeof TenantUsageScalarFieldEnum)[keyof typeof TenantUsageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DeploymentTier'
   */
  export type EnumDeploymentTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeploymentTier'>
    


  /**
   * Reference to a field of type 'DeploymentTier[]'
   */
  export type ListEnumDeploymentTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DeploymentTier[]'>
    


  /**
   * Reference to a field of type 'TenantStatus'
   */
  export type EnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantStatus'>
    


  /**
   * Reference to a field of type 'TenantStatus[]'
   */
  export type ListEnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'BillingCycle'
   */
  export type EnumBillingCycleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BillingCycle'>
    


  /**
   * Reference to a field of type 'BillingCycle[]'
   */
  export type ListEnumBillingCycleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BillingCycle[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    name?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    dbUrl?: StringFilter<"Tenant"> | string
    encryptionKeyReference?: StringFilter<"Tenant"> | string
    tier?: EnumDeploymentTierFilter<"Tenant"> | $Enums.DeploymentTier
    region?: StringFilter<"Tenant"> | string
    status?: EnumTenantStatusFilter<"Tenant"> | $Enums.TenantStatus
    suspensionReason?: StringNullableFilter<"Tenant"> | string | null
    suspendedAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    address?: StringNullableFilter<"Tenant"> | string | null
    logoUrl?: StringNullableFilter<"Tenant"> | string | null
    primaryColor?: StringNullableFilter<"Tenant"> | string | null
    secondaryColor?: StringNullableFilter<"Tenant"> | string | null
    trialEndsAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    enabledModules?: JsonFilter<"Tenant">
    publicKeySpki?: StringNullableFilter<"Tenant"> | string | null
    sharedSecret?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    entitlements?: TenantModuleListRelationFilter
    payments?: SystemPaymentListRelationFilter
    subscriptions?: SubscriptionListRelationFilter
    usages?: TenantUsageListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    dbUrl?: SortOrder
    encryptionKeyReference?: SortOrder
    tier?: SortOrder
    region?: SortOrder
    status?: SortOrder
    suspensionReason?: SortOrderInput | SortOrder
    suspendedAt?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    logoUrl?: SortOrderInput | SortOrder
    primaryColor?: SortOrderInput | SortOrder
    secondaryColor?: SortOrderInput | SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    enabledModules?: SortOrder
    publicKeySpki?: SortOrderInput | SortOrder
    sharedSecret?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    entitlements?: TenantModuleOrderByRelationAggregateInput
    payments?: SystemPaymentOrderByRelationAggregateInput
    subscriptions?: SubscriptionOrderByRelationAggregateInput
    usages?: TenantUsageOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    dbUrl?: StringFilter<"Tenant"> | string
    encryptionKeyReference?: StringFilter<"Tenant"> | string
    tier?: EnumDeploymentTierFilter<"Tenant"> | $Enums.DeploymentTier
    region?: StringFilter<"Tenant"> | string
    status?: EnumTenantStatusFilter<"Tenant"> | $Enums.TenantStatus
    suspensionReason?: StringNullableFilter<"Tenant"> | string | null
    suspendedAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    address?: StringNullableFilter<"Tenant"> | string | null
    logoUrl?: StringNullableFilter<"Tenant"> | string | null
    primaryColor?: StringNullableFilter<"Tenant"> | string | null
    secondaryColor?: StringNullableFilter<"Tenant"> | string | null
    trialEndsAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    enabledModules?: JsonFilter<"Tenant">
    publicKeySpki?: StringNullableFilter<"Tenant"> | string | null
    sharedSecret?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    entitlements?: TenantModuleListRelationFilter
    payments?: SystemPaymentListRelationFilter
    subscriptions?: SubscriptionListRelationFilter
    usages?: TenantUsageListRelationFilter
  }, "id" | "slug">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    dbUrl?: SortOrder
    encryptionKeyReference?: SortOrder
    tier?: SortOrder
    region?: SortOrder
    status?: SortOrder
    suspensionReason?: SortOrderInput | SortOrder
    suspendedAt?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    logoUrl?: SortOrderInput | SortOrder
    primaryColor?: SortOrderInput | SortOrder
    secondaryColor?: SortOrderInput | SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    enabledModules?: SortOrder
    publicKeySpki?: SortOrderInput | SortOrder
    sharedSecret?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    name?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    dbUrl?: StringWithAggregatesFilter<"Tenant"> | string
    encryptionKeyReference?: StringWithAggregatesFilter<"Tenant"> | string
    tier?: EnumDeploymentTierWithAggregatesFilter<"Tenant"> | $Enums.DeploymentTier
    region?: StringWithAggregatesFilter<"Tenant"> | string
    status?: EnumTenantStatusWithAggregatesFilter<"Tenant"> | $Enums.TenantStatus
    suspensionReason?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    suspendedAt?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    address?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    logoUrl?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    primaryColor?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    secondaryColor?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    trialEndsAt?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
    enabledModules?: JsonWithAggregatesFilter<"Tenant">
    publicKeySpki?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    sharedSecret?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type ModuleWhereInput = {
    AND?: ModuleWhereInput | ModuleWhereInput[]
    OR?: ModuleWhereInput[]
    NOT?: ModuleWhereInput | ModuleWhereInput[]
    id?: StringFilter<"Module"> | string
    name?: StringFilter<"Module"> | string
    code?: StringFilter<"Module"> | string
    description?: StringNullableFilter<"Module"> | string | null
    basePrice?: DecimalFilter<"Module"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"Module"> | Date | string
    updatedAt?: DateTimeFilter<"Module"> | Date | string
    tenants?: TenantModuleListRelationFilter
  }

  export type ModuleOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrderInput | SortOrder
    basePrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenants?: TenantModuleOrderByRelationAggregateInput
  }

  export type ModuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: ModuleWhereInput | ModuleWhereInput[]
    OR?: ModuleWhereInput[]
    NOT?: ModuleWhereInput | ModuleWhereInput[]
    name?: StringFilter<"Module"> | string
    description?: StringNullableFilter<"Module"> | string | null
    basePrice?: DecimalFilter<"Module"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"Module"> | Date | string
    updatedAt?: DateTimeFilter<"Module"> | Date | string
    tenants?: TenantModuleListRelationFilter
  }, "id" | "code">

  export type ModuleOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrderInput | SortOrder
    basePrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ModuleCountOrderByAggregateInput
    _avg?: ModuleAvgOrderByAggregateInput
    _max?: ModuleMaxOrderByAggregateInput
    _min?: ModuleMinOrderByAggregateInput
    _sum?: ModuleSumOrderByAggregateInput
  }

  export type ModuleScalarWhereWithAggregatesInput = {
    AND?: ModuleScalarWhereWithAggregatesInput | ModuleScalarWhereWithAggregatesInput[]
    OR?: ModuleScalarWhereWithAggregatesInput[]
    NOT?: ModuleScalarWhereWithAggregatesInput | ModuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Module"> | string
    name?: StringWithAggregatesFilter<"Module"> | string
    code?: StringWithAggregatesFilter<"Module"> | string
    description?: StringNullableWithAggregatesFilter<"Module"> | string | null
    basePrice?: DecimalWithAggregatesFilter<"Module"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"Module"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Module"> | Date | string
  }

  export type TenantModuleWhereInput = {
    AND?: TenantModuleWhereInput | TenantModuleWhereInput[]
    OR?: TenantModuleWhereInput[]
    NOT?: TenantModuleWhereInput | TenantModuleWhereInput[]
    id?: StringFilter<"TenantModule"> | string
    tenantId?: StringFilter<"TenantModule"> | string
    moduleId?: StringFilter<"TenantModule"> | string
    isEnabled?: BoolFilter<"TenantModule"> | boolean
    validUntil?: DateTimeNullableFilter<"TenantModule"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeFilter<"TenantModule"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    module?: XOR<ModuleRelationFilter, ModuleWhereInput>
  }

  export type TenantModuleOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleId?: SortOrder
    isEnabled?: SortOrder
    validUntil?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    module?: ModuleOrderByWithRelationInput
  }

  export type TenantModuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_moduleId?: TenantModuleTenantIdModuleIdCompoundUniqueInput
    AND?: TenantModuleWhereInput | TenantModuleWhereInput[]
    OR?: TenantModuleWhereInput[]
    NOT?: TenantModuleWhereInput | TenantModuleWhereInput[]
    tenantId?: StringFilter<"TenantModule"> | string
    moduleId?: StringFilter<"TenantModule"> | string
    isEnabled?: BoolFilter<"TenantModule"> | boolean
    validUntil?: DateTimeNullableFilter<"TenantModule"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeFilter<"TenantModule"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    module?: XOR<ModuleRelationFilter, ModuleWhereInput>
  }, "id" | "tenantId_moduleId">

  export type TenantModuleOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleId?: SortOrder
    isEnabled?: SortOrder
    validUntil?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantModuleCountOrderByAggregateInput
    _max?: TenantModuleMaxOrderByAggregateInput
    _min?: TenantModuleMinOrderByAggregateInput
  }

  export type TenantModuleScalarWhereWithAggregatesInput = {
    AND?: TenantModuleScalarWhereWithAggregatesInput | TenantModuleScalarWhereWithAggregatesInput[]
    OR?: TenantModuleScalarWhereWithAggregatesInput[]
    NOT?: TenantModuleScalarWhereWithAggregatesInput | TenantModuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantModule"> | string
    tenantId?: StringWithAggregatesFilter<"TenantModule"> | string
    moduleId?: StringWithAggregatesFilter<"TenantModule"> | string
    isEnabled?: BoolWithAggregatesFilter<"TenantModule"> | boolean
    validUntil?: DateTimeNullableWithAggregatesFilter<"TenantModule"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantModule"> | Date | string
  }

  export type SystemAdminWhereInput = {
    AND?: SystemAdminWhereInput | SystemAdminWhereInput[]
    OR?: SystemAdminWhereInput[]
    NOT?: SystemAdminWhereInput | SystemAdminWhereInput[]
    id?: StringFilter<"SystemAdmin"> | string
    name?: StringFilter<"SystemAdmin"> | string
    email?: StringFilter<"SystemAdmin"> | string
    passwordHash?: StringFilter<"SystemAdmin"> | string
    createdAt?: DateTimeFilter<"SystemAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"SystemAdmin"> | Date | string
  }

  export type SystemAdminOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemAdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: SystemAdminWhereInput | SystemAdminWhereInput[]
    OR?: SystemAdminWhereInput[]
    NOT?: SystemAdminWhereInput | SystemAdminWhereInput[]
    name?: StringFilter<"SystemAdmin"> | string
    passwordHash?: StringFilter<"SystemAdmin"> | string
    createdAt?: DateTimeFilter<"SystemAdmin"> | Date | string
    updatedAt?: DateTimeFilter<"SystemAdmin"> | Date | string
  }, "id" | "email">

  export type SystemAdminOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SystemAdminCountOrderByAggregateInput
    _max?: SystemAdminMaxOrderByAggregateInput
    _min?: SystemAdminMinOrderByAggregateInput
  }

  export type SystemAdminScalarWhereWithAggregatesInput = {
    AND?: SystemAdminScalarWhereWithAggregatesInput | SystemAdminScalarWhereWithAggregatesInput[]
    OR?: SystemAdminScalarWhereWithAggregatesInput[]
    NOT?: SystemAdminScalarWhereWithAggregatesInput | SystemAdminScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SystemAdmin"> | string
    name?: StringWithAggregatesFilter<"SystemAdmin"> | string
    email?: StringWithAggregatesFilter<"SystemAdmin"> | string
    passwordHash?: StringWithAggregatesFilter<"SystemAdmin"> | string
    createdAt?: DateTimeWithAggregatesFilter<"SystemAdmin"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SystemAdmin"> | Date | string
  }

  export type GlobalSettingsWhereInput = {
    AND?: GlobalSettingsWhereInput | GlobalSettingsWhereInput[]
    OR?: GlobalSettingsWhereInput[]
    NOT?: GlobalSettingsWhereInput | GlobalSettingsWhereInput[]
    id?: StringFilter<"GlobalSettings"> | string
    platformName?: StringFilter<"GlobalSettings"> | string
    platformLogoUrl?: StringNullableFilter<"GlobalSettings"> | string | null
    platformSlogan?: StringNullableFilter<"GlobalSettings"> | string | null
    heroTitle?: StringNullableFilter<"GlobalSettings"> | string | null
    heroSubtitle?: StringNullableFilter<"GlobalSettings"> | string | null
    heroCTA?: StringNullableFilter<"GlobalSettings"> | string | null
    heroImageUrl?: StringNullableFilter<"GlobalSettings"> | string | null
    showHero?: BoolFilter<"GlobalSettings"> | boolean
    showFeatures?: BoolFilter<"GlobalSettings"> | boolean
    feature1Title?: StringNullableFilter<"GlobalSettings"> | string | null
    feature1Desc?: StringNullableFilter<"GlobalSettings"> | string | null
    feature1Icon?: StringNullableFilter<"GlobalSettings"> | string | null
    feature2Title?: StringNullableFilter<"GlobalSettings"> | string | null
    feature2Desc?: StringNullableFilter<"GlobalSettings"> | string | null
    feature2Icon?: StringNullableFilter<"GlobalSettings"> | string | null
    feature3Title?: StringNullableFilter<"GlobalSettings"> | string | null
    feature3Desc?: StringNullableFilter<"GlobalSettings"> | string | null
    feature3Icon?: StringNullableFilter<"GlobalSettings"> | string | null
    paypalClientId?: StringNullableFilter<"GlobalSettings"> | string | null
    paypalClientSecret?: StringNullableFilter<"GlobalSettings"> | string | null
    paypalEnv?: StringFilter<"GlobalSettings"> | string
    mpesaConsumerKey?: StringNullableFilter<"GlobalSettings"> | string | null
    mpesaConsumerSecret?: StringNullableFilter<"GlobalSettings"> | string | null
    mpesaPasskey?: StringNullableFilter<"GlobalSettings"> | string | null
    mpesaShortcode?: StringNullableFilter<"GlobalSettings"> | string | null
    updatedAt?: DateTimeFilter<"GlobalSettings"> | Date | string
  }

  export type GlobalSettingsOrderByWithRelationInput = {
    id?: SortOrder
    platformName?: SortOrder
    platformLogoUrl?: SortOrderInput | SortOrder
    platformSlogan?: SortOrderInput | SortOrder
    heroTitle?: SortOrderInput | SortOrder
    heroSubtitle?: SortOrderInput | SortOrder
    heroCTA?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    showHero?: SortOrder
    showFeatures?: SortOrder
    feature1Title?: SortOrderInput | SortOrder
    feature1Desc?: SortOrderInput | SortOrder
    feature1Icon?: SortOrderInput | SortOrder
    feature2Title?: SortOrderInput | SortOrder
    feature2Desc?: SortOrderInput | SortOrder
    feature2Icon?: SortOrderInput | SortOrder
    feature3Title?: SortOrderInput | SortOrder
    feature3Desc?: SortOrderInput | SortOrder
    feature3Icon?: SortOrderInput | SortOrder
    paypalClientId?: SortOrderInput | SortOrder
    paypalClientSecret?: SortOrderInput | SortOrder
    paypalEnv?: SortOrder
    mpesaConsumerKey?: SortOrderInput | SortOrder
    mpesaConsumerSecret?: SortOrderInput | SortOrder
    mpesaPasskey?: SortOrderInput | SortOrder
    mpesaShortcode?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
  }

  export type GlobalSettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GlobalSettingsWhereInput | GlobalSettingsWhereInput[]
    OR?: GlobalSettingsWhereInput[]
    NOT?: GlobalSettingsWhereInput | GlobalSettingsWhereInput[]
    platformName?: StringFilter<"GlobalSettings"> | string
    platformLogoUrl?: StringNullableFilter<"GlobalSettings"> | string | null
    platformSlogan?: StringNullableFilter<"GlobalSettings"> | string | null
    heroTitle?: StringNullableFilter<"GlobalSettings"> | string | null
    heroSubtitle?: StringNullableFilter<"GlobalSettings"> | string | null
    heroCTA?: StringNullableFilter<"GlobalSettings"> | string | null
    heroImageUrl?: StringNullableFilter<"GlobalSettings"> | string | null
    showHero?: BoolFilter<"GlobalSettings"> | boolean
    showFeatures?: BoolFilter<"GlobalSettings"> | boolean
    feature1Title?: StringNullableFilter<"GlobalSettings"> | string | null
    feature1Desc?: StringNullableFilter<"GlobalSettings"> | string | null
    feature1Icon?: StringNullableFilter<"GlobalSettings"> | string | null
    feature2Title?: StringNullableFilter<"GlobalSettings"> | string | null
    feature2Desc?: StringNullableFilter<"GlobalSettings"> | string | null
    feature2Icon?: StringNullableFilter<"GlobalSettings"> | string | null
    feature3Title?: StringNullableFilter<"GlobalSettings"> | string | null
    feature3Desc?: StringNullableFilter<"GlobalSettings"> | string | null
    feature3Icon?: StringNullableFilter<"GlobalSettings"> | string | null
    paypalClientId?: StringNullableFilter<"GlobalSettings"> | string | null
    paypalClientSecret?: StringNullableFilter<"GlobalSettings"> | string | null
    paypalEnv?: StringFilter<"GlobalSettings"> | string
    mpesaConsumerKey?: StringNullableFilter<"GlobalSettings"> | string | null
    mpesaConsumerSecret?: StringNullableFilter<"GlobalSettings"> | string | null
    mpesaPasskey?: StringNullableFilter<"GlobalSettings"> | string | null
    mpesaShortcode?: StringNullableFilter<"GlobalSettings"> | string | null
    updatedAt?: DateTimeFilter<"GlobalSettings"> | Date | string
  }, "id">

  export type GlobalSettingsOrderByWithAggregationInput = {
    id?: SortOrder
    platformName?: SortOrder
    platformLogoUrl?: SortOrderInput | SortOrder
    platformSlogan?: SortOrderInput | SortOrder
    heroTitle?: SortOrderInput | SortOrder
    heroSubtitle?: SortOrderInput | SortOrder
    heroCTA?: SortOrderInput | SortOrder
    heroImageUrl?: SortOrderInput | SortOrder
    showHero?: SortOrder
    showFeatures?: SortOrder
    feature1Title?: SortOrderInput | SortOrder
    feature1Desc?: SortOrderInput | SortOrder
    feature1Icon?: SortOrderInput | SortOrder
    feature2Title?: SortOrderInput | SortOrder
    feature2Desc?: SortOrderInput | SortOrder
    feature2Icon?: SortOrderInput | SortOrder
    feature3Title?: SortOrderInput | SortOrder
    feature3Desc?: SortOrderInput | SortOrder
    feature3Icon?: SortOrderInput | SortOrder
    paypalClientId?: SortOrderInput | SortOrder
    paypalClientSecret?: SortOrderInput | SortOrder
    paypalEnv?: SortOrder
    mpesaConsumerKey?: SortOrderInput | SortOrder
    mpesaConsumerSecret?: SortOrderInput | SortOrder
    mpesaPasskey?: SortOrderInput | SortOrder
    mpesaShortcode?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: GlobalSettingsCountOrderByAggregateInput
    _max?: GlobalSettingsMaxOrderByAggregateInput
    _min?: GlobalSettingsMinOrderByAggregateInput
  }

  export type GlobalSettingsScalarWhereWithAggregatesInput = {
    AND?: GlobalSettingsScalarWhereWithAggregatesInput | GlobalSettingsScalarWhereWithAggregatesInput[]
    OR?: GlobalSettingsScalarWhereWithAggregatesInput[]
    NOT?: GlobalSettingsScalarWhereWithAggregatesInput | GlobalSettingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GlobalSettings"> | string
    platformName?: StringWithAggregatesFilter<"GlobalSettings"> | string
    platformLogoUrl?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    platformSlogan?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    heroTitle?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    heroSubtitle?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    heroCTA?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    heroImageUrl?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    showHero?: BoolWithAggregatesFilter<"GlobalSettings"> | boolean
    showFeatures?: BoolWithAggregatesFilter<"GlobalSettings"> | boolean
    feature1Title?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    feature1Desc?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    feature1Icon?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    feature2Title?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    feature2Desc?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    feature2Icon?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    feature3Title?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    feature3Desc?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    feature3Icon?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    paypalClientId?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    paypalClientSecret?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    paypalEnv?: StringWithAggregatesFilter<"GlobalSettings"> | string
    mpesaConsumerKey?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    mpesaConsumerSecret?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    mpesaPasskey?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    mpesaShortcode?: StringNullableWithAggregatesFilter<"GlobalSettings"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"GlobalSettings"> | Date | string
  }

  export type SystemPaymentWhereInput = {
    AND?: SystemPaymentWhereInput | SystemPaymentWhereInput[]
    OR?: SystemPaymentWhereInput[]
    NOT?: SystemPaymentWhereInput | SystemPaymentWhereInput[]
    id?: StringFilter<"SystemPayment"> | string
    tenantId?: StringNullableFilter<"SystemPayment"> | string | null
    amount?: DecimalFilter<"SystemPayment"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"SystemPayment"> | string
    method?: StringFilter<"SystemPayment"> | string
    status?: StringFilter<"SystemPayment"> | string
    reference?: StringFilter<"SystemPayment"> | string
    customerEmail?: StringFilter<"SystemPayment"> | string
    customerName?: StringFilter<"SystemPayment"> | string
    description?: StringNullableFilter<"SystemPayment"> | string | null
    createdAt?: DateTimeFilter<"SystemPayment"> | Date | string
    tenant?: XOR<TenantNullableRelationFilter, TenantWhereInput> | null
  }

  export type SystemPaymentOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    amount?: SortOrder
    currency?: SortOrder
    method?: SortOrder
    status?: SortOrder
    reference?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type SystemPaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    reference?: string
    AND?: SystemPaymentWhereInput | SystemPaymentWhereInput[]
    OR?: SystemPaymentWhereInput[]
    NOT?: SystemPaymentWhereInput | SystemPaymentWhereInput[]
    tenantId?: StringNullableFilter<"SystemPayment"> | string | null
    amount?: DecimalFilter<"SystemPayment"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"SystemPayment"> | string
    method?: StringFilter<"SystemPayment"> | string
    status?: StringFilter<"SystemPayment"> | string
    customerEmail?: StringFilter<"SystemPayment"> | string
    customerName?: StringFilter<"SystemPayment"> | string
    description?: StringNullableFilter<"SystemPayment"> | string | null
    createdAt?: DateTimeFilter<"SystemPayment"> | Date | string
    tenant?: XOR<TenantNullableRelationFilter, TenantWhereInput> | null
  }, "id" | "reference">

  export type SystemPaymentOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    amount?: SortOrder
    currency?: SortOrder
    method?: SortOrder
    status?: SortOrder
    reference?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SystemPaymentCountOrderByAggregateInput
    _avg?: SystemPaymentAvgOrderByAggregateInput
    _max?: SystemPaymentMaxOrderByAggregateInput
    _min?: SystemPaymentMinOrderByAggregateInput
    _sum?: SystemPaymentSumOrderByAggregateInput
  }

  export type SystemPaymentScalarWhereWithAggregatesInput = {
    AND?: SystemPaymentScalarWhereWithAggregatesInput | SystemPaymentScalarWhereWithAggregatesInput[]
    OR?: SystemPaymentScalarWhereWithAggregatesInput[]
    NOT?: SystemPaymentScalarWhereWithAggregatesInput | SystemPaymentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SystemPayment"> | string
    tenantId?: StringNullableWithAggregatesFilter<"SystemPayment"> | string | null
    amount?: DecimalWithAggregatesFilter<"SystemPayment"> | Decimal | DecimalJsLike | number | string
    currency?: StringWithAggregatesFilter<"SystemPayment"> | string
    method?: StringWithAggregatesFilter<"SystemPayment"> | string
    status?: StringWithAggregatesFilter<"SystemPayment"> | string
    reference?: StringWithAggregatesFilter<"SystemPayment"> | string
    customerEmail?: StringWithAggregatesFilter<"SystemPayment"> | string
    customerName?: StringWithAggregatesFilter<"SystemPayment"> | string
    description?: StringNullableWithAggregatesFilter<"SystemPayment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SystemPayment"> | Date | string
  }

  export type PlanWhereInput = {
    AND?: PlanWhereInput | PlanWhereInput[]
    OR?: PlanWhereInput[]
    NOT?: PlanWhereInput | PlanWhereInput[]
    id?: StringFilter<"Plan"> | string
    name?: StringFilter<"Plan"> | string
    code?: StringFilter<"Plan"> | string
    description?: StringNullableFilter<"Plan"> | string | null
    price?: DecimalFilter<"Plan"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"Plan"> | string
    billingCycle?: EnumBillingCycleFilter<"Plan"> | $Enums.BillingCycle
    features?: JsonFilter<"Plan">
    maxPatients?: IntFilter<"Plan"> | number
    maxUsers?: IntFilter<"Plan"> | number
    maxBeds?: IntFilter<"Plan"> | number
    isActive?: BoolFilter<"Plan"> | boolean
    createdAt?: DateTimeFilter<"Plan"> | Date | string
    updatedAt?: DateTimeFilter<"Plan"> | Date | string
    subscriptions?: SubscriptionListRelationFilter
  }

  export type PlanOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    currency?: SortOrder
    billingCycle?: SortOrder
    features?: SortOrder
    maxPatients?: SortOrder
    maxUsers?: SortOrder
    maxBeds?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    subscriptions?: SubscriptionOrderByRelationAggregateInput
  }

  export type PlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: PlanWhereInput | PlanWhereInput[]
    OR?: PlanWhereInput[]
    NOT?: PlanWhereInput | PlanWhereInput[]
    name?: StringFilter<"Plan"> | string
    description?: StringNullableFilter<"Plan"> | string | null
    price?: DecimalFilter<"Plan"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"Plan"> | string
    billingCycle?: EnumBillingCycleFilter<"Plan"> | $Enums.BillingCycle
    features?: JsonFilter<"Plan">
    maxPatients?: IntFilter<"Plan"> | number
    maxUsers?: IntFilter<"Plan"> | number
    maxBeds?: IntFilter<"Plan"> | number
    isActive?: BoolFilter<"Plan"> | boolean
    createdAt?: DateTimeFilter<"Plan"> | Date | string
    updatedAt?: DateTimeFilter<"Plan"> | Date | string
    subscriptions?: SubscriptionListRelationFilter
  }, "id" | "code">

  export type PlanOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    currency?: SortOrder
    billingCycle?: SortOrder
    features?: SortOrder
    maxPatients?: SortOrder
    maxUsers?: SortOrder
    maxBeds?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PlanCountOrderByAggregateInput
    _avg?: PlanAvgOrderByAggregateInput
    _max?: PlanMaxOrderByAggregateInput
    _min?: PlanMinOrderByAggregateInput
    _sum?: PlanSumOrderByAggregateInput
  }

  export type PlanScalarWhereWithAggregatesInput = {
    AND?: PlanScalarWhereWithAggregatesInput | PlanScalarWhereWithAggregatesInput[]
    OR?: PlanScalarWhereWithAggregatesInput[]
    NOT?: PlanScalarWhereWithAggregatesInput | PlanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Plan"> | string
    name?: StringWithAggregatesFilter<"Plan"> | string
    code?: StringWithAggregatesFilter<"Plan"> | string
    description?: StringNullableWithAggregatesFilter<"Plan"> | string | null
    price?: DecimalWithAggregatesFilter<"Plan"> | Decimal | DecimalJsLike | number | string
    currency?: StringWithAggregatesFilter<"Plan"> | string
    billingCycle?: EnumBillingCycleWithAggregatesFilter<"Plan"> | $Enums.BillingCycle
    features?: JsonWithAggregatesFilter<"Plan">
    maxPatients?: IntWithAggregatesFilter<"Plan"> | number
    maxUsers?: IntWithAggregatesFilter<"Plan"> | number
    maxBeds?: IntWithAggregatesFilter<"Plan"> | number
    isActive?: BoolWithAggregatesFilter<"Plan"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Plan"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Plan"> | Date | string
  }

  export type SubscriptionWhereInput = {
    AND?: SubscriptionWhereInput | SubscriptionWhereInput[]
    OR?: SubscriptionWhereInput[]
    NOT?: SubscriptionWhereInput | SubscriptionWhereInput[]
    id?: StringFilter<"Subscription"> | string
    tenantId?: StringFilter<"Subscription"> | string
    planId?: StringFilter<"Subscription"> | string
    status?: StringFilter<"Subscription"> | string
    startDate?: DateTimeFilter<"Subscription"> | Date | string
    endDate?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    signedToken?: StringNullableFilter<"Subscription"> | string | null
    autoRenew?: BoolFilter<"Subscription"> | boolean
    createdAt?: DateTimeFilter<"Subscription"> | Date | string
    updatedAt?: DateTimeFilter<"Subscription"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    plan?: XOR<PlanRelationFilter, PlanWhereInput>
    usages?: TenantUsageListRelationFilter
  }

  export type SubscriptionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    planId?: SortOrder
    status?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrderInput | SortOrder
    signedToken?: SortOrderInput | SortOrder
    autoRenew?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    plan?: PlanOrderByWithRelationInput
    usages?: TenantUsageOrderByRelationAggregateInput
  }

  export type SubscriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SubscriptionWhereInput | SubscriptionWhereInput[]
    OR?: SubscriptionWhereInput[]
    NOT?: SubscriptionWhereInput | SubscriptionWhereInput[]
    tenantId?: StringFilter<"Subscription"> | string
    planId?: StringFilter<"Subscription"> | string
    status?: StringFilter<"Subscription"> | string
    startDate?: DateTimeFilter<"Subscription"> | Date | string
    endDate?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    signedToken?: StringNullableFilter<"Subscription"> | string | null
    autoRenew?: BoolFilter<"Subscription"> | boolean
    createdAt?: DateTimeFilter<"Subscription"> | Date | string
    updatedAt?: DateTimeFilter<"Subscription"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    plan?: XOR<PlanRelationFilter, PlanWhereInput>
    usages?: TenantUsageListRelationFilter
  }, "id">

  export type SubscriptionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    planId?: SortOrder
    status?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrderInput | SortOrder
    signedToken?: SortOrderInput | SortOrder
    autoRenew?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SubscriptionCountOrderByAggregateInput
    _max?: SubscriptionMaxOrderByAggregateInput
    _min?: SubscriptionMinOrderByAggregateInput
  }

  export type SubscriptionScalarWhereWithAggregatesInput = {
    AND?: SubscriptionScalarWhereWithAggregatesInput | SubscriptionScalarWhereWithAggregatesInput[]
    OR?: SubscriptionScalarWhereWithAggregatesInput[]
    NOT?: SubscriptionScalarWhereWithAggregatesInput | SubscriptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Subscription"> | string
    tenantId?: StringWithAggregatesFilter<"Subscription"> | string
    planId?: StringWithAggregatesFilter<"Subscription"> | string
    status?: StringWithAggregatesFilter<"Subscription"> | string
    startDate?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
    endDate?: DateTimeNullableWithAggregatesFilter<"Subscription"> | Date | string | null
    signedToken?: StringNullableWithAggregatesFilter<"Subscription"> | string | null
    autoRenew?: BoolWithAggregatesFilter<"Subscription"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
  }

  export type PatientIndexWhereInput = {
    AND?: PatientIndexWhereInput | PatientIndexWhereInput[]
    OR?: PatientIndexWhereInput[]
    NOT?: PatientIndexWhereInput | PatientIndexWhereInput[]
    biometricHash?: StringFilter<"PatientIndex"> | string
    biometricType?: StringFilter<"PatientIndex"> | string
    tenantId?: StringFilter<"PatientIndex"> | string
    patientId?: StringFilter<"PatientIndex"> | string
    description?: StringNullableFilter<"PatientIndex"> | string | null
    timestamp?: DateTimeFilter<"PatientIndex"> | Date | string
    updatedAt?: DateTimeFilter<"PatientIndex"> | Date | string
  }

  export type PatientIndexOrderByWithRelationInput = {
    biometricHash?: SortOrder
    biometricType?: SortOrder
    tenantId?: SortOrder
    patientId?: SortOrder
    description?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientIndexWhereUniqueInput = Prisma.AtLeast<{
    biometricHash?: string
    AND?: PatientIndexWhereInput | PatientIndexWhereInput[]
    OR?: PatientIndexWhereInput[]
    NOT?: PatientIndexWhereInput | PatientIndexWhereInput[]
    biometricType?: StringFilter<"PatientIndex"> | string
    tenantId?: StringFilter<"PatientIndex"> | string
    patientId?: StringFilter<"PatientIndex"> | string
    description?: StringNullableFilter<"PatientIndex"> | string | null
    timestamp?: DateTimeFilter<"PatientIndex"> | Date | string
    updatedAt?: DateTimeFilter<"PatientIndex"> | Date | string
  }, "biometricHash">

  export type PatientIndexOrderByWithAggregationInput = {
    biometricHash?: SortOrder
    biometricType?: SortOrder
    tenantId?: SortOrder
    patientId?: SortOrder
    description?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    updatedAt?: SortOrder
    _count?: PatientIndexCountOrderByAggregateInput
    _max?: PatientIndexMaxOrderByAggregateInput
    _min?: PatientIndexMinOrderByAggregateInput
  }

  export type PatientIndexScalarWhereWithAggregatesInput = {
    AND?: PatientIndexScalarWhereWithAggregatesInput | PatientIndexScalarWhereWithAggregatesInput[]
    OR?: PatientIndexScalarWhereWithAggregatesInput[]
    NOT?: PatientIndexScalarWhereWithAggregatesInput | PatientIndexScalarWhereWithAggregatesInput[]
    biometricHash?: StringWithAggregatesFilter<"PatientIndex"> | string
    biometricType?: StringWithAggregatesFilter<"PatientIndex"> | string
    tenantId?: StringWithAggregatesFilter<"PatientIndex"> | string
    patientId?: StringWithAggregatesFilter<"PatientIndex"> | string
    description?: StringNullableWithAggregatesFilter<"PatientIndex"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"PatientIndex"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PatientIndex"> | Date | string
  }

  export type TenantUsageWhereInput = {
    AND?: TenantUsageWhereInput | TenantUsageWhereInput[]
    OR?: TenantUsageWhereInput[]
    NOT?: TenantUsageWhereInput | TenantUsageWhereInput[]
    id?: StringFilter<"TenantUsage"> | string
    tenantId?: StringFilter<"TenantUsage"> | string
    subscriptionId?: StringFilter<"TenantUsage"> | string
    date?: DateTimeFilter<"TenantUsage"> | Date | string
    activeUsers?: IntFilter<"TenantUsage"> | number
    activePatients?: IntFilter<"TenantUsage"> | number
    storageUsedMb?: DecimalFilter<"TenantUsage"> | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFilter<"TenantUsage"> | number
    createdAt?: DateTimeFilter<"TenantUsage"> | Date | string
    updatedAt?: DateTimeFilter<"TenantUsage"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    subscription?: XOR<SubscriptionRelationFilter, SubscriptionWhereInput>
  }

  export type TenantUsageOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    subscriptionId?: SortOrder
    date?: SortOrder
    activeUsers?: SortOrder
    activePatients?: SortOrder
    storageUsedMb?: SortOrder
    apiCallsCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    subscription?: SubscriptionOrderByWithRelationInput
  }

  export type TenantUsageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_date?: TenantUsageTenantIdDateCompoundUniqueInput
    AND?: TenantUsageWhereInput | TenantUsageWhereInput[]
    OR?: TenantUsageWhereInput[]
    NOT?: TenantUsageWhereInput | TenantUsageWhereInput[]
    tenantId?: StringFilter<"TenantUsage"> | string
    subscriptionId?: StringFilter<"TenantUsage"> | string
    date?: DateTimeFilter<"TenantUsage"> | Date | string
    activeUsers?: IntFilter<"TenantUsage"> | number
    activePatients?: IntFilter<"TenantUsage"> | number
    storageUsedMb?: DecimalFilter<"TenantUsage"> | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFilter<"TenantUsage"> | number
    createdAt?: DateTimeFilter<"TenantUsage"> | Date | string
    updatedAt?: DateTimeFilter<"TenantUsage"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    subscription?: XOR<SubscriptionRelationFilter, SubscriptionWhereInput>
  }, "id" | "tenantId_date">

  export type TenantUsageOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    subscriptionId?: SortOrder
    date?: SortOrder
    activeUsers?: SortOrder
    activePatients?: SortOrder
    storageUsedMb?: SortOrder
    apiCallsCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantUsageCountOrderByAggregateInput
    _avg?: TenantUsageAvgOrderByAggregateInput
    _max?: TenantUsageMaxOrderByAggregateInput
    _min?: TenantUsageMinOrderByAggregateInput
    _sum?: TenantUsageSumOrderByAggregateInput
  }

  export type TenantUsageScalarWhereWithAggregatesInput = {
    AND?: TenantUsageScalarWhereWithAggregatesInput | TenantUsageScalarWhereWithAggregatesInput[]
    OR?: TenantUsageScalarWhereWithAggregatesInput[]
    NOT?: TenantUsageScalarWhereWithAggregatesInput | TenantUsageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TenantUsage"> | string
    tenantId?: StringWithAggregatesFilter<"TenantUsage"> | string
    subscriptionId?: StringWithAggregatesFilter<"TenantUsage"> | string
    date?: DateTimeWithAggregatesFilter<"TenantUsage"> | Date | string
    activeUsers?: IntWithAggregatesFilter<"TenantUsage"> | number
    activePatients?: IntWithAggregatesFilter<"TenantUsage"> | number
    storageUsedMb?: DecimalWithAggregatesFilter<"TenantUsage"> | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntWithAggregatesFilter<"TenantUsage"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TenantUsage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TenantUsage"> | Date | string
  }

  export type TenantCreateInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    entitlements?: TenantModuleCreateNestedManyWithoutTenantInput
    payments?: SystemPaymentCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
    usages?: TenantUsageCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    entitlements?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    payments?: SystemPaymentUncheckedCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
    usages?: TenantUsageUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entitlements?: TenantModuleUpdateManyWithoutTenantNestedInput
    payments?: SystemPaymentUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
    usages?: TenantUsageUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entitlements?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    payments?: SystemPaymentUncheckedUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
    usages?: TenantUsageUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModuleCreateInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    basePrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    tenants?: TenantModuleCreateNestedManyWithoutModuleInput
  }

  export type ModuleUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    basePrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    tenants?: TenantModuleUncheckedCreateNestedManyWithoutModuleInput
  }

  export type ModuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenants?: TenantModuleUpdateManyWithoutModuleNestedInput
  }

  export type ModuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenants?: TenantModuleUncheckedUpdateManyWithoutModuleNestedInput
  }

  export type ModuleCreateManyInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    basePrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleCreateInput = {
    id?: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutEntitlementsInput
    module: ModuleCreateNestedOneWithoutTenantsInput
  }

  export type TenantModuleUncheckedCreateInput = {
    id?: string
    tenantId: string
    moduleId: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutEntitlementsNestedInput
    module?: ModuleUpdateOneRequiredWithoutTenantsNestedInput
  }

  export type TenantModuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleCreateManyInput = {
    id?: string
    tenantId: string
    moduleId: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemAdminCreateInput = {
    id?: string
    name: string
    email: string
    passwordHash: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SystemAdminUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    passwordHash: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SystemAdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemAdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemAdminCreateManyInput = {
    id?: string
    name: string
    email: string
    passwordHash: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SystemAdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemAdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalSettingsCreateInput = {
    id?: string
    platformName?: string
    platformLogoUrl?: string | null
    platformSlogan?: string | null
    heroTitle?: string | null
    heroSubtitle?: string | null
    heroCTA?: string | null
    heroImageUrl?: string | null
    showHero?: boolean
    showFeatures?: boolean
    feature1Title?: string | null
    feature1Desc?: string | null
    feature1Icon?: string | null
    feature2Title?: string | null
    feature2Desc?: string | null
    feature2Icon?: string | null
    feature3Title?: string | null
    feature3Desc?: string | null
    feature3Icon?: string | null
    paypalClientId?: string | null
    paypalClientSecret?: string | null
    paypalEnv?: string
    mpesaConsumerKey?: string | null
    mpesaConsumerSecret?: string | null
    mpesaPasskey?: string | null
    mpesaShortcode?: string | null
    updatedAt?: Date | string
  }

  export type GlobalSettingsUncheckedCreateInput = {
    id?: string
    platformName?: string
    platformLogoUrl?: string | null
    platformSlogan?: string | null
    heroTitle?: string | null
    heroSubtitle?: string | null
    heroCTA?: string | null
    heroImageUrl?: string | null
    showHero?: boolean
    showFeatures?: boolean
    feature1Title?: string | null
    feature1Desc?: string | null
    feature1Icon?: string | null
    feature2Title?: string | null
    feature2Desc?: string | null
    feature2Icon?: string | null
    feature3Title?: string | null
    feature3Desc?: string | null
    feature3Icon?: string | null
    paypalClientId?: string | null
    paypalClientSecret?: string | null
    paypalEnv?: string
    mpesaConsumerKey?: string | null
    mpesaConsumerSecret?: string | null
    mpesaPasskey?: string | null
    mpesaShortcode?: string | null
    updatedAt?: Date | string
  }

  export type GlobalSettingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    platformName?: StringFieldUpdateOperationsInput | string
    platformLogoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    platformSlogan?: NullableStringFieldUpdateOperationsInput | string | null
    heroTitle?: NullableStringFieldUpdateOperationsInput | string | null
    heroSubtitle?: NullableStringFieldUpdateOperationsInput | string | null
    heroCTA?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    showHero?: BoolFieldUpdateOperationsInput | boolean
    showFeatures?: BoolFieldUpdateOperationsInput | boolean
    feature1Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature1Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature1Icon?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Icon?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Icon?: NullableStringFieldUpdateOperationsInput | string | null
    paypalClientId?: NullableStringFieldUpdateOperationsInput | string | null
    paypalClientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    paypalEnv?: StringFieldUpdateOperationsInput | string
    mpesaConsumerKey?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaConsumerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaPasskey?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaShortcode?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalSettingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    platformName?: StringFieldUpdateOperationsInput | string
    platformLogoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    platformSlogan?: NullableStringFieldUpdateOperationsInput | string | null
    heroTitle?: NullableStringFieldUpdateOperationsInput | string | null
    heroSubtitle?: NullableStringFieldUpdateOperationsInput | string | null
    heroCTA?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    showHero?: BoolFieldUpdateOperationsInput | boolean
    showFeatures?: BoolFieldUpdateOperationsInput | boolean
    feature1Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature1Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature1Icon?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Icon?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Icon?: NullableStringFieldUpdateOperationsInput | string | null
    paypalClientId?: NullableStringFieldUpdateOperationsInput | string | null
    paypalClientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    paypalEnv?: StringFieldUpdateOperationsInput | string
    mpesaConsumerKey?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaConsumerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaPasskey?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaShortcode?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalSettingsCreateManyInput = {
    id?: string
    platformName?: string
    platformLogoUrl?: string | null
    platformSlogan?: string | null
    heroTitle?: string | null
    heroSubtitle?: string | null
    heroCTA?: string | null
    heroImageUrl?: string | null
    showHero?: boolean
    showFeatures?: boolean
    feature1Title?: string | null
    feature1Desc?: string | null
    feature1Icon?: string | null
    feature2Title?: string | null
    feature2Desc?: string | null
    feature2Icon?: string | null
    feature3Title?: string | null
    feature3Desc?: string | null
    feature3Icon?: string | null
    paypalClientId?: string | null
    paypalClientSecret?: string | null
    paypalEnv?: string
    mpesaConsumerKey?: string | null
    mpesaConsumerSecret?: string | null
    mpesaPasskey?: string | null
    mpesaShortcode?: string | null
    updatedAt?: Date | string
  }

  export type GlobalSettingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    platformName?: StringFieldUpdateOperationsInput | string
    platformLogoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    platformSlogan?: NullableStringFieldUpdateOperationsInput | string | null
    heroTitle?: NullableStringFieldUpdateOperationsInput | string | null
    heroSubtitle?: NullableStringFieldUpdateOperationsInput | string | null
    heroCTA?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    showHero?: BoolFieldUpdateOperationsInput | boolean
    showFeatures?: BoolFieldUpdateOperationsInput | boolean
    feature1Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature1Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature1Icon?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Icon?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Icon?: NullableStringFieldUpdateOperationsInput | string | null
    paypalClientId?: NullableStringFieldUpdateOperationsInput | string | null
    paypalClientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    paypalEnv?: StringFieldUpdateOperationsInput | string
    mpesaConsumerKey?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaConsumerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaPasskey?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaShortcode?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalSettingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    platformName?: StringFieldUpdateOperationsInput | string
    platformLogoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    platformSlogan?: NullableStringFieldUpdateOperationsInput | string | null
    heroTitle?: NullableStringFieldUpdateOperationsInput | string | null
    heroSubtitle?: NullableStringFieldUpdateOperationsInput | string | null
    heroCTA?: NullableStringFieldUpdateOperationsInput | string | null
    heroImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    showHero?: BoolFieldUpdateOperationsInput | boolean
    showFeatures?: BoolFieldUpdateOperationsInput | boolean
    feature1Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature1Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature1Icon?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature2Icon?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Title?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Desc?: NullableStringFieldUpdateOperationsInput | string | null
    feature3Icon?: NullableStringFieldUpdateOperationsInput | string | null
    paypalClientId?: NullableStringFieldUpdateOperationsInput | string | null
    paypalClientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    paypalEnv?: StringFieldUpdateOperationsInput | string
    mpesaConsumerKey?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaConsumerSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaPasskey?: NullableStringFieldUpdateOperationsInput | string | null
    mpesaShortcode?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemPaymentCreateInput = {
    id?: string
    amount: Decimal | DecimalJsLike | number | string
    currency?: string
    method: string
    status: string
    reference: string
    customerEmail: string
    customerName: string
    description?: string | null
    createdAt?: Date | string
    tenant?: TenantCreateNestedOneWithoutPaymentsInput
  }

  export type SystemPaymentUncheckedCreateInput = {
    id?: string
    tenantId?: string | null
    amount: Decimal | DecimalJsLike | number | string
    currency?: string
    method: string
    status: string
    reference: string
    customerEmail: string
    customerName: string
    description?: string | null
    createdAt?: Date | string
  }

  export type SystemPaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    reference?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneWithoutPaymentsNestedInput
  }

  export type SystemPaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    reference?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemPaymentCreateManyInput = {
    id?: string
    tenantId?: string | null
    amount: Decimal | DecimalJsLike | number | string
    currency?: string
    method: string
    status: string
    reference: string
    customerEmail: string
    customerName: string
    description?: string | null
    createdAt?: Date | string
  }

  export type SystemPaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    reference?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemPaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    reference?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlanCreateInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    currency?: string
    billingCycle?: $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: number
    maxUsers?: number
    maxBeds?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    subscriptions?: SubscriptionCreateNestedManyWithoutPlanInput
  }

  export type PlanUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    currency?: string
    billingCycle?: $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: number
    maxUsers?: number
    maxBeds?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutPlanInput
  }

  export type PlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    billingCycle?: EnumBillingCycleFieldUpdateOperationsInput | $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: IntFieldUpdateOperationsInput | number
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxBeds?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptions?: SubscriptionUpdateManyWithoutPlanNestedInput
  }

  export type PlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    billingCycle?: EnumBillingCycleFieldUpdateOperationsInput | $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: IntFieldUpdateOperationsInput | number
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxBeds?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutPlanNestedInput
  }

  export type PlanCreateManyInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    currency?: string
    billingCycle?: $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: number
    maxUsers?: number
    maxBeds?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    billingCycle?: EnumBillingCycleFieldUpdateOperationsInput | $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: IntFieldUpdateOperationsInput | number
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxBeds?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    billingCycle?: EnumBillingCycleFieldUpdateOperationsInput | $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: IntFieldUpdateOperationsInput | number
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxBeds?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionCreateInput = {
    id?: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutSubscriptionsInput
    plan: PlanCreateNestedOneWithoutSubscriptionsInput
    usages?: TenantUsageCreateNestedManyWithoutSubscriptionInput
  }

  export type SubscriptionUncheckedCreateInput = {
    id?: string
    tenantId: string
    planId: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    usages?: TenantUsageUncheckedCreateNestedManyWithoutSubscriptionInput
  }

  export type SubscriptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutSubscriptionsNestedInput
    plan?: PlanUpdateOneRequiredWithoutSubscriptionsNestedInput
    usages?: TenantUsageUpdateManyWithoutSubscriptionNestedInput
  }

  export type SubscriptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    planId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usages?: TenantUsageUncheckedUpdateManyWithoutSubscriptionNestedInput
  }

  export type SubscriptionCreateManyInput = {
    id?: string
    tenantId: string
    planId: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    planId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientIndexCreateInput = {
    biometricHash: string
    biometricType: string
    tenantId: string
    patientId: string
    description?: string | null
    timestamp?: Date | string
    updatedAt?: Date | string
  }

  export type PatientIndexUncheckedCreateInput = {
    biometricHash: string
    biometricType: string
    tenantId: string
    patientId: string
    description?: string | null
    timestamp?: Date | string
    updatedAt?: Date | string
  }

  export type PatientIndexUpdateInput = {
    biometricHash?: StringFieldUpdateOperationsInput | string
    biometricType?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientIndexUncheckedUpdateInput = {
    biometricHash?: StringFieldUpdateOperationsInput | string
    biometricType?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientIndexCreateManyInput = {
    biometricHash: string
    biometricType: string
    tenantId: string
    patientId: string
    description?: string | null
    timestamp?: Date | string
    updatedAt?: Date | string
  }

  export type PatientIndexUpdateManyMutationInput = {
    biometricHash?: StringFieldUpdateOperationsInput | string
    biometricType?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PatientIndexUncheckedUpdateManyInput = {
    biometricHash?: StringFieldUpdateOperationsInput | string
    biometricType?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    patientId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageCreateInput = {
    id?: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutUsagesInput
    subscription: SubscriptionCreateNestedOneWithoutUsagesInput
  }

  export type TenantUsageUncheckedCreateInput = {
    id?: string
    tenantId: string
    subscriptionId: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUsageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsagesNestedInput
    subscription?: SubscriptionUpdateOneRequiredWithoutUsagesNestedInput
  }

  export type TenantUsageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageCreateManyInput = {
    id?: string
    tenantId: string
    subscriptionId: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUsageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumDeploymentTierFilter<$PrismaModel = never> = {
    equals?: $Enums.DeploymentTier | EnumDeploymentTierFieldRefInput<$PrismaModel>
    in?: $Enums.DeploymentTier[] | ListEnumDeploymentTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeploymentTier[] | ListEnumDeploymentTierFieldRefInput<$PrismaModel>
    not?: NestedEnumDeploymentTierFilter<$PrismaModel> | $Enums.DeploymentTier
  }

  export type EnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type TenantModuleListRelationFilter = {
    every?: TenantModuleWhereInput
    some?: TenantModuleWhereInput
    none?: TenantModuleWhereInput
  }

  export type SystemPaymentListRelationFilter = {
    every?: SystemPaymentWhereInput
    some?: SystemPaymentWhereInput
    none?: SystemPaymentWhereInput
  }

  export type SubscriptionListRelationFilter = {
    every?: SubscriptionWhereInput
    some?: SubscriptionWhereInput
    none?: SubscriptionWhereInput
  }

  export type TenantUsageListRelationFilter = {
    every?: TenantUsageWhereInput
    some?: TenantUsageWhereInput
    none?: TenantUsageWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TenantModuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SystemPaymentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SubscriptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantUsageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    dbUrl?: SortOrder
    encryptionKeyReference?: SortOrder
    tier?: SortOrder
    region?: SortOrder
    status?: SortOrder
    suspensionReason?: SortOrder
    suspendedAt?: SortOrder
    address?: SortOrder
    logoUrl?: SortOrder
    primaryColor?: SortOrder
    secondaryColor?: SortOrder
    trialEndsAt?: SortOrder
    enabledModules?: SortOrder
    publicKeySpki?: SortOrder
    sharedSecret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    dbUrl?: SortOrder
    encryptionKeyReference?: SortOrder
    tier?: SortOrder
    region?: SortOrder
    status?: SortOrder
    suspensionReason?: SortOrder
    suspendedAt?: SortOrder
    address?: SortOrder
    logoUrl?: SortOrder
    primaryColor?: SortOrder
    secondaryColor?: SortOrder
    trialEndsAt?: SortOrder
    publicKeySpki?: SortOrder
    sharedSecret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    dbUrl?: SortOrder
    encryptionKeyReference?: SortOrder
    tier?: SortOrder
    region?: SortOrder
    status?: SortOrder
    suspensionReason?: SortOrder
    suspendedAt?: SortOrder
    address?: SortOrder
    logoUrl?: SortOrder
    primaryColor?: SortOrder
    secondaryColor?: SortOrder
    trialEndsAt?: SortOrder
    publicKeySpki?: SortOrder
    sharedSecret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumDeploymentTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeploymentTier | EnumDeploymentTierFieldRefInput<$PrismaModel>
    in?: $Enums.DeploymentTier[] | ListEnumDeploymentTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeploymentTier[] | ListEnumDeploymentTierFieldRefInput<$PrismaModel>
    not?: NestedEnumDeploymentTierWithAggregatesFilter<$PrismaModel> | $Enums.DeploymentTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeploymentTierFilter<$PrismaModel>
    _max?: NestedEnumDeploymentTierFilter<$PrismaModel>
  }

  export type EnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type ModuleCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    basePrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModuleAvgOrderByAggregateInput = {
    basePrice?: SortOrder
  }

  export type ModuleMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    basePrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModuleMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    basePrice?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModuleSumOrderByAggregateInput = {
    basePrice?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type TenantRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type ModuleRelationFilter = {
    is?: ModuleWhereInput
    isNot?: ModuleWhereInput
  }

  export type TenantModuleTenantIdModuleIdCompoundUniqueInput = {
    tenantId: string
    moduleId: string
  }

  export type TenantModuleCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleId?: SortOrder
    isEnabled?: SortOrder
    validUntil?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantModuleMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleId?: SortOrder
    isEnabled?: SortOrder
    validUntil?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantModuleMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    moduleId?: SortOrder
    isEnabled?: SortOrder
    validUntil?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type SystemAdminCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemAdminMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemAdminMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GlobalSettingsCountOrderByAggregateInput = {
    id?: SortOrder
    platformName?: SortOrder
    platformLogoUrl?: SortOrder
    platformSlogan?: SortOrder
    heroTitle?: SortOrder
    heroSubtitle?: SortOrder
    heroCTA?: SortOrder
    heroImageUrl?: SortOrder
    showHero?: SortOrder
    showFeatures?: SortOrder
    feature1Title?: SortOrder
    feature1Desc?: SortOrder
    feature1Icon?: SortOrder
    feature2Title?: SortOrder
    feature2Desc?: SortOrder
    feature2Icon?: SortOrder
    feature3Title?: SortOrder
    feature3Desc?: SortOrder
    feature3Icon?: SortOrder
    paypalClientId?: SortOrder
    paypalClientSecret?: SortOrder
    paypalEnv?: SortOrder
    mpesaConsumerKey?: SortOrder
    mpesaConsumerSecret?: SortOrder
    mpesaPasskey?: SortOrder
    mpesaShortcode?: SortOrder
    updatedAt?: SortOrder
  }

  export type GlobalSettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    platformName?: SortOrder
    platformLogoUrl?: SortOrder
    platformSlogan?: SortOrder
    heroTitle?: SortOrder
    heroSubtitle?: SortOrder
    heroCTA?: SortOrder
    heroImageUrl?: SortOrder
    showHero?: SortOrder
    showFeatures?: SortOrder
    feature1Title?: SortOrder
    feature1Desc?: SortOrder
    feature1Icon?: SortOrder
    feature2Title?: SortOrder
    feature2Desc?: SortOrder
    feature2Icon?: SortOrder
    feature3Title?: SortOrder
    feature3Desc?: SortOrder
    feature3Icon?: SortOrder
    paypalClientId?: SortOrder
    paypalClientSecret?: SortOrder
    paypalEnv?: SortOrder
    mpesaConsumerKey?: SortOrder
    mpesaConsumerSecret?: SortOrder
    mpesaPasskey?: SortOrder
    mpesaShortcode?: SortOrder
    updatedAt?: SortOrder
  }

  export type GlobalSettingsMinOrderByAggregateInput = {
    id?: SortOrder
    platformName?: SortOrder
    platformLogoUrl?: SortOrder
    platformSlogan?: SortOrder
    heroTitle?: SortOrder
    heroSubtitle?: SortOrder
    heroCTA?: SortOrder
    heroImageUrl?: SortOrder
    showHero?: SortOrder
    showFeatures?: SortOrder
    feature1Title?: SortOrder
    feature1Desc?: SortOrder
    feature1Icon?: SortOrder
    feature2Title?: SortOrder
    feature2Desc?: SortOrder
    feature2Icon?: SortOrder
    feature3Title?: SortOrder
    feature3Desc?: SortOrder
    feature3Icon?: SortOrder
    paypalClientId?: SortOrder
    paypalClientSecret?: SortOrder
    paypalEnv?: SortOrder
    mpesaConsumerKey?: SortOrder
    mpesaConsumerSecret?: SortOrder
    mpesaPasskey?: SortOrder
    mpesaShortcode?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantNullableRelationFilter = {
    is?: TenantWhereInput | null
    isNot?: TenantWhereInput | null
  }

  export type SystemPaymentCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    method?: SortOrder
    status?: SortOrder
    reference?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type SystemPaymentAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type SystemPaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    method?: SortOrder
    status?: SortOrder
    reference?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type SystemPaymentMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    method?: SortOrder
    status?: SortOrder
    reference?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type SystemPaymentSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type EnumBillingCycleFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCycle | EnumBillingCycleFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCycle[] | ListEnumBillingCycleFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCycle[] | ListEnumBillingCycleFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCycleFilter<$PrismaModel> | $Enums.BillingCycle
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type PlanCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    billingCycle?: SortOrder
    features?: SortOrder
    maxPatients?: SortOrder
    maxUsers?: SortOrder
    maxBeds?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlanAvgOrderByAggregateInput = {
    price?: SortOrder
    maxPatients?: SortOrder
    maxUsers?: SortOrder
    maxBeds?: SortOrder
  }

  export type PlanMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    billingCycle?: SortOrder
    maxPatients?: SortOrder
    maxUsers?: SortOrder
    maxBeds?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlanMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    description?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    billingCycle?: SortOrder
    maxPatients?: SortOrder
    maxUsers?: SortOrder
    maxBeds?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlanSumOrderByAggregateInput = {
    price?: SortOrder
    maxPatients?: SortOrder
    maxUsers?: SortOrder
    maxBeds?: SortOrder
  }

  export type EnumBillingCycleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCycle | EnumBillingCycleFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCycle[] | ListEnumBillingCycleFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCycle[] | ListEnumBillingCycleFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCycleWithAggregatesFilter<$PrismaModel> | $Enums.BillingCycle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBillingCycleFilter<$PrismaModel>
    _max?: NestedEnumBillingCycleFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type PlanRelationFilter = {
    is?: PlanWhereInput
    isNot?: PlanWhereInput
  }

  export type SubscriptionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    planId?: SortOrder
    status?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    signedToken?: SortOrder
    autoRenew?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    planId?: SortOrder
    status?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    signedToken?: SortOrder
    autoRenew?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    planId?: SortOrder
    status?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    signedToken?: SortOrder
    autoRenew?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientIndexCountOrderByAggregateInput = {
    biometricHash?: SortOrder
    biometricType?: SortOrder
    tenantId?: SortOrder
    patientId?: SortOrder
    description?: SortOrder
    timestamp?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientIndexMaxOrderByAggregateInput = {
    biometricHash?: SortOrder
    biometricType?: SortOrder
    tenantId?: SortOrder
    patientId?: SortOrder
    description?: SortOrder
    timestamp?: SortOrder
    updatedAt?: SortOrder
  }

  export type PatientIndexMinOrderByAggregateInput = {
    biometricHash?: SortOrder
    biometricType?: SortOrder
    tenantId?: SortOrder
    patientId?: SortOrder
    description?: SortOrder
    timestamp?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionRelationFilter = {
    is?: SubscriptionWhereInput
    isNot?: SubscriptionWhereInput
  }

  export type TenantUsageTenantIdDateCompoundUniqueInput = {
    tenantId: string
    date: Date | string
  }

  export type TenantUsageCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    subscriptionId?: SortOrder
    date?: SortOrder
    activeUsers?: SortOrder
    activePatients?: SortOrder
    storageUsedMb?: SortOrder
    apiCallsCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantUsageAvgOrderByAggregateInput = {
    activeUsers?: SortOrder
    activePatients?: SortOrder
    storageUsedMb?: SortOrder
    apiCallsCount?: SortOrder
  }

  export type TenantUsageMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    subscriptionId?: SortOrder
    date?: SortOrder
    activeUsers?: SortOrder
    activePatients?: SortOrder
    storageUsedMb?: SortOrder
    apiCallsCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantUsageMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    subscriptionId?: SortOrder
    date?: SortOrder
    activeUsers?: SortOrder
    activePatients?: SortOrder
    storageUsedMb?: SortOrder
    apiCallsCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantUsageSumOrderByAggregateInput = {
    activeUsers?: SortOrder
    activePatients?: SortOrder
    storageUsedMb?: SortOrder
    apiCallsCount?: SortOrder
  }

  export type TenantModuleCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput> | TenantModuleCreateWithoutTenantInput[] | TenantModuleUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutTenantInput | TenantModuleCreateOrConnectWithoutTenantInput[]
    createMany?: TenantModuleCreateManyTenantInputEnvelope
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
  }

  export type SystemPaymentCreateNestedManyWithoutTenantInput = {
    create?: XOR<SystemPaymentCreateWithoutTenantInput, SystemPaymentUncheckedCreateWithoutTenantInput> | SystemPaymentCreateWithoutTenantInput[] | SystemPaymentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SystemPaymentCreateOrConnectWithoutTenantInput | SystemPaymentCreateOrConnectWithoutTenantInput[]
    createMany?: SystemPaymentCreateManyTenantInputEnvelope
    connect?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
  }

  export type SubscriptionCreateNestedManyWithoutTenantInput = {
    create?: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput> | SubscriptionCreateWithoutTenantInput[] | SubscriptionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutTenantInput | SubscriptionCreateOrConnectWithoutTenantInput[]
    createMany?: SubscriptionCreateManyTenantInputEnvelope
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
  }

  export type TenantUsageCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantUsageCreateWithoutTenantInput, TenantUsageUncheckedCreateWithoutTenantInput> | TenantUsageCreateWithoutTenantInput[] | TenantUsageUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantUsageCreateOrConnectWithoutTenantInput | TenantUsageCreateOrConnectWithoutTenantInput[]
    createMany?: TenantUsageCreateManyTenantInputEnvelope
    connect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
  }

  export type TenantModuleUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput> | TenantModuleCreateWithoutTenantInput[] | TenantModuleUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutTenantInput | TenantModuleCreateOrConnectWithoutTenantInput[]
    createMany?: TenantModuleCreateManyTenantInputEnvelope
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
  }

  export type SystemPaymentUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<SystemPaymentCreateWithoutTenantInput, SystemPaymentUncheckedCreateWithoutTenantInput> | SystemPaymentCreateWithoutTenantInput[] | SystemPaymentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SystemPaymentCreateOrConnectWithoutTenantInput | SystemPaymentCreateOrConnectWithoutTenantInput[]
    createMany?: SystemPaymentCreateManyTenantInputEnvelope
    connect?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
  }

  export type SubscriptionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput> | SubscriptionCreateWithoutTenantInput[] | SubscriptionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutTenantInput | SubscriptionCreateOrConnectWithoutTenantInput[]
    createMany?: SubscriptionCreateManyTenantInputEnvelope
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
  }

  export type TenantUsageUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<TenantUsageCreateWithoutTenantInput, TenantUsageUncheckedCreateWithoutTenantInput> | TenantUsageCreateWithoutTenantInput[] | TenantUsageUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantUsageCreateOrConnectWithoutTenantInput | TenantUsageCreateOrConnectWithoutTenantInput[]
    createMany?: TenantUsageCreateManyTenantInputEnvelope
    connect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumDeploymentTierFieldUpdateOperationsInput = {
    set?: $Enums.DeploymentTier
  }

  export type EnumTenantStatusFieldUpdateOperationsInput = {
    set?: $Enums.TenantStatus
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TenantModuleUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput> | TenantModuleCreateWithoutTenantInput[] | TenantModuleUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutTenantInput | TenantModuleCreateOrConnectWithoutTenantInput[]
    upsert?: TenantModuleUpsertWithWhereUniqueWithoutTenantInput | TenantModuleUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantModuleCreateManyTenantInputEnvelope
    set?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    disconnect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    delete?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    update?: TenantModuleUpdateWithWhereUniqueWithoutTenantInput | TenantModuleUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantModuleUpdateManyWithWhereWithoutTenantInput | TenantModuleUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
  }

  export type SystemPaymentUpdateManyWithoutTenantNestedInput = {
    create?: XOR<SystemPaymentCreateWithoutTenantInput, SystemPaymentUncheckedCreateWithoutTenantInput> | SystemPaymentCreateWithoutTenantInput[] | SystemPaymentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SystemPaymentCreateOrConnectWithoutTenantInput | SystemPaymentCreateOrConnectWithoutTenantInput[]
    upsert?: SystemPaymentUpsertWithWhereUniqueWithoutTenantInput | SystemPaymentUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: SystemPaymentCreateManyTenantInputEnvelope
    set?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
    disconnect?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
    delete?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
    connect?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
    update?: SystemPaymentUpdateWithWhereUniqueWithoutTenantInput | SystemPaymentUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: SystemPaymentUpdateManyWithWhereWithoutTenantInput | SystemPaymentUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: SystemPaymentScalarWhereInput | SystemPaymentScalarWhereInput[]
  }

  export type SubscriptionUpdateManyWithoutTenantNestedInput = {
    create?: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput> | SubscriptionCreateWithoutTenantInput[] | SubscriptionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutTenantInput | SubscriptionCreateOrConnectWithoutTenantInput[]
    upsert?: SubscriptionUpsertWithWhereUniqueWithoutTenantInput | SubscriptionUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: SubscriptionCreateManyTenantInputEnvelope
    set?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    disconnect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    delete?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    update?: SubscriptionUpdateWithWhereUniqueWithoutTenantInput | SubscriptionUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: SubscriptionUpdateManyWithWhereWithoutTenantInput | SubscriptionUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
  }

  export type TenantUsageUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantUsageCreateWithoutTenantInput, TenantUsageUncheckedCreateWithoutTenantInput> | TenantUsageCreateWithoutTenantInput[] | TenantUsageUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantUsageCreateOrConnectWithoutTenantInput | TenantUsageCreateOrConnectWithoutTenantInput[]
    upsert?: TenantUsageUpsertWithWhereUniqueWithoutTenantInput | TenantUsageUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantUsageCreateManyTenantInputEnvelope
    set?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    disconnect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    delete?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    connect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    update?: TenantUsageUpdateWithWhereUniqueWithoutTenantInput | TenantUsageUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantUsageUpdateManyWithWhereWithoutTenantInput | TenantUsageUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantUsageScalarWhereInput | TenantUsageScalarWhereInput[]
  }

  export type TenantModuleUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput> | TenantModuleCreateWithoutTenantInput[] | TenantModuleUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutTenantInput | TenantModuleCreateOrConnectWithoutTenantInput[]
    upsert?: TenantModuleUpsertWithWhereUniqueWithoutTenantInput | TenantModuleUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantModuleCreateManyTenantInputEnvelope
    set?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    disconnect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    delete?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    update?: TenantModuleUpdateWithWhereUniqueWithoutTenantInput | TenantModuleUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantModuleUpdateManyWithWhereWithoutTenantInput | TenantModuleUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
  }

  export type SystemPaymentUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<SystemPaymentCreateWithoutTenantInput, SystemPaymentUncheckedCreateWithoutTenantInput> | SystemPaymentCreateWithoutTenantInput[] | SystemPaymentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SystemPaymentCreateOrConnectWithoutTenantInput | SystemPaymentCreateOrConnectWithoutTenantInput[]
    upsert?: SystemPaymentUpsertWithWhereUniqueWithoutTenantInput | SystemPaymentUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: SystemPaymentCreateManyTenantInputEnvelope
    set?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
    disconnect?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
    delete?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
    connect?: SystemPaymentWhereUniqueInput | SystemPaymentWhereUniqueInput[]
    update?: SystemPaymentUpdateWithWhereUniqueWithoutTenantInput | SystemPaymentUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: SystemPaymentUpdateManyWithWhereWithoutTenantInput | SystemPaymentUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: SystemPaymentScalarWhereInput | SystemPaymentScalarWhereInput[]
  }

  export type SubscriptionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput> | SubscriptionCreateWithoutTenantInput[] | SubscriptionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutTenantInput | SubscriptionCreateOrConnectWithoutTenantInput[]
    upsert?: SubscriptionUpsertWithWhereUniqueWithoutTenantInput | SubscriptionUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: SubscriptionCreateManyTenantInputEnvelope
    set?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    disconnect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    delete?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    update?: SubscriptionUpdateWithWhereUniqueWithoutTenantInput | SubscriptionUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: SubscriptionUpdateManyWithWhereWithoutTenantInput | SubscriptionUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
  }

  export type TenantUsageUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<TenantUsageCreateWithoutTenantInput, TenantUsageUncheckedCreateWithoutTenantInput> | TenantUsageCreateWithoutTenantInput[] | TenantUsageUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: TenantUsageCreateOrConnectWithoutTenantInput | TenantUsageCreateOrConnectWithoutTenantInput[]
    upsert?: TenantUsageUpsertWithWhereUniqueWithoutTenantInput | TenantUsageUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: TenantUsageCreateManyTenantInputEnvelope
    set?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    disconnect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    delete?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    connect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    update?: TenantUsageUpdateWithWhereUniqueWithoutTenantInput | TenantUsageUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: TenantUsageUpdateManyWithWhereWithoutTenantInput | TenantUsageUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: TenantUsageScalarWhereInput | TenantUsageScalarWhereInput[]
  }

  export type TenantModuleCreateNestedManyWithoutModuleInput = {
    create?: XOR<TenantModuleCreateWithoutModuleInput, TenantModuleUncheckedCreateWithoutModuleInput> | TenantModuleCreateWithoutModuleInput[] | TenantModuleUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutModuleInput | TenantModuleCreateOrConnectWithoutModuleInput[]
    createMany?: TenantModuleCreateManyModuleInputEnvelope
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
  }

  export type TenantModuleUncheckedCreateNestedManyWithoutModuleInput = {
    create?: XOR<TenantModuleCreateWithoutModuleInput, TenantModuleUncheckedCreateWithoutModuleInput> | TenantModuleCreateWithoutModuleInput[] | TenantModuleUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutModuleInput | TenantModuleCreateOrConnectWithoutModuleInput[]
    createMany?: TenantModuleCreateManyModuleInputEnvelope
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type TenantModuleUpdateManyWithoutModuleNestedInput = {
    create?: XOR<TenantModuleCreateWithoutModuleInput, TenantModuleUncheckedCreateWithoutModuleInput> | TenantModuleCreateWithoutModuleInput[] | TenantModuleUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutModuleInput | TenantModuleCreateOrConnectWithoutModuleInput[]
    upsert?: TenantModuleUpsertWithWhereUniqueWithoutModuleInput | TenantModuleUpsertWithWhereUniqueWithoutModuleInput[]
    createMany?: TenantModuleCreateManyModuleInputEnvelope
    set?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    disconnect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    delete?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    update?: TenantModuleUpdateWithWhereUniqueWithoutModuleInput | TenantModuleUpdateWithWhereUniqueWithoutModuleInput[]
    updateMany?: TenantModuleUpdateManyWithWhereWithoutModuleInput | TenantModuleUpdateManyWithWhereWithoutModuleInput[]
    deleteMany?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
  }

  export type TenantModuleUncheckedUpdateManyWithoutModuleNestedInput = {
    create?: XOR<TenantModuleCreateWithoutModuleInput, TenantModuleUncheckedCreateWithoutModuleInput> | TenantModuleCreateWithoutModuleInput[] | TenantModuleUncheckedCreateWithoutModuleInput[]
    connectOrCreate?: TenantModuleCreateOrConnectWithoutModuleInput | TenantModuleCreateOrConnectWithoutModuleInput[]
    upsert?: TenantModuleUpsertWithWhereUniqueWithoutModuleInput | TenantModuleUpsertWithWhereUniqueWithoutModuleInput[]
    createMany?: TenantModuleCreateManyModuleInputEnvelope
    set?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    disconnect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    delete?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    connect?: TenantModuleWhereUniqueInput | TenantModuleWhereUniqueInput[]
    update?: TenantModuleUpdateWithWhereUniqueWithoutModuleInput | TenantModuleUpdateWithWhereUniqueWithoutModuleInput[]
    updateMany?: TenantModuleUpdateManyWithWhereWithoutModuleInput | TenantModuleUpdateManyWithWhereWithoutModuleInput[]
    deleteMany?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutEntitlementsInput = {
    create?: XOR<TenantCreateWithoutEntitlementsInput, TenantUncheckedCreateWithoutEntitlementsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutEntitlementsInput
    connect?: TenantWhereUniqueInput
  }

  export type ModuleCreateNestedOneWithoutTenantsInput = {
    create?: XOR<ModuleCreateWithoutTenantsInput, ModuleUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: ModuleCreateOrConnectWithoutTenantsInput
    connect?: ModuleWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TenantUpdateOneRequiredWithoutEntitlementsNestedInput = {
    create?: XOR<TenantCreateWithoutEntitlementsInput, TenantUncheckedCreateWithoutEntitlementsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutEntitlementsInput
    upsert?: TenantUpsertWithoutEntitlementsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutEntitlementsInput, TenantUpdateWithoutEntitlementsInput>, TenantUncheckedUpdateWithoutEntitlementsInput>
  }

  export type ModuleUpdateOneRequiredWithoutTenantsNestedInput = {
    create?: XOR<ModuleCreateWithoutTenantsInput, ModuleUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: ModuleCreateOrConnectWithoutTenantsInput
    upsert?: ModuleUpsertWithoutTenantsInput
    connect?: ModuleWhereUniqueInput
    update?: XOR<XOR<ModuleUpdateToOneWithWhereWithoutTenantsInput, ModuleUpdateWithoutTenantsInput>, ModuleUncheckedUpdateWithoutTenantsInput>
  }

  export type TenantCreateNestedOneWithoutPaymentsInput = {
    create?: XOR<TenantCreateWithoutPaymentsInput, TenantUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutPaymentsInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneWithoutPaymentsNestedInput = {
    create?: XOR<TenantCreateWithoutPaymentsInput, TenantUncheckedCreateWithoutPaymentsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutPaymentsInput
    upsert?: TenantUpsertWithoutPaymentsInput
    disconnect?: TenantWhereInput | boolean
    delete?: TenantWhereInput | boolean
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutPaymentsInput, TenantUpdateWithoutPaymentsInput>, TenantUncheckedUpdateWithoutPaymentsInput>
  }

  export type SubscriptionCreateNestedManyWithoutPlanInput = {
    create?: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput> | SubscriptionCreateWithoutPlanInput[] | SubscriptionUncheckedCreateWithoutPlanInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutPlanInput | SubscriptionCreateOrConnectWithoutPlanInput[]
    createMany?: SubscriptionCreateManyPlanInputEnvelope
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
  }

  export type SubscriptionUncheckedCreateNestedManyWithoutPlanInput = {
    create?: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput> | SubscriptionCreateWithoutPlanInput[] | SubscriptionUncheckedCreateWithoutPlanInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutPlanInput | SubscriptionCreateOrConnectWithoutPlanInput[]
    createMany?: SubscriptionCreateManyPlanInputEnvelope
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
  }

  export type EnumBillingCycleFieldUpdateOperationsInput = {
    set?: $Enums.BillingCycle
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SubscriptionUpdateManyWithoutPlanNestedInput = {
    create?: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput> | SubscriptionCreateWithoutPlanInput[] | SubscriptionUncheckedCreateWithoutPlanInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutPlanInput | SubscriptionCreateOrConnectWithoutPlanInput[]
    upsert?: SubscriptionUpsertWithWhereUniqueWithoutPlanInput | SubscriptionUpsertWithWhereUniqueWithoutPlanInput[]
    createMany?: SubscriptionCreateManyPlanInputEnvelope
    set?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    disconnect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    delete?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    update?: SubscriptionUpdateWithWhereUniqueWithoutPlanInput | SubscriptionUpdateWithWhereUniqueWithoutPlanInput[]
    updateMany?: SubscriptionUpdateManyWithWhereWithoutPlanInput | SubscriptionUpdateManyWithWhereWithoutPlanInput[]
    deleteMany?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
  }

  export type SubscriptionUncheckedUpdateManyWithoutPlanNestedInput = {
    create?: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput> | SubscriptionCreateWithoutPlanInput[] | SubscriptionUncheckedCreateWithoutPlanInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutPlanInput | SubscriptionCreateOrConnectWithoutPlanInput[]
    upsert?: SubscriptionUpsertWithWhereUniqueWithoutPlanInput | SubscriptionUpsertWithWhereUniqueWithoutPlanInput[]
    createMany?: SubscriptionCreateManyPlanInputEnvelope
    set?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    disconnect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    delete?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    update?: SubscriptionUpdateWithWhereUniqueWithoutPlanInput | SubscriptionUpdateWithWhereUniqueWithoutPlanInput[]
    updateMany?: SubscriptionUpdateManyWithWhereWithoutPlanInput | SubscriptionUpdateManyWithWhereWithoutPlanInput[]
    deleteMany?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutSubscriptionsInput = {
    create?: XOR<TenantCreateWithoutSubscriptionsInput, TenantUncheckedCreateWithoutSubscriptionsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutSubscriptionsInput
    connect?: TenantWhereUniqueInput
  }

  export type PlanCreateNestedOneWithoutSubscriptionsInput = {
    create?: XOR<PlanCreateWithoutSubscriptionsInput, PlanUncheckedCreateWithoutSubscriptionsInput>
    connectOrCreate?: PlanCreateOrConnectWithoutSubscriptionsInput
    connect?: PlanWhereUniqueInput
  }

  export type TenantUsageCreateNestedManyWithoutSubscriptionInput = {
    create?: XOR<TenantUsageCreateWithoutSubscriptionInput, TenantUsageUncheckedCreateWithoutSubscriptionInput> | TenantUsageCreateWithoutSubscriptionInput[] | TenantUsageUncheckedCreateWithoutSubscriptionInput[]
    connectOrCreate?: TenantUsageCreateOrConnectWithoutSubscriptionInput | TenantUsageCreateOrConnectWithoutSubscriptionInput[]
    createMany?: TenantUsageCreateManySubscriptionInputEnvelope
    connect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
  }

  export type TenantUsageUncheckedCreateNestedManyWithoutSubscriptionInput = {
    create?: XOR<TenantUsageCreateWithoutSubscriptionInput, TenantUsageUncheckedCreateWithoutSubscriptionInput> | TenantUsageCreateWithoutSubscriptionInput[] | TenantUsageUncheckedCreateWithoutSubscriptionInput[]
    connectOrCreate?: TenantUsageCreateOrConnectWithoutSubscriptionInput | TenantUsageCreateOrConnectWithoutSubscriptionInput[]
    createMany?: TenantUsageCreateManySubscriptionInputEnvelope
    connect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
  }

  export type TenantUpdateOneRequiredWithoutSubscriptionsNestedInput = {
    create?: XOR<TenantCreateWithoutSubscriptionsInput, TenantUncheckedCreateWithoutSubscriptionsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutSubscriptionsInput
    upsert?: TenantUpsertWithoutSubscriptionsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutSubscriptionsInput, TenantUpdateWithoutSubscriptionsInput>, TenantUncheckedUpdateWithoutSubscriptionsInput>
  }

  export type PlanUpdateOneRequiredWithoutSubscriptionsNestedInput = {
    create?: XOR<PlanCreateWithoutSubscriptionsInput, PlanUncheckedCreateWithoutSubscriptionsInput>
    connectOrCreate?: PlanCreateOrConnectWithoutSubscriptionsInput
    upsert?: PlanUpsertWithoutSubscriptionsInput
    connect?: PlanWhereUniqueInput
    update?: XOR<XOR<PlanUpdateToOneWithWhereWithoutSubscriptionsInput, PlanUpdateWithoutSubscriptionsInput>, PlanUncheckedUpdateWithoutSubscriptionsInput>
  }

  export type TenantUsageUpdateManyWithoutSubscriptionNestedInput = {
    create?: XOR<TenantUsageCreateWithoutSubscriptionInput, TenantUsageUncheckedCreateWithoutSubscriptionInput> | TenantUsageCreateWithoutSubscriptionInput[] | TenantUsageUncheckedCreateWithoutSubscriptionInput[]
    connectOrCreate?: TenantUsageCreateOrConnectWithoutSubscriptionInput | TenantUsageCreateOrConnectWithoutSubscriptionInput[]
    upsert?: TenantUsageUpsertWithWhereUniqueWithoutSubscriptionInput | TenantUsageUpsertWithWhereUniqueWithoutSubscriptionInput[]
    createMany?: TenantUsageCreateManySubscriptionInputEnvelope
    set?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    disconnect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    delete?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    connect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    update?: TenantUsageUpdateWithWhereUniqueWithoutSubscriptionInput | TenantUsageUpdateWithWhereUniqueWithoutSubscriptionInput[]
    updateMany?: TenantUsageUpdateManyWithWhereWithoutSubscriptionInput | TenantUsageUpdateManyWithWhereWithoutSubscriptionInput[]
    deleteMany?: TenantUsageScalarWhereInput | TenantUsageScalarWhereInput[]
  }

  export type TenantUsageUncheckedUpdateManyWithoutSubscriptionNestedInput = {
    create?: XOR<TenantUsageCreateWithoutSubscriptionInput, TenantUsageUncheckedCreateWithoutSubscriptionInput> | TenantUsageCreateWithoutSubscriptionInput[] | TenantUsageUncheckedCreateWithoutSubscriptionInput[]
    connectOrCreate?: TenantUsageCreateOrConnectWithoutSubscriptionInput | TenantUsageCreateOrConnectWithoutSubscriptionInput[]
    upsert?: TenantUsageUpsertWithWhereUniqueWithoutSubscriptionInput | TenantUsageUpsertWithWhereUniqueWithoutSubscriptionInput[]
    createMany?: TenantUsageCreateManySubscriptionInputEnvelope
    set?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    disconnect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    delete?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    connect?: TenantUsageWhereUniqueInput | TenantUsageWhereUniqueInput[]
    update?: TenantUsageUpdateWithWhereUniqueWithoutSubscriptionInput | TenantUsageUpdateWithWhereUniqueWithoutSubscriptionInput[]
    updateMany?: TenantUsageUpdateManyWithWhereWithoutSubscriptionInput | TenantUsageUpdateManyWithWhereWithoutSubscriptionInput[]
    deleteMany?: TenantUsageScalarWhereInput | TenantUsageScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutUsagesInput = {
    create?: XOR<TenantCreateWithoutUsagesInput, TenantUncheckedCreateWithoutUsagesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsagesInput
    connect?: TenantWhereUniqueInput
  }

  export type SubscriptionCreateNestedOneWithoutUsagesInput = {
    create?: XOR<SubscriptionCreateWithoutUsagesInput, SubscriptionUncheckedCreateWithoutUsagesInput>
    connectOrCreate?: SubscriptionCreateOrConnectWithoutUsagesInput
    connect?: SubscriptionWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutUsagesNestedInput = {
    create?: XOR<TenantCreateWithoutUsagesInput, TenantUncheckedCreateWithoutUsagesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsagesInput
    upsert?: TenantUpsertWithoutUsagesInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutUsagesInput, TenantUpdateWithoutUsagesInput>, TenantUncheckedUpdateWithoutUsagesInput>
  }

  export type SubscriptionUpdateOneRequiredWithoutUsagesNestedInput = {
    create?: XOR<SubscriptionCreateWithoutUsagesInput, SubscriptionUncheckedCreateWithoutUsagesInput>
    connectOrCreate?: SubscriptionCreateOrConnectWithoutUsagesInput
    upsert?: SubscriptionUpsertWithoutUsagesInput
    connect?: SubscriptionWhereUniqueInput
    update?: XOR<XOR<SubscriptionUpdateToOneWithWhereWithoutUsagesInput, SubscriptionUpdateWithoutUsagesInput>, SubscriptionUncheckedUpdateWithoutUsagesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumDeploymentTierFilter<$PrismaModel = never> = {
    equals?: $Enums.DeploymentTier | EnumDeploymentTierFieldRefInput<$PrismaModel>
    in?: $Enums.DeploymentTier[] | ListEnumDeploymentTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeploymentTier[] | ListEnumDeploymentTierFieldRefInput<$PrismaModel>
    not?: NestedEnumDeploymentTierFilter<$PrismaModel> | $Enums.DeploymentTier
  }

  export type NestedEnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumDeploymentTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DeploymentTier | EnumDeploymentTierFieldRefInput<$PrismaModel>
    in?: $Enums.DeploymentTier[] | ListEnumDeploymentTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.DeploymentTier[] | ListEnumDeploymentTierFieldRefInput<$PrismaModel>
    not?: NestedEnumDeploymentTierWithAggregatesFilter<$PrismaModel> | $Enums.DeploymentTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDeploymentTierFilter<$PrismaModel>
    _max?: NestedEnumDeploymentTierFilter<$PrismaModel>
  }

  export type NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumBillingCycleFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCycle | EnumBillingCycleFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCycle[] | ListEnumBillingCycleFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCycle[] | ListEnumBillingCycleFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCycleFilter<$PrismaModel> | $Enums.BillingCycle
  }

  export type NestedEnumBillingCycleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BillingCycle | EnumBillingCycleFieldRefInput<$PrismaModel>
    in?: $Enums.BillingCycle[] | ListEnumBillingCycleFieldRefInput<$PrismaModel>
    notIn?: $Enums.BillingCycle[] | ListEnumBillingCycleFieldRefInput<$PrismaModel>
    not?: NestedEnumBillingCycleWithAggregatesFilter<$PrismaModel> | $Enums.BillingCycle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBillingCycleFilter<$PrismaModel>
    _max?: NestedEnumBillingCycleFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type TenantModuleCreateWithoutTenantInput = {
    id?: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    module: ModuleCreateNestedOneWithoutTenantsInput
  }

  export type TenantModuleUncheckedCreateWithoutTenantInput = {
    id?: string
    moduleId: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleCreateOrConnectWithoutTenantInput = {
    where: TenantModuleWhereUniqueInput
    create: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput>
  }

  export type TenantModuleCreateManyTenantInputEnvelope = {
    data: TenantModuleCreateManyTenantInput | TenantModuleCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type SystemPaymentCreateWithoutTenantInput = {
    id?: string
    amount: Decimal | DecimalJsLike | number | string
    currency?: string
    method: string
    status: string
    reference: string
    customerEmail: string
    customerName: string
    description?: string | null
    createdAt?: Date | string
  }

  export type SystemPaymentUncheckedCreateWithoutTenantInput = {
    id?: string
    amount: Decimal | DecimalJsLike | number | string
    currency?: string
    method: string
    status: string
    reference: string
    customerEmail: string
    customerName: string
    description?: string | null
    createdAt?: Date | string
  }

  export type SystemPaymentCreateOrConnectWithoutTenantInput = {
    where: SystemPaymentWhereUniqueInput
    create: XOR<SystemPaymentCreateWithoutTenantInput, SystemPaymentUncheckedCreateWithoutTenantInput>
  }

  export type SystemPaymentCreateManyTenantInputEnvelope = {
    data: SystemPaymentCreateManyTenantInput | SystemPaymentCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type SubscriptionCreateWithoutTenantInput = {
    id?: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    plan: PlanCreateNestedOneWithoutSubscriptionsInput
    usages?: TenantUsageCreateNestedManyWithoutSubscriptionInput
  }

  export type SubscriptionUncheckedCreateWithoutTenantInput = {
    id?: string
    planId: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    usages?: TenantUsageUncheckedCreateNestedManyWithoutSubscriptionInput
  }

  export type SubscriptionCreateOrConnectWithoutTenantInput = {
    where: SubscriptionWhereUniqueInput
    create: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput>
  }

  export type SubscriptionCreateManyTenantInputEnvelope = {
    data: SubscriptionCreateManyTenantInput | SubscriptionCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantUsageCreateWithoutTenantInput = {
    id?: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    subscription: SubscriptionCreateNestedOneWithoutUsagesInput
  }

  export type TenantUsageUncheckedCreateWithoutTenantInput = {
    id?: string
    subscriptionId: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUsageCreateOrConnectWithoutTenantInput = {
    where: TenantUsageWhereUniqueInput
    create: XOR<TenantUsageCreateWithoutTenantInput, TenantUsageUncheckedCreateWithoutTenantInput>
  }

  export type TenantUsageCreateManyTenantInputEnvelope = {
    data: TenantUsageCreateManyTenantInput | TenantUsageCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type TenantModuleUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantModuleWhereUniqueInput
    update: XOR<TenantModuleUpdateWithoutTenantInput, TenantModuleUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantModuleCreateWithoutTenantInput, TenantModuleUncheckedCreateWithoutTenantInput>
  }

  export type TenantModuleUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantModuleWhereUniqueInput
    data: XOR<TenantModuleUpdateWithoutTenantInput, TenantModuleUncheckedUpdateWithoutTenantInput>
  }

  export type TenantModuleUpdateManyWithWhereWithoutTenantInput = {
    where: TenantModuleScalarWhereInput
    data: XOR<TenantModuleUpdateManyMutationInput, TenantModuleUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantModuleScalarWhereInput = {
    AND?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
    OR?: TenantModuleScalarWhereInput[]
    NOT?: TenantModuleScalarWhereInput | TenantModuleScalarWhereInput[]
    id?: StringFilter<"TenantModule"> | string
    tenantId?: StringFilter<"TenantModule"> | string
    moduleId?: StringFilter<"TenantModule"> | string
    isEnabled?: BoolFilter<"TenantModule"> | boolean
    validUntil?: DateTimeNullableFilter<"TenantModule"> | Date | string | null
    createdAt?: DateTimeFilter<"TenantModule"> | Date | string
    updatedAt?: DateTimeFilter<"TenantModule"> | Date | string
  }

  export type SystemPaymentUpsertWithWhereUniqueWithoutTenantInput = {
    where: SystemPaymentWhereUniqueInput
    update: XOR<SystemPaymentUpdateWithoutTenantInput, SystemPaymentUncheckedUpdateWithoutTenantInput>
    create: XOR<SystemPaymentCreateWithoutTenantInput, SystemPaymentUncheckedCreateWithoutTenantInput>
  }

  export type SystemPaymentUpdateWithWhereUniqueWithoutTenantInput = {
    where: SystemPaymentWhereUniqueInput
    data: XOR<SystemPaymentUpdateWithoutTenantInput, SystemPaymentUncheckedUpdateWithoutTenantInput>
  }

  export type SystemPaymentUpdateManyWithWhereWithoutTenantInput = {
    where: SystemPaymentScalarWhereInput
    data: XOR<SystemPaymentUpdateManyMutationInput, SystemPaymentUncheckedUpdateManyWithoutTenantInput>
  }

  export type SystemPaymentScalarWhereInput = {
    AND?: SystemPaymentScalarWhereInput | SystemPaymentScalarWhereInput[]
    OR?: SystemPaymentScalarWhereInput[]
    NOT?: SystemPaymentScalarWhereInput | SystemPaymentScalarWhereInput[]
    id?: StringFilter<"SystemPayment"> | string
    tenantId?: StringNullableFilter<"SystemPayment"> | string | null
    amount?: DecimalFilter<"SystemPayment"> | Decimal | DecimalJsLike | number | string
    currency?: StringFilter<"SystemPayment"> | string
    method?: StringFilter<"SystemPayment"> | string
    status?: StringFilter<"SystemPayment"> | string
    reference?: StringFilter<"SystemPayment"> | string
    customerEmail?: StringFilter<"SystemPayment"> | string
    customerName?: StringFilter<"SystemPayment"> | string
    description?: StringNullableFilter<"SystemPayment"> | string | null
    createdAt?: DateTimeFilter<"SystemPayment"> | Date | string
  }

  export type SubscriptionUpsertWithWhereUniqueWithoutTenantInput = {
    where: SubscriptionWhereUniqueInput
    update: XOR<SubscriptionUpdateWithoutTenantInput, SubscriptionUncheckedUpdateWithoutTenantInput>
    create: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput>
  }

  export type SubscriptionUpdateWithWhereUniqueWithoutTenantInput = {
    where: SubscriptionWhereUniqueInput
    data: XOR<SubscriptionUpdateWithoutTenantInput, SubscriptionUncheckedUpdateWithoutTenantInput>
  }

  export type SubscriptionUpdateManyWithWhereWithoutTenantInput = {
    where: SubscriptionScalarWhereInput
    data: XOR<SubscriptionUpdateManyMutationInput, SubscriptionUncheckedUpdateManyWithoutTenantInput>
  }

  export type SubscriptionScalarWhereInput = {
    AND?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
    OR?: SubscriptionScalarWhereInput[]
    NOT?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
    id?: StringFilter<"Subscription"> | string
    tenantId?: StringFilter<"Subscription"> | string
    planId?: StringFilter<"Subscription"> | string
    status?: StringFilter<"Subscription"> | string
    startDate?: DateTimeFilter<"Subscription"> | Date | string
    endDate?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    signedToken?: StringNullableFilter<"Subscription"> | string | null
    autoRenew?: BoolFilter<"Subscription"> | boolean
    createdAt?: DateTimeFilter<"Subscription"> | Date | string
    updatedAt?: DateTimeFilter<"Subscription"> | Date | string
  }

  export type TenantUsageUpsertWithWhereUniqueWithoutTenantInput = {
    where: TenantUsageWhereUniqueInput
    update: XOR<TenantUsageUpdateWithoutTenantInput, TenantUsageUncheckedUpdateWithoutTenantInput>
    create: XOR<TenantUsageCreateWithoutTenantInput, TenantUsageUncheckedCreateWithoutTenantInput>
  }

  export type TenantUsageUpdateWithWhereUniqueWithoutTenantInput = {
    where: TenantUsageWhereUniqueInput
    data: XOR<TenantUsageUpdateWithoutTenantInput, TenantUsageUncheckedUpdateWithoutTenantInput>
  }

  export type TenantUsageUpdateManyWithWhereWithoutTenantInput = {
    where: TenantUsageScalarWhereInput
    data: XOR<TenantUsageUpdateManyMutationInput, TenantUsageUncheckedUpdateManyWithoutTenantInput>
  }

  export type TenantUsageScalarWhereInput = {
    AND?: TenantUsageScalarWhereInput | TenantUsageScalarWhereInput[]
    OR?: TenantUsageScalarWhereInput[]
    NOT?: TenantUsageScalarWhereInput | TenantUsageScalarWhereInput[]
    id?: StringFilter<"TenantUsage"> | string
    tenantId?: StringFilter<"TenantUsage"> | string
    subscriptionId?: StringFilter<"TenantUsage"> | string
    date?: DateTimeFilter<"TenantUsage"> | Date | string
    activeUsers?: IntFilter<"TenantUsage"> | number
    activePatients?: IntFilter<"TenantUsage"> | number
    storageUsedMb?: DecimalFilter<"TenantUsage"> | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFilter<"TenantUsage"> | number
    createdAt?: DateTimeFilter<"TenantUsage"> | Date | string
    updatedAt?: DateTimeFilter<"TenantUsage"> | Date | string
  }

  export type TenantModuleCreateWithoutModuleInput = {
    id?: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutEntitlementsInput
  }

  export type TenantModuleUncheckedCreateWithoutModuleInput = {
    id?: string
    tenantId: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleCreateOrConnectWithoutModuleInput = {
    where: TenantModuleWhereUniqueInput
    create: XOR<TenantModuleCreateWithoutModuleInput, TenantModuleUncheckedCreateWithoutModuleInput>
  }

  export type TenantModuleCreateManyModuleInputEnvelope = {
    data: TenantModuleCreateManyModuleInput | TenantModuleCreateManyModuleInput[]
    skipDuplicates?: boolean
  }

  export type TenantModuleUpsertWithWhereUniqueWithoutModuleInput = {
    where: TenantModuleWhereUniqueInput
    update: XOR<TenantModuleUpdateWithoutModuleInput, TenantModuleUncheckedUpdateWithoutModuleInput>
    create: XOR<TenantModuleCreateWithoutModuleInput, TenantModuleUncheckedCreateWithoutModuleInput>
  }

  export type TenantModuleUpdateWithWhereUniqueWithoutModuleInput = {
    where: TenantModuleWhereUniqueInput
    data: XOR<TenantModuleUpdateWithoutModuleInput, TenantModuleUncheckedUpdateWithoutModuleInput>
  }

  export type TenantModuleUpdateManyWithWhereWithoutModuleInput = {
    where: TenantModuleScalarWhereInput
    data: XOR<TenantModuleUpdateManyMutationInput, TenantModuleUncheckedUpdateManyWithoutModuleInput>
  }

  export type TenantCreateWithoutEntitlementsInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    payments?: SystemPaymentCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
    usages?: TenantUsageCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutEntitlementsInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    payments?: SystemPaymentUncheckedCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
    usages?: TenantUsageUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutEntitlementsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutEntitlementsInput, TenantUncheckedCreateWithoutEntitlementsInput>
  }

  export type ModuleCreateWithoutTenantsInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    basePrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModuleUncheckedCreateWithoutTenantsInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    basePrice?: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModuleCreateOrConnectWithoutTenantsInput = {
    where: ModuleWhereUniqueInput
    create: XOR<ModuleCreateWithoutTenantsInput, ModuleUncheckedCreateWithoutTenantsInput>
  }

  export type TenantUpsertWithoutEntitlementsInput = {
    update: XOR<TenantUpdateWithoutEntitlementsInput, TenantUncheckedUpdateWithoutEntitlementsInput>
    create: XOR<TenantCreateWithoutEntitlementsInput, TenantUncheckedCreateWithoutEntitlementsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutEntitlementsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutEntitlementsInput, TenantUncheckedUpdateWithoutEntitlementsInput>
  }

  export type TenantUpdateWithoutEntitlementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    payments?: SystemPaymentUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
    usages?: TenantUsageUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutEntitlementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    payments?: SystemPaymentUncheckedUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
    usages?: TenantUsageUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type ModuleUpsertWithoutTenantsInput = {
    update: XOR<ModuleUpdateWithoutTenantsInput, ModuleUncheckedUpdateWithoutTenantsInput>
    create: XOR<ModuleCreateWithoutTenantsInput, ModuleUncheckedCreateWithoutTenantsInput>
    where?: ModuleWhereInput
  }

  export type ModuleUpdateToOneWithWhereWithoutTenantsInput = {
    where?: ModuleWhereInput
    data: XOR<ModuleUpdateWithoutTenantsInput, ModuleUncheckedUpdateWithoutTenantsInput>
  }

  export type ModuleUpdateWithoutTenantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModuleUncheckedUpdateWithoutTenantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateWithoutPaymentsInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    entitlements?: TenantModuleCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
    usages?: TenantUsageCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutPaymentsInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    entitlements?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
    usages?: TenantUsageUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutPaymentsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutPaymentsInput, TenantUncheckedCreateWithoutPaymentsInput>
  }

  export type TenantUpsertWithoutPaymentsInput = {
    update: XOR<TenantUpdateWithoutPaymentsInput, TenantUncheckedUpdateWithoutPaymentsInput>
    create: XOR<TenantCreateWithoutPaymentsInput, TenantUncheckedCreateWithoutPaymentsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutPaymentsInput, TenantUncheckedUpdateWithoutPaymentsInput>
  }

  export type TenantUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entitlements?: TenantModuleUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
    usages?: TenantUsageUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutPaymentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entitlements?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
    usages?: TenantUsageUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type SubscriptionCreateWithoutPlanInput = {
    id?: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutSubscriptionsInput
    usages?: TenantUsageCreateNestedManyWithoutSubscriptionInput
  }

  export type SubscriptionUncheckedCreateWithoutPlanInput = {
    id?: string
    tenantId: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    usages?: TenantUsageUncheckedCreateNestedManyWithoutSubscriptionInput
  }

  export type SubscriptionCreateOrConnectWithoutPlanInput = {
    where: SubscriptionWhereUniqueInput
    create: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput>
  }

  export type SubscriptionCreateManyPlanInputEnvelope = {
    data: SubscriptionCreateManyPlanInput | SubscriptionCreateManyPlanInput[]
    skipDuplicates?: boolean
  }

  export type SubscriptionUpsertWithWhereUniqueWithoutPlanInput = {
    where: SubscriptionWhereUniqueInput
    update: XOR<SubscriptionUpdateWithoutPlanInput, SubscriptionUncheckedUpdateWithoutPlanInput>
    create: XOR<SubscriptionCreateWithoutPlanInput, SubscriptionUncheckedCreateWithoutPlanInput>
  }

  export type SubscriptionUpdateWithWhereUniqueWithoutPlanInput = {
    where: SubscriptionWhereUniqueInput
    data: XOR<SubscriptionUpdateWithoutPlanInput, SubscriptionUncheckedUpdateWithoutPlanInput>
  }

  export type SubscriptionUpdateManyWithWhereWithoutPlanInput = {
    where: SubscriptionScalarWhereInput
    data: XOR<SubscriptionUpdateManyMutationInput, SubscriptionUncheckedUpdateManyWithoutPlanInput>
  }

  export type TenantCreateWithoutSubscriptionsInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    entitlements?: TenantModuleCreateNestedManyWithoutTenantInput
    payments?: SystemPaymentCreateNestedManyWithoutTenantInput
    usages?: TenantUsageCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutSubscriptionsInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    entitlements?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    payments?: SystemPaymentUncheckedCreateNestedManyWithoutTenantInput
    usages?: TenantUsageUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutSubscriptionsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutSubscriptionsInput, TenantUncheckedCreateWithoutSubscriptionsInput>
  }

  export type PlanCreateWithoutSubscriptionsInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    currency?: string
    billingCycle?: $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: number
    maxUsers?: number
    maxBeds?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PlanUncheckedCreateWithoutSubscriptionsInput = {
    id?: string
    name: string
    code: string
    description?: string | null
    price: Decimal | DecimalJsLike | number | string
    currency?: string
    billingCycle?: $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: number
    maxUsers?: number
    maxBeds?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PlanCreateOrConnectWithoutSubscriptionsInput = {
    where: PlanWhereUniqueInput
    create: XOR<PlanCreateWithoutSubscriptionsInput, PlanUncheckedCreateWithoutSubscriptionsInput>
  }

  export type TenantUsageCreateWithoutSubscriptionInput = {
    id?: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutUsagesInput
  }

  export type TenantUsageUncheckedCreateWithoutSubscriptionInput = {
    id?: string
    tenantId: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUsageCreateOrConnectWithoutSubscriptionInput = {
    where: TenantUsageWhereUniqueInput
    create: XOR<TenantUsageCreateWithoutSubscriptionInput, TenantUsageUncheckedCreateWithoutSubscriptionInput>
  }

  export type TenantUsageCreateManySubscriptionInputEnvelope = {
    data: TenantUsageCreateManySubscriptionInput | TenantUsageCreateManySubscriptionInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutSubscriptionsInput = {
    update: XOR<TenantUpdateWithoutSubscriptionsInput, TenantUncheckedUpdateWithoutSubscriptionsInput>
    create: XOR<TenantCreateWithoutSubscriptionsInput, TenantUncheckedCreateWithoutSubscriptionsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutSubscriptionsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutSubscriptionsInput, TenantUncheckedUpdateWithoutSubscriptionsInput>
  }

  export type TenantUpdateWithoutSubscriptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entitlements?: TenantModuleUpdateManyWithoutTenantNestedInput
    payments?: SystemPaymentUpdateManyWithoutTenantNestedInput
    usages?: TenantUsageUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutSubscriptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entitlements?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    payments?: SystemPaymentUncheckedUpdateManyWithoutTenantNestedInput
    usages?: TenantUsageUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type PlanUpsertWithoutSubscriptionsInput = {
    update: XOR<PlanUpdateWithoutSubscriptionsInput, PlanUncheckedUpdateWithoutSubscriptionsInput>
    create: XOR<PlanCreateWithoutSubscriptionsInput, PlanUncheckedCreateWithoutSubscriptionsInput>
    where?: PlanWhereInput
  }

  export type PlanUpdateToOneWithWhereWithoutSubscriptionsInput = {
    where?: PlanWhereInput
    data: XOR<PlanUpdateWithoutSubscriptionsInput, PlanUncheckedUpdateWithoutSubscriptionsInput>
  }

  export type PlanUpdateWithoutSubscriptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    billingCycle?: EnumBillingCycleFieldUpdateOperationsInput | $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: IntFieldUpdateOperationsInput | number
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxBeds?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlanUncheckedUpdateWithoutSubscriptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    billingCycle?: EnumBillingCycleFieldUpdateOperationsInput | $Enums.BillingCycle
    features?: JsonNullValueInput | InputJsonValue
    maxPatients?: IntFieldUpdateOperationsInput | number
    maxUsers?: IntFieldUpdateOperationsInput | number
    maxBeds?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageUpsertWithWhereUniqueWithoutSubscriptionInput = {
    where: TenantUsageWhereUniqueInput
    update: XOR<TenantUsageUpdateWithoutSubscriptionInput, TenantUsageUncheckedUpdateWithoutSubscriptionInput>
    create: XOR<TenantUsageCreateWithoutSubscriptionInput, TenantUsageUncheckedCreateWithoutSubscriptionInput>
  }

  export type TenantUsageUpdateWithWhereUniqueWithoutSubscriptionInput = {
    where: TenantUsageWhereUniqueInput
    data: XOR<TenantUsageUpdateWithoutSubscriptionInput, TenantUsageUncheckedUpdateWithoutSubscriptionInput>
  }

  export type TenantUsageUpdateManyWithWhereWithoutSubscriptionInput = {
    where: TenantUsageScalarWhereInput
    data: XOR<TenantUsageUpdateManyMutationInput, TenantUsageUncheckedUpdateManyWithoutSubscriptionInput>
  }

  export type TenantCreateWithoutUsagesInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    entitlements?: TenantModuleCreateNestedManyWithoutTenantInput
    payments?: SystemPaymentCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutUsagesInput = {
    id?: string
    name: string
    slug: string
    dbUrl: string
    encryptionKeyReference: string
    tier?: $Enums.DeploymentTier
    region: string
    status?: $Enums.TenantStatus
    suspensionReason?: string | null
    suspendedAt?: Date | string | null
    address?: string | null
    logoUrl?: string | null
    primaryColor?: string | null
    secondaryColor?: string | null
    trialEndsAt?: Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: string | null
    sharedSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    entitlements?: TenantModuleUncheckedCreateNestedManyWithoutTenantInput
    payments?: SystemPaymentUncheckedCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutUsagesInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutUsagesInput, TenantUncheckedCreateWithoutUsagesInput>
  }

  export type SubscriptionCreateWithoutUsagesInput = {
    id?: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutSubscriptionsInput
    plan: PlanCreateNestedOneWithoutSubscriptionsInput
  }

  export type SubscriptionUncheckedCreateWithoutUsagesInput = {
    id?: string
    tenantId: string
    planId: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionCreateOrConnectWithoutUsagesInput = {
    where: SubscriptionWhereUniqueInput
    create: XOR<SubscriptionCreateWithoutUsagesInput, SubscriptionUncheckedCreateWithoutUsagesInput>
  }

  export type TenantUpsertWithoutUsagesInput = {
    update: XOR<TenantUpdateWithoutUsagesInput, TenantUncheckedUpdateWithoutUsagesInput>
    create: XOR<TenantCreateWithoutUsagesInput, TenantUncheckedCreateWithoutUsagesInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutUsagesInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutUsagesInput, TenantUncheckedUpdateWithoutUsagesInput>
  }

  export type TenantUpdateWithoutUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entitlements?: TenantModuleUpdateManyWithoutTenantNestedInput
    payments?: SystemPaymentUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    encryptionKeyReference?: StringFieldUpdateOperationsInput | string
    tier?: EnumDeploymentTierFieldUpdateOperationsInput | $Enums.DeploymentTier
    region?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    suspensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    suspendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    logoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    primaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    secondaryColor?: NullableStringFieldUpdateOperationsInput | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    enabledModules?: JsonNullValueInput | InputJsonValue
    publicKeySpki?: NullableStringFieldUpdateOperationsInput | string | null
    sharedSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    entitlements?: TenantModuleUncheckedUpdateManyWithoutTenantNestedInput
    payments?: SystemPaymentUncheckedUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type SubscriptionUpsertWithoutUsagesInput = {
    update: XOR<SubscriptionUpdateWithoutUsagesInput, SubscriptionUncheckedUpdateWithoutUsagesInput>
    create: XOR<SubscriptionCreateWithoutUsagesInput, SubscriptionUncheckedCreateWithoutUsagesInput>
    where?: SubscriptionWhereInput
  }

  export type SubscriptionUpdateToOneWithWhereWithoutUsagesInput = {
    where?: SubscriptionWhereInput
    data: XOR<SubscriptionUpdateWithoutUsagesInput, SubscriptionUncheckedUpdateWithoutUsagesInput>
  }

  export type SubscriptionUpdateWithoutUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutSubscriptionsNestedInput
    plan?: PlanUpdateOneRequiredWithoutSubscriptionsNestedInput
  }

  export type SubscriptionUncheckedUpdateWithoutUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    planId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleCreateManyTenantInput = {
    id?: string
    moduleId: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SystemPaymentCreateManyTenantInput = {
    id?: string
    amount: Decimal | DecimalJsLike | number | string
    currency?: string
    method: string
    status: string
    reference: string
    customerEmail: string
    customerName: string
    description?: string | null
    createdAt?: Date | string
  }

  export type SubscriptionCreateManyTenantInput = {
    id?: string
    planId: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUsageCreateManyTenantInput = {
    id?: string
    subscriptionId: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    module?: ModuleUpdateOneRequiredWithoutTenantsNestedInput
  }

  export type TenantModuleUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemPaymentUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    reference?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemPaymentUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    reference?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemPaymentUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    currency?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    reference?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    plan?: PlanUpdateOneRequiredWithoutSubscriptionsNestedInput
    usages?: TenantUsageUpdateManyWithoutSubscriptionNestedInput
  }

  export type SubscriptionUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    planId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usages?: TenantUsageUncheckedUpdateManyWithoutSubscriptionNestedInput
  }

  export type SubscriptionUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    planId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subscription?: SubscriptionUpdateOneRequiredWithoutUsagesNestedInput
  }

  export type TenantUsageUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    subscriptionId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleCreateManyModuleInput = {
    id?: string
    tenantId: string
    isEnabled?: boolean
    validUntil?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantModuleUpdateWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutEntitlementsNestedInput
  }

  export type TenantModuleUncheckedUpdateWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantModuleUncheckedUpdateManyWithoutModuleInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    isEnabled?: BoolFieldUpdateOperationsInput | boolean
    validUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionCreateManyPlanInput = {
    id?: string
    tenantId: string
    status?: string
    startDate?: Date | string
    endDate?: Date | string | null
    signedToken?: string | null
    autoRenew?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubscriptionUpdateWithoutPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutSubscriptionsNestedInput
    usages?: TenantUsageUpdateManyWithoutSubscriptionNestedInput
  }

  export type SubscriptionUncheckedUpdateWithoutPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usages?: TenantUsageUncheckedUpdateManyWithoutSubscriptionNestedInput
  }

  export type SubscriptionUncheckedUpdateManyWithoutPlanInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    signedToken?: NullableStringFieldUpdateOperationsInput | string | null
    autoRenew?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageCreateManySubscriptionInput = {
    id?: string
    tenantId: string
    date: Date | string
    activeUsers?: number
    activePatients?: number
    storageUsedMb?: Decimal | DecimalJsLike | number | string
    apiCallsCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUsageUpdateWithoutSubscriptionInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsagesNestedInput
  }

  export type TenantUsageUncheckedUpdateWithoutSubscriptionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUsageUncheckedUpdateManyWithoutSubscriptionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    activeUsers?: IntFieldUpdateOperationsInput | number
    activePatients?: IntFieldUpdateOperationsInput | number
    storageUsedMb?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    apiCallsCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TenantCountOutputTypeDefaultArgs instead
     */
    export type TenantCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ModuleCountOutputTypeDefaultArgs instead
     */
    export type ModuleCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ModuleCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlanCountOutputTypeDefaultArgs instead
     */
    export type PlanCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlanCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SubscriptionCountOutputTypeDefaultArgs instead
     */
    export type SubscriptionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SubscriptionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TenantDefaultArgs instead
     */
    export type TenantArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ModuleDefaultArgs instead
     */
    export type ModuleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ModuleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TenantModuleDefaultArgs instead
     */
    export type TenantModuleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantModuleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SystemAdminDefaultArgs instead
     */
    export type SystemAdminArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SystemAdminDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GlobalSettingsDefaultArgs instead
     */
    export type GlobalSettingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GlobalSettingsDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SystemPaymentDefaultArgs instead
     */
    export type SystemPaymentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SystemPaymentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlanDefaultArgs instead
     */
    export type PlanArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlanDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SubscriptionDefaultArgs instead
     */
    export type SubscriptionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SubscriptionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PatientIndexDefaultArgs instead
     */
    export type PatientIndexArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PatientIndexDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TenantUsageDefaultArgs instead
     */
    export type TenantUsageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantUsageDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}