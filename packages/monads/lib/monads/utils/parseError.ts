export function parseError(e: any): Error {
  if (e instanceof Error) return e;
  if (typeof e === "string") return new Error(e);
  if (typeof e === "object" && e.message) return new Error(e.message);
  return new Error(`Unknown error type: ${e}`);
}
