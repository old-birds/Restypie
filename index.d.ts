import * as http from 'http';
import * as Stream from 'stream';

export var Logger: any;
export interface IQueryParamsFilters {
  [key: string]: any | { in?: any[], nin?: any[], eq?: any, ne?: any, gt?: any, gte?: any, lt?: any, lte?: any };
}

export interface IQueryParams {
  limit?: number;
  offset?: number;
  populate?: string[];
  sort?: string[];
  select?: string[];
  filters?: IQueryParamsFilters;
  body?: any;
  headers?: any;
}

export class Bundle {
  req: http.IncomingMessage;
  res: any;
  isWrite: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isRead: boolean;
  filters: any;
  select: string[];
  limit: number;
  offset: number;
  sort: string[];
  headers: any;
  body: any;
  params: any;
  meta: any;
  query: any;
  populate: string[];
  statusCode: number;
  isError: boolean;
  data: any;
  code: string;
  format: string;
  payload: any;
  emptyPayload(): Bundle;
  setData(data: any): Bundle;
  setStatusCode(statusCode: number): Bundle;
  setError(err: Error): Bundle;
  next(err?: Error): Promise<Bundle>
  setPayload(payload: any): Bundle;
  assignToPayload(obj: any): Bundle;
  assignToHeaders(obj: { [key: string]: string }): Bundle;
  resetPayload(): Bundle;
  assignToQuery(obj: any): Bundle;
  setQuery(query: any): Bundle;
  setMessage(message: string): Bundle;
  setCode(code: string): Bundle;
  assignToMeta(key: string, value: any): Bundle;
  setMeta(obj: any): Bundle;
  setPopulate(fields: string[]): Bundle;
  setSelect(select: string[]): Bundle;
  setLimit(value: number): Bundle;
  setOffset(value: number): Bundle;
  setFormat(format: string): Bundle;
  setFilters(filters: any): Bundle;
  setBody(body: any): Bundle;
  setSort(fields: string[]): Bundle;
  getNavLinks(total: number): { next: string, prev: string };
}
export module Resources {
  export class AbstractCoreResource {

  }
  export class AbstractResource extends AbstractCoreResource {
    afterValidate(bundle: Bundle): Promise<any>;
    beforeValidate(bundle: Bundle): Promise<any>;
    beforeHydrate(bundle: Bundle): Promise<any>;
    afterHydrate(bundle: Bundle): Promise<any>;
    beforeDehydrate(bundle: Bundle): Promise<any>;
    afterDehydrate(bundle: Bundle): Promise<any>;
    beforeParseFilters(bundle: Bundle): void;
    afterParseFilters(bundle: Bundle): void;
    parseBody(bundle: Bundle): Promise<any>;
    parseLimit(bundle: Bundle): void;
    parseOffset(bundle: Bundle): void;
    parseSort(bundle: Bundle): void;
    parseFormat(bundle: Bundle): void;
    parsePopulate(bundle: Bundle): void;
    parseSelect(bundle: Bundle): void;
    parseFilters(bundle: Bundle): void;
    parseOptions(bundle: Bundle): Promise<Bundle>;
    hydrate(bundle: Bundle): Promise<Bundle>;
    dehydrate(bundle: Bundle): Promise<Bundle>;
    populate(bundle: Bundle): Promise<Bundle>;
    validate(bundle: Bundle): Promise<Bundle>;
  }
  export class SequelizeResource extends AbstractResource {}
  export class FixturesResource extends AbstractResource {}
  export class ProxyResource extends AbstractCoreResource {}
  export class RestypieResource extends AbstractResource {}
}
export module Fields {

  export interface IFieldParams {
    path?: string;
    isRequired?: boolean;
    isWritable?: boolean;
    isFilterable?: boolean;
    isReadable?: boolean;
    isWritableOnce?: boolean;
    isPrimaryKey?: boolean;
    default?: any;
    to?: Function | Resources.AbstractCoreResource;
    through?: Function | Resources.AbstractCoreResource;
    toKey?: string;
    throughKey: string;
    otherThroughKey: string;
  }

  export class AbstractField implements IFieldParams {
    supportedOperators: any[];
    optionsProperties: string[];
    key: string;
    path: string;
    isRequired: boolean;
    isWritable: boolean;
    isFilterable: boolean;
    isReadable: boolean;
    isUpdatable: boolean;
    isPopulable: boolean;
    populateFrom: Function;
    isWritableOnce: boolean;
    isPrimaryKey: boolean;
    hasDefault: boolean;
    default: any;
    _to: Function | Resources.AbstractCoreResource;
    to: Resources.AbstractCoreResource;
    toKey: string;
    _toKey: string;
    _through: Function | Resources.AbstractCoreResource;
    through: Resources.AbstractCoreResource;
    throughKey: string;
    otherThroughKey: string;

    constructor(key: string, options: IFieldParams);

    isPresent(value: any): boolean;
    validatePresence(value: any): boolean;
    hydrate(value: any): any;
    dehydrate(value: any): any;
    validate(): boolean;
    getOperatorByName(operatorName: string): any;

    static toJavascriptValue(value: any): any;
  }

