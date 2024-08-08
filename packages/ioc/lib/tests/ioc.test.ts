import { beforeEach, describe, test } from "vitest";
import { createModule, Provider } from "../main/module";
import { reader, Reader } from "@functional-ts/monads";

type Logger = Console;

const MyLogger = Reader.of(console);

const MyService1 = reader((deps: { logger: Logger }) => {
  return {
    hello: "world 1",
    saluda: () => deps.logger.log("hola"),
  };
});

type ReaderType<A> = A extends Reader<any, infer A> ? A : never;
type MyService1 = ReaderType<typeof MyService1>;

const MyService2 = reader((deps: { logger: Logger; service_1: MyService1 }) => {
  deps.service_1.saluda();
  return {
    hello: "world 2",
    saluda: () => deps.logger.log("hola 2"),
  };
});

describe("ioc", () => {
  let Logger: Provider;
  let Service1: Provider;
  let Service2: Provider;

  beforeEach(() => {
    Logger = { provide: "logger", useReader: MyLogger };
    Service1 = { provide: "service_1", useReader: MyService1 };
    Service2 = { provide: "service_2", useReader: MyService2 };
  });

  test("should be able to resolve a export service", ({ expect }) => {
    const module = createModule({
      providers: [Service1, Service2, Logger],
      exports: [Service2],
    });

    const test = module.container.resolve("service_2");
    expect(test).toBeDefined();
  });

  test("should be able to resolve a export service", ({ expect }) => {
    const SharedModule = createModule({ providers: [Logger], exports: [Logger] });

    const module = createModule({
      imports: [SharedModule],
      providers: [Service1, Service2],
      exports: [Service2],
    });

    const test = module.container.resolve("service_2");
    expect(test).toBeDefined();
  });

  test("should be able to resolve a export import module service", ({ expect }) => {
    const SharedModule = createModule({ providers: [Logger], exports: [Logger] });

    const module = createModule({
      imports: [SharedModule],
      providers: [Service1, Service2],
      exports: [Service2],
    });

    const test = module.container.resolve("logger");
    expect(test).toBeDefined();
  });

  test("should be same instance of services", ({ expect }) => {
    const Module1 = createModule({ providers: [Logger], exports: [Logger] });
    const Module2 = createModule({
      imports: [Module1],
      providers: [Service1],
      exports: [Service1],
    });
    const Module3 = createModule({
      imports: [Module1, Module2],
      providers: [Service2],
      exports: [Service2],
    });
    const MainModule = createModule({ imports: [Module2, Module3], providers: [Logger] });

    const main_logger = MainModule.container.resolve("logger");
    const main_service1 = MainModule.container.resolve("service_1");
    const main_service2 = MainModule.container.resolve("service_2");

    const module1_logger = Module1.container.resolve("logger");
    const module2_service1 = Module2.container.resolve("service_1");
    const module3_service2 = Module3.container.resolve("service_2");

    expect(main_logger).toBe(module1_logger);
    expect(main_service1).toBe(module2_service1);
    expect(main_service2).toBe(module3_service2);
  });

  test("should not allow registering the same key twice", ({ expect }) => {
    const module = createModule({
      providers: [Logger],
      exports: [Logger],
    });

    const test = module.container.resolve("logger");
    expect(test).toBeDefined();
  });
});
