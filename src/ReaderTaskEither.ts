/**
 * @since 2.0.0
 */
import { Alt3, Alt3C } from './Alt'
import { Applicative3, Applicative3C } from './Applicative'
import { apFirst_, Apply1, apSecond_ } from './Apply'
import { Bifunctor3 } from './Bifunctor'
import * as E from './Either'
import { bindTo_, bind_, flow, identity, Lazy, pipe, Predicate, Refinement, tuple } from './function'
import { Functor3 } from './Functor'
import { IO } from './IO'
import { IOEither } from './IOEither'
import { chainFirst_, Monad3 } from './Monad'
import { MonadIO3 } from './MonadIO'
import { MonadTask3 } from './MonadTask'
import { MonadThrow3 } from './MonadThrow'
import { Monoid } from './Monoid'
import { Option } from './Option'
import * as R from './Reader'
import { ReaderEither } from './ReaderEither'
import * as RT from './ReaderTask'
import { Semigroup } from './Semigroup'
import * as T from './Task'
import * as TE from './TaskEither'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

import Either = E.Either
import Task = T.Task
import TaskEither = TE.TaskEither
import Reader = R.Reader
import ReaderTask = RT.ReaderTask

/**
 * @category model
 * @since 2.0.0
 */
export interface ReaderTaskEither<R, E, A> {
  (r: R): TaskEither<E, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 2.0.0
 */
export const fromTaskEither: <R, E, A>(ma: TaskEither<E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  R.of

/**
 * @category constructors
 * @since 2.0.0
 */
export const left: <R, E = never, A = never>(e: E) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.left, fromTaskEither)

/**
 * @category constructors
 * @since 2.0.0
 */
export const right: <R, E = never, A = never>(a: A) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.right, fromTaskEither)

/**
 * @category constructors
 * @since 2.0.0
 */
export const rightTask: <R, E = never, A = never>(ma: Task<A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.rightTask, fromTaskEither)

/**
 * @category constructors
 * @since 2.0.0
 */
export const leftTask: <R, E = never, A = never>(me: Task<E>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.leftTask, fromTaskEither)

/**
 * @category constructors
 * @since 2.0.0
 */
export const rightReader: <R, E = never, A = never>(ma: Reader<R, A>) => ReaderTaskEither<R, E, A> = (ma) =>
  flow(ma, TE.right)

/**
 * @category constructors
 * @since 2.0.0
 */
export const leftReader: <R, E = never, A = never>(me: Reader<R, E>) => ReaderTaskEither<R, E, A> = (me) =>
  flow(me, TE.left)

/**
 * @category constructors
 * @since 2.5.0
 */
export const rightReaderTask: <R, E = never, A = never>(ma: ReaderTask<R, A>) => ReaderTaskEither<R, E, A> = (ma) =>
  flow(ma, TE.rightTask)

/**
 * @category constructors
 * @since 2.5.0
 */
export const leftReaderTask: <R, E = never, A = never>(me: ReaderTask<R, E>) => ReaderTaskEither<R, E, A> = (me) =>
  flow(me, TE.leftTask)

/**
 * @category constructors
 * @since 2.0.0
 */
export const fromIOEither: <R, E, A>(ma: IOEither<E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.fromIOEither, fromTaskEither)

/**
 * @category constructors
 * @since 2.0.0
 */
export const fromReaderEither = <R, E, A>(ma: ReaderEither<R, E, A>): ReaderTaskEither<R, E, A> =>
  flow(ma, TE.fromEither)

/**
 * @category constructors
 * @since 2.0.0
 */
export const rightIO: <R, E = never, A = never>(ma: IO<A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.rightIO, fromTaskEither)

/**
 * @category constructors
 * @since 2.0.0
 */
export const leftIO: <R, E = never, A = never>(me: IO<E>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  flow(TE.leftIO, fromTaskEither)

/**
 * @category constructors
 * @since 2.0.0
 */
export const ask: <R, E = never>() => ReaderTaskEither<R, E, R> = () => TE.right

/**
 * @category constructors
 * @since 2.0.0
 */
export const asks: <R, E = never, A = never>(f: (r: R) => A) => ReaderTaskEither<R, E, A> = (f) =>
  flow(TE.right, TE.map(f))

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromEither: <R, E, A>(ma: Either<E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  E.fold(left, (a) => right(a))

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromOption: <E>(onNone: Lazy<E>) => <R, A>(ma: Option<A>) => ReaderTaskEither<R, E, A> = (onNone) => (
  ma
) => (ma._tag === 'None' ? left(onNone()) : right(ma.value))

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromPredicate: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <U>(a: A) => ReaderTaskEither<U, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <R>(a: A) => ReaderTaskEither<R, E, A>
} = <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E) => (a: A) => (predicate(a) ? right(a) : left(onFalse(a)))

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 2.0.0
 */
