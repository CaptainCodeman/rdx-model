import { Plugin, Model, Store } from "../typings";
import { createDispatcher } from "./dispatchPlugin";
import { ActionEvent, stateEvent } from "@captaincodeman/rdx";

const effects = {}
export const effectsPlugin: Plugin = {
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
    }
  },

  onStore(store: Store) {
    store.addEventListener(stateEvent, async e => {
      const { action } = (<CustomEvent<ActionEvent>>e).detail
      const actionEffects = effects[action.type!]
      if (actionEffects) {
        // allow the triggering action to be reduced first
        await Promise.resolve()

        // does await allow us to call other effects? do we want / need that?
        // await Promise.all(effects.map(effect => effect(action.payload)))
        actionEffects.forEach(effect => effect(action.payload))
      }
    })
  },
}