/// <reference types="node" />

import { Url } from "url";

module Restypie {

  type Host = string | Url;

  export const VERSION: string;
  export const TEST_ENV: string;
  export const SUDO_HEADER_NAME: string;
  export const OPERATOR_SEPARATOR: string;
  export const EQUALITY_OPERATOR: string;
  export const LIST_SEPARATOR: string;
  export const LIST_SEPARATOR_REG: RegExp;
  export const RESERVED_WORDS: string[];

  export enum RouterTypes {
    KOA_ROUTER = 'koa-router',
    EXPRESS = 'express'
  }

  export enum QueryOptions {
    NO_COUNT = 'NO_COUNT',
    INCLUDE_SCORE = 'INCLUDE_SCORE',
    SCORE_ONLY = 'SCORE_ONLY'
  }

  export enum EventTypes {
    ERROR = 'error',
    WARN = 'warn'
  }

  export function isSudo(headers: { [header: string]: string }): boolean;
  export function getSudoHeader(): { [SUDO_HEADER_NAME]: string | number };
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

