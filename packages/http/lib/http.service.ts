import { HttpOptions, get, post, put, patch, del, MethodOptions, Endpoint } from "./http";

export function createHttpService<E>(options: HttpOptions, mapErr?: (e: any) => E) {
  return {
    get<A>(url: Endpoint, methodOptions?: MethodOptions) {
      return get<A>(url, methodOptions).toEither(options, mapErr);
    },

    post<A>(url: Endpoint, body?: unknown, methodOptions?: MethodOptions) {
      return post<A>(url, body, methodOptions).toEither(options, mapErr);
    },

    put<A>(url: Endpoint, body?: unknown, methodOptions?: MethodOptions) {
      return put<A>(url, body, methodOptions).toEither(options, mapErr);
    },

    delete<A>(url: Endpoint, methodOptions?: MethodOptions) {
      return del<A>(url, methodOptions).toEither(options, mapErr);
    },

    patch<A>(url: Endpoint, body?: unknown, methodOptions?: MethodOptions) {
      return patch<A>(url, body, methodOptions).toEither(options, mapErr);
    },
  };
}
