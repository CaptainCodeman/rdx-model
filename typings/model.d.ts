import { Dispatch as RdxDispatch, GetState } from "@captaincodeman/rdx"
import { ModelsDispatch, Models } from "./models"

export type Dispatch = RdxDispatch & {
  [model: string]: {
    [action: string]: Effect
  }
}

export type Reducer<S, P = any> = (state: S, payload: P) => S

export interface Reducers<S> {
  [key: string]: Reducer<S>
}

export type Effect<P = any> = (payload?: P) => void

export interface Effects {
  [key: string]: Effect
}

// TODO: constraint to limit reducers + effects with the same name, to the same payload
export interface Model<S = any, R extends Reducers<S> = any, E extends Effects = any> {
  state: S
  reducers: R
  effects?: (dispatch: any, getState: GetState) => E
  [key: string]: any
}

export type ActionFromReducer<S, R extends Reducer<S>> = 
  R extends (state: S) => S ? () => void :
  R extends (state: S, payload: infer P) => S ? (payload: P) => void : never

export type ActionsFromReducers<S, R extends Reducers<S>> = {
  [K in keyof R]: ActionFromReducer<S, R[K]>
}

export type ActionFromEffect<R extends Effect> = 
  R extends () => void ? () => void :
  R extends (payload: infer P) => void ? (payload: P) => void : never

export type ActionsFromEffects<R extends Effects> = {
  [K in keyof R]: ActionFromEffect<R[K]>
}

export type ModelDispatch<S, R extends Reducers<S>, E extends Effects> = ActionsFromReducers<S, R> & ActionsFromEffects<E>

export declare function createModel<S, R extends Reducers<S>, E extends Effects>(model: Model<S, R, E>): Model<S, R, E>