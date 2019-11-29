import { Dispatch, Store } from "@captaincodeman/rdx"

type Context = {
  dispatch: Dispatch
  [key: string]: any
}

type Model<S = any> = {
  state: S
  reducers: Reducers<S>
  effects?: Effects<S>
  [key: string]: any
}

type ModelState<M extends Model> = M extends Model<infer S> ? S : never

type Models = {
  [name: string]: Model
}

type Effect<S = any, P = any> = (this: Reducers<S>, payload: P, getState: () => any, dispatch: Dispatch) => void

type Effects<S> = {
  [key: string]: Effect<S>
}

type Reducer<S = any, P = any> = (state: S, payload: P) => S

type Reducers<S> = {
  [key: string]: Reducer<S>
}

type RootState<M extends Models> = {
  [K in keyof M]: ModelState<M[K]>
}

type Action<P = void> = P extends void ? () => void : (payload: P) => void

type ReducerAction<R extends Reducer> =
  R extends Reducer<any, void> ? Action<void> :
  R extends Reducer<any, infer P> ? Action<P> : never

type ReducersActions<R extends Reducers<any>> = {
  [K in keyof R]: ReducerAction<R[K]>
}

type ModelDispatchers<M extends Model> = ReducersActions<M['reducers']>

type ModelsDispatchers<M extends Models> = {
  [K in keyof M]: ModelDispatchers<M[K]>
}

type Dispatcher<M extends Models> = ModelsDispatchers<M>

interface Plugin {
  // if the model adds any state to the store, it needs a name and model
  state?: {
    name: string
    model: Model
  }
  exposed?: any
  onInit?(this: Context): void
  onStore?(this: Context, store: Store): void
  onModel?<M extends Model>(this: Context, name: string, model: M): void
}

interface Config {
  name?: string
  models: Models
  plugins?: Plugin[]
  redux?: {
    state?: any
  }
}

type ConfigModels<C extends Config> = C['models']

interface RemodeledStore<M extends Models = Models> extends Store<RootState<M>> {
  models: Dispatcher<M>
}