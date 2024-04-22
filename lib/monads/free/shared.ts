import { Free } from "./Free";
import { Program } from "./Program";

export type NextFn<A, C = any> = (data: C) => A;
export type ChainFn<A, B> = (data: A) => Free<Program<B>>;
export type MapFn<A = any, B = any> = (data: A) => B;

export type ProgramValue<P> = P extends Program<infer A> ? A : never;

export type Constructor<A> = new (...args: any[]) => A;
