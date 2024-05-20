import { left } from "../either";
import { Maybe, maybe, nothing } from "../maybe";
import { Reader, reader } from "../reader";
import { Monad } from "../types/Monad";
import { Program } from "./Program";
import { Constructor, ProgramValue } from "./shared";

export type ContextType = Record<any, any>;

export type Handler<P extends Program> = (program: P) => Monad<ProgramValue<P>>;

export type InterpreterHandler<P extends Program> = (interpreter: InterpreterFn<any>) => Handler<P>;

export class Match<P extends Program<unknown>, C extends ContextType> {
  private operation: string | undefined;
  private instance: Constructor<any> | undefined;
  private handler: ((interpreter: InterpreterFn<any>) => Reader<C, Handler<P>>) | undefined;

  private context: Maybe<any> = nothing();

  constructor(instance: Constructor<P>, handler?: Handler<P>);
  constructor(operation: string, handler?: Handler<P>);
  constructor(operationOrFn: unknown, handler?: Handler<P>) {
    this.handler = handler ? () => reader(() => handler) : undefined;
    if (typeof operationOrFn === "string") {
      this.operation = operationOrFn;
    } else if (typeof operationOrFn === "function") {
      this.instance = operationOrFn as Constructor<any>;
    } else {
      throw new Error("Invalid argument");
    }
  }

  equals(match: Match<P, C>): boolean {
    return this.operation === match.operation || this.instance === match.instance;
  }

  from(handler: Handler<P>): Match<P, C> {
    this.handler = () => reader(() => handler);
    return this;
  }

  fromInterpreter(fn: InterpreterHandler<P>): Match<P, C> {
    this.handler = (interpreter) => reader(() => fn(interpreter));
    return this;
  }

  fromContext(reader: Reader<C, Handler<P>>): Match<P, C> {
    this.handler = (interpreter) => reader;
    return this;
  }

  isMatch(program: Program): boolean {
    if (this.operation) {
      return program.operation === this.operation;
    } else if (this.instance) {
      return program instanceof this.instance;
    } else {
      return false;
    }
  }

  make(interpreter: Interpreter<any, C>) {
    return reader((context: C) => {
      return (program: P): Monad<ProgramValue<P>> => {
        if (!this.isMatch(program)) return nothing();
        if (!this.handler) return nothing();
        return this.handler(interpreter.make()).run(context)(program);
      };
    });
  }
}

export type InterpreterFn<P extends Program> = (program: P) => Monad<ProgramValue<P>>;

export class Interpreter<P extends Program, C extends ContextType = {}> {
  private matches: Match<P, C>[] = [];
  private context: Maybe<C> = nothing();

  constructor(...matches: Match<any, C>[]) {
    this.matches = matches;
  }

  chain<BContext extends ContextType>(
    interpreter: Interpreter<any, BContext>
  ): Interpreter<P, C & BContext> {
    const newContext = {
      ...this.context.getOrElse({} as ContextType),
      ...interpreter.context.getOrElse({} as BContext),
    };
    return new Interpreter<P, C & BContext>(...this.matches, ...interpreter.matches).withContext(
      newContext
    );
  }

  replace(match: Match<P, C>) {
    return new Interpreter(match, ...this.matches.filter((m) => !m.equals(match)));
  }

  withContext(context: C): Interpreter<P, C> {
    this.context = maybe(context);
    return this;
  }

  make(): InterpreterFn<P> {
    return (program: P): Monad<ProgramValue<P>> => {
      const match = this.matches.find((match) => match.isMatch(program));
      if (!match) return left(`No match found for ${program.operation}`);
      return match.make(this).run(this.context.getOrElse({} as C))(program);
    };
  }
}

export const interpreter = <Context extends ContextType = {}>(...matches: Match<any, Context>[]) =>
  new Interpreter<Program, Context>(...matches);

export function match<P extends Program, C extends ContextType = any>(
  instance: Constructor<P>
): Match<P, C>;
export function match<P extends Program, C extends ContextType = any>(
  operation: string
): Match<P, C>;
export function match<P extends Program, C extends ContextType = any>(
  operationOrFn: any
): Match<P, C> {
  return new Match<P, C>(operationOrFn);
}

export const handler = <A = unknown, Payload = unknown>(fn: Handler<Program<A, any, Payload>>) =>
  fn as Handler<Program>;
