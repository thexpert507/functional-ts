import { maybe, nothing } from "../maybe";
import { groupBy, indexBy } from "./group-by";

export function listMap<T, B>(f: (data: T) => B) {
  return (data: T[]) => data.map(f);
}

export function listFlatMap<T, B>(f: (data: T) => B[]) {
  return (data: T[]) => data.flatMap(f);
}

export function listFilter<T>(f: (data: T) => boolean) {
  return (data: T[]) => data.filter(f);
}

export function listReduce<T, B>(f: (acc: B, data: T) => B, initialValue: B) {
  return (data: T[]) => data.reduce(f, initialValue);
}

export function listGroupBy<T>(fn: (item: T) => string | number) {
  return (data: T[]) => groupBy(data, fn);
}

export function listIndexBy<T>(fn: (item: T) => string | number) {
  return (data: T[]) => indexBy(data, fn);
}

export function listFind<T>(f: (data: T) => boolean) {
  return (data: T[]) => maybe(data.find(f));
}

export function listFindIndex<T>(f: (data: T) => boolean) {
  return (data: T[]) => {
    const index = data.findIndex(f);
    return index === -1 ? nothing<number>() : maybe<number>(index);
  };
}

export function listIncludes<T>(value: T) {
  return (data: T[]) => data.includes(value);
}

export function listEvery<T>(f: (data: T) => boolean) {
  return (data: T[]) => data.every(f);
}

export function listSome<T>(f: (data: T) => boolean) {
  return (data: T[]) => data.some(f);
}

export function listSort<T>(f: (a: T, b: T) => number) {
  return (data: T[]) => data.sort(f);
}

export function listSortBy<T>(f: (data: T) => number) {
  return (data: T[]) => data.sort((a, b) => f(a) - f(b));
}

export function listSortByDesc<T>(f: (data: T) => number) {
  return (data: T[]) => data.sort((a, b) => f(b) - f(a));
}
