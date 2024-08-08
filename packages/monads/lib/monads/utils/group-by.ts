export function groupBy<T>(iterable: Iterable<T>, fn: (item: T) => string | number) {
  return [...iterable].reduce<Record<string, T[]>>((groups, curr) => {
    const key = fn(curr);
    const group = groups[key] ?? [];
    group.push(curr);
    return { ...groups, [key]: group };
  }, {});
}

export function indexBy<T>(iterable: Iterable<T>, fn: (item: T) => string | number) {
  return [...iterable].reduce<Record<string, T>>((groups, curr) => {
    const key = fn(curr);
    return { ...groups, [key]: curr };
  }, {});
}
