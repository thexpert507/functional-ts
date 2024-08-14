import { asFunction, asValue, createContainer } from "awilix";
import { Reader } from "@functional-ts/monads";

export type Module = {
  container: ReturnType<typeof createContainer>;
};

export type Provider = {
  provide: string;
  useReader: Reader<any, any>;
};

export type ModuleProps = {
  imports?: Module[];
  providers?: Provider[];
  exports?: Provider[];
};

export function createModule(props: ModuleProps): Module {
  const container = createContainer();

  const { imports = [], providers = [], exports = [] } = props;

  imports.forEach((module) => {
    Object.entries(module.container.cradle).forEach(([key, value]) => {
      container.register(key, asValue(value));
    });
  });

  providers.forEach((provider) => {
    container.register(provider.provide, asFunction(provider.useReader.run));
  });

  const exportsContainer = createContainer();
  exports.forEach((provider) => {
    const value = container.resolve(provider.provide);
    exportsContainer.register(provider.provide, asValue(value));
  });

  imports.forEach((module) => {
    Object.entries(module.container.cradle).forEach(([key, value]) => {
      exportsContainer.register(key, asValue(value));
    });
  });

  return { container: exportsContainer };
}
