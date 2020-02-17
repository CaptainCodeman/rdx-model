import { ActionEvent, stateEvent } from "@captaincodeman/rdx";

import { createDispatcher } from "./dispatchPlugin";

import { Model, Store, Effect } from "../typings";

const effects: { [type: string]: Effect[] } = {}
const inits: Function[] = []

export const effectsPlugin = {
  onModel(store: Store, name: string, model: Model) {
    if (!model.effects) {
      return
    }

    const dispatcher = store.dispatch[name]
    const modelEffects = model.effects(store.dispatch, () => store.state)

    for (const key in modelEffects) {
      const type = createDispatcher(store, name, key)
      const effect = modelEffects[key].bind(dispatcher)

      // effects are a list, because multiple models may want to listen to the same 
      // action type (e.g. routing/change) and we want to trigger _all_ of them ...
      if (effects[type]) {
        effects[type].push(effect)
      } else {
        effects[type] = [effect]
      }

      if (key === 'init') {
        inits.push(effect)
      }
    }
  },

  onStore(store: Store) {
    store.addEventListener(stateEvent, e => {
      const { action } = (<CustomEvent<ActionEvent>>e).detail
      const runEffects = effects[action.type!]
      if (runEffects) {
        // allow the triggering action to be reduced first
        // before we handle the effect(s) running
        queueMicrotask(() => runEffects.forEach(effect => effect(action.payload)))
      }
    })

    inits.forEach(effect => effect())
  },
}