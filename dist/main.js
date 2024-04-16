class g {
  constructor(t) {
    this.value = t;
  }
  static apply(t, r) {
    return t.isRight() && r.isRight() ? l(t.right()(r.right())) : t.isLeft() ? t : r;
  }
}
class d extends g {
  fold(t, r) {
    return t(this.value);
  }
  left() {
    return this.value;
  }
  right() {
  }
  isLeft() {
    return !0;
  }
  isRight() {
    return !1;
  }
  tapLeft(t) {
    return t(this.value), this;
  }
  tapRight(t) {
    return this;
  }
  map(t) {
    return this;
  }
  chain(t) {
    return this;
  }
  toPrimitive() {
    return { isRight: !1, value: this.value };
  }
  getOrElseThrow() {
    throw this.value;
  }
  getOrElse(t) {
    return t;
  }
}
class m extends g {
  fold(t, r) {
    return r(this.value);
  }
  left() {
  }
  right() {
    return this.value;
  }
  isLeft() {
    return !1;
  }
  isRight() {
    return !0;
  }
  tapLeft(t) {
    return this;
  }
  tapRight(t) {
    return t(this.value), this;
  }
  map(t) {
    return new m(t(this.value));
  }
  chain(t) {
    return t(this.value);
  }
  toPrimitive() {
    return { isRight: !0, value: this.value };
  }
  getOrElseThrow() {
    return this.value;
  }
  getOrElse(t) {
    return this.value;
  }
}
const l = (i) => new m(i), c = (i) => new d(i), W = g.apply;
class a {
  constructor(t) {
    this.value = t;
  }
  static of(t) {
    return new a(t);
  }
  static apply(t, r) {
    return t.isNothing() || r.isNothing() ? a.of(null) : a.of(t.value(r.value));
  }
  isNothing() {
    return this.value === null || this.value === void 0;
  }
  tap(t) {
    return this.isNothing() || t(this.value), this;
  }
  map(t) {
    return this.isNothing() ? a.of(null) : a.of(t(this.value));
  }
  ap(t) {
    return a.apply(this, t);
  }
  join() {
    return this.isNothing() ? a.of(null) : this.value;
  }
  chain(t) {
    return this.map(t).join();
  }
  getOrElse(t) {
    return this.isNothing() ? t : this.value;
  }
  get() {
    return this.value ?? null;
  }
  toEither(t) {
    return this.isNothing() ? c(t) : l(this.value);
  }
  fold(t, r) {
    return this.isNothing() ? t() : r(this.value);
  }
}
const C = () => a.of(null), L = a.of, A = a.apply, O = (i) => i instanceof g ? i : i instanceof Error || typeof i == "string" ? c(i) : c(`Unknown error: ${i}`);
class s {
  constructor(t) {
    this.run = t;
  }
  static sequence(t) {
    return t.length === 0 ? s.right([]) : t.reduce((n, e) => n.chain(
      (w) => s.from(
        () => e.fold(
          (v) => c(v),
          (v) => l([...w, v])
        )
      )
    ), s.right([]));
  }
  static parsePrimitiveEither(t) {
    return t === null ? { isRight: !1, value: "Null value from TaskEither.fromPrimitives" } : t === void 0 ? { isRight: !1, value: "Undefined value from TaskEither.fromPrimitives" } : typeof t == "object" && "isRight" in t ? t : t instanceof g ? t.toPrimitive() : { isRight: !1, value: t };
  }
  static fromPrimitives(t) {
    const r = s.parsePrimitiveEither(t);
    return r.isRight ? s.of(l(r.value)) : s.of(c(r.value));
  }
  static from(t) {
    return new s(() => t().catch(O));
  }
  static of(t) {
    const r = L(t).getOrElse(c("Invalid value from TaskEither.of"));
    return new s(() => Promise.resolve(r));
  }
  static right(t) {
    return s.of(l(t));
  }
  static left(t) {
    return s.of(c(t));
  }
  static appply(t, r) {
    return s.from(async () => {
      const n = await t.run(), e = await r.run();
      if (n.isLeft())
        return c(n.left());
      if (e.isLeft())
        return c(e.left());
      const w = n.right(), v = e.right();
      return l(w(v));
    });
  }
  async fold(t, r) {
    return this.run().then((n) => n.fold(t, r));
  }
  left() {
    return this.fold(
      (t) => t,
      (t) => {
      }
    );
  }
  right() {
    return this.fold(
      (t) => {
      },
      (t) => t
    );
  }
  isLeft() {
    return this.fold(
      (t) => !0,
      (t) => !1
    );
  }
  isRight() {
    return this.fold(
      (t) => !1,
      (t) => !0
    );
  }
  map(t) {
    return new s(
      () => this.run().then(
        (r) => r.fold(
          (n) => Promise.resolve(new d(n)),
          (n) => Promise.resolve(new m(t(n)))
        )
      ).catch(O)
    );
  }
  tap(t) {
    return new s(
      () => this.run().then(
        (r) => r.fold(
          (n) => Promise.resolve(new d(n)),
          async (n) => (t(n), new m(n))
        )
      )
    );
  }
  chain(t) {
    return new s(
      () => this.run().then(
        (r) => r.fold(
          (n) => Promise.resolve(new d(n)),
          (n) => t(n).run()
        )
      )
    );
  }
  chainLeft(t) {
    return new s(
      () => this.run().then(
        (r) => r.fold(
          (n) => t(n).run(),
          (n) => Promise.resolve(new m(n))
        )
      )
    );
  }
  async getOrElse(t) {
    return (await this.run()).fold(
      () => t,
      (n) => n
    );
  }
  async getOrElseThrow(t) {
    return (await this.run()).fold(
      (n) => Promise.reject(n ?? t ?? "Error from TaskEither"),
      (n) => n
    );
  }
  async toPrimitive() {
    return this.run().then((t) => t.toPrimitive());
  }
}
const $ = s.from, q = s.of, F = s.appply;
class h {
  constructor(t) {
    this.effect = t;
  }
  static from(t) {
    return new h(t);
  }
  static void(t) {
    return new h(async () => {
      await t();
    });
  }
  static of(t) {
    return new h(() => Promise.resolve(t));
  }
  static rejected(t) {
    return new h(() => Promise.reject(t));
  }
  static apply(t, r) {
    return new h(async () => {
      const n = await t.run(), e = await r.run();
      return n(e);
    });
  }
  async run() {
    return this.effect();
  }
  map(t) {
    return new h(async () => t(await this.run()));
  }
  tap(t) {
    return new h(async () => {
      const r = await this.run();
      return t(r), r;
    });
  }
  chain(t) {
    return new h(async () => t(await this.run()).run());
  }
  toEither(t) {
    return s.from(
      () => this.run().then((r) => l(r)).catch(
        (r) => L(t).map((n) => c(n(r))).getOrElse(c(r))
      )
    );
  }
}
const z = h.from, B = h.apply;
class f {
  constructor(t) {
    this.effect = t;
  }
  static apply(t, r) {
    return new f(() => t.run()(r.run()));
  }
  static of(t) {
    return new f(() => t);
  }
  static reject(t) {
    return new f(() => {
      throw t;
    });
  }
  run() {
    return this.effect();
  }
  tap(t) {
    return new f(() => {
      const r = this.run();
      return t(r), r;
    });
  }
  map(t) {
    return new f(() => t(this.run()));
  }
  chain(t) {
    return new f(() => t(this.run()).run());
  }
  fold(t, r) {
    try {
      return r(this.run());
    } catch {
      return t();
    }
  }
}
const D = f.of, G = f.apply;
class E {
  constructor(t) {
    this.effect = t;
  }
  static from(t) {
    return new E(t);
  }
  run(t) {
    return this.effect(t);
  }
  map(t) {
    return new E((r) => this.run(r).map(t));
  }
  chain(t) {
    return new E(
      (r) => this.run(r).chain((n) => t(n).fold(r, (e) => c(e), l))
    );
  }
  fold(t, r, n) {
    return this.run(t).fold(r, n);
  }
}
class P {
  constructor(t) {
    this.effect = t;
  }
  static from(t) {
    return new P(t);
  }
  run(t) {
    return this.effect(t);
  }
  map(t) {
    return new P((r) => this.run(r).map(t));
  }
  chain(t) {
    return new P(
      (r) => this.run(r).chain((n) => t(n).fold(r, () => f.reject(new Error("IO rejected")), f.of))
    );
  }
  fold(t, r, n) {
    try {
      return n(this.run(t).run());
    } catch (e) {
      return r(e);
    }
  }
}
class N {
  constructor(t) {
    this.effect = t;
  }
  static from(t) {
    return new N(t);
  }
  run(t) {
    return this.effect(t);
  }
  map(t) {
    return new N((r) => this.run(r).map(t));
  }
  chain(t) {
    return new N((r) => this.run(r).chain((n) => t(n).fold(r, () => C(), L)));
  }
  fold(t, r, n) {
    return this.run(t).fold(r, n);
  }
}
class u {
  constructor(t) {
    this.run = t;
  }
  static from(t) {
    return new u(t);
  }
  static fromIO(t) {
    return new u((r) => t(r).run());
  }
  static fromEither(t) {
    return new u((r) => t(r).getOrElseThrow());
  }
  static of(t) {
    return new u(() => t);
  }
  static ofEither(t) {
    return new u(() => t.getOrElseThrow());
  }
  static ask() {
    return new u((t) => t);
  }
  static apply(t, r) {
    return new u((n) => {
      const e = t.run(n), w = r.run(n);
      return e(w);
    });
  }
  ask() {
    return u.ask();
  }
  map(t) {
    return new u((r) => t(this.run(r)));
  }
  chain(t) {
    return new u((r) => t(this.run(r)).run(r));
  }
  chainContext(t, r) {
    return this.chain((n) => U(t, r(n)));
  }
  toEither(t, r) {
    try {
      return l(this.run(t));
    } catch (n) {
      return c(r ? r(t) : n);
    }
  }
}
const H = u.from, J = u.fromIO, K = u.fromEither, Q = u.ask, X = u.of, Y = u.apply;
function U(i, t) {
  return u.from((r) => t.run(i(r)));
}
class Z {
}
const y = (i, t) => [i, t];
class p {
  constructor(t) {
    this.run = t;
  }
  static of(t) {
    return new p((r) => y(t, r));
  }
  static from(t) {
    return new p(t);
  }
  map(t) {
    return new p((r) => {
      const [n, e] = this.run(r);
      return y(t(n), e);
    });
  }
  tap(t) {
    return new p((r) => {
      const [n, e] = this.run(r);
      return t(n), y(n, e);
    });
  }
  tapEffect(t) {
    return new p((r) => {
      const [n, e] = this.run(r);
      return t(e), y(n, e);
    });
  }
  chain(t) {
    return new p((r) => {
      const [n, e] = this.run(r);
      return t(n).run(e);
    });
  }
  runWith(t) {
    return this.run(t);
  }
  evalWith(t) {
    return this.run(t)[0];
  }
  execWith(t) {
    return this.run(t)[1];
  }
}
class j {
  constructor(t) {
    this.effect = t;
  }
  static from(t) {
    return new j(t);
  }
  run(t) {
    return this.effect(t);
  }
  map(t) {
    return new j((r) => this.run(r).map(t));
  }
  chain(t) {
    return new j(
      (r) => this.run(r).chain((n) => s.from(() => t(n).fold(r, (e) => c(e), l)))
    );
  }
  fold(t, r, n) {
    return this.run(t).fold(r, n);
  }
}
class x {
  constructor(t) {
    this.effect = t;
  }
  static from(t) {
    return new x(t);
  }
  run(t) {
    return this.effect(t);
  }
  map(t) {
    return new x((r) => this.run(r).map(t));
  }
  chain(t) {
    return new x(
      (r) => this.run(r).chain(
        (n) => h.from(
          () => t(n).fold(
            r,
            (e) => {
              throw new Error(`Unexpected error ${e}`);
            },
            (e) => e
          )
        )
      )
    );
  }
  fold(t, r, n) {
    return this.run(t).run().then(n).catch(r);
  }
}
class o {
  constructor(t) {
    this.run = t;
  }
  static from(t) {
    return new o(t);
  }
  static fromTaskIO(t) {
    return new o((r) => t(r).run());
  }
  static fromTaskEither(t) {
    return new o((r) => t(r).getOrElseThrow());
  }
  static fromReader(t) {
    return new o((r) => Promise.resolve(t(r).run(r)));
  }
  static of(t) {
    return new o(() => Promise.resolve(t));
  }
  static ofEither(t) {
    return new o(async () => t.getOrElseThrow());
  }
  static ofReader(t) {
    return new o((r) => Promise.resolve(t.run(r)));
  }
  static ask() {
    return new o(async (t) => t);
  }
  static apply(t, r) {
    return new o(async (n) => {
      const e = await t.run(n), w = await r.run(n);
      return e(w);
    });
  }
  ask() {
    return o.ask();
  }
  map(t) {
    return new o((r) => this.run(r).then(t));
  }
  tap(t) {
    return this.map((r) => (t(r), r));
  }
  chain(t) {
    return new o((r) => this.run(r).then((n) => t(n).run(r)));
  }
  chainContext(t, r) {
    return this.chain((n) => V(t, r(n)));
  }
  toEither(t, r) {
    return h.from(async () => this.run(t)).toEither(r);
  }
}
const I = o.fromTaskIO, M = o.fromTaskEither, S = o.apply;
function V(i, t) {
  return o.from((r) => t.run(i(r)));
}
class k {
}
export {
  g as Either,
  E as EitherReaderT,
  j as EitherTaskReaderT,
  f as IO,
  P as IOReaderT,
  x as IOTaskReaderT,
  Z as IReaderT,
  k as ITaskReaderT,
  d as Left,
  a as Maybe,
  N as MaybeReaderT,
  y as Pair,
  u as Reader,
  m as Right,
  p as State,
  s as TaskEither,
  h as TaskIO,
  o as TaskReader,
  W as applyEither,
  G as applyIO,
  A as applyMaybe,
  F as applyTaskEither,
  B as applyTaskIO,
  S as applyTaskReader,
  D as io,
  c as left,
  L as maybe,
  C as nothing,
  H as reader,
  Y as readerApply,
  Q as readerAsk,
  K as readerEither,
  J as readerIO,
  U as readerMapContext,
  X as readerOf,
  I as readerTask,
  M as readerTaskEither,
  V as readerTaskMapContext,
  l as right,
  $ as taskEither,
  q as taskEitherOf,
  z as taskIO
};
