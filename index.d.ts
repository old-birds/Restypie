/// <reference types="node" />
/// <reference types="winston" />

import { Url } from 'url';
import { Writable } from 'stream';
import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'event';
import * as winston from 'winston';

declare module Restypie {
  type Host = string | Url;
  type HandlerFunction = Function | GeneratorFunction;
  type Request = OpenPartial<IncomingMessage>;
  type Response = OpenPartial<ServerResponse>;
  type Code = string | number;
  type NavLinks = { prev: string, next: string };
  type ExitFunction = (bundle: Bundle) => Promise<any> | any;
  interface Meta extends NavLinks { limit?: number, offset?: number, total?: number }
  type SchemaType = string | typeof Fields.AbstractField | typeof String | typeof Number | typeof Boolean | typeof Date;
  type OpenPartial<T> = { [key: string]: any; } & Partial<T>;
  type Options = string[];
  type Populate = string[];
  type Sort = string[];
  type Select = string[];
  type Filters = { [key: string]: any };
  type Headers = { [name: string]: string };
  enum ReturnTypes {
    BODY,
    DATA,
    META
  }


  /**************************************************************************************************************************************
   Index
  **************************************************************************************************************************************/

  export const VERSION: string;
  export const TEST_ENV: string;
  export const SUDO_HEADER_NAME: string;
  export const OPERATOR_SEPARATOR: string;
  export const EQUALITY_OPERATOR: string;
  export const LIST_SEPARATOR: string;
  export const LIST_SEPARATOR_REG: RegExp;
  export const RESERVED_WORDS: string[];

  export enum RouterTypes {
    KOA_ROUTER,
    EXPRESS
  }

  export enum QueryOptions {
    NO_COUNT,
    INCLUDE_SCORE,
    SCORE_ONLY
  }

  export enum EventTypes {
    ERROR,
    WARN
  }

  export function isSudo(headers: { [header: string]: string }): boolean;
  export function getSudoHeader(): { [sudoHeaderName: string]: string | number };
  export function getSudoSignature(): string | number;
  export function isSupportedRouterType(type: string): boolean;
  export function assertSupportedRouterType(type: string): void;
  export function listToArray(str: string): string[];
  export function arrayToList(arr: any[]): string;
  export function stringify(options?: {
    sort?: string[];
    populate?: string[];
    select?: string[];
    filters?: { [key: string]: any };
    options?: string[];
    limit?: number;
    offset?: number;
  }): { [key: string]: any };
  export function javascriptToString(value: any): any;
  export function mergeValuesForOperator(operator: string, ...values: any[]): { [operator: string]: any };
  export function dedupeFilters(filters: { [key: string]: any }): { [key: string]: any };
  export function mergeFilters(left: { [key: string]: any}, right: { [key: string]: any}): { [key: string]: any};
  export function mergeFiltersForKey(left: { [operator: string]: any }, right: { [operator: string]: any }): { [key: string]: any };



  /**************************************************************************************************************************************
   API
  **************************************************************************************************************************************/

  export class API {
    public readonly path: string;
    public readonly router: any;
    public readonly isLaunched: boolean;
    public readonly resources: Resources.AbstractCoreResource[];
    public readonly host: string;
    public readonly routerType: RouterTypes;
    public readonly routes: Route[];

    public constructor(options?: {
      routerType?: RouterTypes,
      router?: any;
      host?: Host;
      path?: string;
      routes?: (typeof Route)[];
    });

    public launch(router?: any, host?: Host): API;
    public reset(): API;
    public setPath(path: string): API;
    public registerResource(name: string, resource: typeof Resources.AbstractCoreResource): API;
    public registerResources(resources: { [name: string]: typeof Resources.AbstractCoreResource }): API;
    protected _setRouterType(routerType: RouterTypes): API;
    protected _setHost(host: Host): void;
    protected _registerRoute(definition: { routerType?: RouterTypes, method: string, path: string, handlers: Function[] });
    protected _throwIfLaunched(): void;
  }



  /**************************************************************************************************************************************
   Route
  **************************************************************************************************************************************/
  
  export class Route {
    public readonly path: string;
    public readonly method: Methods.METHODS;
    public readonly handler: HandlerFunction;
    public readonly routerType: RouterTypes;
    protected readonly _handlers: HandlerFunction[];

