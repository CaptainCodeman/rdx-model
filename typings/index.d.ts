import { Dispatch, Store, GetState } from "@captaincodeman/rdx"
import { Result, Matcher } from "@captaincodeman/router"

export type Context = {
  dispatch: Dispatch
  getState: GetState<any>
  [key: string]: any
}

export type Model<S = any> = {
  state: S
  reducers: Reducers<S>
  // TODO: getState should be dealing with *root* state, hwo do we define that?
  effects?: (dispatch: Dispatcher, getState: GetState<any>) => Effects<S>
  [key: string]: any
}

export type ModelState<M extends Model> = M extends Model<infer S> ? S : never

export type Models = {
  [name: string]: Model
}

export type Effect<S = any, P = any> = (this: Reducers<S>, payload: P) => void

export type Effects<S> = {
  [key: string]: Effect<S>
}

export type Reducer<S = any, P = any> = (state: S, payload: P) => S

export type Reducers<S> = {
  [key: string]: Reducer<S>
}

export type RootState<M extends Models> = {
  [K in keyof M]: ModelState<M[K]>
}

export type Action<P = void> = P extends void ? () => void : (payload: P) => void

export type ReducerAction<R extends Reducer> =
  R extends Reducer<any, void> ? Action<void> :
  R extends Reducer<any, infer P> ? Action<P> : never

export type ReducersActions<R extends Reducers<any>> = {
  [K in keyof R]: ReducerAction<R[K]>
}

export type ModelDispatchers<M extends Model> = ReducersActions<M['reducers']>

export type ModelsDispatchers<M extends Models> = {
  [K in keyof M]: ModelDispatchers<M[K]>
}

export type Dispatcher<M extends Models | void = void> = (M extends Models
  ? ModelsDispatchers<M>
  : { [key: string]: { [key: string]: Action } }
) & Dispatch


export interface Plugin {
  // if the plugin adds any state to the store, it needs a name and model
  state?: {
    name: string
    model: Model
  }
  exposed?: any
  onInit?(this: Context): void
  onStore?(this: Context, store: Store): void
  onModel?<M extends Model>(this: Context, name: string, model: M): void
}

export interface Config {
  models: Models
  plugins?: Plugin[]
  state?: any
}

export type ConfigModels<C extends Config> = C['models']

export interface RemodeledStore<M extends Models = Models> extends Store<RootState<M>> {
  dispatch: Dispatch & Dispatcher<M>
  models: Dispatcher<M>
}

export declare function createStore<C extends Config>(config: C): RemodeledStore<ConfigModels<C>>

export declare function createModel<S>(model: Model<S>): Model<S>

export declare function routingPluginFactory(router: Matcher): Plugin

export type RoutingState = NonNullable<Result>

export interface Routing {
  push(href: string): void;
  replace(href: string): void;
}

export const routingChange = 'routing/change'