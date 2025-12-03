export type FreeForm = Record<string | number | symbol, unknown>

/**
 * Helper that allows extending a type as a union type
 * while also providing syntactic sugar for extending a type with FreeForm
 */
export type Extendable<T, Ext = FreeForm> = Ext & T

/**
 * Mark the given keys of target type as required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/*
 * Make a set of keys of a given target type required, while making all other optional
 */
export type RequireOnly<T, Keys extends keyof T> = Partial<T> & Pick<WithRequired<T, Keys>, Keys>

/**
 * Exclusive OR
 */
export type XOR<T, U> =
  | (T & Partial<Record<Exclude<keyof U, keyof T>, never>>)
  | (U & Partial<Record<Exclude<keyof T, keyof U>, never>>)
