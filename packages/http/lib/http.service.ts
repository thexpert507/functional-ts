import { HttpOptions, get, post, put, patch, del } from "./http";

export function createHttpService<E>(options: HttpOptions, mapErr?: (e: any) => E) {
  return {
    get<A>(url: string) {
      return get<A>(url).toEither(options, mapErr);
    },

    post<A>(url: string, body?: any) {
      return post<A>(url, body).toEither(options, mapErr);
    },

    put<A>(url: string, body?: any) {
      return put<A>(url, body).toEither(options, mapErr);
    },

    delete<A>(url: string) {
      return del<A>(url).toEither(options, mapErr);
    },

    patch<A>(url: string, body?: any) {
      return patch<A>(url, body).toEither(options, mapErr);
    },
  };
}