export function fold<R, E, A, B>(
  onLeft: (e: E) => ReaderTask<R, B>,
  onRight: (a: A) => ReaderTask<R, B>
): (ma: ReaderTaskEither<R, E, A>) => ReaderTask<R, B> {
  return (ma) => (r) =>
    pipe(
      ma(r),
      TE.fold(
        (e) => onLeft(e)(r),
        (a) => onRight(a)(r)
      )
    )
}

/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
export const getOrElseW = <E, R2, B>(
  onLeft: (e: E) => ReaderTask<R2, B>
): (<R1, A>(ma: ReaderTaskEither<R1, E, A>) => ReaderTask<R1 & R2, A | B>) => (ma) => (r) =>
  TE.getOrElseW((e: E) => onLeft(e)(r))(ma(r))

/**
 * @category destructors
 * @since 2.0.0
 */
export const getOrElse: <E, R, A>(
  onLeft: (e: E) => ReaderTask<R, A>
) => (ma: ReaderTaskEither<R, E, A>) => ReaderTask<R, A> = getOrElseW

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 2.0.0
 */
export const orElse = <E1, R, E2, A>(onLeft: (e: E1) => ReaderTaskEither<R, E2, A>) => (
  ma: ReaderTaskEither<R, E1, A>
): ReaderTaskEither<R, E2, A> => (r) => TE.orElse<E1, E2, A>((e) => onLeft(e)(r))(ma(r))

/**
 * @category combinators
 * @since 2.0.0
 */
export const swap = <R, E, A>(ma: ReaderTaskEither<R, E, A>): ReaderTaskEither<R, A, E> => flow(ma, TE.swap)

/**
 * Less strict version of [`filterOrElse`](#filterOrElse).
 *
 * @since 2.9.0
 */
export const filterOrElseW: {
  <A, B extends A, E2>(refinement: Refinement<A, B>, onFalse: (a: A) => E2): <R, E1>(
    ma: ReaderTaskEither<R, E1, A>
  ) => ReaderTaskEither<R, E1 | E2, B>
  <A, E2>(predicate: Predicate<A>, onFalse: (a: A) => E2): <R, E1>(
    ma: ReaderTaskEither<R, E1, A>
  ) => ReaderTaskEither<R, E1 | E2, A>
} = <A, E2>(
  predicate: Predicate<A>,
  onFalse: (a: A) => E2
): (<R, E1>(ma: ReaderTaskEither<R, E1, A>) => ReaderTaskEither<R, E1 | E2, A>) =>
  chainW((a) => (predicate(a) ? right(a) : left(onFalse(a))))

/**
 * Derivable from `MonadThrow`.
 *
 * @category combinators
 * @since 2.0.0
 */
export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): <R>(
    ma: ReaderTaskEither<R, E, A>
  ) => ReaderTaskEither<R, E, B>
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A>
} = filterOrElseW

/**
 * @category combinators
 * @since 2.4.0
 */
export function fromEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Either<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B> {
  return (...a) => fromEither(f(...a))
}

/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export const chainEitherKW: <E, A, B>(
  f: (a: A) => Either<E, B>
) => <R, D>(ma: ReaderTaskEither<R, D, A>) => ReaderTaskEither<R, D | E, B> = (f) => chainW(fromEitherK(f))

/**
 * @category combinators
 * @since 2.4.0
 */
