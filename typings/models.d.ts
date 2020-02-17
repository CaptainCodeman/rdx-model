import { Model, ModelDispatch } from './model'

export interface Models {
  [name: string]: Model
}

export type ModelsState<M extends Models> = {
  [K in keyof M]: M[K] extends Model<infer S> ? S : never
}

export type ModelsDispatch<M extends Models> = {
  [K in keyof M]: M[K] extends Model<infer S, infer R, infer E> ? ModelDispatch<S, R, E> : never
}
