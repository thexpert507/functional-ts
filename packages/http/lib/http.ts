import { AppError, toAppError } from "@functional-ts/core";
import { PrimitiveEither, ReaderT, TaskEither, Task, readerT, task } from "@functional-ts/monads";

const defaultHeaders: HeadersInit = { "Content-Type": "application/json" };

function responseToJson<A>(response: Response): TaskEither<AppError, A> {
  if (!response.ok) return TaskEither.left(toAppError(response.statusText));
  return Task.from(() => response.json()).toEither(toAppError);
}

function responseToEither<A>(response: Response): TaskEither<AppError, A> {
  return task<PrimitiveEither<any, A>>(() => response.json())
    .bindError(() => Task.rejected<PrimitiveEither<any, A>>(response.statusText))
    .toEither(toAppError)
    .bind(TaskEither.fromPrimitives);
}

export type Endpoint = string | URL;

export type HttpOptions = {
  isEither?: boolean;
  interceptors?: HttpInterceptors;
  transformResponse?<A>(response: Response): TaskEither<AppError, A>;
};

export type HttpInterceptors = {
  request?(url: Endpoint, init: RequestInit): RequestInit;
  response?<A>(response: Response, options?: HttpOptions): TaskEither<AppError, A>;
};

export type MethodOptions = {
  headers?: HeadersInit;
};

function applyInterceptors(
  url: Endpoint,
  init: RequestInit,
  interceptors?: HttpInterceptors
): RequestInit {
  return interceptors?.request ? interceptors.request(url, init) : init;
}

function handleResponse<A>(response: Response, options?: HttpOptions): TaskEither<AppError, A> {
  if (options?.transformResponse) return options.transformResponse<A>(response);
  const handler =
    options?.interceptors?.response || (options?.isEither ? responseToEither : responseToJson);
  return handler(response, options);
}

function mergeHeaders(defaultHeaders: HeadersInit, customHeaders?: HeadersInit): HeadersInit {
  return { ...defaultHeaders, ...customHeaders };
}

export function get<A>(url: Endpoint, methodOptions?: MethodOptions): ReaderT<HttpOptions, A> {
  return readerT((options) => {
    const headers = mergeHeaders(defaultHeaders, methodOptions?.headers);
    const init: RequestInit = { method: "GET", headers };
    const finalInit = applyInterceptors(url, init, options?.interceptors);
    return Task.from(() => fetch(url, finalInit))
      .toEither(toAppError)
      .chain<A>((response) => handleResponse<A>(response, options));
  });
}

function parseBody(body: BodyInit): BodyInit {
  if (typeof body === "string") return body;
  if (body instanceof FormData) return body;
  if (body instanceof ArrayBuffer) return body;
  if (body instanceof Blob) return body;
  if (body instanceof URLSearchParams) return body;
  return JSON.stringify(body);
}

export function post<A>(
  url: Endpoint,
  body?: BodyInit,
  methodOptions?: MethodOptions
): ReaderT<HttpOptions, A> {
  return readerT((options) => {
    const headers = mergeHeaders(defaultHeaders, methodOptions?.headers);
    const init: RequestInit = { method: "POST", headers, body: body ? parseBody(body) : undefined };
    const finalInit = applyInterceptors(url, init, options?.interceptors);
    return Task.from(() => fetch(url, finalInit))
      .toEither(toAppError)
      .chain<A>((response) => handleResponse<A>(response, options));
  });
}

export function put<A>(
  url: Endpoint,
  body?: BodyInit,
  methodOptions?: MethodOptions
): ReaderT<HttpOptions, A> {
  return readerT((options) => {
    const headers = mergeHeaders(defaultHeaders, methodOptions?.headers);
    const init: RequestInit = { method: "PUT", headers, body: body ? parseBody(body) : undefined };
    const finalInit = applyInterceptors(url, init, options?.interceptors);
    return Task.from(() => fetch(url, finalInit))
      .toEither(toAppError)
      .chain<A>((response) => handleResponse<A>(response, options));
  });
}

export function del<A>(url: Endpoint, methodOptions?: MethodOptions): ReaderT<HttpOptions, A> {
  return readerT((options) => {
    const headers = mergeHeaders(defaultHeaders, methodOptions?.headers);
    const init: RequestInit = { method: "DELETE", headers };
    const finalInit = applyInterceptors(url, init, options?.interceptors);
    return Task.from(() => fetch(url, finalInit))
      .toEither(toAppError)
      .chain<A>((response) => handleResponse<A>(response, options));
  });
}

export function patch<A>(
  url: Endpoint,
  body?: BodyInit,
  methodOptions?: MethodOptions
): ReaderT<HttpOptions, A> {
  return readerT((options) => {
    const headers = mergeHeaders(defaultHeaders, methodOptions?.headers);
    const init: RequestInit = {
      method: "PATCH",
      headers,
      body: body ? parseBody(body) : undefined,
    };
    const finalInit = applyInterceptors(url, init, options?.interceptors);
    return Task.from(() => fetch(url, finalInit))
      .toEither(toAppError)
      .chain<A>((response) => handleResponse<A>(response, options));
  });
}
