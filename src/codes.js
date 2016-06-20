'use strict';

/***********************************************************************************************************************
 * Dependencies
 **********************************************************************************************************************/
const Continue = 100;
const SwitchingProtocols = 101;
const OK = 200;
const Created = 201;
const Accepted = 202;
const NonAuthoritativeInformation = 203;
const NoContent = 204;
const ResetContent = 205;
const PartialContent = 206;
const MultipleChoices = 300;
const MovedPermanently = 301;
const MovedTemporarily = 302;
const SeeOther = 303;
const NotModified = 304;
const UseProxy = 305;
const BadRequest = 400;
const Unauthorized = 401;
const PaymentRequired = 402;
const Forbidden = 403;
const NotFound = 404;
const MethodNotAllowed = 405;
const NotAcceptable = 406;
const ProxyAuthenticationRequired = 407;
const RequestTimeOut = 408;
const Conflict = 409;
const Gone = 410;
const LengthRequired = 411;
const PreconditionFailed = 412;
const RequestEntityTooLarge = 413;
const RequestURITooLong = 414;
const UnsupportedMediaType = 415;
const RequestRangeUnsatisfiable = 416;
const ExpectationFailed = 417;
const InternalServerError = 500;
const NotImplemented = 501;
const BadGateway = 502;
const ServiceUnavailable = 503;
const GatewayTimeOut = 504;
const HTTPVersionNotSupported = 505;


let Codes = {
  /**
   * @property Continue
   * @static
   * @final
   * @type {Number}
   */
  Continue: Continue,
  /**
   * @property SwitchingProtocols
   * @static
   * @final
   * @type {Number}
   */
  SwitchingProtocols: SwitchingProtocols,
  /**
   * @property OK
   * @static
   * @final
   * @type {Number}
   */
  OK: OK,
  /**
   * @property Created
   * @static
   * @final
   * @type {Number}
   */
  Created: Created,
  /**
   * @property Accepted
   * @static
   * @final
   * @type {Number}
   */
  Accepted: Accepted,
  /**
   * @property NonAuthoritativeInformation
   * @static
   * @final
   * @type {Number}
   */
  NonAuthoritativeInformation: NonAuthoritativeInformation,
  /**
   * @property NoContent
   * @static
   * @final
   * @type {Number}
   */
  NoContent: NoContent,
  /**
   * @property ResetContent
   * @static
   * @final
   * @type {Number}
   */
  ResetContent: ResetContent,
  /**
   * @property PartialContent
   * @static
   * @final
   * @type {Number}
   */
  PartialContent: PartialContent,

  /**
   * @property MultipleChoices
   * @static
   * @final
   * @type {Number}
   */
  MultipleChoices: MultipleChoices,
  /**
   * @property MovedPermanently
   * @static
   * @final
   * @type {Number}
   */
  MovedPermanently: MovedPermanently,
  /**
   * @property MovedTemporarily
   * @static
   * @final
   * @type {Number}
   */
  MovedTemporarily: MovedTemporarily,
  /**
   * @property SeeOther
   * @static
   * @final
   * @type {Number}
   */
  SeeOther: SeeOther,
  /**
   * @property NotModified
   * @static
   * @final
   * @type {Number}
   */
  NotModified: NotModified,
  /**
   * @property UseProxy
   * @static
   * @final
   * @type {Number}
   */
  UseProxy: UseProxy,

  /**
   * @property BadRequest
   * @static
   * @final
   * @type {Number}
   */
  BadRequest: BadRequest,
  /**
   * @property Unauthorized
   * @static
   * @final
   * @type {Number}
   */
  Unauthorized: Unauthorized,
  /**
   * @property PaymentRequired
   * @static
   * @final
   * @type {Number}
   */
  PaymentRequired: PaymentRequired,
  /**
   * @property Forbidden
   * @static
   * @final
   * @type {Number}
   */
  Forbidden: Forbidden,
  /**
   * @property NotFound
   * @static
   * @final
   * @type {Number}
   */
  NotFound: NotFound,
  /**
   * @property MethodNotAllowed
   * @static
   * @final
   * @type {Number}
   */
  MethodNotAllowed: MethodNotAllowed,
  /**
   * @property NotAcceptable
   * @static
   * @final
   * @type {Number}
   */
  NotAcceptable: NotAcceptable,
  /**
   * @property ProxyAuthenticationRequired
   * @static
   * @final
   * @type {Number}
   */
  ProxyAuthenticationRequired: ProxyAuthenticationRequired,
  /**
   * @property RequestTimeOut
   * @static
   * @final
   * @type {Number}
   */
  RequestTimeOut: RequestTimeOut,
  /**
   * @property Conflict
   * @static
   * @final
   * @type {Number}
   */
  Conflict: Conflict,
  /**
   * @property Gone
   * @static
   * @final
   * @type {Number}
   */
  Gone: Gone,
  /**
   * @property LengthRequired
   * @static
   * @final
   * @type {Number}
   */
  LengthRequired: LengthRequired,
  /**
   * @property PreconditionFailed
   * @static
   * @final
   * @type {Number}
   */
  PreconditionFailed: PreconditionFailed,
  /**
   * @property RequestEntityTooLarge
   * @static
   * @final
   * @type {Number}
   */
  RequestEntityTooLarge: RequestEntityTooLarge,
  /**
   * @property RequestURITooLong
   * @static
   * @final
   * @type {Number}
   */
  RequestURITooLong: RequestURITooLong,
  /**
   * @property UnsupportedMediaType
   * @static
   * @final
   * @type {Number}
   */
  UnsupportedMediaType: UnsupportedMediaType,
  /**
   * @property RequestRangeUnsatisfiable
   * @static
   * @final
   * @type {Number}
   */
  RequestRangeUnsatisfiable: RequestRangeUnsatisfiable,
  /**
   * @property ExpectationFailed
   * @static
   * @final
   * @type {Number}
   */
  ExpectationFailed: ExpectationFailed,

  /**
   * @property InternalServerError
   * @static
   * @final
   * @type {Number}
   */
  InternalServerError: InternalServerError,
  /**
   * @property NotImplemented
   * @static
   * @final
   * @type {Number}
   */
  NotImplemented: NotImplemented,
  /**
   * @property BadGateway
   * @static
   * @final
   * @type {Number}
   */
  BadGateway: BadGateway,
  /**
   * @property ServiceUnavailable
   * @static
   * @final
   * @type {Number}
   */
  ServiceUnavailable: ServiceUnavailable,
  /**
   * @property GatewayTimeOut
   * @static
   * @final
   * @type {Number}
   */
  GatewayTimeOut: GatewayTimeOut,
  /**
   * @property HTTPVersionNotSupported
   * @static
   * @final
   * @type {Number}
   */
  HTTPVersionNotSupported: HTTPVersionNotSupported
};

/***********************************************************************************************************************
 * Complete list of HTTP codes.
 *
 * @namespace Restypie
 * @class Codes
 **********************************************************************************************************************/
module.exports = Object.assign({

  /**
   * Convenience object grouping on the codes (useful for iterations for example).
   *
   * @attribute Codes
   * @type Object
   * @static
   */
  Codes: Codes,

  /**
   * Check whether or not `code` is an error one.
   *
   * @method isErrorCode
   * @static
   * @param {Number} code
   * @return {Boolean}
   *
   * @example
   * ```javascript
   * Codes.isErrorCode(200); // false
   * Codes.isErrorCode(400); // true
   * ```
   */
  isErrorCode(code) {
    return code >= 400;
  }

}, Codes);