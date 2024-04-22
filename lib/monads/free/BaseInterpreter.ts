import { Monad } from "../types";
import { ApplyPayload } from "./Apply";
import { ChainPayload } from "./Chain";
import {
  ContextType,
  Interpreter,
  InterpreterFn,
  handler,
  interpreter,
  match,
} from "./Interpreter";
import { Program } from "./Program";
import { PurePayload } from "./Pure";

const handlerChain = (interpreter: InterpreterFn<Program>) =>
  handler<any, ChainPayload<any>>((program) => {
    const monad: Monad<ChainPayload<any>> = program.payload;
    return monad.chain((payload) => {
      return interpreter(payload.program)
        .chain((data) => payload.fn(data).run(interpreter))
        .map((data) => program.run(data));
    });
  });

const handlerApply = (interpreter: InterpreterFn<Program>) =>
  handler<any, ApplyPayload>((program) => {
    const monad: Monad<ApplyPayload> = program.payload;
    return monad.chain((payload) => {
      const monadFn = payload.program.run(interpreter);
      const monadValue = payload.value.run(interpreter);
      return monadValue.apply(monadFn).map((data) => program.run(data));
    });
  });

const handlerPure = handler<any, PurePayload<any>>((program) =>
  program.payload.map(({ value }) => program.run(value))
);

// Crear un base interpreter
export const baseInterpreter = <Context extends ContextType>() =>
  interpreter<Context>(
    match("chain").fromInterpreter(handlerChain),
    match("apply").fromInterpreter(handlerApply),
    match("pure").from(handlerPure)
  );