export const chainEitherK: <E, A, B>(
  f: (a: A) => Either<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> = chainEitherKW

/**
 * @category combinators
 * @since 2.4.0
 */
export function fromIOEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => IOEither<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B> {
  return (...a) => fromIOEither(f(...a))
}

/**
 * Less strict version of [`chainIOEitherK`](#chainIOEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export const chainIOEitherKW: <E, A, B>(
  f: (a: A) => IOEither<E, B>
) => <R, D>(ma: ReaderTaskEither<R, D, A>) => ReaderTaskEither<R, D | E, B> = (f) => chainW(fromIOEitherK(f))

/**
 * @category combinators
 * @since 2.4.0
 */
export const chainIOEitherK: <E, A, B>(
  f: (a: A) => IOEither<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> = chainIOEitherKW

/**
 * @category combinators
 * @since 2.4.0
 */
export function fromTaskEitherK<E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => TaskEither<E, B>
): <R>(...a: A) => ReaderTaskEither<R, E, B> {
  return (...a) => fromTaskEither(f(...a))
}

/**
 * Less strict version of [`chainTaskEitherK`](#chainTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
export const chainTaskEitherKW: <E, A, B>(
  f: (a: A) => TaskEither<E, B>
) => <R, D>(ma: ReaderTaskEither<R, D, A>) => ReaderTaskEither<R, D | E, B> = (f) => chainW(fromTaskEitherK(f))

/**
 * @category combinators
 * @since 2.4.0
 */
export const chainTaskEitherK: <E, A, B>(
  f: (a: A) => TaskEither<E, B>
) => <R>(ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> = chainTaskEitherKW

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
export const map: <A, B>(f: (a: A) => B) => <R, E>(fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> = (
  f
) => (fa) => flow(fa, TE.map(f))

/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export const bimap: Bifunctor3<URI>['bimap'] = (f, g) => (fa) => (r) => pipe(fa(r), TE.bimap(f, g))

/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
export const mapLeft: Bifunctor3<URI>['mapLeft'] = (f) => (fa) => (r) => pipe(fa(r), TE.mapLeft(f))

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
export const apW = <R2, E2, A>(fa: ReaderTaskEither<R2, E2, A>) => <R1, E1, B>(
  fab: ReaderTaskEither<R1, E1, (a: A) => B>
): ReaderTaskEither<R1 & R2, E1 | E2, B> => (r) => pipe(fab(r), TE.apW(fa(r)))

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
export const ap: Applicative3<URI>['ap'] = apW

/**
 * Wrap a value into the type constructor.
 *
 * Equivalent to [`right`](#right).
 *
 * @category Applicative
 * @since 2.7.0
 */
export const of: Applicative3<URI>['of'] = right

/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
export const chainW: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => <Q, D>(ma: ReaderTaskEither<Q, D, A>) => ReaderTaskEither<Q & R, D | E, B> = (f) => (fa) => (r) =>
  pipe(
    fa(r),
    TE.chainW((a) => f(a)(r))
  )

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
export const chain: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (ma: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> = chainW

/**
 * Derivable from `Monad`.
 *
 * @category derivable combinators
 * @since 2.0.0
 */
export const flatten: <R, E, A>(mma: ReaderTaskEither<R, E, ReaderTaskEither<R, E, A>>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  chain(identity)

/**
 * Less strict version of [`alt`](#alt).
 *
 * @category Alt
 * @since 2.9.0
 */
export const altW = <R2, E2, B>(second: () => ReaderTaskEither<R2, E2, B>) => <R1, E1, A>(
  first: ReaderTaskEither<R1, E1, A>
): ReaderTaskEither<R1 & R2, E1 | E2, A | B> => (r) =>
  pipe(
    first(r),
    TE.altW(() => second()(r))
  )

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
export const alt: Alt3<URI>['alt'] = altW

/**
 * @category MonadIO
 * @since 2.0.0
 */
export const fromIO: MonadIO3<URI>['fromIO'] = rightIO

/**
 * @category MonadTask
 * @since 2.0.0
 */
export const fromTask: MonadTask3<URI>['fromTask'] = rightTask

/**
 * @category MonadThrow
 * @since 2.0.0
 */
export const throwError: MonadThrow3<URI>['throwError'] = left

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 2.0.0
 */
export const URI = 'ReaderTaskEither'

/**
 * @category instances
 * @since 2.0.0
 */
export type URI = typeof URI

declare module './HKT' {
  interface URItoKind3<R, E, A> {
    readonly [URI]: ReaderTaskEither<R, E, A>
  }
}

/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export function getSemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderTaskEither<R, E, A>> {
  return R.getSemigroup(TE.getSemigroup(S))
}

/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
export function getApplySemigroup<R, E, A>(S: Semigroup<A>): Semigroup<ReaderTaskEither<R, E, A>> {
  return R.getSemigroup(TE.getApplySemigroup(S))
}

/**
 * @category instances
 * @since 2.0.0
 */
export function getApplyMonoid<R, E, A>(M: Monoid<A>): Monoid<ReaderTaskEither<R, E, A>> {
  return {
    concat: getApplySemigroup<R, E, A>(M).concat,
    empty: right(M.empty)
  }
}

/**
 * @category instances
 * @since 2.7.0
 */
export function getApplicativeReaderTaskValidation<E>(A: Apply1<T.URI>, SE: Semigroup<E>): Applicative3C<URI, E> {
  const AV = TE.getApplicativeTaskValidation(A, SE)
  const ap = <EF, A>(
    fga: R.Reader<EF, TE.TaskEither<E, A>>
  ): (<B>(fgab: R.Reader<EF, TE.TaskEither<E, (a: A) => B>>) => R.Reader<EF, TE.TaskEither<E, B>>) =>
    flow(
      R.map((gab) => (ga: TE.TaskEither<E, A>) => pipe(gab, AV.ap(ga))),
      R.ap(fga)
    )
  return {
    URI,
    map,
    ap,
    of
  }
}

/**
 * @category instances
 * @since 2.7.0
 */
export function getAltReaderTaskValidation<E>(SE: Semigroup<E>): Alt3C<URI, E> {
  const A = TE.getAltTaskValidation(SE)
  return {
    URI,
    map,
    alt: (second) => (first) => (r) =>
      pipe(
        first(r),
        A.alt(() => second()(r))
      )
  }
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Functor: Functor3<URI> = {
  URI,
  map
}

/**
 * @category instances
 * @since 2.7.0
 */
export const ApplicativePar: Applicative3<URI> = {
  URI,
  map,
  ap,
  of
}

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @category derivable combinators
 * @since 2.0.0
 */
export const apFirst: <R, E, B>(
  second: ReaderTaskEither<R, E, B>
) => <A>(first: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A> =
  /*#__PURE__*/
  apFirst_(ApplicativePar)

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @category derivable combinators
 * @since 2.0.0
 */
export const apSecond: <R, E, B>(
  second: ReaderTaskEither<R, E, B>
) => <A>(first: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, B> =
  /*#__PURE__*/
  apSecond_(ApplicativePar)

/**
 * @category instances
 * @since 2.7.0
 */
export const ApplicativeSeq: Applicative3<URI> = {
  URI,
  map,
  ap: (fa) => chain((f) => pipe(fa, map(f))),
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Monad: Monad3<URI> = {
  URI,
  map,
  of,
  chain
}

/**
 * Less strict version of [`chainFirst`](#chainFirst).
 *
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 2.8.0
 */
export const chainFirstW: <A, R2, E2, B>(
  f: (a: A) => ReaderTaskEither<R2, E2, B>
) => <R1, E1>(first: ReaderTaskEither<R1, E1, A>) => ReaderTaskEither<R1 & R2, E1 | E2, A> =
  /*#__PURE__*/
  chainFirst_(Monad) as any

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * Derivable from `Monad`.
 *
 * @category derivable combinators
 * @since 2.0.0
 */
export const chainFirst: <A, R, E, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (first: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, A> = chainFirstW

/**
 * @category instances
 * @since 3.0.0
 */
export const MonadTask: MonadTask3<URI> = {
  URI,
  fromIO,
  fromTask
}

/**
 * @category instances
 * @since 3.0.0
 */
export const MonadThrow: MonadThrow3<URI> = {
  URI,
  throwError
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Bifunctor: Bifunctor3<URI> = {
  URI,
  bimap,
  mapLeft
}

/**
 * @category instances
 * @since 2.7.0
 */
export const Alt: Alt3<URI> = {
  URI,
  map,
  alt
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * Derivable from `MonadThrow`.
 *
 * @since 2.0.4
 */
export function bracket<R, E, A, B>(
  aquire: ReaderTaskEither<R, E, A>,
  use: (a: A) => ReaderTaskEither<R, E, B>,
  release: (a: A, e: Either<E, B>) => ReaderTaskEither<R, E, void>
): ReaderTaskEither<R, E, B> {
  return (r) =>
    TE.bracket(
      aquire(r),
      (a) => use(a)(r),
      (a, e) => release(a, e)(r)
    )
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 2.9.0
 */
export const Do: ReaderTaskEither<unknown, never, {}> = of({})

/**
 * @since 2.8.0
 */
export const bindTo = <N extends string>(
  name: N
): (<R, E, A>(fa: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, { [K in N]: A }>) => map(bindTo_(name))

/**
 * @since 2.8.0
 */
export const bindW = <N extends string, A, Q, D, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => ReaderTaskEither<Q, D, B>
): (<R, E>(
  fa: ReaderTaskEither<R, E, A>
) => ReaderTaskEither<Q & R, E | D, { [K in keyof A | N]: K extends keyof A ? A[K] : B }>) =>
  chainW((a) =>
    pipe(
      f(a),
      map((b) => bind_(a, name, b))
    )
  )

/**
 * @since 2.8.0
 */
export const bind: <N extends string, A, R, E, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (
  fa: ReaderTaskEither<R, E, A>
) => ReaderTaskEither<R, E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }> = bindW

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 2.8.0
 */
export const apSW = <A, N extends string, Q, D, B>(
  name: Exclude<N, keyof A>,
  fb: ReaderTaskEither<Q, D, B>
): (<R, E>(
  fa: ReaderTaskEither<R, E, A>
) => ReaderTaskEither<Q & R, D | E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }>) =>
  flow(
    map((a) => (b: B) => bind_(a, name, b)),
    apW(fb)
  )

/**
 * @since 2.8.0
 */
export const apS: <A, N extends string, R, E, B>(
  name: Exclude<N, keyof A>,
  fb: ReaderTaskEither<R, E, B>
) => (
  fa: ReaderTaskEither<R, E, A>
) => ReaderTaskEither<R, E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }> = apSW

// -------------------------------------------------------------------------------------
// pipeable sequence T
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const ApT: ReaderTaskEither<unknown, never, readonly []> = of([])

/**
 * @since 3.0.0
 */
export const tupled: <R, E, A>(a: ReaderTaskEither<R, E, A>) => ReaderTaskEither<R, E, readonly [A]> = map(tuple)

/**
 * @since 3.0.0
 */
export const apTW = <R2, E2, B>(fb: ReaderTaskEither<R2, E2, B>) => <R1, E1, A extends ReadonlyArray<unknown>>(
  fas: ReaderTaskEither<R1, E1, A>
): ReaderTaskEither<R1 & R2, E1 | E2, readonly [...A, B]> =>
  pipe(
    fas,
    map((a) => (b: B): readonly [...A, B] => [...a, b]),
    apW(fb)
  )

/**
 * @since 3.0.0
 */
export const apT: <R, E, B>(
  fb: ReaderTaskEither<R, E, B>
) => <A extends ReadonlyArray<unknown>>(
  fas: ReaderTaskEither<R, E, A>
) => ReaderTaskEither<R, E, readonly [...A, B]> = apTW

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * @since 2.9.0
 */
export const traverseArrayWithIndex: <R, E, A, B>(
  f: (index: number, a: A) => ReaderTaskEither<R, E, B>
) => (arr: ReadonlyArray<A>) => ReaderTaskEither<R, E, ReadonlyArray<B>> = (f) => (arr) => (r) => () =>
  Promise.all(arr.map((x, i) => f(i, x)(r)())).then(E.sequenceArray)

/**
 * @since 2.9.0
 */
export const traverseArray: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (arr: ReadonlyArray<A>) => ReaderTaskEither<R, E, ReadonlyArray<B>> = (f) => traverseArrayWithIndex((_, a) => f(a))

/**
 * @since 2.9.0
 */
export const sequenceArray: <R, E, A>(
  arr: ReadonlyArray<ReaderTaskEither<R, E, A>>
) => ReaderTaskEither<R, E, ReadonlyArray<A>> = traverseArray(identity)

/**
 * @since 2.9.0
 */
export const traverseSeqArrayWithIndex: <R, E, A, B>(
  f: (index: number, a: A) => ReaderTaskEither<R, E, B>
) => (arr: ReadonlyArray<A>) => ReaderTaskEither<R, E, ReadonlyArray<B>> = (f) => (arr) => (r) => async () => {
  // tslint:disable-next-line: readonly-array
  const out = []
  for (let i = 0; i < arr.length; i++) {
    const b = await f(i, arr[i])(r)()
    if (E.isLeft(b)) {
      return b
    }
    out.push(b.right)
  }

  return E.right(out)
}

/**
 * @since 2.9.0
 */
export const traverseSeqArray: <R, E, A, B>(
  f: (a: A) => ReaderTaskEither<R, E, B>
) => (arr: ReadonlyArray<A>) => ReaderTaskEither<R, E, ReadonlyArray<B>> = (f) =>
  traverseSeqArrayWithIndex((_, a) => f(a))

/**
 * @since 2.9.0
 */
export const sequenceSeqArray: <R, E, A>(
  arr: ReadonlyArray<ReaderTaskEither<R, E, A>>
) => ReaderTaskEither<R, E, ReadonlyArray<A>> = traverseSeqArray(identity)
