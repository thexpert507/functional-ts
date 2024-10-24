export const splitArray =
  (size: number) =>
  <A>(array: A[]): A[][] => {
    const result: A[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };
