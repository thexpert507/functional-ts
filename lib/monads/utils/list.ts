export function listMap<T, B>(f: (data: T) => B) {
  return (data: T[]) => data.map(f);
}
