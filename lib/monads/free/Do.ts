import { Free } from "./Free";
import { Program } from "./Program";
import { Pure, pure } from "./Pure";
import { free } from "./utils";

type InferProgramType<T> = T extends Free<Program<infer U>> ? U : never;

type ProgramRecord<T> = {
  [K in keyof T]: InferProgramType<T[K]>;
};

export function Do<T extends Record<string, Free<Program<any>>>>(
  data: T
): Free<Program<ProgramRecord<T>>> {
  const [first, ...rest] = Object.entries(data) as [keyof T, Free<Program<any>>][];

  if (!first) return free(Pure({})) as Free<Program<ProgramRecord<T>>>;

  const initialValue = first[1].map((result) => ({ [first[0]]: result })) as Free<
    Program<ProgramRecord<T>>
  >;

  return rest.reduce<Free<Program<ProgramRecord<T>>>>(
    (acc, [key, program]) =>
      acc.apply(program.map((result) => (results) => ({ ...results, [key]: result }))),
    initialValue
  );
}

// Map record values to pure programs
export function pureRecord<T extends Record<string, any>>(
  record: T
): { [K in keyof T]: Free<Program<T[K]>> } {
  const data = Object.entries(record) as [keyof T, T[keyof T]][];
  const programs = Object.fromEntries(
    data.map(([key, value]) => [key, pure(value)])
  ) as { [K in keyof T]: Free<Program<T[K]>> };
  return programs;
}