    public constructor(context?: {
      routerType?: RouterTypes;
      [key: string]: any;
    });

    protected createBundleHandler(): HandlerFunction;
    protected _setRouterType(routerType: RouterTypes): void;
  }



  /**************************************************************************************************************************************
   Client
  **************************************************************************************************************************************/
  
  export class Client<T> {
    public readonly url: string;
    public readonly defaultHeaders: Headers;
    public readonly host: string;
    public readonly path: string;
    public readonly version: string;

    public constructor(options?: {
      host: string;
      path: string;
      version?: string;
      defaultHeaders?: { [name: string]: string };
    });

    public create(props: T | T[] | null, params?: {
      options?: Options,
      headers?: Headers
    }): Promise<T | T[]>;

    public find(filters?: Filters, params?: {
      headers?: Headers;
      options?: Options;
      select?: Select;
      limit?: number;
      offset?: number;
      populate?: Populate;
      sort?: Sort;
      returnType?: ReturnTypes;
    }): Promise<T[]>;

    public findById(id: any, params?: {
      headers?: Headers;
      options?: Options;
      select?: Select;
      populate?: Populate;
    }): Promise<T>;

    public findOne(filters?: Filters, params?: {
      headers?: Headers;
      options?: Options;
      select?: Select;
      populate?: Populate;
      sort?: Sort;
    }): Promise<T>;

    public deleteByid(id: any, params?: {
      headers?: Headers;
      options?: Options;
    }): Promise<void>;

    public updateById(id: any, updates: OpenPartial<T>, params?: {
      headers?: Headers;
      options?: Options;
    }): Promise<void>;

    public update(filters: Filters, updates: OpenPartial<T>, params?: {
      headers?: Headers;
      options?: Options;
    }): Promise<void>;

    public query(method: Methods.METHODS, path: string, filters?: Filters, params?: {
      headers?: Headers;
      options?: Options;
      select?: Select;
      limit?: number;
      offset?: number;
      populate?: Populate;
      sort?: Sort;
    }): Promise<any>;

    public count(filters?: Filters, params?: {
      headers?: Headers;
      options?: Options;
    }): Promise<number>;

    public getQueryScore(filters?: Filters, params?: {
      headers?: Headers;
      options?: Options;
      select?: Select;
      limit?: number;
      offset?: number;
      populate?: Populate;
      sort?: Sort;
    }): Promise<number>;

    public static extractReturn(body: any, returnType: ReturnTypes): any;

    public static readonly ReturnTypes: typeof ReturnTypes;
  }



  /**************************************************************************************************************************************
   Operators
  **************************************************************************************************************************************/
  
  export module Operators {
    export abstract class AbstractOperator {
      public static readonly filteringWeight: number;
      public static readonly normalizedFilteringWeight: number;
      public static readonly stringName: string;

      public static parse(value: any): any;
    }

    export abstract class AbstractListOperator extends AbstractOperator {
      public static readonly SEPARATOR: string;
    }

    export class Eq extends AbstractOperator {}
    export class Gt extends AbstractOperator {}
    export class Gte extends AbstractOperator {}
    export class In extends AbstractListOperator {}
    export class Lt extends AbstractOperator {}
    export class Lte extends AbstractOperator {}
    export class Ne extends AbstractOperator {}
    export class Nin extends AbstractListOperator {}
  }



  /**************************************************************************************************************************************
   RestErrors
  **************************************************************************************************************************************/
  
  export module RestErrors {
    export function toRestError(err: Error | AbstractRestError): AbstractRestError;
    export function fromStatusCode(statusCode: number, message: string, meta?: { [key: string]: any }): AbstractRestError;;

    export class AbstractRestError extends Error {
      public readonly name: string;
      public readonly statusCode: number;
      public constructor(message: string, meta?: { [key: string]: any });
    }
    export class InternalServerError extends AbstractRestError {};
    export class BadRequest extends AbstractRestError {};
    export class NotFound extends AbstractRestError {};
    export class Forbidden extends AbstractRestError {};
    export class NotImplemented extends AbstractRestError {};
    export class UnsupportedMediaType extends AbstractRestError {};
    export class NotAcceptable extends AbstractRestError {};
    export class Unauthorized extends AbstractRestError {};
    export class Conflict extends AbstractRestError {};
    export class GatewayTimeOut extends AbstractRestError {};
    export class ServiceUnavailable extends AbstractRestError {};
  }



