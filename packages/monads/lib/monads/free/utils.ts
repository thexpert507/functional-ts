import { nothing } from "../maybe";
import { Free } from "./Free";
import { Program } from "./Program";
import { Pure } from "./Pure";

export function all<A>(...programs: Free<Program<A>>[]): Free<Program<A[]>> {
  const [first, ...rest] = programs;
  if (!first) return free(Pure([]));
  return rest.reduce<Free<Program<A[]>>>(
    (acc, program) => acc.apply(program.map((result) => (results) => [...results, result])),
    first.map((result) => [result])
  );
}

// Crear un Free
export const free = <A>(program: Program<A>) => new Free(program);

// Crear un Program
export const program = <A>(operation: string) => new Program<A>(operation, nothing(), nothing());

export type FreeValue<F extends Free<Program>> = F extends Free<Program<infer A>> ? A : never;
type BindFn = <P extends Free<Program>>(value: any) => FreeValue<P>;

// Do notation
export function DoGen<A, R>(
  generator: (bind: BindFn) => Generator<Free<Program<A>>, R, any>
): Free<Program<R>> {
  const bind: BindFn = (value) => value;
  const iterator = generator(bind);
  const iterate = (value?: any): Free<Program<R>> => {
    const result = iterator.next(value);
    if (result.done) {
      return free(Pure(result.value));
    } else {
      return result.value.chain(iterate);
    }
  };
  return iterate();
}

export function sequece<A>(...programs: Free<Program<A>>[]): Free<Program<A[]>> {
  const [first, ...rest] = programs;
  if (!first) return free(Pure([]));
  return rest.reduce<Free<Program<A[]>>>(
    (acc, program) => acc.chain((results) => program.map((result) => [...results, result])),
    first.map((result) => [result])
  );
}
