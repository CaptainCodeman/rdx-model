import { Store as RdxStore, Dispatch, GetState } from "@captaincodeman/rdx"
import { Result, Matcher } from "@captaincodeman/router"

export type ActionFromReducer<S, R extends Reducer<S>> = 
  R extends (state: S) => S ? () => () => void :
  R extends (state: S, payload: infer P) => S ? (payload: P) => void : never

export type ActionsFromReducer<S, R extends Reducers<S>> = { [K in keyof R]: ActionFromReducer<S, R[K]> }

export type Reducer<S, P = any> = (state: S, payload: P) => S

export type Reducers<S> = { [key: string]: Reducer<S> }

export type Effect<P = any> = (payload: P) => void

export type Effects = { [key: string]: Effect }

export type ActionFromEffect<R extends Effect> = 
  R extends () => void ? () => void :
  R extends (payload: infer P) => void ? (payload: P) => void : never

export type ActionsFromEffects<R extends Effects> = { [K in keyof R]: ActionFromEffect<R[K]> }

// TODO: constraint to limit reducers + effects with the same name, to the same payload
export type Model<S = any, R extends Reducers<S> = any, E extends Effects = any> = {
  state: S
  reducers: R
  // TODO: try to improve these types
  effects?: (dispatch: any, getState: GetState<any>) => E
  [key: string]: any
}

export type ModelDispatch<S, R extends Reducers<S>, E extends Effects> = ActionsFromReducer<S, R> & ActionsFromEffects<E>

export declare function createModel<S, R extends Reducers<S>, E extends Effects>(model: Model<S, R, E>): Model<S, R, E>

export type Models = { [name: string]: Model }

export type ModelsState<M extends Models> = {
  [K in keyof M]: M[K] extends Model<infer S> ? S : never
}

export type ModelsDispatch<M extends Models> = {
  [K in keyof M]: M[K] extends Model<infer S, infer R, infer E> ? ModelDispatch<S, R, E> : never
}

export interface Plugin {
  // if the plugin adds any state to the store, it needs a name and model
  state?: {
    name: string
    model: Model
  }
  onModel?<M extends Model>(store: Store, name: string, model: M): void
  onStore?(store: Store): void
}

export interface Config {
  models: Models
  plugins?: Plugin[]
  state?: any
}

export type ConfigModels<C extends Config> = C['models']

export interface Store<M extends Models = Models> extends RdxStore<ModelsState<M>> {
  dispatch: Dispatch & ModelsDispatch<M>,
}

export declare function createStore<C extends Config>(config: C): Store<ConfigModels<C>>

// === routing ===

export declare function routingPluginFactory(router: Matcher, options?: Partial<RoutingOptions>): Plugin

export type RoutingState = NonNullable<Result> & {
  queries?: {
    [key: string]: string | string[]
  }
}

export interface RoutingDispatch {
  change(payload: RoutingState): void;
  back(): void;
  forward(): void;
  go(payload: number): void;
  push(href: string): void;
  replace(href: string): void;
}

export interface RoutingOptions {
  transform: (result: Result) => RoutingState
}

export function withQuerystring(result: Result): RoutingState

export type RoutingChange = 'routing/change'

export const routingChange: RoutingChange