  export class AbstractNumberField extends AbstractField {}
  export class AbstractRelationField extends AnyField {}
  export class AnyField extends AbstractField {}
  export class ToOneField extends AbstractRelationField {}
  export class ToManyField extends AbstractRelationField {}
  export class StringField extends AbstractField {}
  export class IntegerField extends AbstractField {}
  export class FloatField extends AbstractField {}

  export interface IFileFieldParams extends IFieldParams {
    maxSize?: number;
  }
  export class FileField extends AbstractField {
    maxSize: number;

    constructor(key: string, options: IFileFieldParams)

    buildFilePath(file: any): string;
    writeStream(file: any): Stream.Writable;
    unlink(file: any): Promise<void>;
    validateSize(file: any): void;
  }
  export class DateField extends AbstractField {}
  export class BooleanField extends AbstractField {}
}
export module RestErrors {
  export class AbstractRestError extends Error {
    statusCode: number;
    code: string;
    meta: any;
    constructor(message?: string, meta?: any)
  }
  export class Forbidden extends AbstractRestError {}
  export class NotFound extends AbstractRestError {}
  export class NotAcceptable extends AbstractRestError {}
  export class Unauthorized extends AbstractRestError {}
  export class BadRequest extends AbstractRestError {}
  export function toRestError(err: Error): AbstractRestError;
  export function fromStatusCode(statusCode: number, body: any, meta?:any): AbstractRestError;
}
export var Codes: any;

export var TemplateErrors: any;
export module Utils {
  export function isSubclassOf(Child: typeof Object, Parent: typeof Object, shouldThrow?: boolean): boolean;
  export function isInstanceOf(obj: any, Constructor: typeof Object, shouldThrow?: boolean): boolean;
  export function forceAbstract(context: any, Constructor: typeof Object): void;
  export function forceStatic(context: any, Constructor: typeof Object): void;
  export function isNone(value: any): boolean;
  export function isValidNumber(value: any): boolean;
  export function didReturnAPromise(obj: any): boolean;
}
export class API {
  resources: any;
  constructor(options: any);
  registerResource(name: string, resource: typeof Resources.AbstractCoreResource): this;
  launch(app: any): void;
}
export class Route {
  context: any;
  method: string;
  path: string;
  handler(bundle: Bundle): Promise<any>;
}
export module BasicRoutes {
  export class PostRoute extends Route {
    allowsMany: boolean;
  }
  export class GetSingleRoute extends Route {}
  export class GetManyRoute extends Route {}
  export class PatchSingleRoute extends Route {}
  export class PatchManyRoute extends Route {}
  export class DeleteSingleRoute extends Route {}
  export class OptionsRoute extends Route {}
  export class PutSingleRoute extends Route {}
}
export module Methods {
  export var GET: string;
  export var POST: string;
  export var PATCH: string;
  export var DELETE: string;
  export var OPTIONS: string;
  export var HEAD: string;
  export var PUT: string;
  export var METHODS: { [method: string]: string };
}

export module Operators {
  export class AbstractOperator {
    static stringName: string;
    static parse(value: any): any;
  }
  export class AbstractListOperator extends AbstractOperator {
    static SEPARATOR: string;
  }
  export class Eq extends AbstractOperator {}
  export class Gt extends AbstractOperator {}
  export class Gte extends AbstractOperator {}
  export class In extends AbstractOperator {}
  export class Lt extends AbstractOperator {}
  export class Lte extends AbstractOperator {}
  export class Ne extends AbstractOperator {}
  export class Nin extends AbstractOperator {}
}

export module Url {
  export function join(...paths: string[]): string;
  export function ensureHTTPProtocol(url: string, useHTTPS?: boolean): string;
}

export class Client<T> {
  host: string;
  version: string;
  path: string;
  constructor(options: { host: string, version?: string, path: string });
  find(params: IQueryParams): Promise<T[]>;
  findById(id: string | number, params: IQueryParams): Promise<T>;
  findOne(params: IQueryParams): Promise<T>;
  create(objects: T, params?: IQueryParams): Promise<T>;
  create(objects: T[], params?: IQueryParams): Promise<T[]>;
  updateById(id: string | number, updates: any, params?: IQueryParams): Promise<void>;
  deleteById(id: string | number, params?: IQueryParams): Promise<void>;
  count(filters: IQueryParamsFilters, params?: IQueryParams): Promise<number>;
  update(filters: IQueryParamsFilters, updates: any, params?: IQueryParams): Promise<void>;
}


export class Model<T> {
  private _properties: T;
  toJSON(): T;
  static create<T>(object: any, params?: IQueryParams): Promise<T>;
  static create<T>(objects: any[], params?: IQueryParams): Promise<T[]>;
  static findOne<T>(filters?: IQueryParamsFilters, options?: IQueryParams): Promise<T>;
  static findById<T>(id: string | number, params?: IQueryParams): Promise<T>;
  static find<T>(filters?: IQueryParamsFilters, options?: IQueryParams): Promise<T[]>;
  static updateById(id: string | number, updates: any, params?: IQueryParams): Promise<void>;
  static deleteById(id: string | number, params?: IQueryParams): Promise<void>;
  static count(filters?: IQueryParamsFilters, params?: IQueryParams): Promise<number>;
  static update(filters: IQueryParamsFilters, updates: any, params?: IQueryParams): Promise<void>;
}
