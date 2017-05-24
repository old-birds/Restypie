/// <reference types="node" />

import { Url } from "url";

declare module Restypie {
  export enum RouterTypes {
    KOA_ROUTER = 'koa-router',
    EXPRESS = 'express'
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

  export class Route {

  }

  export type Host = string | Url;

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

}

declare module "restypie" {
  export = Restypie;
}

