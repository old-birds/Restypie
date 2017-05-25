/// <reference types="node" />

import { Url } from 'url';
import { Writable } from 'stream';

declare module Restypie {

  type Host = string | Url;
  type HandlerFunction = Function | GeneratorFunction;

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

  export module Fields {
    interface IFileObject {
      name: string;
      mimeType?: string;
      encoding?: string;
      size: number;
      [key: string]: any;
    }

    interface IAbstractFieldConstructorOptions {
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

    interface IAbstractNumberFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      min?: number;
      max?: number;
      range?: [number, number]
    }

    interface IDateFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      ISOFormat?: RegExp;
      min?: Date | number;
      max?: Date | number;
    }

    interface IFileFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      maxSize?: number;
    }

    interface IIntegerFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      enum?: number[];
    }

    interface IStringFieldConstructorOptions extends IAbstractFieldConstructorOptions {
      lengthRange?: [number, number];
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      enum?: string[];
    }

    export function match(type: string | typeof AbstractField | typeof String | typeof Number | typeof Boolean | typeof Date): typeof AbstractField;

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

  export module Resources {
    export abstract class AbstractCoreResource {

    }

    export abstract class AbstractResource extends AbstractCoreResource {

    }

    export abstract class FixturesResource extends AbstractResource {

    }

    export abstract class SequelizeResource extends AbstractResource {

    }

    export abstract class ProxyResource extends AbstractCoreResource {

    }
  }
}

declare module "restypie" {
  export = Restypie;
}