  /**************************************************************************************************************************************
   BasicRoutes
  **************************************************************************************************************************************/
  
  export module BasicRoutes {
    export class DeleteSingleRoute extends Route {}
    export class GetManyRoute extends Route {}
    export class GetSingleRoute extends Route {}
    export class OptionsRoute extends Route {}
    export class PatchManyRoute extends Route {}
    export class PatchSingleRoute extends Route {}
    export class PostRoute extends Route { public readonly allowsMany: boolean; }
    export class PutSingleRoute extends Route {}
  }



  /**************************************************************************************************************************************
   Fields
  **************************************************************************************************************************************/
  
  export module Fields {
    export interface IFileObject {
      name: string;
      mimeType?: string;
      encoding?: string;
      size: number;
      [key: string]: any;
    }

    export interface IAbstractFieldConstructorOptions {
      path?: string;
      isRequired?: boolean;
      isWritable?: boolean;
      isFilterable?: boolean;
      isReadable?: boolean;
      isWritableOnce?: boolean;
      isPrimaryKey?: boolean;
      isPopulable?: boolean;
      isOneToOneRelation?: boolean;
      default?: any;
      through?: Resources.AbstractCoreResource;
      throughKey?: string;
      otherThroughKey?: string;
      to?: Resources.AbstractCoreResource;
    }

    export interface IAbstractNumberFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      min?: number;
      max?: number;
      range?: [number, number]
    }

