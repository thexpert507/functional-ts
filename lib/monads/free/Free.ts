import { Monad } from "../types/Monad";
import { Apply } from "./Apply";
import { Chain } from "./Chain";
import { InterpreterFn } from "./Interpreter";
import { Program } from "./Program";
import { ChainFn, MapFn, ProgramValue } from "./shared";

export class Free<P extends Program> {
  constructor(private program: P) {}

  // Método map
  map<B>(f: MapFn<ProgramValue<P>, B>): Free<Program<B>> {
    return new Free(this.program.map(f));
  }

  // Método chain
  chain<B>(fn: ChainFn<ProgramValue<P>, B>): Free<Program<B>> {
    return new Free(Chain({ program: this.program, fn }));
  }

  // Método apply
  apply<B>(program: Free<Program<MapFn<ProgramValue<P>, B>>>): Free<Program<B>> {
    return new Free(Apply({ program, value: this }));
  }

  // Método run
  run(interpreter: InterpreterFn<P>): Monad<ProgramValue<P>> {
    return interpreter(this.program);
  }
}
