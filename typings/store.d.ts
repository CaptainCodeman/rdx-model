import { Store as RdxStore, Dispatch as RdxDispatch } from "@captaincodeman/rdx"

import { Model } from './model'
import { Models, ModelsDispatch, ModelsState } from './models'

export interface Plugin<M extends Model = Model> {
  // if the plugin adds any state to the store, it can define it's own model
  // which will be merged together with the application-defined models ...
  model?: M
  
  // NOTE: this is *NOT* the same model as above - this is called for each
  // model in the store as part of the setup, to give a plugin chance to do
  // whatever it needs to do based on each one.
  onModel?<M extends Model>(store: Store, name: string, model: M): void

  // TODO: thinking about it, why do we need 'onModel'? Can't we just handle
  // the store as a whole and the plugin can iterate the models if it wants?
  onStore?(store: Store): void
}

export interface Plugins {
  [name: string]: Plugin
}

type ExtractPluginModel<P extends Plugin> = P['model']

type ExtractModelsFromPlugins<P extends Plugins> = {
  [K in keyof P]: ExtractPluginModel<P[K]>
};

type KeysOfPluginsWithModels<P extends Plugins> = {
  [K in keyof P]: undefined extends ExtractPluginModel<P[K]> ? never : K
}[keyof P];

type PluginsModels<P> = P extends Plugins ? ExtractModelsFromPlugins<Pick<P, KeysOfPluginsWithModels<P>>> : unknown;

type ExtractConfigPlugins<C extends Config> = C['plugins']

type ExtractConfigModels<C extends Config> = C['models']

type ConfigModels<C extends Config> = ExtractConfigModels<C> & PluginsModels<ExtractConfigPlugins<C>>

export interface Config {
  models: Models
  plugins?: Plugins
  state?: any
}

export interface Store<M extends Models = Models> extends RdxStore<ModelsState<M>> {
  dispatch: ModelsDispatch<M> & RdxDispatch
}

export declare function createStore<C extends Config>(config: C): Store<ConfigModels<C>>

export type StoreState<C extends Config> = ModelsState<ConfigModels<C>>

export type StoreDispatch<C extends Config> = ModelsDispatch<ConfigModels<C>>