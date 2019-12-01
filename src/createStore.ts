import { actionType } from 'actionType';
import { dispatchPlugin } from 'dispatchPlugin';
import { effectsPlugin } from 'effectsPlugin';
import { Config, RemodeledStore, ConfigModels, Plugin, Dispatcher, Context } from '../typings';
import { Store, combineReducers, Action, Reducer } from '@captaincodeman/rdx';

// TODO: should effectsPlugin be 'core'? What if we provide a saga plugin instead?
// like the devtools, we could provide an importable definition can could be passed in
const corePlugins: Plugin[] = [dispatchPlugin, effectsPlugin]

export const createStore = <C extends Config>(config: C): RemodeledStore<ConfigModels<C>> => {
  // TODO: context should be divided into store level and model level
  const context = {} as Context
  const plugins = [...corePlugins, ...config.plugins || []]
  const models = { ...config.models }
  const reducers: { [name: string]: Reducer } = {}
  
  // process plugins for extra model state and middleware
  plugins.forEach(plugin => {
    if (plugin.state) {
      models[plugin.state.name] = plugin.state.model
    }
    plugin.onInit && plugin.onInit.call(context)
  })

  // process models
  for (const name in models) {
    const model = models[name]

    plugins.forEach(plugin => {
      plugin.onModel && plugin.onModel.call(context, name, model)
    })

    const modelReducers: { [name: string]: any } = {}

    for (const k in model.reducers) {
      modelReducers[actionType(name, k)] = model.reducers[k]
    }

    reducers[name] = function (state: any = model.state, action: Action) {
      const reducer = modelReducers[action.type!]
      return reducer ? reducer(state, action.payload) : state
    }
  }

  // create store
  const reducer = combineReducers(reducers)
  const initialState = config && config.state
  const store = <RemodeledStore<ConfigModels<C>>>new Store(initialState, reducer)

  context.dispatch = store.dispatch.bind(store)

  // initialize plugins
  plugins.forEach(plugin => {
    plugin.onStore && plugin.onStore.call(context, store)
  })

  store.models = context.dispatcher  as Dispatcher<ConfigModels<C>>

  return store
}