    export interface IDateFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      ISOFormat?: RegExp;
      min?: Date | number;
      max?: Date | number;
    }

    export interface IFileFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      maxSize?: number;
    }

    export interface IIntegerFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      enum?: number[];
    }

    export interface IStringFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      lengthRange?: [number, number];
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      enum?: string[];
    }

    export function match(type: SchemaType): typeof AbstractField;

    export abstract class AbstractField {
      public readonly isRelation: boolean;
      public readonly isManyRelation: boolean;
      public readonly hasTo: boolean;
      public readonly hasThrough: boolean;
      public readonly supportedOperators: (typeof Operators.AbstractOperator)[];
      public readonly optionsProperties: string[];
      public readonly fromKey: string;
      public readonly toKey: string;
      public readonly isDynamicRelation: boolean;
      public readonly filteringWeight: number;
      public readonly normalizedFilteringWeight: number;
      public readonly displayType: string;
      public hasDefault: boolean;
      public path: string;
      public key: string;
      public isRequired: boolean;
      public isWritable: boolean;
      public isFilterable: boolean;
      public isReadable: boolean;
      public isWritableOnce: boolean;
      public isPrimaryKey: boolean;
      public isPopulable: boolean;
      public isOneToOneRelation: boolean;
      public default: any;
      public through: Resources.AbstractCoreResource;
      public throughKey: string;
      public otherThroughKey: string;
      public to: Resources.AbstractCoreResource;
      protected _hasTo: boolean;
      protected _to: Resources.AbstractCoreResource;
      protected _toKey: string;
      protected _fromKey: string;
      protected _isDynamicRelation: boolean;
      protected _hasThrough: boolean;
      protected _filteringWeight: boolean;

      public constructor(key: string, options?: IAbstractFieldConstructorOptions);

      public setFilteringWeight(weight: number): void;
      public isPresent(value: any): boolean;
      public validatePresence(value: any): boolean;
      public hydrate(value: any): any;
      public dehydrate(value: any): any;
      public validate(value: any): any;
      public getToKey(): string;
      public getToResource(): Resources.AbstractCoreResource;
      public getThroughResource(): Resources.AbstractCoreResource;
      public getOperatorByName(operatorName: string): typeof Operators.AbstractOperator;
    }

    export abstract class AbstractNumberField extends AbstractField {
      public min: number;
      public max: number;
      public constructor(key: string, options?: IAbstractNumberFieldConstructorOptions);
    }

    export abstract class AbstractRelationField extends AbstractField {}

    export class AnyField extends AbstractField {}
    export class BooleanField extends AbstractField {}
    export class DateField extends AbstractField {
      public constructor(key: string, options?: IDateFieldConstructorOptions);
      public static readonly DEFAULT_ISO_FORMAT: RegExp;
      public static readonly MIN_TIMESTAMP: number;
      public static readonly MAX_TIMESTAMP: number;
    }
    export class FileField extends AbstractField {
      public constructor(key: string, options?: IFileFieldConstructorOptions);
      public buildFilePath(file: IFileObject): string;
      public writeStream(file: IFileObject): Writable;
      public unlink(file: IFileObject): Promise<void>;
      public validateSize(file: IFileObject): void;
    }
    export class FloatField extends AbstractNumberField {}
    export class IntegerField extends AbstractNumberField {
      public enum: number[];
      public constructor(key: string, options?: IIntegerFieldConstructorOptions);
    }
    export class StringField extends AbstractField {
      public pattern: RegExp;
      public minLength: number;
      public maxLength: number;
      public enum: string[];
      public constructor(key: string, options?: IStringFieldConstructorOptions);
    }
    export class ToManyField extends AbstractRelationField {}
    export class ToOneField extends AbstractRelationField {}
  }



  /**************************************************************************************************************************************
   Methods
  **************************************************************************************************************************************/
  
  export module Methods {
    export enum METHODS {
      GET,
      POST,
      PUT,
      PATCH,
      DELETE,
      OPTIONS,
      HEAD
    }

    export const GET: string;
    export const POST: string;
    export const PUT: string;
    export const PATCH: string;
    export const DELETE: string;
    export const OPTIONS: string;
    export const HEAD: string;

    export function isSupportedMethod(method: string): boolean;
  }



  /**************************************************************************************************************************************
   Serializers
  **************************************************************************************************************************************/
  
  export module Serializers {
    export abstract class AbstractSerializer {
      private constructor();

      static serialize(content: any): Promise<any>;
      static readonly mimeType: string;
      static readonly aliases: string[];
    }

    export class JSONSerializer extends AbstractSerializer {
      static serialize(content: string | { [key: string]: any }): Promise<{ [key: string]: any }>;
    }
  }



  /**************************************************************************************************************************************
   Bundle
  **************************************************************************************************************************************/
  
  class TaskPipeline {
    public readonly bundle: Bundle;
    public readonly exit: ExitFunction;
    public readonly context: any;
    protected _tasks: Function[];
    protected _context: any;
    protected _exit: () => Promise<any> | any;
    protected _ran: boolean;
    protected _isRunning: boolean;
    protected _bundle: Bundle;

    public constructor(options?: {
      exit: ExitFunction,
      bundle: Bundle,
      context?: any
    });

    public add(task: Function): TaskPipeline;
    public run(): Promise<any>;
    public stop(): Promise<Symbol>;
    protected _getNext(): Function | null;
    protected _run(): Promise<any>;
  }

  export class Bundle {
    public readonly req: Request;
    public readonly res: Response;
    public readonly url: string;
    public readonly body: any;
    public readonly query: { [key: string]: any };
    public readonly params: Filters;
    public readonly headers: Headers;
    public readonly populate: Populate;
    public readonly options: Options;
    public readonly statusCode: number;
    public readonly limit: number;
    public readonly offset: number;
    public readonly isError: boolean;
    public readonly meta: OpenPartial<Meta>;
    public readonly data: any | any[];
    public readonly code: Code;
    public readonly format: string;
    public readonly filters: Filters;
    public readonly flatFilters: Filters;
    public readonly nestedFilters: Filters;
    public readonly select: Select;
    public readonly sort: Sort;
    public readonly safeReqHeaders: Headers;
    public readonly isRead: boolean;
    public readonly isUpdate: boolean;
    public readonly isWrite: boolean;
    public readonly isDelete: boolean;
    public readonly hasNestedFilters: boolean;
    public readonly hasFilters: boolean;
    public readonly isSudo: boolean;
    public readonly shouldCalculateQueryScore: boolean;
    public readonly shouldValidateQueryScore: boolean;
    public readonly payload: any;

    public constructor(options?: {
      req: Request,
      res: Response,
      params?: Filters,
      url?: string
    });

    public next(err?: Error): Promise<Bundle>;
    public setData(data: any): Bundle;
    public setPayload(payload: any): Bundle;
    public assignToPayload(obj: {}): Bundle;
    public assignToHeaders(headers: Headers): Bundle;
    public resetPayload(): Bundle;
    public emptyPayload(): Bundle;
    public assignToQuery(obj: Filters): Bundle;
    public setStatusCode(statusCode: number): Bundle;
    public setQuery(query: Filters): Bundle;
    public setOptions(options: Options): Bundle;
    public hasOption(option: string): boolean;
    public setMessage(message: string): Bundle;
    public setCode(code: Code): Bundle;
    public setError(err: Error): Bundle;
    public assignToMeta(key: string, value: any): Bundle;
    public setMeta(meta: OpenPartial<Meta>): Bundle;
    public setPopulate(fields: Populate): Bundle;
    public setSelect(fields: Select): Bundle;
    public setLimit(value: number): Bundle;
    public setOffset(value: number): Bundle;
    public setFormat(format: string): Bundle;
    public setFilters(filters: Filters): Bundle;
    public mergeToFilters(filters: Filters): Bundle;
    public setNestedFilters(filters: Filters): Bundle;
    public setBody(body: any): Bundle;
    public setSort(fields: string[]): Bundle;
    public makeSudo(value: boolean): void;
    public getNavLinks(total: number): NavLinks;
    public createPipeline(exit: ExitFunction, context?: any): TaskPipeline;
    protected _getNavLink(limit: number, offset: number): string;    
  }



  /**************************************************************************************************************************************
   QueryScore
  **************************************************************************************************************************************/

  interface IScore {
    total: number;
    maxLevel: number;
    filters: Filters;
  }
  
  class Score {

  }

  export class QueryScore {
    public constructor(fields: Fields.AbstractField[], bundle: Bundle);

    public compute(): Promise<IScore>;
    protected _computeOwn(originalFilters: Filters): IScore;
    protected _computeNested(originalFilters: Filters): Promise<IScore> ;
    protected _setLevels(score: IScore): void;
    protected _penalizeDeepNesting(score: IScore);
    protected _getFieldByPath(path: string): Fields.AbstractField;
    protected _formatFilters(originalFilters: Filters): any;
    static compute(fields: Fields.AbstractField[], bundle: Bundle): Promise<IScore>;
    public static Score: typeof Score;
  }


  
  /**************************************************************************************************************************************
   Url
  **************************************************************************************************************************************/
  
  export module Url {
    export function join(...parts: string[]): string;
    export function ensureHTTPProtocol(url: string, useHTTPS?: boolean): string;
  }



  /**************************************************************************************************************************************
   Codes
  **************************************************************************************************************************************/
  
  export module Codes {
    export function isErrorCode(code: number): boolean;
    export const Continue: number;
    export const SwitchingProtocols: number;
    export const OK: number;
    export const Created: number;
    export const Accepted: number;
    export const NonAuthoritativeInformation: number;
    export const NoContent: number;
    export const ResetContent: number;
    export const PartialContent: number;
    export const MultipleChoices: number;
    export const MovedPermanently: number;
    export const MovedTemporarily: number;
    export const SeeOther: number;
    export const NotModified: number;
    export const UseProxy: number;
    export const BadRequest: number;
    export const Unauthorized: number;
    export const PaymentRequired: number;
    export const Forbidden: number;
    export const NotFound: number;
    export const MethodNotAllowed: number;
    export const NotAcceptable: number;
    export const ProxyAuthenticationRequired: number;
    export const RequestTimeOut: number;
    export const Conflict: number;
    export const Gone: number;
    export const LengthRequired: number;
    export const PreconditionFailed: number;
    export const RequestEntityTooLarge: number;
    export const RequestURITooLong: number;
    export const UnsupportedMediaType: number;
    export const RequestRangeUnsatisfiable: number;
    export const ExpectationFailed: number;
    export const InternalServerError: number;
    export const NotImplemented: number;
    export const BadGateway: number;
    export const ServiceUnavailable: number;
    export const GatewayTimeOut: number;
    export const HTTPVersionNotSupported: number;
    export module Codes {
      export const Continue: number;
      export const SwitchingProtocols: number;
      export const OK: number;
      export const Created: number;
      export const Accepted: number;
      export const NonAuthoritativeInformation: number;
      export const NoContent: number;
      export const ResetContent: number;
      export const PartialContent: number;
      export const MultipleChoices: number;
      export const MovedPermanently: number;
      export const MovedTemporarily: number;
      export const SeeOther: number;
      export const NotModified: number;
      export const UseProxy: number;
      export const BadRequest: number;
      export const Unauthorized: number;
      export const PaymentRequired: number;
      export const Forbidden: number;
      export const NotFound: number;
      export const MethodNotAllowed: number;
      export const NotAcceptable: number;
      export const ProxyAuthenticationRequired: number;
      export const RequestTimeOut: number;
      export const Conflict: number;
      export const Gone: number;
      export const LengthRequired: number;
      export const PreconditionFailed: number;
      export const RequestEntityTooLarge: number;
      export const RequestURITooLong: number;
      export const UnsupportedMediaType: number;
      export const RequestRangeUnsatisfiable: number;
      export const ExpectationFailed: number;
      export const InternalServerError: number;
      export const NotImplemented: number;
      export const BadGateway: number;
      export const ServiceUnavailable: number;
      export const GatewayTimeOut: number;
      export const HTTPVersionNotSupported: number;
    }
  }



  /**************************************************************************************************************************************
   EventEmitter
  **************************************************************************************************************************************/
  
  export const EventEmitter: EventEmitter;



  /**************************************************************************************************************************************
   Logger
  **************************************************************************************************************************************/
  
  export const Logger: winston.Winston;



  /**************************************************************************************************************************************
   Utils
  **************************************************************************************************************************************/
  
  export module Utils {
    export function isSubclassOf(child: typeof Object, parent: typeof Object, shouldThrow: boolean = false): boolean;
    export function assertIsSubclassOf(child: typeof Object, parent: typeof Object): void;
    export function isInstanceOf(obj: any, construc: typeof Object, shouldThrow: boolean = false): boolean;
    export function assertIsInstanceOf(obj: any, construc: typeof Object): void;
    export function forceAbstract(context: any, construc: typeof Object): void;
    export function forceStatic(context: any, construc: typeof Object): void;
    export function isNone(value: any): boolean;
    export function isValidNumber(value: any): boolean;
    export function didReturnAPromise(obj: any): boolean;
    export function missingImplementation(name: string): void;
    export function makeArray<T>(value: any): T[];
  }



  /**************************************************************************************************************************************
   TemplateErrors
  **************************************************************************************************************************************/
  
  export module TemplateErrors {
    export function overrideTemplate(error: typeof AbstractError, templateFunction: Function): void;

    export class AbstractError extends RestErrors.AbstractRestError {
      public readonly name: string;
      public readonly statusCode: number;

      public constructor(meta: any);

      public static template(meta: any): string;
    }

    export class AbstractBadRequestError extends AbstractError {}
    export class AbstractForbiddenError extends AbstractError {}
    export class Missing extends AbstractBadRequestError {
      static template(meta: { key: string }): string;
    }
    export class OutOfRange extends AbstractForbiddenError {
      static template(meta: { key: string, min?: number, max?: number, value: any }): string;
    }
    export class BadType extends AbstractBadRequestError {
      static template(meta: { key: string, expected: string, type?: string, value: any }): string;
    }
    export class BadPattern extends AbstractBadRequestError {
      static template(meta: { key: string, expected: RegExp }): string;
    }
    export class UnsupportedFormat extends AbstractError {
      static template(meta: { expected: string[], value: string }): string;
    }
    export class ResourceNotFound extends AbstractError {
      static template(meta: { pk: any }): string;
    }
    export class UnknownPath extends AbstractForbiddenError {
      static template(meta: { key: string }): string;
    }
    export class UnsupportedOption extends AbstractBadRequestError {
      static template(meta: { options: string[], option: string }): string;
    }
    export class NotWritable extends AbstractForbiddenError {
      static template(meta: { key: string, value: any }): string;
    }
    export class NotUpdatable extends AbstractForbiddenError {
      static template(meta: { key: string, value: any }): string;
    }
    export class NotFilterable extends AbstractForbiddenError {
      static template(meta: { key: string }): string;
    }
    export class NotPopulable extends AbstractForbiddenError {
      static template(meta: { key: string }): string;
    }
    export class NotInEnum extends AbstractBadRequestError {
      static template(meta: { key: string, expected: any[], value: any }): string;
    }
    export class UnsupportedOperator extends AbstractBadRequestError {
      static template(meta: { key: string, operator: string }): string;
    }
    export class NotMixableOperators extends AbstractForbiddenError {
      static template(meta: { operators: string[], key: string }): string;
    }
    export class UniquenessConstraintViolation extends AbstractError {
      static template(meta: { keys: { [key: string]: any } = {} }): string;
    }
    export class RequestOutOfRange extends AbstractForbiddenError {
      static template(): string;
    }
    export class InconsistentRequest extends AbstractBadRequestError {
      static template(meta: { key: string, filterValue: any, bodyValue: any }): string
    }
  }



  /**************************************************************************************************************************************
   RoutesSorter
  **************************************************************************************************************************************/
  
  export module RoutesSorter {
    export function sort(routes: { method: string, path: string }[]): { method: string, path: string }[];
    export function _computeMethodRoutes(routes: { path: string }[]): void;
    export function _getPathWeight(str: string): number;
    export function _fillPartsArray(arr: any[], length: number): any[];
  }



  /**************************************************************************************************************************************
   ResourceTester
  **************************************************************************************************************************************/
  
  export class ResourceTester {
    static validate(resourceClass: typeof Resources.AbstractCoreResource, options: { routerType: RouterTypes, before?: (...args: any[]) => void }): void;
  }



  /**************************************************************************************************************************************
   Resources
  **************************************************************************************************************************************/
  
  export module Resources {
    export abstract class AbstractCoreResource<T = any> {
      public readonly primaryKeyField: typeof Fields.AbstractField;
      public readonly primaryKeyPath: string;
      public readonly primaryKeyKey: string;
      public readonly fieldsByKey: { [key: string]: typeof Fields.AbstractField };
      public readonly fieldsByPath: { [path: string]: typeof Fields.AbstractField };
      public readonly routerType: RouterTypes;
      public readonly isGetAllAllowed: boolean;

      public constructor();

      public getFullUrl(): string;
      public createFields(): void;
      public createClient(): Client<T>;
      protected _createRoute(route: typeof Route): void;
      protected _createRoutes(): void;
      protected _ensurePrimaryKeyField(): void;
    }

    export abstract class AbstractResource<T> extends AbstractCoreResource<T> {
      public abstract readonly path: string;
      public readonly displayPath: string;
      public readonly fullDisplayPath: string;
      public abstract readonly schema: {}; // FIXME: could be better
      public abstract readonly routes: Route[];
      public readonly serializers: (typeof Serializers.AbstractSerializer)[];
      public readonly defaultLimit: number;
      public readonly maxLimit: number;
      public readonly minQueryScore: number;
      public readonly maxDeepLevel: number;
      public readonly readableFields: (typeof Fields.AbstractField)[];
      public readonly filterableFields: (typeof Fields.AbstractField)[];
      public readonly writableFields: (typeof Fields.AbstractField)[];
      public readonly populableFields: (typeof Fields.AbstractField)[];
      public readonly requiredFields: (typeof Fields.AbstractField)[];
      public readonly fileFields: (typeof Fields.AbstractField)[];
      public readonly supportedFormatMimeTypes: string[];
      public readonly supportedFormatAliases: string[];
      public readonly supportedFormatMimeTypesAndAliases: string[];
      public readonly supportsUniqueConstraints: boolean;
      public readonly supportsUpserts: boolean;
      public readonly upsertPaths: string[];
      public readonly routerType: RouterTypes;
      public readonly options: {};
      public readonly defaultSelect: string[];
      public readonly defaultSort: string[];
      public readonly api: API;

      public constructor(api: API);

      public beforeValidate(bundle: Bundle): Promise<Bundle>;
      public afterValidate(bundle: Bundle): Promise<Bundle>;
      public beforeHydrate(bundle: Bundle): Promise<Bundle>;
      public afterHydrate(bundle: Bundle): Promise<Bundle>;
      public beforeDehydrate(bundle: Bundle): Promise<Bundle>;
      public afterDehydrate(bundle: Bundle): Promise<Bundle>;
      public beforeParseFilters(bundle: Bundle): void;
      public afterParseFilters(bundle: Bundle): void;
      public fieldPathToKey(path: string): string;
      public getFullUrl(): string;
      public abstract countObjects(bundle: Bundle): Promise<number>;
      public abstract createObject(bundle: Bundle): Promise<T>;
      public abstract createObjects(bundle: Bundle): Promise<T[]>;
      public abstract getObject(bundle: Bundle): Promise<T>;
      public abstract getObjects(bundle: Bundle): Promise<T[]>;
      public abstract updateObject(bundle: Bundle): Promise<void>;
      public abstract deleteObject(bundle: Bundle): Promise<void>;
      public abstract replaceObject(bundle: Bundle): Promise<void>;
      public getSchemaDescription(): {};
      public getSerializerByAliasOrMimeType(type: string): typeof Serializers.AbstractSerializer;
      public parseOptions(bundle: Bundle): void;
      public parseBody(bundle: Bundle): Promise<Bundle>;
      public parseLimit(bundle: Bundle): void;
      public parseOffset(bundle: Bundle): void;
      public parseSort(bundle: Bundle): void;
      public parseFormat(bundle: Bundle): void;
      public parseFilters(bundle: Bundle): void;
      public parseSelect(bundle: Bundle): void;
      public parsePopulate(bundle: Bundle): void;
      public getQueryScore(bundle: Bundle): Promise<number>;
      public validateQueryScore(score: Score): Promise<boolean>;
      public applyNestedFilters(bundle: Bundle): Promise<Bundle>;
      public hydrate(bundle: Bundle): Promise<Bundle>;
      public validate(bundle: Bundle): Promise<Bundle>;
      public dehydrate(bundle: Bundle): Promise<Bundle>;
      public populate(bundle: Bundle): Promise<Bundle>;
      public exit(bundle: Bundle): Promise<void>;
      public serialize(bundle: Bundle): Promise<Bundle>;
      public respond(bundle: Bundle): void;
      public reset(): Promise<any>;
      protected _parseMultipart(bundle: Bundle): Promise<Bundle>;
      protected _parseJSON(bundle: Bundle): Promise<Bundle>;
      protected abstract __reset(): Promise<any>;

      public static readonly LIST_SEPARATOR: RegExp;
      public static readonly OPERATOR_SEPARATOR: string;
      public static readonly EQUALITY_OPERATOR: string;
      public static readonly DEEP_PROPERTY_SEPARATOR: string;
    }

    export abstract class FixturesResource<T> extends AbstractResource<T> {
      public readonly initialFixtures: T[];
      public readonly fixtures: T[];
      public readonly size: number;
      protected _fixtures: T[];
      
      public countObjects(bundle: Bundle): Promise<number>;
      public createObject(bundle: Bundle): Promise<T>;
      public createObjects(bundle: Bundle): Promise<T[]>;
      public getObject(bundle: Bundle): Promise<T>;
      public getObjects(bundle: Bundle): Promise<T[]>;
      public updateObject(bundle: Bundle): Promise<void>;
      public deleteObject(bundle: Bundle): Promise<void>;
      public replaceObject(bundle: Bundle): Promise<void>;
      public filterObjects(bundle: Bundle): T[];
      protected __reset(): Promise<any>;
    }

    export abstract class SequelizeResource<T> extends AbstractResource<T> {
      public abstract readonly model: any; // FIXME could provide Sequelize definition
      public countObjects(bundle: Bundle): Promise<number>;
      public createObject(bundle: Bundle): Promise<T>;
      public createObjects(bundle: Bundle): Promise<T[]>;
      public getObject(bundle: Bundle): Promise<T>;
      public getObjects(bundle: Bundle): Promise<T[]>;
      public updateObject(bundle: Bundle): Promise<void>;
      public deleteObject(bundle: Bundle): Promise<void>;
      public replaceObject(bundle: Bundle): Promise<void>;
      public filterObjects(bundle: Bundle): T[];
      public mapErrors(err: Error): Error;
      protected __reset(): Promise<any>;
      static formatFilters(filters: Filters): Filters;
      static toOrder(sort: string[]): ([string, 'DESC' | 'ASC'])[];
    }

    export class ProxyResource<T> extends AbstractCoreResource<T> {
      public readonly targetUrl: string;
      public readonly targetHost: string;
      public readonly targetVersion: string;
      public readonly targetPath: string;

      public constructor(targetUrl?: string);

      protected _buildTargetUrl(): void;
    }
  }
}

declare module "restypie" {
  export = Restypie;
}

