import { actionType } from 'actionType';
import { dispatchPlugin } from 'dispatchPlugin';
import { effectsPlugin } from 'effectsPlugin';
import { Config, Store, ConfigModels } from '../typings';
import { Store as RdxStore, combineReducers, Action, Reducer } from '@captaincodeman/rdx';

const corePlugins = [dispatchPlugin, effectsPlugin]

export const createStore = <C extends Config>(config: C): Store<ConfigModels<C>> => {
  const models = { ...config.models }
  
  // add models from plugins
  const plugins = [...corePlugins, ...config.plugins || []]
  plugins.forEach(plugin => {
    if (plugin.state) {
      models[plugin.state.name] = plugin.state.model
    }
  })

  // create reducers
  const reducers: { [name: string]: Reducer } = {}
  for (const name in models) {
    const model = models[name]
    const modelReducers: { [name: string]: any } = {}

    for (const k in model.reducers) {
      modelReducers[actionType(name, k)] = model.reducers[k]
    }

    reducers[name] = (state: any = model.state, action: Action) => {
      const reducer = modelReducers[action.type!]
      return reducer ? reducer(state, action.payload) : state
    }
  }

  // create store
  const rootReducer = combineReducers(reducers)
  const initialState = config && config.state
  const store = <Store<ConfigModels<C>>>new RdxStore(initialState, rootReducer)

  // give each plugin chance to handle the models
  plugins.forEach(plugin => {
    if (plugin.onModel) {
      for (const name in models) {
        plugin.onModel(store, name, models[name])
      }
    }
  })

  // initialize plugins
  plugins.forEach(plugin => {
    if (plugin.onStore) {
      plugin.onStore(store)
    }
  })

  return store
}
