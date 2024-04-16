// Primero, definimos nuestro Functor como una clase abstracta con un método map
abstract class ProgramF<A> {
  abstract map<B>(f: (a: A) => B): ProgramF<B>;
}

// Luego, definimos nuestros constructores de datos como subclases de ProgramF
class SayHello<A> extends ProgramF<A> {
  constructor(public next: A) {
    super();
  }

  map<B>(f: (a: A) => B): ProgramF<B> {
    return new SayHello(f(this.next));
  }
}

class AskName<A> extends ProgramF<A> {
  constructor(public next: (name: string) => A) {
    super();
  }

  map<B>(f: (a: A) => B): ProgramF<B> {
    return new AskName((name) => f(this.next(name)));
  }
}

// Ahora, podemos definir nuestra Free Monad como una clase con un constructor y un método flatMap
class Free<F extends ProgramF<any>> {
  constructor(public program: F) {}

  map<B>(f: (a: F extends ProgramF<infer A> ? A : never) => B): Free<ProgramF<B>> {
    return new Free(this.program.map(f));
  }

  flatMap<B>(f: (a: F extends ProgramF<infer A> ? A : never) => Free<ProgramF<B>>): Free<ProgramF<B>> {
    return new Free(new FlatMap(this, f));
  }
}

// Y necesitamos un constructor de datos adicional para representar la operación flatMap
class FlatMap<F extends ProgramF<any>, B> extends ProgramF<B> {
  constructor(public program: Free<F>, public f: (a: F extends ProgramF<infer A> ? A : never) => Free<ProgramF<B>>) {
    super();
  }

  map<C>(g: (b: B) => C): ProgramF<C> {
    return new FlatMap(this.program, (a) => this.f(a).map(g));
  }
}

// Finalmente, podemos definir nuestras operaciones como funciones que construyen nuestra Free Monad
function sayHello(): Free<ProgramF<void>> {
  return new Free(new SayHello(undefined));
}

function askName(): Free<ProgramF<string>> {
  return new Free(new AskName((name) => name));
}

// Y podemos definir nuestro programa usando estas operaciones
const program = sayHello().flatMap(() => askName().flatMap((name) => sayHello()));

// async function interpret(program: Free<ProgramF<any>>): Promise<void> {
//   if (program.program instanceof SayHello) {
//     console.log("Hola!");
//     return interpret(program.program.next);
//   } else if (program.program instanceof AskName) {
//     const step: AskName<any> = program.program;
//     return Promise.resolve("Adriel").then((name) => interpret(step.next(name)));
//   } else if (program.program instanceof FlatMap) {
//     const step: FlatMap<any, any> = program.program;
//     return interpret(program.program.program).then((a) => interpret(step.f(a)));
//   } else {
//     return Promise.resolve();
//   }
// }

// // Ahora puedes ejecutar tu programa con:
// interpret(program);
